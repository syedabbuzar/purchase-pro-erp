import type { InvoiceItem, Customer, Company } from "./db";

export interface ItemInput {
  boxes: number;
  pieces: number;
  boxSize: number;
  rate: number;
  discount: number; // percent
  scheme: number; // amount
  gstPct: number;
}

export function computeItem(i: ItemInput) {
  const totalPieces = (i.boxes || 0) * (i.boxSize || 1) + (i.pieces || 0);
  const gross = totalPieces * (i.rate || 0);
  const discAmt = gross * ((i.discount || 0) / 100);
  const taxable = Math.max(0, gross - discAmt - (i.scheme || 0));
  const gstAmount = +(taxable * ((i.gstPct || 0) / 100)).toFixed(2);
  const netAmount = +(taxable + gstAmount).toFixed(2);
  return { totalPieces, gross, taxable: +taxable.toFixed(2), gstAmount, netAmount };
}

export interface Totals {
  subtotal: number;
  totalDiscount: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  roundOff: number;
  total: number;
  byRate: Record<string, { taxable: number; cgst: number; sgst: number; igst: number }>;
}

export function computeInvoice(
  items: Array<Omit<InvoiceItem, "id" | "invoiceId" | "srNo">>,
  company: Company,
  customer: Customer | null,
): Totals {
  const interState = !!customer?.stateCode && customer.stateCode !== company.stateCode;
  let subtotal = 0;
  let taxable = 0;
  let totalDiscount = 0;
  let cgst = 0, sgst = 0, igst = 0;
  const byRate: Totals["byRate"] = {};

  for (const it of items) {
    const totalPieces = it.boxes * (it.boxSize || 1) + it.pieces;
    const gross = totalPieces * it.rate;
    const discAmt = gross * ((it.discount || 0) / 100);
    subtotal += gross;
    totalDiscount += discAmt + (it.scheme || 0);
    taxable += it.taxable;
    const key = it.gstPct.toString();
    if (!byRate[key]) byRate[key] = { taxable: 0, cgst: 0, sgst: 0, igst: 0 };
    byRate[key].taxable += it.taxable;
    if (interState) {
      const g = +(it.taxable * (it.gstPct / 100)).toFixed(2);
      igst += g;
      byRate[key].igst += g;
    } else {
      const half = +(it.taxable * (it.gstPct / 200)).toFixed(2);
      cgst += half;
      sgst += half;
      byRate[key].cgst += half;
      byRate[key].sgst += half;
    }
  }

  const totalTax = cgst + sgst + igst;
  const raw = taxable + totalTax;
  const rounded = Math.round(raw);
  const roundOff = +(rounded - raw).toFixed(2);
  return {
    subtotal: +subtotal.toFixed(2),
    totalDiscount: +totalDiscount.toFixed(2),
    taxable: +taxable.toFixed(2),
    cgst: +cgst.toFixed(2),
    sgst: +sgst.toFixed(2),
    igst: +igst.toFixed(2),
    roundOff,
    total: rounded,
    byRate,
  };
}

export function nextInvoiceNumber(prefix: string, existing: string[]): string {
  const now = new Date();
  // FY: Apr-Mar. FY label = year after March
  const fyEndYear = now.getMonth() >= 3 ? now.getFullYear() + 1 : now.getFullYear();
  const fyLabel = String(fyEndYear);
  const pattern = new RegExp(`^${prefix}:${fyLabel}_(\\d+)$`);
  let max = 0;
  for (const n of existing) {
    const m = n.match(pattern);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  const seq = String(max + 1).padStart(7, "0");
  return `${prefix}:${fyLabel}_${seq}`;
}
