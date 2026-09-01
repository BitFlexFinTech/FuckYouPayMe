import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import React from "react";
import { renderToStream } from "@react-pdf/renderer";
import { InvoicePdfDocument } from "@/lib/invoice-pdf";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: { items: true, freelancer: true },
  });
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

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
      freelancerName: invoice.freelancer.name,
      businessName: invoice.freelancer.businessName,
    })
  );

  const chunks: Buffer[] = [];
  for await (const chunk of pdfStream) {
    chunks.push(Buffer.from(chunk));
  }
  const pdfBuffer = Buffer.concat(chunks);

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
    },
  });
}