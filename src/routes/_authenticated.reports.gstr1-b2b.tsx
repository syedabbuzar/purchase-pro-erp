import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportHeader, ReportToolbar } from "@/components/report-shell";
import { gstCompany, gstrB2BRows, type GstrB2BRow } from "@/lib/gst-mock";
import { inr } from "@/lib/num";
import { ChevronsUpDown } from "lucide-react";

export const Route = createFileRoute("/_authenticated/reports/gstr1-b2b")({
  component: GstrB2B,
  head: () => ({ meta: [{ title: "GSTR-1 B2B — STAR ENTERPRISES" }] }),
});

const COLS: { key: keyof GstrB2BRow; label: string; num?: boolean; w?: string }[] = [
  { key: "gstin", label: "GSTIN/UIN of Recipient", w: "150px" },
  { key: "recipientCode", label: "Recipient Code in application", w: "110px" },
  { key: "recipientName", label: "Recipient Name", w: "180px" },
  { key: "recipientType", label: "Recipient Type", w: "100px" },
  { key: "kindOfTransaction", label: "Kind of transaction", w: "100px" },
  { key: "invoiceNumber", label: "Invoice Number", w: "150px" },
  { key: "invoiceDate", label: "Invoice date", w: "90px" },
  { key: "invoiceValue", label: "Invoice Value", num: true, w: "110px" },
  { key: "placeOfSupply", label: "Place Of Supply", w: "130px" },
  { key: "reverseCharge", label: "Reverse Charge", w: "80px" },
  { key: "invoiceType", label: "Invoice Type", w: "100px" },
  { key: "goodsServices", label: "Identifier if Goods or Services", w: "110px" },
  { key: "ecomGstin", label: "E-Commerce GSTIN", w: "130px" },
  { key: "rate", label: "Rate", num: true, w: "60px" },
  { key: "taxableValue", label: "Taxable Value", num: true, w: "110px" },
  { key: "cessAmount", label: "Cess Amount", num: true, w: "90px" },
  { key: "igstRate", label: "IGST Rate", num: true, w: "70px" },
  { key: "igstAmount", label: "IGST Amount", num: true, w: "100px" },
  { key: "cgstRate", label: "CGST Rate", num: true, w: "70px" },
  { key: "cgstAmount", label: "CGST Amount", num: true, w: "100px" },
  { key: "sgstRate", label: "SGST/UTGST Rate", num: true, w: "80px" },
  { key: "sgstAmount", label: "SGST/UTGST Amount", num: true, w: "110px" },
];

function GstrB2B() {
  const [from, setFrom] = useState("2026-06-01");
  const [to, setTo] = useState("2026-06-30");
  const [customer, setCustomer] = useState<string>("__all");
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<keyof GstrB2BRow>("invoiceDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const customers = useMemo(
    () => Array.from(new Set(gstrB2BRows.map((r) => r.recipientName))).sort(),
    [],
  );

  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    const rows = gstrB2BRows.filter((r) => {
      if (customer !== "__all" && r.recipientName !== customer) return false;
      if (!ql) return true;
      return (
        r.recipientName.toLowerCase().includes(ql) ||
        r.gstin.toLowerCase().includes(ql) ||
        r.invoiceNumber.toLowerCase().includes(ql)
      );
    });
    rows.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return rows;
  }, [customer, q, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const totals = filtered.reduce(
    (s, r) => ({
      invoiceValue: s.invoiceValue + r.invoiceValue,
      taxableValue: s.taxableValue + r.taxableValue,
      igstAmount: s.igstAmount + r.igstAmount,
      cgstAmount: s.cgstAmount + r.cgstAmount,
      sgstAmount: s.sgstAmount + r.sgstAmount,
      cessAmount: s.cessAmount + r.cessAmount,
    }),
    { invoiceValue: 0, taxableValue: 0, igstAmount: 0, cgstAmount: 0, sgstAmount: 0, cessAmount: 0 },
  );

  const toggleSort = (k: keyof GstrB2BRow) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  };

  const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-GB");

  return (
    <div className="space-y-3">
      <ReportToolbar
        title="GSTR-1 B2B"
        search={q}
        onSearch={(v) => { setQ(v); setPage(1); }}
        onPrint={() => window.print()}
        onExcel={() => { /* UI only */ }}
        onPdf={() => window.print()}
      >
        <Label className="text-xs">From</Label>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-36 h-9" />
        <Label className="text-xs">To</Label>
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-36 h-9" />
        <Select value={customer} onValueChange={(v) => { setCustomer(v); setPage(1); }}>
          <SelectTrigger className="w-48 h-9"><SelectValue placeholder="All Customers" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">All Customers</SelectItem>
            {customers.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </ReportToolbar>

      <div className="print-area space-y-2">
        <ReportHeader
          title="FORM GSTR1-B2B"
          company={`${gstCompany.arn}-${gstCompany.name}`}
          gstin={`${gstCompany.gstin}/${gstCompany.stateCode}-${gstCompany.state}`}
          from={`${fmtDate(from)} 12:00AM`}
          to={`${fmtDate(to)} 12:00AM`}
        />

        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto max-h-[65vh] print:max-h-none print:overflow-visible">
            <table className="w-full text-[11px] border-collapse font-mono">
              <thead className="sticky top-0 z-10 bg-primary text-primary-foreground">
                <tr>
                  {COLS.map((c) => (
                    <th
                      key={c.key}
                      style={{ minWidth: c.w }}
                      onClick={() => toggleSort(c.key)}
                      className="border border-primary-foreground/30 px-2 py-1.5 text-center font-semibold cursor-pointer select-none whitespace-normal"
                    >
                      <div className="inline-flex items-center gap-1">
                        {c.label}
                        <ChevronsUpDown className="h-3 w-3 opacity-60" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r, i) => (
                  <tr key={i} className="even:bg-muted/30 hover:bg-accent/40">
                    {COLS.map((c) => (
                      <td
                        key={c.key}
                        className={`border border-border px-2 py-1 whitespace-nowrap ${c.num ? "text-right tabular-nums" : ""}`}
                      >
                        {c.num ? (r[c.key] ? inr(Number(r[c.key])) : "0.00") : String(r[c.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
                {pageRows.length === 0 && (
                  <tr><td colSpan={COLS.length} className="text-center p-6 text-muted-foreground border border-border">No records found.</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-muted font-semibold">
                  <td colSpan={7} className="border border-border px-2 py-1 text-right">Grand Total</td>
                  <td className="border border-border px-2 py-1 text-right tabular-nums">{inr(totals.invoiceValue)}</td>
                  <td colSpan={6} className="border border-border"></td>
                  <td className="border border-border px-2 py-1 text-right tabular-nums">{inr(totals.taxableValue)}</td>
                  <td className="border border-border px-2 py-1 text-right tabular-nums">{inr(totals.cessAmount)}</td>
                  <td className="border border-border"></td>
                  <td className="border border-border px-2 py-1 text-right tabular-nums">{inr(totals.igstAmount)}</td>
                  <td className="border border-border"></td>
                  <td className="border border-border px-2 py-1 text-right tabular-nums">{inr(totals.cgstAmount)}</td>
                  <td className="border border-border"></td>
                  <td className="border border-border px-2 py-1 text-right tabular-nums">{inr(totals.sgstAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        <div className="flex items-center justify-between text-xs no-print">
          <div className="text-muted-foreground">
            Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
            <div className="px-3 py-1 border rounded">{page} / {totalPages}</div>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
