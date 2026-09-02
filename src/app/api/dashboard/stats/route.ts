import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Try to get data from database
  try {
    const { prisma } = await import("@/lib/prisma");
    if (prisma) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (user) {
        const invoices = await prisma.invoice.findMany({
          where: { freelancerId: user.id },
          include: { items: true },
          orderBy: { createdAt: "desc" },
        });

        const totalPaid = invoices.filter((i: any) => i.status === "PAID" || i.status === "SETTLED").reduce((s: number, i: any) => s + i.total, 0);
        const totalOutstanding = invoices.filter((i: any) => i.status !== "PAID" && i.status !== "SETTLED" && i.status !== "VOIDED").reduce((s: number, i: any) => s + i.total, 0);
        const activeDunning = invoices.filter((i: any) => i.status === "DUNNING_ACTIVE").length;
        const recentInvoices = invoices.slice(0, 5);

        const clients = await prisma.client.findMany({ where: { freelancerId: user.id } });
        const totalClients = clients.length;
        const avgPaymentDays = clients.reduce((s: number, c: any) => s + c.avgPaymentDays, 0) / (totalClients || 1);

        return NextResponse.json({
          totalPaid, totalOutstanding, activeDunning,
          invoiceCount: invoices.length, totalClients,
          avgPaymentDays: Math.round(avgPaymentDays),
          recentInvoices,
          user: { name: user.name, email: user.email, businessName: user.businessName, country: user.country, currency: user.currency },
        });
      }
    }
  } catch {}

  // Return rich mock data for demo mode
  const { getMockInvoices, getMockClients } = await import("@/lib/mock-data");
  const invoices = getMockInvoices();
  const clients = getMockClients();
  const totalPaid = invoices.filter((i: any) => i.status === "PAID" || i.status === "SETTLED").reduce((s: number, i: any) => s + i.total, 0);
  const totalOutstanding = invoices.filter((i: any) => i.status !== "PAID" && i.status !== "SETTLED" && i.status !== "VOIDED" && i.status !== "DRAFT").reduce((s: number, i: any) => s + i.total, 0);
  const activeDunning = invoices.filter((i: any) => i.status === "DUNNING_ACTIVE").length;
  return NextResponse.json({
    totalPaid, totalOutstanding, activeDunning,
    invoiceCount: invoices.length,
    totalClients: clients.length,
    avgPaymentDays: 12,
    recentInvoices: invoices.slice(0, 5),
    user: { name: "Maya Chen", email: session.user.email, businessName: "Chen Creative Studio", country: "US", currency: "USD" },
  });
}