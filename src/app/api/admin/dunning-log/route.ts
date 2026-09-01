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
  const level = searchParams.get("level"); // polite, firm, fuck_you, nuclear

  const where: any = {};
  if (level) where.level = level;

  const [events, total] = await Promise.all([
    prisma.dunningEvent.findMany({
      where,
      include: { invoice: { select: { invoiceNumber: true, clientName: true } } },
      orderBy: { sentAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.dunningEvent.count({ where }),
  ]);

  return NextResponse.json({ events, total, page, limit });
}