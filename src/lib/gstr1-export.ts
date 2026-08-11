import * as XLSX from "xlsx";
import { invoicesApi, customersApi, companyApi, productsApi, reportsApi } from "./services";
import { get } from "./api";
import type { Company, Customer, Invoice, InvoiceItem, Product } from "./types";

/* ------------------------------------------------------------------
 * GSTR-1 Excel export (Tally-style workbook).
 * Sheet names / order / titles / headers mirror the GSTN offline-tool
 * workbook exported by Tally.ERP 9.
 * ------------------------------------------------------------------ */

export const GSTR1_SHEETS = [
  "Help Instruction", "b2b", "b2cl", "b2cs", "cdnr", "cdnur",
  "exp", "at", "atadj", "exemp", "hsn", "docs",
] as const;

type Row = (string | number | null)[];

const HELP_ROWS: Row[] = [
  [], [], [], [],
  ["Help Instructions"],
  ["1. The offline tool for generating the JSON file will not take the data available in the sheets exemp and docs."],
  ["2. The values in these sheets are in the same order as in the portal."],
  ["3. You can manually enter the data from these sheets directly into the GSTN portal."],
  [],
  ["Visit help for more information on:"],
  ["1. GSTR1 Filing"],
  ["2. Data captured in GSTR1 Return"],
  [],
  ["Please Note"],
  ["1. This Excel workbook works best with Microsoft Excel 2003 or later."],
  ["2. We recommend that you do not modify the data in Excel after exporting."],
  ["3. Use separate Excel workbooks for each month, with the month name as a part of the file name. In case there are multiple uploads for a month, use Part A, Part B, and so on, in the file name to avoid confusion."],
  ["4. If any data exists in the offline tool when you are importing data from Excel, all the existing data will be overwritten."],
];

const SECTIONS: Record<string, { title: string; headers: string[]; widths: number[] }> = {
  b2b: {
    title: "Summary For B2B(4)",
    headers: ["GSTIN/UIN of Recipient", "Receiver Name", "Invoice Number", "Invoice date", "Invoice Value", "Place Of Supply", "Reverse Charge", "Applicable % of Tax Rate", "Invoice Type", "E-Commerce GSTIN", "Rate", "Taxable Value", "Cess Amount"],
    widths: [22.8, 22.8, 17.8, 12, 19.6, 20, 14.8, 14.8, 36.2, 22.2, 8.8, 20, 12.4],
  },
  b2cl: {
    title: "Summary For B2CL(5)",
    headers: ["Invoice Number", "Invoice date", "Invoice Value", "Place Of Supply", "Applicable % of Tax Rate", "Rate", "Taxable Value", "Cess Amount", "E-Commerce GSTIN"],
    widths: [22.8, 12.2, 15.8, 14.8, 14.8, 9.2, 20, 12.8, 22.6],
  },
  b2cs: {
    title: "Summary For B2CS(7)",
    headers: ["Type", "Place Of Supply", "Applicable % of Tax Rate", "Rate", "Taxable Value", "Cess Amount", "E-Commerce GSTIN"],
    widths: [22.4, 14.8, 14.8, 8.6, 20.6, 13.2, 22.8],
  },
  cdnr: {
    title: "Summary For CDNR(9B)",
    headers: ["GSTIN/UIN of Recipient", "Receiver Name", "Note Number", "Note Date", "Note Type", "Place Of Supply", "Reverse Charge", "Note Supply Type", "Note Value", "Applicable % of Tax Rate", "Rate", "Taxable Value", "Cess Amount"],
    widths: [22.8, 22.8, 27.8, 13.4, 14.8, 14.8, 14.8, 16.8, 15, 23.2, 9.8, 13.4, 12.4],
  },
  cdnur: {
    title: "Summary For CDNUR(9B)",
    headers: ["UR Type", "Note Number", "Note Date", "Note Type", "Place Of Supply", "Note Value", "Applicable % of Tax Rate", "Rate", "Taxable Value", "Cess Amount"],
    widths: [26.6, 16.2, 17.8, 14.8, 14.8, 13, 25.8, 10.6, 20, 12.4],
  },
  exp: {
    title: "Summary For EXP(6)",
    headers: ["Export Type", "Invoice Number", "Invoice date", "Invoice Value", "Port Code", "Shipping Bill Number", "Shipping Bill Date", "Rate", "Taxable Value", "Cess Amount"],
    widths: [21, 15.2, 12, 15.6, 13.4, 19.2, 16.2, 8.8, 20, 12.4],
  },
  at: {
    title: "Summary For Advance Received (11B) ",
    headers: ["Place Of Supply", "Applicable % of Tax Rate", "Rate", "Gross Advance Received", "Cess Amount"],
    widths: [19.2, 23.4, 7.2, 24.4, 12.4],
  },
  atadj: {
    title: "Summary For Advance Adjusted (11B) ",
    headers: ["Place Of Supply", "Applicable % of Tax Rate", "Rate", "Gross Advance Adjusted", "Cess Amount"],
    widths: [20.2, 23.4, 8.8, 24, 12.4],
  },
  exemp: {
    title: "Summary For Nil rated, exempted and non GST outward supplies (8)",
    headers: ["Description", "Nil Rated Supplies", "Exempted (other than nil rated/non GST supply )", "Non-GST supplies"],
    widths: [38.2, 24.2, 24.8, 24],
  },
  hsn: {
    title: "Summary For HSN(12)",
    headers: ["HSN", "Description", "UQC", "Total Quantity", "Total Value", "Rate", "Taxable Value", "Integrated Tax Amount", "Central Tax Amount", "State/UT Tax Amount", "Cess Amount"],
    widths: [22.6, 10.6, 8.2, 13.8, 14.2, 14.2, 20, 21, 18.6, 20.2, 12.4],
  },
  docs: {
    title: "Summary of documents issued during the tax period (13)",
    headers: ["Nature of Document", "Sr. No. From", "Sr. No. To", "Total Number", "Cancelled"],
    widths: [58.8, 14.2, 11.8, 14.2, 15.8],
  },
};

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const dmy = (d?: string | null) => (d ? new Date(d).toLocaleDateString("en-GB").replace(/\//g, "-") : "");

/**
 * Normalises any saved date value (ISO with time, UTC "Z", or date-only) to a
 * plain yyyy-mm-dd key so period filtering can never drop an invoice because of
 * a timezone shift.
 */
function dateKey(d?: string | null): string {
  if (!d) return "";
  const s = String(d);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  const dt = new Date(s);
  if (Number.isNaN(dt.getTime())) return "";
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}

function pos(state?: string, code?: string) {
  if (!code && !state) return "";
  return `${(code || "").padStart(2, "0")}-${state || ""}`.replace(/^-/, "");
}

/** State code -> name, used only to render a saved POS code as "27-Maharashtra". */
const STATE_NAMES: Record<string, string> = {
  "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh",
  "05": "Uttarakhand", "06": "Haryana", "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
  "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh", "13": "Nagaland", "14": "Manipur",
  "15": "Mizoram", "16": "Tripura", "17": "Meghalaya", "18": "Assam", "19": "West Bengal",
  "20": "Jharkhand", "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
  "26": "Dadra & Nagar Haveli and Daman & Diu", "27": "Maharashtra", "29": "Karnataka",
  "30": "Goa", "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu", "34": "Puducherry",
  "35": "Andaman & Nicobar Islands", "36": "Telangana", "37": "Andhra Pradesh", "38": "Ladakh",
  "97": "Other Territory",
};

/** Reads a state code from any saved field / a GSTIN prefix. */
function codeOf(...vals: unknown[]): string {
  for (const v of vals) {
    if (typeof v === "number" && v > 0) return String(v).padStart(2, "0");
    if (typeof v === "string") {
      const m = v.trim().match(/^(\d{1,2})/);
      if (m) return m[1].padStart(2, "0");
    }
  }
  return "";
}

/**
 * Place of supply, SAVED VALUE FIRST.
 * Order: value saved on the invoice snapshot -> customer state -> (intra only)
 * company state. Never defaults to any hard-coded state.
 */
function resolvePos(
  invoice: Invoice,
  cust?: Customer,
  company?: Company | null,
): { pos: string; code: string; source: string } {
  const raw = invoice as unknown as Record<string, unknown>;
  const savedText = [raw.placeOfSupply, raw.pos, raw.placeOfSupplyName].find(
    (v) => typeof v === "string" && (v as string).trim(),
  ) as string | undefined;
  const savedCode = codeOf(raw.placeOfSupplyCode, raw.posCode, raw.stateCode, savedText);
  if (savedText && /^\d{1,2}\s*-\s*\S/.test(savedText.trim()))
    return { pos: savedText.trim().replace(/\s*-\s*/, "-"), code: savedCode, source: "invoice snapshot" };
  if (savedCode)
    return {
      pos: pos(STATE_NAMES[savedCode] || (savedText || "").replace(/^\d+\s*-?\s*/, ""), savedCode),
      code: savedCode,
      source: "invoice snapshot",
    };
  if (savedText) return { pos: savedText.trim(), code: "", source: "invoice snapshot" };

  const custCode = codeOf(cust?.stateCode, cust?.gstin);
  if (custCode || cust?.state)
    return {
      pos: pos(cust?.state || STATE_NAMES[custCode], custCode),
      code: custCode,
      source: "customer record",
    };

  const compCode = codeOf(company?.stateCode, company?.gstin);
  if (compCode || company?.state)
    return {
      pos: pos(company?.state || STATE_NAMES[compCode], compCode),
      code: compCode,
      source: "company state (fallback)",
    };
  return { pos: "", code: "", source: "none" };
}

export interface Gstr1Options {
  from: string; // yyyy-mm-dd
  to: string;   // yyyy-mm-dd
}

export interface Gstr1Result {
  fileName: string;
  warnings: string[];
  counts: Record<string, number>;
}

/* ------------------------------------------------------------------
 * DATA SOURCE (single source of truth)
 * ------------------------------------------------------------------
 * Backend models used (no new storage is created):
 *   Invoice      GET /invoice/all , GET /sales-report?from&to  -> header:
 *                _id, number, date, customerId, taxable, cgst, sgst, igst,
 *                total, status(active|cancelled|deleted)
 *   InvoiceItem  GET /invoice/view/:id -> data.items (SAVED SNAPSHOT):
 *                name, hsn, gstPct, boxes, pieces, boxSize, rate,
 *                taxable, gstAmount, amount
 *   Customer     GET /customers -> gstin, name/shopName, state, stateCode
 *   Company      GET /company   -> gstin, state, stateCode
 *
 * Every money/tax/HSN value written to the workbook comes from the SAVED
 * invoice header or SAVED line items - never re-derived from product master.
 * Product master is only consulted as a last-resort display fallback for a
 * missing HSN, and that always raises a validation warning.
 *
 * The backend has no credit/debit note, export, or advance-receipt models,
 * so cdnr / cdnur / exp / at / atadj stay structurally present but empty -
 * fabricating those rows is never acceptable.
 * ------------------------------------------------------------------ */

/** B2CL rule: inter-state supply to an unregistered person, invoice value > 2.5 lakh. */
const B2CL_LIMIT = 250000;

const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;

/** Reads a GSTIN from any of the field names the ERP/backend may use. */
function pickGstin(...sources: unknown[]): string {
  const keys = [
    "gstin", "GSTIN", "gstIn", "gstNo", "gstNumber", "gstinNumber",
    "customerGstin", "customerGSTIN", "recipientGstin", "recipientGSTIN",
    "buyerGstin", "partyGstin",
  ];
  for (const src of sources) {
    if (!src) continue;
    if (typeof src === "string") {
      const v = src.trim().toUpperCase();
      if (v) return v;
      continue;
    }
    const o = src as Record<string, unknown>;
    for (const k of keys) {
      const v = o[k];
      if (typeof v === "string" && v.trim()) return v.trim().toUpperCase();
    }
    const nested = [o.customer, o.customerId, o.customerDetails, o.billingAddress, o.party];
    for (const n of nested) {
      if (n && typeof n === "object") {
        const v = pickGstin(n);
        if (v) return v;
      }
    }
  }
  return "";
}

/** Resolves the saved recipient, whether customerId is an id string or a populated object. */
function resolveCustomer(
  invoice: Invoice,
  custById: Map<string, Customer>,
): Customer | undefined {
  const raw = invoice as unknown as Record<string, unknown>;
  const ref = raw.customerId ?? raw.customer;
  if (ref && typeof ref === "object") {
    const obj = ref as Customer;
    return custById.get(String(obj._id)) || obj;
  }
  if (typeof ref === "string") return custById.get(ref);
  return undefined;
}

interface Detail {
  invoice: Invoice;
  items: InvoiceItem[];
}

/** Accepts any envelope shape the backend may return and always yields an array. */
function asList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  if (res && typeof res === "object") {
    const o = res as Record<string, unknown>;
    for (const k of ["invoices", "data", "docs", "results", "rows", "items", "list"]) {
      const v = o[k];
      if (Array.isArray(v)) return v as T[];
      if (v && typeof v === "object") {
        const inner = asList<T>(v);
        if (inner.length) return inner;
      }
    }
  }
  return [];
}

/**
 * Pulls EVERY saved invoice from the ERP, following pagination when the backend
 * returns paged data. Old invoices created long before this report existed are
 * retrieved the same way as new ones - there is no recency filter anywhere.
 */
async function fetchAllInvoices(): Promise<Invoice[]> {
  const out = new Map<string, Invoice>();
  const push = (list: Invoice[]) => {
    for (const inv of list) if (inv?._id) out.set(String(inv._id), inv);
  };

  try {
    push(asList<Invoice>(await invoicesApi.list()));
  } catch {
    /* ignore - paged attempt below may still succeed */
  }

  // Paged sweep: harmless when the backend ignores the params (same rows come
  // back and are deduped by _id); essential when it does paginate.
  let page = 1;
  let lastSize = -1;
  while (page <= 50) {
    let list: Invoice[] = [];
    try {
      list = asList<Invoice>(await get<unknown>("/invoice/all", { page, limit: 500 }));
    } catch {
      break;
    }
    if (!list.length) break;
    const before = out.size;
    push(list);
    if (out.size === before || list.length === lastSize && list.length < 500) break;
    lastSize = list.length;
    if (list.length < 500) break;
    page++;
  }

  return [...out.values()];
}

/** Fetches ERP data for the period and builds the workbook. */
export async function generateGstr1Workbook(opts: Gstr1Options): Promise<Gstr1Result> {
  const fromKey = dateKey(opts.from);
  const toKey = dateKey(opts.to);

  // Period filtering is pushed to the backend (/sales-report?from&to); the full
  // list is merged in so cancelled/other-status documents of the period are not lost.
  const [periodReport, allInvoices, customers, company, products] = await Promise.all([
    reportsApi.sales(opts.from, opts.to).catch(() => null),
    fetchAllInvoices().catch(() => [] as Invoice[]),
    customersApi.list(),
    companyApi.get().catch(() => null),
    productsApi.list().catch(() => [] as Product[]),
  ]);

  // Deduplicate strictly by transaction id (never by invoice number).
  const byId = new Map<string, Invoice>();
  for (const inv of [...asList<Invoice>(periodReport?.invoices), ...asList<Invoice>(allInvoices)]) {
    if (inv?._id && !byId.has(String(inv._id))) byId.set(String(inv._id), inv);
  }

  const inPeriod = [...byId.values()].filter((i) => {
    if (i.status === "deleted") return false;
    const k = dateKey(i.date);
    return !!k && k >= fromKey && k <= toKey;
  });

  const excluded = [...byId.values()]
    .filter((i) => !inPeriod.includes(i))
    .map((i) => ({
      invoiceId: String(i._id),
      number: i.number,
      date: dateKey(i.date) || "(no date)",
      reason: i.status === "deleted" ? "status = deleted" : "invoice date outside selected period",
    }));

  const custById = new Map(asList<Customer>(customers).map((c) => [String(c._id), c]));
  const prodById = new Map(asList<Product>(products).map((p) => [String(p._id), p]));

  const details = await fetchDetails(inPeriod);
  const warnings: string[] = [];

  const b2b: Row[] = [];
  const b2cl: Row[] = [];
  const cdnr: Row[] = [];
  const cdnur: Row[] = [];
  const b2csMap = new Map<string, { type: string; pos: string; rate: number; taxable: number; cess: number }>();
  const hsnMap = new Map<string, { hsn: string; desc: string; uqc: string; qty: number; value: number; rate: number; taxable: number; igst: number; cgst: number; sgst: number; cess: number }>();
  const exemp = {
    interReg: 0, intraReg: 0, interUnreg: 0, intraUnreg: 0,
  };

  const activeInvoices: Invoice[] = [];
  const seen = new Set<string>();
  const trace: Record<string, unknown>[] = [];
  const b2csSources = new Map<string, { sourceInvoiceIds: Set<string>; sourceInvoiceNumbers: Set<string>; sourceLineItemIds: Set<string> }>();

  for (const { invoice, items } of details) {
    if (invoice.status === "cancelled" || invoice.status === "deleted") {
      excluded.push({
        invoiceId: String(invoice._id),
        number: invoice.number,
        date: dateKey(invoice.date) || "(no date)",
        reason: `status = ${invoice.status} (reported in docs (13) only)`,
      });
      continue;
    }
    if (seen.has(String(invoice._id))) {
      excluded.push({
        invoiceId: String(invoice._id),
        number: invoice.number,
        date: dateKey(invoice.date) || "(no date)",
        reason: "duplicate transaction id",
      });
      continue;
    }
    seen.add(String(invoice._id));
    activeInvoices.push(invoice);

    const cust = resolveCustomer(invoice, custById);
    // GSTIN is read from the SAVED invoice first, then from the customer record.
    const gstin = pickGstin(invoice, cust);
    if (gstin && !GSTIN_RE.test(gstin))
      warnings.push(`INVALID_GSTIN - Invoice ${invoice.number}: recipient GSTIN "${gstin}" is not a valid 15-character GSTIN - treated as unregistered (B2C).`);
    const b2bGstin = gstin && GSTIN_RE.test(gstin) ? gstin : "";

    const savedIgst = invoice.igst || 0;
    const savedCgst = (invoice.cgst || 0) + (invoice.sgst || 0);

    // Place of supply: saved value on the invoice first, customer next.
    const posInfo = resolvePos(invoice, cust, company);
    const place = posInfo.pos;
    const companyCode = codeOf(company?.stateCode, company?.gstin);

    // Supply type: POS vs company state when both are known (authoritative),
    // otherwise the SAVED tax split on the invoice.
    let supplySource = "place of supply vs company state";
    let interState: boolean;
    if (posInfo.code && companyCode) {
      interState = posInfo.code !== companyCode;
      const bySplit = savedIgst > 0 ? true : savedCgst > 0 ? false : null;
      if (bySplit !== null && bySplit !== interState) {
        interState = bySplit; // saved tax is the legal record
        supplySource = "saved tax split (conflicts with place of supply)";
        warnings.push(
          `Invoice ${invoice.number}: place of supply ${place} implies ${posInfo.code !== companyCode ? "inter" : "intra"}-state but the saved tax is ${bySplit ? "IGST" : "CGST/SGST"} - the saved tax split was used.`,
        );
      }
    } else {
      interState = savedIgst > 0 ? true : savedCgst > 0 ? false : false;
      supplySource = "saved tax split";
    }

    if (!place) warnings.push(`Invoice ${invoice.number}: no place of supply saved on the invoice or the customer record.`);
    if (!invoice.date) warnings.push(`Invoice ${invoice.number}: missing invoice date.`);
    if (!items.length) warnings.push(`Invoice ${invoice.number}: no saved line items found - excluded from HSN summary.`);

    const invoiceValue = r2(invoice.total || 0);

    /* ---- reconciliation: saved header vs saved line items ---- */
    const lineTaxable = items.reduce((s, it) => s + (it.taxable || 0), 0);
    const lineTax = items.reduce((s, it) => s + (it.gstAmount || 0), 0);
    const headerTax = savedIgst + savedCgst;
    if (items.length && Math.abs(r2(lineTaxable) - r2(invoice.taxable || 0)) > 1)
      warnings.push(`Invoice ${invoice.number}: saved taxable value (${r2(invoice.taxable || 0)}) does not match sum of line items (${r2(lineTaxable)}).`);
    if (items.length && Math.abs(r2(lineTax) - r2(headerTax)) > 1)
      warnings.push(`Invoice ${invoice.number}: saved tax (${r2(headerTax)}) does not match sum of line item tax (${r2(lineTax)}).`);
    if (Math.abs(r2((invoice.taxable || 0) + headerTax) - invoiceValue) > 1)
      warnings.push(`Invoice ${invoice.number}: invoice total (${invoiceValue}) does not equal taxable + tax (${r2((invoice.taxable || 0) + headerTax)}).`);

    // Rate-wise split built from the SAVED line items only (per line item, so an
    // invoice with several GST rates produces one row per rate - never merged).
    const byRate = new Map<number, { taxable: number; igst: number; cgst: number; sgst: number; cess: number; lineIds: string[] }>();
    for (const [idx, it] of items.entries()) {
      const rate = it.gstPct || 0;
      const taxable = it.taxable || 0;
      const rawIt = it as unknown as Record<string, unknown>;
      const savedTax = it.gstAmount ?? taxable * (rate / 100);
      const lIgst = typeof rawIt.igst === "number" ? rawIt.igst : interState ? savedTax : 0;
      const lCgst = typeof rawIt.cgst === "number" ? rawIt.cgst : interState ? 0 : savedTax / 2;
      const lSgst = typeof rawIt.sgst === "number" ? rawIt.sgst : interState ? 0 : savedTax / 2;
      const lCess = typeof rawIt.cess === "number" ? rawIt.cess : 0;
      const cur = byRate.get(rate) || { taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, lineIds: [] };
      cur.taxable += taxable;
      cur.igst += lIgst;
      cur.cgst += lCgst;
      cur.sgst += lSgst;
      cur.cess += lCess;
      cur.lineIds.push(String(it._id || `${invoice._id}#${idx}`));
      byRate.set(rate, cur);

      /* ---- HSN summary from saved line items ---- */
      let hsn = (it.hsn || "").trim();
      if (!hsn) {
        hsn = prodById.get(String(it.productId))?.hsn || "";
        warnings.push(`Invoice ${invoice.number}: item "${it.name}" has no HSN saved on the invoice${hsn ? " (product master value used)" : ""}.`);
      }
      const uqc = (typeof rawIt.uqc === "string" && rawIt.uqc) || "PCS-PIECES";
      const key = `${hsn}|${rate}|${uqc}`;
      const h = hsnMap.get(key) || { hsn, desc: it.name || "", uqc, qty: 0, value: 0, rate, taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 };
      const qty = (it.boxes || 0) * (it.boxSize || 1) + (it.pieces || 0);
      const tax = savedTax; // saved tax amount preferred
      h.qty += qty;
      h.taxable += taxable;
      h.value += it.amount ?? taxable + tax;
      h.igst += lIgst;
      h.cgst += lCgst;
      h.sgst += lSgst;
      h.cess += lCess;
      hsnMap.set(key, h);

      /* ---- nil rated / exempt / non-GST (8) ---- */
      if (rate === 0) {
        if (b2bGstin) {
          if (interState) exemp.interReg += taxable; else exemp.intraReg += taxable;
        } else if (interState) exemp.interUnreg += taxable; else exemp.intraUnreg += taxable;
      }
    }

    let rates = [...byRate.entries()].sort((a, b) => a[0] - b[0]);

    // SAFETY NET for older bills: if the saved line items could not be loaded
    // (or were never stored), the invoice must still be reported. The rate is
    // derived from the SAVED header tax vs SAVED header taxable value - no
    // product-master lookup, no fabricated amounts.
    if (!rates.length) {
      const headerTaxable = invoice.taxable || 0;
      const derivedRate = headerTaxable > 0 ? Math.round((headerTax / headerTaxable) * 100 * 100) / 100 : 0;
      rates = [[derivedRate, {
        taxable: headerTaxable,
        igst: savedIgst,
        cgst: invoice.cgst || 0,
        sgst: invoice.sgst || 0,
        cess: 0,
        lineIds: [],
      }]];
      warnings.push(
        `Invoice ${invoice.number}: no saved line items were returned - reported from the saved invoice header (taxable ${r2(headerTaxable)}, rate ${derivedRate}%), and excluded from the HSN summary.`,
      );
    }

    let classification = "";
    // Real credit/debit-note detection: the ERP has no note model, so the only
    // genuine source is a saved document with a negative value / negative
    // quantities. Nothing is fabricated when none exists.
    const isCreditNote =
      (invoice.total || 0) < 0 ||
      (items.length > 0 && items.every((it) => (it.amount ?? 0) < 0 || (it.taxable ?? 0) < 0));

    if (isCreditNote) {
      classification = b2bGstin ? "CDNR" : "CDNUR";
      const supplyType = interState ? "Inter-State" : "Intra-State";
      for (const [rate, v] of rates) {
        if (b2bGstin) {
          cdnr.push([
            b2bGstin, cust?.name || cust?.shopName || "", invoice.number, dmy(invoice.date),
            "C", place, "N", supplyType, Math.abs(invoiceValue), "", rate, r2(Math.abs(v.taxable)), 0,
          ]);
        } else {
          cdnur.push([
            interState && Math.abs(invoiceValue) > B2CL_LIMIT ? "B2CL" : "B2CS",
            invoice.number, dmy(invoice.date), "C", place, Math.abs(invoiceValue), "",
            rate, r2(Math.abs(v.taxable)), 0,
          ]);
        }
      }
    } else if (b2bGstin) {
      classification = "B2B";
      for (const [rate, v] of rates) {
        b2b.push([
          b2bGstin, cust?.name || cust?.shopName || "", invoice.number, dmy(invoice.date),
          invoiceValue, place, "N", "", "Regular B2B", "", rate, r2(v.taxable), 0,
        ]);
      }
    } else if (interState && invoiceValue > B2CL_LIMIT) {
      // Unregistered + inter-state + invoice value above the B2CL threshold.
      // Only taxable rates are reported here; 0% lines are already in exemp (8).
      const taxableRates = rates.filter(([rate]) => rate > 0);
      classification = taxableRates.length ? (taxableRates.length === rates.length ? "B2CL" : "B2CL+EXEMP") : "EXEMP";
      for (const [rate, v] of taxableRates) {
        b2cl.push([invoice.number, dmy(invoice.date), invoiceValue, place, "", rate, r2(v.taxable), r2(v.cess), ""]);
      }
    } else {
      // B2CS is aggregated on: supply type + place of supply + rate (+ e-commerce GSTIN).
      // Nil-rated / 0% lines belong to the exemp (8) table only, never to B2CS.
      const taxableRates = rates.filter(([rate]) => rate > 0);
      classification = !taxableRates.length ? "EXEMP" : taxableRates.length === rates.length ? "B2CS" : "B2CS+EXEMP";
      for (const [rate, v] of rates) {
        if (rate === 0) continue;
        const type = interState ? "Inter-State" : "Intra-State";
        const key = `${type}|${place}|${rate}|`;
        const cur = b2csMap.get(key) || { type, pos: place, rate, taxable: 0, cess: 0 };
        cur.taxable += v.taxable;
        cur.cess += v.cess;
        b2csMap.set(key, cur);
        const src = b2csSources.get(key) || { sourceInvoiceIds: new Set<string>(), sourceInvoiceNumbers: new Set<string>(), sourceLineItemIds: new Set<string>() };
        src.sourceInvoiceIds.add(String(invoice._id));
        src.sourceInvoiceNumbers.add(String(invoice.number));
        v.lineIds.forEach((id) => src.sourceLineItemIds.add(id));
        b2csSources.set(key, src);
      }
    }

    if (!classification) {
      classification = "UNCLASSIFIED";
      warnings.push(`UNCLASSIFIED INVOICE ${invoice.number} (${invoice._id}): no GSTR-1 section could be determined from the saved data.`);
    }

    trace.push({
      invoiceId: String(invoice._id),
      number: invoice.number,
      customer: cust?.name || cust?.shopName || "(unknown)",
      gstin: gstin || "(none)",
      registered: b2bGstin ? "Registered" : "Unregistered",
      date: dmy(invoice.date),
      placeOfSupply: place,
      posSource: posInfo.source,
      companyState: pos(company?.state, companyCode) || "(not set)",
      supply: interState ? "Inter-State" : "Intra-State",
      supplySource,
      taxable: r2(invoice.taxable || 0),
      invoiceValue,
      igst: r2(savedIgst),
      cgst: r2(invoice.cgst || 0),
      sgst: r2(invoice.sgst || 0),
      cess: 0,
      rates: rates.map(([r]) => r).join(","),
      classification,
      targetSheet: classification.toLowerCase(),
    });
  }

  /* ---------------- docs (13) ---------------- */
  const numbers = details.map((d) => d.invoice.number).filter(Boolean).sort();
  const cancelled = details.filter((d) => d.invoice.status === "cancelled").length;
  const docsRows: Row[] = numbers.length
    ? [["Invoices for outward supply", numbers[0], numbers[numbers.length - 1], numbers.length, cancelled]]
    : [];

  /* ---------------- build workbook ---------------- */
  const wb = XLSX.utils.book_new();
  addSheet(wb, "Help Instruction", null, HELP_ROWS, [37.8, 48.2, 9.2]);

  const b2csRows: Row[] = [...b2csMap.values()].map((v) => [v.type, v.pos, "", v.rate, r2(v.taxable), r2(v.cess), ""]);
  const hsnRows: Row[] = [...hsnMap.values()].map((h) => [
    h.hsn, h.desc, h.uqc, h.qty, r2(h.value), h.rate, r2(h.taxable), r2(h.igst), r2(h.cgst), r2(h.sgst), r2(h.cess),
  ]);
  const exempRows: Row[] = [
    ["Inter-State supplies to registered persons", r2(exemp.interReg), 0, 0],
    ["Intra-State supplies to registered persons", r2(exemp.intraReg), 0, 0],
    ["Inter-State supplies to unregistered persons", r2(exemp.interUnreg), 0, 0],
    ["Intra-State supplies to unregistered persons", r2(exemp.intraUnreg), 0, 0],
  ];

  const data: Record<string, Row[]> = {
    b2b, b2cl, b2cs: b2csRows, cdnr, cdnur, exp: [], at: [], atadj: [],
    exemp: exempRows, hsn: hsnRows, docs: docsRows,
  };

  if (!company?.gstin) warnings.push("Company GSTIN is not configured in Settings - file name will not contain the GSTIN.");

  // Data always starts on row 5 (1-based): row1 title, rows 2-3 template/blank,
  // row 4 header. Template rows are written first, then every data row is
  // appended explicitly at that origin so headers can never be overwritten.
  const DATA_START_ROW = 5;
  const written: Record<string, number> = {};
  const cellTrace: string[] = [];

  for (const name of GSTR1_SHEETS.slice(1)) {
    const s = SECTIONS[name];
    const template: Row[] = [[s.title], [], [], s.headers];
    if (name === "docs") {
      template[1] = [null, null, null, "Total Number", "Total Cancelled"];
      template[2] = [null, null, null, numbers.length, cancelled];
    }
    const rows = data[name];
    // Pad every data row to the full header width so no mapped column is dropped.
    const padded = rows.map((r) => {
      const out = r.slice(0, s.headers.length) as Row;
      while (out.length < s.headers.length) out.push("");
      return out;
    });
    const ws = XLSX.utils.aoa_to_sheet(template as unknown[][]);
    if (padded.length) {
      XLSX.utils.sheet_add_aoa(ws, padded as unknown[][], { origin: `A${DATA_START_ROW}` });
    }
    ws["!cols"] = s.widths.map((w) => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws, name);
    written[name] = padded.length;
    padded.forEach((_, i) => cellTrace.push(`${name}Data[${i}] -> sheet "${name}" -> Excel row ${DATA_START_ROW + i}`));
  }

  const gstin = company?.gstin || "GSTIN";
  const fileName = `GSTR-1_${gstin}_${opts.from}_to_${opts.to}.xlsx`;

  /* ---------------- serialise, then READ BACK the real xlsx ---------------- */
  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  const reopened = XLSX.read(buffer, { type: "array" });

  const verified: Record<string, number> = {};
  const valueChecks: Record<string, string> = {};

  for (const name of GSTR1_SHEETS.slice(1)) {
    const ws = reopened.Sheets[name];
    if (!ws) {
      warnings.push(`Workbook verification: sheet "${name}" is missing from the generated file.`);
      verified[name] = 0;
      continue;
    }
    // Keep blank rows so the template offset stays intact, then read only the
    // data range - never compare against the raw row count.
    const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, blankrows: true, defval: "" });
    const dataRows = aoa
      .slice(DATA_START_ROW - 1)
      .filter((r) => Array.isArray(r) && r.some((c) => c !== "" && c !== null && c !== undefined));
    verified[name] = dataRows.length;

    const built = data[name].length;
    if (verified[name] !== built)
      warnings.push(`Workbook verification: sheet "${name}" contains ${verified[name]} data rows in the generated file but ${built} were built.`);

    // Cell-level value verification of every built row against the re-read file.
    const headers = SECTIONS[name].headers;
    let mismatches = 0;
    data[name].forEach((row, i) => {
      const got = dataRows[i] || [];
      headers.forEach((_, c) => {
        const a = row[c] ?? "";
        const b = (got[c] ?? "") as string | number;
        const same = typeof a === "number" && typeof b === "number"
          ? Math.abs(a - b) < 0.005
          : String(a) === String(b);
        if (!same) {
          mismatches++;
          warnings.push(`Workbook verification: sheet "${name}" row ${DATA_START_ROW + i}, column "${headers[c]}" expected "${a}" but the file contains "${b}".`);
        }
      });
    });
    valueChecks[name] = mismatches === 0 ? "PASS" : `FAIL (${mismatches} cells)`;
  }

  /* ---------------- debug trace ---------------- */
  /* eslint-disable no-console */
  /* ---- source audit + reconciliation over ALL saved invoices in period ---- */
  const num = (v: unknown) => (typeof v === "number" ? v : 0);
  const srcTotals = trace.reduce<{ taxable: number; invoiceValue: number; igst: number; cgst: number; sgst: number; cess: number }>(
    (a, t) => ({
      taxable: a.taxable + num(t.taxable),
      invoiceValue: a.invoiceValue + num(t.invoiceValue),
      igst: a.igst + num(t.igst),
      cgst: a.cgst + num(t.cgst),
      sgst: a.sgst + num(t.sgst),
      cess: a.cess + num(t.cess),
    }),
    { taxable: 0, invoiceValue: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 },
  );
  const bySheetSources: Record<string, string[]> = {};
  for (const t of trace) {
    const k = String(t.classification || "UNCLASSIFIED");
    (bySheetSources[k] ||= []).push(String(t.number));
  }
  const unclassified = trace.filter((t) => !t.classification);
  if (unclassified.length)
    warnings.push(`${unclassified.length} saved invoice(s) could not be classified: ${unclassified.map((t) => t.number).join(", ")}.`);

  // Workbook taxable total (B2B + B2CL + B2CS + CDNR/CDNUR + nil-rated) must
  // match the sum of the saved invoice taxable values.
  const sheetTaxable =
    b2b.reduce((s, r) => s + num(r[11]), 0) +
    b2cl.reduce((s, r) => s + num(r[6]), 0) +
    [...b2csMap.values()].reduce((s, v) => s + v.taxable, 0) +
    cdnr.reduce((s, r) => s + num(r[11]), 0) +
    cdnur.reduce((s, r) => s + num(r[8]), 0) +
    exemp.interReg + exemp.intraReg + exemp.interUnreg + exemp.intraUnreg;
  if (Math.abs(r2(sheetTaxable) - r2(srcTotals.taxable)) > 1)
    warnings.push(
      `Reconciliation: saved invoices total taxable ${r2(srcTotals.taxable)} but the workbook represents ${r2(sheetTaxable)} - ${r2(srcTotals.taxable - sheetTaxable)} is missing.`,
    );
  if (excluded.length)
    warnings.push(`${excluded.length} saved invoice(s) outside the selected period / deleted were not included (see console audit for the list).`);

  // Tax reconciliation: saved header tax vs the tax written into the HSN sheet.
  const hsnTotals = [...hsnMap.values()].reduce(
    (a, h) => ({ igst: a.igst + h.igst, cgst: a.cgst + h.cgst, sgst: a.sgst + h.sgst, cess: a.cess + h.cess }),
    { igst: 0, cgst: 0, sgst: 0, cess: 0 },
  );
  (["igst", "cgst", "sgst", "cess"] as const).forEach((k) => {
    if (Math.abs(r2(hsnTotals[k]) - r2(srcTotals[k])) > 1)
      warnings.push(
        `Reconciliation: saved invoices total ${k.toUpperCase()} ${r2(srcTotals[k])} but the HSN sheet represents ${r2(hsnTotals[k])}.`,
      );
  });

  const classCounts = Object.fromEntries(Object.entries(bySheetSources).map(([k, v]) => [k, v.length]));

  console.groupCollapsed(`GSTR-1 ${opts.from} to ${opts.to} - source audit`);
  console.log("SAVED INVOICES FETCHED FROM ERP (all time):", byId.size);
  console.log("REAL INVOICES FOUND IN PERIOD:", details.length, "| reported:", trace.length, "| cancelled:", details.filter((d) => d.invoice.status === "cancelled").length);
  console.table(trace);
  console.log("CLASSIFICATION -> SOURCE INVOICE NUMBERS:", bySheetSources);
  console.log("SOURCE INVOICE COUNT PER CLASSIFICATION:", classCounts);
  console.log("SOURCE TOTALS:", {
    invoices: trace.length,
    taxable: r2(srcTotals.taxable),
    invoiceValue: r2(srcTotals.invoiceValue),
    igst: r2(srcTotals.igst),
    cgst: r2(srcTotals.cgst),
    sgst: r2(srcTotals.sgst),
    cess: r2(srcTotals.cess),
  });
  console.log("WORKBOOK TAXABLE REPRESENTED:", r2(sheetTaxable));
  console.log("WORKBOOK TAX REPRESENTED (hsn):", { igst: r2(hsnTotals.igst), cgst: r2(hsnTotals.cgst), sgst: r2(hsnTotals.sgst), cess: r2(hsnTotals.cess) });
  console.log("MISSING:", excluded.length, excluded);
  console.log("UNCLASSIFIED:", unclassified.length);
  console.table(
    Object.fromEntries(
      GSTR1_SHEETS.slice(1).map((n) => [
        n.toUpperCase(),
        { BUILT: data[n].length, WRITTEN: written[n] ?? 0, VERIFIED: verified[n] ?? 0, VALUES: valueChecks[n] ?? "-" },
      ]),
    ),
  );
  console.log("SOURCE -> EXCEL ROW TRACE:", cellTrace);
  console.log(
    "B2CS aggregate -> source invoices:",
    Object.fromEntries(
      [...b2csSources].map(([k, v]) => [
        k,
        {
          sourceInvoiceIds: [...v.sourceInvoiceIds],
          sourceInvoiceNumbers: [...v.sourceInvoiceNumbers],
          sourceLineItemIds: [...v.sourceLineItemIds],
        },
      ]),
    ),
  );
  console.groupEnd();
  /* eslint-enable no-console */

  // Download the exact bytes that were verified above.
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return {
    fileName,
    warnings: [...new Set(warnings)],
    counts: {
      b2b: verified.b2b ?? 0, b2cl: verified.b2cl ?? 0, b2cs: verified.b2cs ?? 0,
      cdnr: verified.cdnr ?? 0, cdnur: verified.cdnur ?? 0, exemp: verified.exemp ?? 0,
      hsn: verified.hsn ?? 0, docs: verified.docs ?? 0,
      invoices: activeInvoices.length, cancelled,
    },
  };
}

function addSheet(wb: XLSX.WorkBook, name: string, _t: null, rows: Row[], widths: number[]) {
  const ws = XLSX.utils.aoa_to_sheet(rows as unknown[][]);
  ws["!cols"] = widths.map((w) => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, ws, name);
}

/** Loads the SAVED header + SAVED line items for every invoice (source of truth). */
async function fetchDetails(invoices: Invoice[]) {
  const out: Detail[] = [];
  const size = 5;
  for (let i = 0; i < invoices.length; i += size) {
    const chunk = invoices.slice(i, i + size);
    const res = await Promise.all(
      chunk.map(async (inv) => {
        try {
          const d = await invoicesApi.getById(inv._id);
          return { invoice: { ...inv, ...(d?.invoice || {}) }, items: d?.items || [] };
        } catch {
          return { invoice: inv, items: [] as InvoiceItem[] };
        }
      }),
    );
    out.push(...res);
  }
  return out;
}

export type { Customer, Company };
