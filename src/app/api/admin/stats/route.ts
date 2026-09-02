import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Try database
  try {
    const { prisma } = await import("@/lib/prisma");
    if (prisma) {
      const admin = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (admin && admin.role === "ADMIN") {
        const [invoices, users, payments, dunningEvents, disputes] = await Promise.all([
          prisma.invoice.findMany({ include: { payments: true } }),
          prisma.user.findMany({ where: { role: "FREELANCER" } }),
          prisma.payment.findMany(),
          prisma.dunningEvent.findMany({ orderBy: { sentAt: "desc" } }),
          prisma.dispute.findMany({ orderBy: { createdAt: "desc" } }),
        ]);

        const totalGmv = payments.filter((p: any) => p.status === "PAID").reduce((s: number, p: any) => s + p.amount, 0);
        const totalFees = payments.filter((p: any) => p.status === "PAID").reduce((s: number, p: any) => s + p.platformFeeAmount, 0);
        const stripeCount = payments.filter((p: any) => p.method === "STRIPE_CARD" || p.method === "STRIPE_ACH" || p.method === "STRIPE_SEPA").length;
        const cryptoCount = payments.filter((p: any) => p.method === "CRYPTO").length;
        const openDisputes = disputes.filter((d: any) => d.status === "OPEN").length;
        const dunningSent = dunningEvents.length;
        const paidInvoices = invoices.filter((i: any) => i.status === "PAID" || i.status === "SETTLED").length;

        const dunningByStage: Record<number, number> = {};
        dunningEvents.forEach((e: any) => { dunningByStage[e.stage] = (dunningByStage[e.stage] || 0) + 1; });

        return NextResponse.json({
          totalGmv, totalFees, activeFreelancers: users.length,
          totalInvoices: invoices.length, paidInvoices,
          stripeCount, cryptoCount, openDisputes, dunningSent,
          dunningByStage, recentUsers: users.slice(0, 5),
        });
      }
    }
  } catch {}

  // Rich mock admin data
  const { getMockInvoices, getMockUsers, getMockPayments, getMockDunningEvents, getMockDisputes } = await import("@/lib/mock-data");
  const invoices = getMockInvoices();
  const payments = getMockPayments();
  const dunningEvents = getMockDunningEvents();
  const disputes = getMockDisputes();
  const users = getMockUsers();
  const totalGmv = payments.filter((p: any) => p.status === "PAID").reduce((s: number, p: any) => s + p.amount, 0);
  const totalFees = payments.filter((p: any) => p.status === "PAID").reduce((s: number, p: any) => s + p.platformFeeAmount, 0);
  const stripeCount = payments.filter((p: any) => p.method === "STRIPE_CARD" || p.method === "STRIPE_ACH").length;
  const paidInvoices = invoices.filter((i: any) => i.status === "PAID" || i.status === "SETTLED").length;
  const dunningByStage: Record<number, number> = { 0: 2, 1: 2, 2: 1 };
  return NextResponse.json({
    totalGmv, totalFees, activeFreelancers: users.length,
    totalInvoices: invoices.length, paidInvoices,
    stripeCount, cryptoCount: 0, openDisputes: disputes.length, dunningSent: dunningEvents.length,
    dunningByStage, recentUsers: users.slice(0, 3),
  });
}