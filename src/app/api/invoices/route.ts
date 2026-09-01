import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeNextRecurringDate } from "@/lib/recurring";

// GET /api/invoices — list invoices for freelancer
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const client = searchParams.get("client");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const where: any = { freelancerId: user.id };
  if (status) where.status = status;
  if (client) where.clientName = { contains: client, mode: "insensitive" };

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: { items: true, payments: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.invoice.count({ where }),
  ]);

  return NextResponse.json({ invoices, total, page, limit });
}

// POST /api/invoices — create invoice
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await request.json();
  const { clientName, clientEmail, clientCompany, items, dueDate, notes, currency, taxPercent, feeAbsorbed, paymentTerms, recurring, recurringFrequency, recurringEndDate } = body;
  if (!clientName || !clientEmail || !items?.length || !dueDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const subtotal = items.reduce((sum: number, item: any) => sum + Math.round(item.quantity * item.rate * 100), 0);
  const taxAmt = taxPercent ? Math.round(subtotal * (taxPercent / 100)) : 0;
  const total = subtotal + taxAmt;
  const platformFeePercent = parseFloat(process.env.PLATFORM_FEE_PERCENT || "2.5");
  const platformFeeAmount = Math.round(total * (platformFeePercent / 100));
  const freelancerReceives = feeAbsorbed ? total - platformFeeAmount : total;

  // Generate invoice number
  const count = await prisma.invoice.count({ where: { freelancerId: user.id } });
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      freelancerId: user.id,
      clientName,
      clientEmail,
      clientCompany: clientCompany || null,
      subtotal,
      taxPercent: taxPercent || 0,
      taxAmount: taxAmt,
      total,
      currency: currency || "USD",
      platformFeePercent,
      platformFeeAmount,
      freelancerReceives,
      feeAbsorbed: feeAbsorbed || false,
      dueDate: new Date(dueDate),
      status: "DRAFT",
      notes: notes || null,
      recurring: recurring || false,
      recurringFrequency: recurring ? (recurringFrequency || "monthly") : null,
      recurringEndDate: recurring && recurringEndDate ? new Date(recurringEndDate) : null,
      nextRecurringDate: recurring ? computeNextRecurringDate(recurringFrequency || "monthly") : null,
      items: {
        create: items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          rate: Math.round(item.rate * 100),
          amount: Math.round(item.quantity * item.rate * 100),
        })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json(invoice, { status: 201 });
}