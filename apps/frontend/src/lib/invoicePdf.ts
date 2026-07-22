import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { IInvoice } from '@agencyos/shared';

function tk(minor: number): string {
  return `Tk ${(minor / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}
function fmtDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString('en-GB') : '—';
}

/** Generates and downloads a client-ready PDF of the invoice. */
export function downloadInvoicePdf(invoice: IInvoice, agencyName: string): void {
  const doc = new jsPDF();
  const marginX = 14;
  const rightX = 196;

  doc.setFontSize(18);
  doc.setTextColor(27, 28, 57);
  doc.text(agencyName || 'AgencyOS', marginX, 20);

  doc.setFontSize(20);
  doc.setTextColor(110, 86, 207);
  doc.text('INVOICE', rightX, 20, { align: 'right' });

  doc.setFontSize(10);
  doc.setTextColor(90, 91, 122);
  doc.text(`No: ${invoice.number}`, rightX, 27, { align: 'right' });
  doc.text(`Issued: ${fmtDate(invoice.issueDate)}`, rightX, 32, { align: 'right' });
  if (invoice.dueDate) {
    doc.text(`Due: ${fmtDate(invoice.dueDate)}`, rightX, 37, { align: 'right' });
  }

  doc.setTextColor(90, 91, 122);
  doc.text('Bill to', marginX, 34);
  doc.setFontSize(12);
  doc.setTextColor(27, 28, 57);
  doc.text(invoice.clientName || '—', marginX, 40);

  const lines = invoice.lineItems ?? [];
  autoTable(doc, {
    startY: 50,
    head: [['Description', 'Qty', 'Unit', 'Amount']],
    body: lines.map((l) => [
      l.description,
      String(l.quantity),
      tk(l.unitPriceMinor),
      tk(l.lineTotalMinor),
    ]),
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [27, 28, 57], textColor: 255 },
    columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let y = (doc as any).lastAutoTable.finalY + 10;
  const labelX = 140;
  const valueX = rightX;
  const totalRow = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(bold ? 27 : 90, bold ? 28 : 91, bold ? 57 : 122);
    doc.text(label, labelX, y);
    doc.text(value, valueX, y, { align: 'right' });
    y += 7;
  };

  doc.setFontSize(10);
  totalRow('Subtotal', tk(invoice.subtotalMinor));
  if (invoice.discountMinor > 0) totalRow('Discount', `- ${tk(invoice.discountMinor)}`);
  if (invoice.taxMinor > 0) totalRow(`VAT (${invoice.taxRatePercent}%)`, tk(invoice.taxMinor));
  totalRow('Total', tk(invoice.totalMinor), true);
  if (invoice.amountPaidMinor > 0) totalRow('Paid', `- ${tk(invoice.amountPaidMinor)}`);
  doc.setDrawColor(220);
  doc.line(labelX, y - 3, valueX, y - 3);
  doc.setFontSize(12);
  totalRow(
    invoice.balanceMinor === 0 ? 'Paid in full' : 'Balance due',
    tk(invoice.balanceMinor),
    true,
  );

  if (invoice.note) {
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(27, 28, 57);
    doc.text('Note', marginX, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 91, 122);
    doc.text(doc.splitTextToSize(invoice.note, 180), marginX, y);
    y += 10;
  }
  if (invoice.terms) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(27, 28, 57);
    doc.text('Terms & conditions', marginX, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 91, 122);
    doc.text(doc.splitTextToSize(invoice.terms, 180), marginX, y);
  }

  doc.save(`${invoice.number}.pdf`);
}
