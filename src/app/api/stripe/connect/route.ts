import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, isStripeConfigured } from "@/lib/stripe";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!isStripeConfigured() || !stripe) {
    // Mock mode — return mock account link
    return NextResponse.json({
      mock: true,
      accountLink: "/dashboard",
      message: "Stripe is not configured. In production, you'd be redirected to Stripe Connect onboarding.",
    });
  }

  try {
    let accountId = user.stripeAccountId;

    // Create account if not exists
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: user.country || "US",
        email: user.email,
        business_type: "individual",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          userId: user.id,
        },
      });
      accountId = account.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeAccountId: accountId },
      });
    }

    // Create account link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: process.env.NEXT_PUBLIC_APP_URL + "/onboarding",
      return_url: process.env.NEXT_PUBLIC_APP_URL + "/dashboard",
      type: "account_onboarding",
    });

    return NextResponse.json({ accountLink: accountLink.url });
  } catch (error) {
    console.error("Stripe Connect error:", error);
    return NextResponse.json({ error: "Failed to create Stripe Connect link" }, { status: 500 });
  }
}