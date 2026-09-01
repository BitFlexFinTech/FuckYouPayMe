import { NextResponse } from "next/server";
import { stripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") || "";

  // Mock/webhook mode: if no stripe configured, accept mock
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    // Accept mock webhook for testing
    return NextResponse.json({ received: true });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const invoiceId = session.metadata?.invoiceId;
        if (!invoiceId) break;

        // Create payment record
        await prisma.payment.create({
          data: {
            invoiceId,
            amount: session.amount_total || 0,
            currency: session.currency?.toUpperCase() || "USD",
            method: "STRIPE_CARD",
            status: "PAID",
            stripePaymentIntentId: session.payment_intent,
            stripeCheckoutSessionId: session.id,
            platformFeeAmount: session.application_fee_amount || 0,
          },
        });

        // Mark invoice as paid
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: {
            status: "PAID",
            paidDate: new Date(),
            dunningCompleted: true,
            nextDunningDate: null,
          },
        });

        // Create notification for freelancer
        const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
        if (invoice) {
          await prisma.notification.create({
            data: {
              userId: invoice.freelancerId,
              type: "PAYMENT_RECEIVED",
              title: "Payment Received",
              message: "Invoice " + invoice.invoiceNumber + " has been paid.",
              link: "/invoices/" + invoiceId,
            },
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as any;
        const invoiceId = pi.metadata?.invoiceId;
        if (invoiceId) {
          await prisma.payment.create({
            data: {
              invoiceId,
              amount: pi.amount || 0,
              currency: pi.currency?.toUpperCase() || "USD",
              method: "STRIPE_CARD",
              status: "FAILED",
              stripePaymentIntentId: pi.id,
              platformFeeAmount: 0,
            },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}