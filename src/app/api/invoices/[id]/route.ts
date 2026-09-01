import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/invoices/[id]
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: { items: true, payments: true, dunningEvents: { orderBy: { sentAt: "desc" } }, disputes: true },
  });
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  return NextResponse.json(invoice);
}

// PUT /api/invoices/[id]
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const body = await request.json();
  const invoice = await prisma.invoice.update({
    where: { id: params.id },
    data: {
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      clientCompany: body.clientCompany,
      notes: body.notes,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      status: body.status,
    },
    include: { items: true },
  });
  return NextResponse.json(invoice);
}

// DELETE /api/invoices/[id] — void invoice
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const invoice = await prisma.invoice.update({
    where: { id: params.id },
    data: { status: "VOIDED" },
  });
  return NextResponse.json(invoice);
}