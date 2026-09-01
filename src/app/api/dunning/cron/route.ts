import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processDunning } from "@/lib/dunning-engine";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// GET /api/dunning/cron — runs every 6 hours via Vercel Cron or external scheduler
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET || "local-cron-secret"}`) {
    // Allow local dev without auth
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Find all invoices needing dunning
  const now = new Date();
  const invoices = await prisma.invoice.findMany({
    where: {
      nextDunningDate: { lte: now },
      status: { in: ["SENT", "OVERDUE", "DUNNING_ACTIVE"] },
      dunningCompleted: false,
    },
    include: {
      freelancer: true,
    },
  });

  const results: any[] = [];

  for (const invoice of invoices) {
    try {
      const result = await processDunning(invoice, invoice.freelancer);
      results.push({ invoiceId: invoice.id, ...result });
    } catch (err) {
      results.push({ invoiceId: invoice.id, error: String(err) });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}