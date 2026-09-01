import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Update based on step
    if (data.step === 2) {
      await prisma.user.update({
        where: { email: session.user.email },
        data: {
          name: data.name,
          businessName: data.businessName,
          country: data.country,
          currency: data.currency,
          onboardingStep: 2,
        },
      });
    } else if (data.step === 3) {
      await prisma.user.update({
        where: { email: session.user.email },
        data: {
          cryptoWalletAddress: data.cryptoWalletAddress,
          onboardingStep: 3,
        },
      });
    } else if (data.step === 4) {
      await prisma.user.update({
        where: { email: session.user.email },
        data: {
          escalationMaxLevel: data.escalationMaxLevel,
          escalationInterval: data.escalationInterval,
          onboardingStep: 4,
        },
      });
    } else if (data.step === 5) {
      await prisma.user.update({
        where: { email: session.user.email },
        data: {
          onboarded: true,
          onboardingStep: 5,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}