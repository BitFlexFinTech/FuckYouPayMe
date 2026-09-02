import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

// In-memory user store for demo mode (no database)
const DEMO_REGISTERED_USERS: Record<string, { name: string; email: string; passwordHash: string; role: string; onboarded: boolean }> = {};

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check demo users
    if (DEMO_REGISTERED_USERS[email]) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Try database first
    try {
      const { prisma } = await import("@/lib/prisma");
      if (prisma) {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
          return NextResponse.json(
            { error: "An account with this email already exists" },
            { status: 409 }
          );
        }

        const passwordHash = await hash(password, 12);
        const user = await prisma.user.create({
          data: {
            name: name || email.split("@")[0],
            email,
            passwordHash,
            role: "FREELANCER",
            onboarded: false,
            onboardingStep: 0,
          },
        });

        // Create default settings
        try {
          await prisma.settings.create({ data: { userId: user.id } });
        } catch {}

        return NextResponse.json(
          { id: user.id, email: user.email, name: user.name },
          { status: 201 }
        );
      }
    } catch {}

    // Fallback to in-memory storage (demo mode)
    const passwordHash = await hash(password, 12);
    DEMO_REGISTERED_USERS[email] = {
      name: name || email.split("@")[0],
      email,
      passwordHash,
      role: "FREELANCER",
      onboarded: false,
    };

    // Also add to the auth module's user store for immediate login
    try {
      const { addDemoUser } = await import("@/lib/auth");
      if (typeof addDemoUser === 'function') {
        addDemoUser(email, passwordHash, name || email.split("@")[0], "FREELANCER");
      }
    } catch {}

    return NextResponse.json(
      { id: email, email, name: name || email.split("@")[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}