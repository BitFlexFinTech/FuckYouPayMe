import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNowPaymentsPayment, isNowPaymentsConfigured } from "@/lib/nowpayments";

export async function POST(request: Request) {
  try {
    const { invoiceId, payCurrency } = await request.json();
    if (!invoiceId) {
      return NextResponse.json({ error: "invoiceId required" }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { freelancer: true },
    });
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    if (invoice.status === "PAID" || invoice.status === "SETTLED") {
      return NextResponse.json({ error: "Already paid" }, { status: 400 });
    }

    const priceAmount = invoice.total / 100;
    const priceCurrency = invoice.currency;

    const result = await createNowPaymentsPayment({
      priceAmount,
      priceCurrency,
      payCurrency: payCurrency || "USDT",
      orderId: invoice.id,
      orderDescription: "Invoice " + invoice.invoiceNumber + " — " + invoice.clientName,
      ipnCallbackUrl: process.env.NEXT_PUBLIC_APP_URL + "/api/payments/crypto/webhook",
      successUrl: process.env.NEXT_PUBLIC_APP_URL + "/pay/" + invoiceId + "?success=crypto",
      cancelUrl: process.env.NEXT_PUBLIC_APP_URL + "/pay/" + invoiceId,
    });

    if (!result) {
      return NextResponse.json({ error: "Failed to create crypto payment" }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Crypto payment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}