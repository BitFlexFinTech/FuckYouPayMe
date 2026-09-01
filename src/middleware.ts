import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiter
const rateMap = new Map<string, { count: number; resetAt: number }>();

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  Array.from(rateMap.keys()).forEach((key) => {
    const val = rateMap.get(key);
    if (val && val.resetAt < now) rateMap.delete(key);
  });
}, 600_000);

export function rateLimit(
  request: NextRequest,
  maxRequests: number = 20,
  windowMs: number = 60_000
): NextResponse | null {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "anonymous";
  const path = request.nextUrl.pathname;
  const key = `${ip}:${path}`;

  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry || entry.resetAt < now) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return null; // Allow
  }

  entry.count++;

  if (entry.count > maxRequests) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)),
          "X-RateLimit-Limit": String(maxRequests),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  return null; // Allow
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Rate limit public endpoints
  const publicPaths = [
    "/api/disputes",
    "/api/stripe/checkout",
    "/api/payments/crypto",
    "/api/auth/register",
  ];

  const isPublicApi = publicPaths.some((p) => path.startsWith(p));
  const isPayPage = path.startsWith("/pay/");

  if (isPublicApi || isPayPage) {
    const limitResponse = rateLimit(request);
    if (limitResponse) return limitResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/pay/:path*",
  ],
};