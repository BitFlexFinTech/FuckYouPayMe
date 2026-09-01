import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verify } from "otplib";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { code, secret } = await request.json();
  if (!code || !secret) {
    return NextResponse.json({ error: "Code and secret required" }, { status: 400 });
  }

  // Verify the TOTP code
  try {
    const isValid = verify({ token: code, secret });
    if (!isValid) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

  // Save the secret and enable TOTP
  await prisma.user.update({
    where: { email: session.user.email },
    data: { totpSecret: secret, totpEnabled: true },
  });

  return NextResponse.json({ success: true });
}