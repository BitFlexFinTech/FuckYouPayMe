import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/disputes — file a dispute (client, no auth required)
export async function POST(request: Request) {
  try {
    const { invoiceId, reason, clientName, clientEmail } = await request.json();
    if (!invoiceId || !reason || !clientName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { freelancer: true },
    });
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Create dispute
    const dispute = await prisma.dispute.create({
      data: {
        invoiceId,
        clientName,
        clientEmail: clientEmail || "",
        reason,
        status: "OPEN",
      },
    });

    // Pause dunning on this invoice
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        dunningCompleted: true,
        nextDunningDate: null,
      },
    });

    // Notify the freelancer
    await prisma.notification.create({
      data: {
        userId: invoice.freelancerId,
        type: "DISPUTE_FILED",
        title: "Dispute Filed",
        message: clientName + " has disputed invoice " + invoice.invoiceNumber + ": " + reason,
        link: "/invoices/" + invoiceId,
      },
    });

    return NextResponse.json(dispute, { status: 201 });
  } catch (error) {
    console.error("Dispute creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}