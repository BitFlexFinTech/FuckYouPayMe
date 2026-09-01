import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/invoice-templates — list templates for freelancer
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const templates = await prisma.invoiceTemplate.findMany({
    where: { freelancerId: user.id },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ templates });
}

// POST /api/invoice-templates — create template from invoice items
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { name, items, currency, notes } = await request.json();
  if (!name || !items?.length) {
    return NextResponse.json({ error: "Name and items required" }, { status: 400 });
  }

  const template = await prisma.invoiceTemplate.create({
    data: {
      freelancerId: user.id,
      name,
      items: items.map((i: any) => ({ description: i.description, quantity: i.quantity, rate: i.rate })),
      currency: currency || "USD",
      notes: notes || null,
    },
  });
  return NextResponse.json(template, { status: 201 });
}

// DELETE /api/invoice-templates — delete a template
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const template = await prisma.invoiceTemplate.findUnique({ where: { id } });
  if (!template || template.freelancerId !== user.id) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  await prisma.invoiceTemplate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}