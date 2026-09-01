import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const invoices = await prisma.invoice.findMany({
    where: { freelancerId: user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const totalPaid = invoices.filter((i) => i.status === "PAID" || i.status === "SETTLED").reduce((s, i) => s + i.total, 0);
  const totalOutstanding = invoices.filter((i) => i.status !== "PAID" && i.status !== "SETTLED" && i.status !== "VOIDED").reduce((s, i) => s + i.total, 0);
  const activeDunning = invoices.filter((i) => i.status === "DUNNING_ACTIVE").length;
  const recentInvoices = invoices.slice(0, 5);

  // Client stats
  const clients = await prisma.client.findMany({ where: { freelancerId: user.id } });
  const totalClients = clients.length;
  const avgPaymentDays = clients.reduce((s, c) => s + c.avgPaymentDays, 0) / (totalClients || 1);

  return NextResponse.json({
    totalPaid,
    totalOutstanding,
    activeDunning,
    invoiceCount: invoices.length,
    totalClients,
    avgPaymentDays: Math.round(avgPaymentDays),
    recentInvoices,
    user: {
      name: user.name,
      email: user.email,
      businessName: user.businessName,
      country: user.country,
      currency: user.currency,
    },
  });
}