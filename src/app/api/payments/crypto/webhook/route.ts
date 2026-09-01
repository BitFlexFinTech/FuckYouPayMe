import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyNowPaymentsIpnSignature } from "@/lib/nowpayments";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-nowpayments-sig") || "";

  if (!verifyNowPaymentsIpnSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const data = JSON.parse(body);
    const { payment_id, payment_status, order_id, pay_amount, actually_paid, pay_currency } = data;

    if (!order_id) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    // Update payment record based on status
    if (payment_status === "finished" || payment_status === "confirmed") {
      await prisma.payment.upsert({
        where: { nowpaymentsPaymentId: String(payment_id) },
        update: {
          status: "PAID",
          cryptoAmount: parseFloat(actually_paid || pay_amount),
          cryptoTxId: data.txid || null,
          updatedAt: new Date(),
        },
        create: {
          invoiceId: order_id,
          amount: 0, // Will be updated from invoice
          currency: pay_currency || "USDT",
          method: "CRYPTO",
          status: "PAID",
          cryptoAsset: pay_currency || "USDT",
          cryptoNetwork: data.pay_currency || "TRC-20",
          cryptoAmount: parseFloat(actually_paid || pay_amount),
          cryptoTxId: data.txid || null,
          nowpaymentsPaymentId: String(payment_id),
          platformFeeAmount: 0,
        },
      });

      // Mark invoice as paid
      const invoice = await prisma.invoice.findUnique({ where: { id: order_id } });
      if (invoice) {
        await prisma.invoice.update({
          where: { id: order_id },
          data: {
            status: "PAID",
            paidDate: new Date(),
            dunningCompleted: true,
            nextDunningDate: null,
          },
        });

        await prisma.notification.create({
          data: {
            userId: invoice.freelancerId,
            type: "PAYMENT_RECEIVED",
            title: "Crypto Payment Received",
            message: "Invoice " + invoice.invoiceNumber + " has been paid via crypto.",
            link: "/invoices/" + order_id,
          },
        });
      }
    } else if (payment_status === "expired" || payment_status === "failed") {
      await prisma.payment.upsert({
        where: { nowpaymentsPaymentId: String(payment_id) },
        update: { status: "EXPIRED" },
        create: {
          invoiceId: order_id,
          amount: 0,
          currency: pay_currency || "USDT",
          method: "CRYPTO",
          status: "EXPIRED",
          nowpaymentsPaymentId: String(payment_id),
          platformFeeAmount: 0,
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("NOWPayments webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}