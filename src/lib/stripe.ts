import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-08-26.dahlia",
      typescript: true,
    })
  : null;

export const STRIPE_CONNECT_CLIENT_ID = process.env.STRIPE_CONNECT_CLIENT_ID || "";
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_mock";

export function isStripeConfigured(): boolean {
  return !!stripe && !!STRIPE_CONNECT_CLIENT_ID;
}

export async function createStripeCheckoutSession(
  invoiceId: string,
  invoiceNumber: string,
  amountInCents: number,
  currency: string,
  freelancerStripeAccountId: string,
  platformFeeAmount: number,
  clientEmail: string,
  clientName: string,
  successUrl: string,
  cancelUrl: string
): Promise<string | null> {
  if (!stripe) return null;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Invoice ${invoiceNumber}`,
              description: "Payment for Invoice " + invoiceNumber,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: platformFeeAmount,
        transfer_data: {
          destination: freelancerStripeAccountId,
        },
      },
      customer_email: clientEmail,
      metadata: {
        invoiceId,
        invoiceNumber,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return session.url;
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return null;
  }
}