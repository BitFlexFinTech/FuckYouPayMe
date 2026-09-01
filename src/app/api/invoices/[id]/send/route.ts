import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import React from "react";
import { renderToStream } from "@react-pdf/renderer";
import { InvoicePdfDocument } from "@/lib/invoice-pdf";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: { items: true },
  });
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  if (invoice.freelancerId !== user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoice.id}`;
  const totalFormatted = (invoice.total / 100).toFixed(2);
  const dueFormatted = invoice.dueDate.toLocaleDateString();

  const emailSubject = `Invoice ${invoice.invoiceNumber} for $${totalFormatted} — due ${dueFormatted}`;
  const emailBody = `Hi ${invoice.clientName},\n\nInvoice #${invoice.invoiceNumber} for $${totalFormatted} is attached.\nDue date: ${dueFormatted}\n\nPay here: ${paymentUrl}\n\nThanks!\n${user.name}`;

  if (resend) {
    try {
      // Generate PDF
      const pdfStream = await renderToStream(
        React.createElement(InvoicePdfDocument, {
          invoice: {
            invoiceNumber: invoice.invoiceNumber,
            clientName: invoice.clientName,
            clientEmail: invoice.clientEmail,
            clientCompany: invoice.clientCompany,
            subtotal: invoice.subtotal,
            taxPercent: invoice.taxPercent || 0,
            taxAmount: invoice.taxAmount || 0,
            total: invoice.total,
            currency: invoice.currency,
            dueDate: invoice.dueDate.toISOString(),
            issuedDate: invoice.issuedDate.toISOString(),
            notes: invoice.notes,
            platformFeePercent: invoice.platformFeePercent,
            platformFeeAmount: invoice.platformFeeAmount,
            items: invoice.items.map((i) => ({
              description: i.description,
              quantity: i.quantity,
              rate: i.rate,
              amount: i.amount,
            })),
          },
          freelancerName: user.name,
          businessName: user.businessName,
        })
      );

      const chunks: Buffer[] = [];
      for await (const chunk of pdfStream) {
        chunks.push(Buffer.from(chunk));
      }
      const pdfBuffer = Buffer.concat(chunks);

      await resend.emails.send({
        from: `${user.name} <invoices@fuckyoupayme.online>`,
        to: invoice.clientEmail,
        subject: emailSubject,
        text: emailBody,
        attachments: [
          {
            filename: `${invoice.invoiceNumber}.pdf`,
            content: pdfBuffer.toString("base64"),
          },
        ],
      });
    } catch (err) {
      // Fallback: send without PDF
      console.error("PDF generation failed, sending without attachment:", err);
      await resend.emails.send({
        from: `${user.name} <invoices@fuckyoupayme.online>`,
        to: invoice.clientEmail,
        subject: emailSubject,
        text: emailBody,
      });
    }
  }

  // Set dunning schedule
  const interval = invoice.escalationInterval || user.escalationInterval || 3;
  const nextDunning = new Date();
  nextDunning.setDate(nextDunning.getDate() + interval);

  await prisma.invoice.update({
    where: { id: params.id },
    data: {
      status: "SENT",
      issuedDate: new Date(),
      nextDunningDate: nextDunning,
      dunningStage: 0,
    },
  });

  return NextResponse.json({ success: true, nextDunningDate: nextDunning });
}