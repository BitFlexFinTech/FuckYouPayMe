import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const admin = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [invoices, users, payments, dunningEvents, disputes] = await Promise.all([
    prisma.invoice.findMany({ include: { payments: true } }),
    prisma.user.findMany({ where: { role: "FREELANCER" } }),
    prisma.payment.findMany(),
    prisma.dunningEvent.findMany({ orderBy: { sentAt: "desc" } }),
    prisma.dispute.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const totalGmv = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0);
  const totalFees = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + p.platformFeeAmount, 0);
  const stripeCount = payments.filter((p) => p.method === "STRIPE_CARD" || p.method === "STRIPE_ACH" || p.method === "STRIPE_SEPA").length;
  const cryptoCount = payments.filter((p) => p.method === "CRYPTO").length;
  const openDisputes = disputes.filter((d) => d.status === "OPEN").length;
  const dunningSent = dunningEvents.length;
  const paidInvoices = invoices.filter((i) => i.status === "PAID" || i.status === "SETTLED").length;

  // Dunning analytics by stage
  const dunningByStage: Record<number, number> = {};
  dunningEvents.forEach((e) => { dunningByStage[e.stage] = (dunningByStage[e.stage] || 0) + 1; });

  return NextResponse.json({
    totalGmv,
    totalFees,
    activeFreelancers: users.length,
    totalInvoices: invoices.length,
    paidInvoices,
    stripeCount,
    cryptoCount,
    openDisputes,
    dunningSent,
    dunningByStage,
    recentUsers: users.slice(0, 5),
  });
}