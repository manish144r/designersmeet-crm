// Minimal client-side invoice PDF generator. Used by Settings > Invoices
// (Wave-A demo mode). Single jsPDF call site — keeps the dep contained and
// the PDF template intentionally plain so the visual matches the locked
// brand tone (no logos, no fancy fills).

import { jsPDF } from "jspdf";

export interface InvoiceLineItem {
  label: string;
  amount: number;
}

export interface InvoiceForPdf {
  id: string;
  period: string;
  amount: number;
  currency: string;
  status: string;
  issued_at: string;
  paid_at?: string | null;
  line_items: InvoiceLineItem[];
}

const COMPANY = {
  name: "DesignersMeet HQ",
  address: "Bengaluru, KA · India",
  email: "billing@designersmeet.com",
};

function fmtAmount(amount: number, currency: string): string {
  const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "EUR" ? "€" : `${currency} `;
  return `${symbol}${amount.toLocaleString("en-IN")}`;
}

export function downloadInvoicePdf(invoice: InvoiceForPdf, filename?: string): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const left = 48;
  let y = 64;

  // Header
  doc.setFontSize(20);
  doc.text("Invoice", left, y);
  doc.setFontSize(10);
  doc.text(`Period: ${invoice.period}`, 400, y);
  y += 22;
  doc.text(`Invoice ID: ${invoice.id}`, 400, y);
  y += 14;
  doc.text(`Status: ${invoice.status}`, 400, y);

  // Issuer block
  y = 110;
  doc.setFontSize(11);
  doc.text(COMPANY.name, left, y);
  y += 14;
  doc.setFontSize(9);
  doc.text(COMPANY.address, left, y);
  y += 12;
  doc.text(COMPANY.email, left, y);

  // Issued / paid
  y += 28;
  doc.setFontSize(10);
  doc.text(`Issued: ${invoice.issued_at?.slice(0, 10) ?? "—"}`, left, y);
  if (invoice.paid_at) {
    y += 14;
    doc.text(`Paid:   ${invoice.paid_at.slice(0, 10)}`, left, y);
  }

  // Line items
  y += 36;
  doc.setFontSize(11);
  doc.text("Description", left, y);
  doc.text("Amount", 460, y, { align: "right" });
  y += 6;
  doc.line(left, y, 510, y);
  y += 16;

  doc.setFontSize(10);
  for (const li of invoice.line_items) {
    doc.text(li.label, left, y);
    doc.text(fmtAmount(li.amount, invoice.currency), 460, y, { align: "right" });
    y += 16;
  }

  // Total
  y += 8;
  doc.line(left, y, 510, y);
  y += 18;
  doc.setFontSize(11);
  doc.text("Total", left, y);
  doc.text(fmtAmount(invoice.amount, invoice.currency), 460, y, { align: "right" });

  // Footer
  doc.setFontSize(8);
  doc.text(
    "Demo invoice generated client-side from DesignersMeet CRM. For preview only.",
    left,
    780,
  );

  doc.save(filename ?? `dm-invoice-${invoice.period}.pdf`);
}
