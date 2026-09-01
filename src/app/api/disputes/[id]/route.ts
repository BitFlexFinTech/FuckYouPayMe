import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT /api/disputes/[id] — resolve dispute (freelancer or admin)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { resolution, action } = await request.json();

  const dispute = await prisma.dispute.findUnique({
    where: { id: params.id },
    include: { invoice: true },
  });
  if (!dispute) {
    return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
  }

  let newStatus: string;
  if (action === "freelancer_wins") newStatus = "RESOLVED_FREELANCER";
  else if (action === "client_wins") newStatus = "RESOLVED_CLIENT";
  else if (action === "void") newStatus = "VOIDED";
  else return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  await prisma.dispute.update({
    where: { id: params.id },
    data: {
      status: newStatus as any,
      resolution: resolution || null,
      resolvedBy: "freelancer",
    },
  });

  // If freelancer wins, resume dunning
  if (newStatus === "RESOLVED_FREELANCER" && dispute.invoice) {
    const interval = dispute.invoice.escalationInterval || 3;
    const nextDunning = new Date();
    nextDunning.setDate(nextDunning.getDate() + interval);
    await prisma.invoice.update({
      where: { id: dispute.invoiceId },
      data: {
        dunningCompleted: false,
        nextDunningDate: nextDunning,
      },
    });
  }

  return NextResponse.json({ success: true });
}