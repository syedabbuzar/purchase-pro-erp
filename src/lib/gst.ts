import type { Company, Customer } from "./types";

export interface ItemInput {
  boxes: number;
  pieces: number;
  boxSize: number;
  rate: number;
  discount: number; // percent
  gstPct: number;
}

export function computeItem(i: ItemInput) {
  const totalPieces = (i.boxes || 0) * (i.boxSize || 1) + (i.pieces || 0);
  const gross = totalPieces * (i.rate || 0);
  const discAmt = gross * ((i.discount || 0) / 100);
  const taxable = Math.max(0, gross - discAmt);
  const gstAmount = +(taxable * ((i.gstPct || 0) / 100)).toFixed(2);
  const netAmount = +(taxable + gstAmount).toFixed(2);
  return { totalPieces, gross, discAmt, taxable: +taxable.toFixed(2), gstAmount, netAmount };
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
}

export interface ComputedItem extends ItemInput {
  taxable: number;
  gstAmount: number;
  netAmount: number;
}

export function computeInvoice(
  items: ComputedItem[],
  company: Company | null,
  customer: Customer | null,
): Totals {
  const interState =
    !!customer?.stateCode && !!company?.stateCode && customer.stateCode !== company.stateCode;
  let subtotal = 0;
  let taxable = 0;
  let totalDiscount = 0;
  let cgst = 0, sgst = 0, igst = 0;

  for (const it of items) {
    const totalPieces = it.boxes * (it.boxSize || 1) + it.pieces;
    const gross = totalPieces * it.rate;
    subtotal += gross;
    totalDiscount += gross * ((it.discount || 0) / 100);
    taxable += it.taxable;
    if (interState) {
      igst += +(it.taxable * (it.gstPct / 100)).toFixed(2);
    } else {
      const half = +(it.taxable * (it.gstPct / 200)).toFixed(2);
      cgst += half;
      sgst += half;
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
  };
}

export function nextInvoiceNumber(prefix: string, existing: string[]): string {
  const p = prefix || "INV";
  const now = new Date();
  // FY: Apr-Mar. FY label = year after March
  const fyEndYear = now.getMonth() >= 3 ? now.getFullYear() + 1 : now.getFullYear();
  const fyLabel = String(fyEndYear);
  const pattern = new RegExp(`^${p}:${fyLabel}_(\\d+)$`);
  let max = 0;
  for (const n of existing) {
    const m = (n || "").match(pattern);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  const seq = String(max + 1).padStart(7, "0");
  return `${p}:${fyLabel}_${seq}`;
}
