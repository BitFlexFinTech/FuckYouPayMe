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
  const status = searchParams.get("status"); // OPEN, RESOLVED_FREELANCER, RESOLVED_CLIENT, VOIDED

  const where: any = {};
  if (status) where.status = status;

  const [disputes, total] = await Promise.all([
    prisma.dispute.findMany({
      where,
      include: { invoice: { select: { invoiceNumber: true, clientName: true, freelancerId: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.dispute.count({ where }),
  ]);

  return NextResponse.json({ disputes, total, page, limit });
}

// POST /api/admin/disputes — admin resolves a dispute
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const admin = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { disputeId, action, resolution } = await request.json();
  if (!disputeId || !action) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const dispute = await prisma.dispute.findUnique({ where: { id: disputeId }, include: { invoice: true } });
  if (!dispute) return NextResponse.json({ error: "Dispute not found" }, { status: 404 });

  let newStatus: string;
  if (action === "freelancer_wins") newStatus = "RESOLVED_FREELANCER";
  else if (action === "client_wins") newStatus = "RESOLVED_CLIENT";
  else if (action === "void") newStatus = "VOIDED";
  else return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  await prisma.dispute.update({
    where: { id: disputeId },
    data: { status: newStatus as any, resolvedBy: "admin", resolution: resolution || "Resolved by admin" },
  });

  // If freelancer wins, resume dunning
  if (newStatus === "RESOLVED_FREELANCER" && dispute.invoice) {
    await prisma.invoice.update({
      where: { id: dispute.invoiceId },
      data: { dunningCompleted: false, nextDunningDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
    });
  }

  return NextResponse.json({ success: true });
}