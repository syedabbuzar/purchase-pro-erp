import * as XLSX from "xlsx";
import { invoicesApi, customersApi, companyApi, productsApi, reportsApi } from "./services";
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

function pos(state?: string, code?: string) {
  if (!code && !state) return "";
  return `${(code || "").padStart(2, "0")}-${state || ""}`.replace(/^-/, "");
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

interface Detail {
  invoice: Invoice;
  items: InvoiceItem[];
}

/** Fetches ERP data for the period and builds the workbook. */
export async function generateGstr1Workbook(opts: Gstr1Options): Promise<Gstr1Result> {
  const from = new Date(opts.from + "T00:00:00");
  const to = new Date(opts.to + "T23:59:59");

  // Period filtering is pushed to the backend (/sales-report?from&to); the full
  // list is merged in so cancelled/other-status documents of the period are not lost.
  const [periodReport, allInvoices, customers, company, products] = await Promise.all([
    reportsApi.sales(opts.from, opts.to).catch(() => null),
    invoicesApi.list().catch(() => [] as Invoice[]),
    customersApi.list(),
    companyApi.get().catch(() => null),
    productsApi.list().catch(() => [] as Product[]),
  ]);

  // Deduplicate strictly by transaction id (never by invoice number).
  const byId = new Map<string, Invoice>();
  for (const inv of [...(periodReport?.invoices || []), ...(allInvoices || [])]) {
    if (inv?._id && !byId.has(String(inv._id))) byId.set(String(inv._id), inv);
  }

  const inPeriod = [...byId.values()].filter((i) => {
    if (i.status === "deleted") return false;
    const d = i.date ? new Date(i.date) : null;
    return !!d && d >= from && d <= to;
  });

  const custById = new Map((customers || []).map((c) => [String(c._id), c]));
  const prodById = new Map((products || []).map((p) => [String(p._id), p]));

  const details = await fetchDetails(inPeriod);
  const warnings: string[] = [];

  const b2b: Row[] = [];
  const b2cl: Row[] = [];
  const b2csMap = new Map<string, { type: string; pos: string; rate: number; taxable: number; cess: number }>();
  const hsnMap = new Map<string, { hsn: string; desc: string; uqc: string; qty: number; value: number; rate: number; taxable: number; igst: number; cgst: number; sgst: number; cess: number }>();
  const exemp = {
    interReg: 0, intraReg: 0, interUnreg: 0, intraUnreg: 0,
  };

  const activeInvoices: Invoice[] = [];
  const seen = new Set<string>();

  for (const { invoice, items } of details) {
    if (invoice.status === "cancelled" || invoice.status === "deleted") continue;
    if (seen.has(String(invoice._id))) continue;
    seen.add(String(invoice._id));
    activeInvoices.push(invoice);

    const cust = custById.get(String(invoice.customerId));
    const gstin = (cust?.gstin || "").trim();

    // Inter/intra is taken from the SAVED tax split on the invoice; the customer
    // master (which may have been edited later) is only a fallback.
    const savedIgst = invoice.igst || 0;
    const savedCgst = (invoice.cgst || 0) + (invoice.sgst || 0);
    const interState =
      savedIgst > 0 ? true
        : savedCgst > 0 ? false
          : !!cust?.stateCode && !!company?.stateCode && cust.stateCode !== company.stateCode;

    const place = interState
      ? pos(cust?.state, cust?.stateCode)
      : pos(cust?.state || company?.state, cust?.stateCode || company?.stateCode);
    if (!place) warnings.push(`Invoice ${invoice.number}: missing place of supply (customer state).`);
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

    // Rate-wise split built from the SAVED line items only.
    const byRate = new Map<number, { taxable: number }>();
    for (const it of items) {
      const rate = it.gstPct || 0;
      const taxable = it.taxable || 0;
      const cur = byRate.get(rate) || { taxable: 0 };
      cur.taxable += taxable;
      byRate.set(rate, cur);

      /* ---- HSN summary from saved line items ---- */
      let hsn = (it.hsn || "").trim();
      if (!hsn) {
        hsn = prodById.get(String(it.productId))?.hsn || "";
        warnings.push(`Invoice ${invoice.number}: item "${it.name}" has no HSN saved on the invoice${hsn ? " (product master value used)" : ""}.`);
      }
      const key = `${hsn}|${rate}`;
      const h = hsnMap.get(key) || { hsn, desc: it.name || "", uqc: "PCS-PIECES", qty: 0, value: 0, rate, taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 };
      const qty = (it.boxes || 0) * (it.boxSize || 1) + (it.pieces || 0);
      const tax = it.gstAmount ?? taxable * (rate / 100); // saved tax amount preferred
      h.qty += qty;
      h.taxable += taxable;
      h.value += it.amount ?? taxable + tax;
      if (interState) h.igst += tax; else { h.cgst += tax / 2; h.sgst += tax / 2; }
      hsnMap.set(key, h);

      /* ---- nil rated / exempt / non-GST (8) ---- */
      if (rate === 0) {
        if (gstin) {
          if (interState) exemp.interReg += taxable; else exemp.intraReg += taxable;
        } else if (interState) exemp.interUnreg += taxable; else exemp.intraUnreg += taxable;
      }
    }

    const rates = [...byRate.entries()].sort((a, b) => a[0] - b[0]);

    if (gstin) {
      for (const [rate, v] of rates) {
        b2b.push([
          gstin, cust?.name || cust?.shopName || "", invoice.number, dmy(invoice.date),
          invoiceValue, place, "N", "", "Regular B2B", "", rate, r2(v.taxable), 0,
        ]);
      }
    } else if (interState && invoiceValue > B2CL_LIMIT) {
      for (const [rate, v] of rates) {
        b2cl.push([invoice.number, dmy(invoice.date), invoiceValue, place, "", rate, r2(v.taxable), 0, ""]);
      }
    } else {
      // B2CS is aggregated on: supply type + place of supply + rate (+ e-commerce GSTIN).
      for (const [rate, v] of rates) {
        const type = interState ? "Inter-State" : "Intra-State";
        const key = `${type}|${place}|${rate}|`;
        const cur = b2csMap.get(key) || { type, pos: place, rate, taxable: 0, cess: 0 };
        cur.taxable += v.taxable;
        b2csMap.set(key, cur);
      }
    }
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
    b2b, b2cl, b2cs: b2csRows, cdnr: [], cdnur: [], exp: [], at: [], atadj: [],
    exemp: exempRows, hsn: hsnRows, docs: docsRows,
  };

  if (!company?.gstin) warnings.push("Company GSTIN is not configured in Settings - file name will not contain the GSTIN.");

  for (const name of GSTR1_SHEETS.slice(1)) {
    const s = SECTIONS[name];
    const rows: Row[] = [[s.title], [], [], s.headers, ...data[name]];
    if (name === "docs") {
      rows[1] = [null, null, null, "Total Number", "Total Cancelled"];
      rows[2] = [null, null, null, numbers.length, cancelled];
    }
    addSheet(wb, name, null, rows, s.widths);
  }

  const gstin = company?.gstin || "GSTIN";
  const fileName = `GSTR-1_${gstin}_${opts.from}_to_${opts.to}.xlsx`;
  XLSX.writeFile(wb, fileName);

  return {
    fileName,
    warnings: [...new Set(warnings)],
    counts: {
      b2b: b2b.length, b2cl: b2cl.length, b2cs: b2csRows.length, hsn: hsnRows.length,
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
