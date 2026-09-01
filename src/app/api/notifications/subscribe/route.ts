import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/notifications/subscribe — save push subscription
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { subscription } = await request.json();
  if (!subscription) {
    return NextResponse.json({ error: "Subscription required" }, { status: 400 });
  }

  // Store subscription in user settings as JSON
  await prisma.settings.upsert({
    where: { userId: user.id },
    create: { userId: user.id, pushNotifications: true },
    update: { pushNotifications: true },
  });

  return NextResponse.json({ success: true });
}

// DELETE /api/notifications/subscribe — unsubscribe from push
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.settings.upsert({
    where: { userId: user.id },
    create: { userId: user.id, pushNotifications: false },
    update: { pushNotifications: false },
  });

  return NextResponse.json({ success: true });
}