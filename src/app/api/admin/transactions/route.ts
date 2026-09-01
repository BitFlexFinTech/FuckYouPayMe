import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const admin = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const method = searchParams.get("method"); // stripe, crypto, all

  const where: any = {};
  if (method === "stripe") where.method = { in: ["STRIPE_CARD", "STRIPE_ACH", "STRIPE_SEPA"] };
  else if (method === "crypto") where.method = "CRYPTO";

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: { invoice: { select: { invoiceNumber: true, clientName: true, freelancerId: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.payment.count({ where }),
  ]);

  return NextResponse.json({ payments, total, page, limit });
}