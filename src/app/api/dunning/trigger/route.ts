import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processDunning } from "@/lib/dunning-engine";

// POST /api/dunning/trigger — manually advance dunning (Fuck You button)
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { invoiceId } = await request.json();
  if (!invoiceId) return NextResponse.json({ error: "invoiceId required" }, { status: 400 });

  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice || invoice.freelancerId !== user.id) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }
  if (invoice.status === "PAID" || invoice.status === "SETTLED" || invoice.status === "VOIDED") {
    return NextResponse.json({ error: "Invoice already settled" }, { status: 400 });
  }

  const result = await processDunning(invoice, user);
  return NextResponse.json(result);
}