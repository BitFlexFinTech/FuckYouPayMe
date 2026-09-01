import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processDunning } from "@/lib/dunning-engine";
import { computeNextRecurringDate } from "@/lib/recurring";

// GET /api/cron/daily — runs once daily at 6 AM via Vercel Cron
// Handles: dunning engine + recurring invoice generation (combined for Hobby plan limit)
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET || "local-cron-secret"}`) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();
  const results: any = { dunning: [], recurring: [] };

  // ─── Part 1: Dunning Engine ─────────────────────────────────────────────
  const dunningInvoices = await prisma.invoice.findMany({
    where: {
      nextDunningDate: { lte: now },
      status: { in: ["SENT", "OVERDUE", "DUNNING_ACTIVE"] },
      dunningCompleted: false,
    },
    include: { freelancer: true },
  });

  for (const invoice of dunningInvoices) {
    try {
      const result = await processDunning(invoice, invoice.freelancer);
      results.dunning.push({ invoiceId: invoice.id, ...result });
    } catch (err) {
      results.dunning.push({ invoiceId: invoice.id, error: String(err) });
    }
  }

  // ─── Part 2: Recurring Invoice Generation ──────────────────────────────
  const templates = await prisma.invoice.findMany({
    where: {
      recurring: true,
      nextRecurringDate: { lte: now },
      status: { not: "VOIDED" },
      OR: [{ recurringEndDate: null }, { recurringEndDate: { gt: now } }],
    },
    include: { items: true, freelancer: true },
  });

  for (const template of templates) {
    try {
      const count = await prisma.invoice.count({ where: { freelancerId: template.freelancerId } });
      const invoiceNumber = `INV-${now.getFullYear()}-${String(count + 1).padStart(4, "0")}`;
      const templateDueDay = template.dueDate.getDate();
      const newDueDate = new Date(now.getFullYear(), now.getMonth(), templateDueDay);
      if (newDueDate < now) newDueDate.setMonth(newDueDate.getMonth() + 1);

      const newInvoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          freelancerId: template.freelancerId,
          clientName: template.clientName,
          clientEmail: template.clientEmail,
          clientCompany: template.clientCompany,
          subtotal: template.subtotal,
          taxPercent: template.taxPercent,
          taxAmount: template.taxAmount,
          total: template.total,
          currency: template.currency,
          platformFeePercent: template.platformFeePercent,
          platformFeeAmount: template.platformFeeAmount,
          freelancerReceives: template.freelancerReceives,
          feeAbsorbed: template.feeAbsorbed,
          dueDate: newDueDate,
          status: "DRAFT",
          notes: template.notes,
          dunningLevel: template.dunningLevel,
          escalationInterval: template.escalationInterval,
          lateFeeEnabled: template.lateFeeEnabled,
          lateFeePercent: template.lateFeePercent,
          lateFeeCapped: template.lateFeeCapped,
          recurring: false,
          items: {
            create: template.items.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              amount: item.amount,
            })),
          },
        },
      });

      const nextDate = computeNextRecurringDate(template.recurringFrequency || "monthly");
      await prisma.invoice.update({
        where: { id: template.id },
        data: { nextRecurringDate: nextDate },
      });

      results.recurring.push({ templateId: template.id, generatedId: newInvoice.id, invoiceNumber });
    } catch (err) {
      results.recurring.push({ templateId: template.id, error: String(err) });
    }
  }

  return NextResponse.json({
    dunningProcessed: results.dunning.length,
    recurringGenerated: results.recurring.length,
    results,
  });
}