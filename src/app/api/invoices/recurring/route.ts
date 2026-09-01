import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeNextRecurringDate } from "@/lib/recurring";

// GET /api/invoices/recurring — runs on a schedule to generate recurring invoices
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET || "local-cron-secret"}`) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();

  // Find recurring templates whose next generation date has arrived
  const templates = await prisma.invoice.findMany({
    where: {
      recurring: true,
      nextRecurringDate: { lte: now },
      status: { not: "VOIDED" },
      OR: [
        { recurringEndDate: null },
        { recurringEndDate: { gt: now } },
      ],
    },
    include: {
      items: true,
      freelancer: true,
    },
  });

  const results: any[] = [];

  for (const template of templates) {
    try {
      // Count existing invoices for this freelancer to generate number
      const count = await prisma.invoice.count({
        where: { freelancerId: template.freelancerId },
      });
      const invoiceNumber = `INV-${now.getFullYear()}-${String(count + 1).padStart(4, "0")}`;

      // Compute next due date: same interval from the template's original due date pattern
      const templateDueMonth = template.dueDate.getMonth();
      const templateDueDay = template.dueDate.getDate();
      const newDueDate = new Date(now.getFullYear(), now.getMonth(), templateDueDay);
      if (newDueDate < now) {
        newDueDate.setMonth(newDueDate.getMonth() + 1);
      }

      // Create a fresh invoice copy
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
          recurring: false, // This is a generated instance, not a template itself
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

      // Advance the template's nextRecurringDate
      const nextDate = computeNextRecurringDate(template.recurringFrequency || "monthly");
      await prisma.invoice.update({
        where: { id: template.id },
        data: { nextRecurringDate: nextDate },
      });

      results.push({
        templateId: template.id,
        generatedId: newInvoice.id,
        invoiceNumber,
        nextRecurringDate: nextDate,
      });
    } catch (err) {
      results.push({ templateId: template.id, error: String(err) });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}