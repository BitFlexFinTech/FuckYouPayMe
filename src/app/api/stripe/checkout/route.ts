import { NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { invoiceId } = await request.json();
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
    if (!invoice.freelancer.stripeAccountId) {
      return NextResponse.json({ error: "Freelancer has not set up Stripe" }, { status: 400 });
    }

    if (!isStripeConfigured() || !stripe) {
      // Mock mode
      return NextResponse.json({
        mock: true,
        url: process.env.NEXT_PUBLIC_APP_URL + "/pay/" + invoiceId + "?paid=mock",
        sessionId: "cs_mock_" + Date.now(),
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: invoice.currency.toLowerCase(),
            product_data: {
              name: "Invoice " + invoice.invoiceNumber,
              description: "Payment for " + invoice.clientName,
            },
            unit_amount: invoice.total,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: invoice.platformFeeAmount,
        transfer_data: {
          destination: invoice.freelancer.stripeAccountId,
        },
      },
      customer_email: invoice.clientEmail,
      metadata: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
      },
      success_url: process.env.NEXT_PUBLIC_APP_URL + "/pay/" + invoiceId + "?success=stripe",
      cancel_url: process.env.NEXT_PUBLIC_APP_URL + "/pay/" + invoiceId,
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}