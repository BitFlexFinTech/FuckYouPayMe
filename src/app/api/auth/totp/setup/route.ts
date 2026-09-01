import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSecret, verify } from "otplib";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const secret = generateSecret();
  const uri = "otpauth://totp/FuckYouPayMe:" + encodeURIComponent(user.email || "user") + "?secret=" + secret + "&issuer=FuckYouPayMe";

  return NextResponse.json({
    secret,
    uri,
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(uri),
  });
}