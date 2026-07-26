import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ReportToolbar } from "@/components/report-shell";
import { gstB2BExportRows, gstCompany, type GstB2BExportRow } from "@/lib/gst-mock";
import { inr } from "@/lib/num";
import { ChevronsUpDown } from "lucide-react";

export const Route = createFileRoute("/_authenticated/reports/gst-b2b-export")({
  component: GstB2BExport,
  head: () => ({ meta: [{ title: "GST B2B Export — STAR ENTERPRISES" }] }),
});

const COLS: { key: keyof GstB2BExportRow; label: string; num?: boolean; w?: string }[] = [
  { key: "yourGstin", label: "Your GSTIN", w: "140px" },
  { key: "returnPeriod", label: "Return Period", w: "90px" },
  { key: "customerGstin", label: "Customer GSTIN", w: "140px" },
  { key: "ecomGstin", label: "GSTIN of E-Commerce Operator", w: "150px" },
  { key: "invoiceNumber", label: "Invoice Num", w: "150px" },
  { key: "invoiceDate", label: "Invoice Date", w: "90px" },
  { key: "invoiceValue", label: "Invoice Value", num: true, w: "110px" },
  { key: "placeOfSupply", label: "Place of supply", w: "130px" },
  { key: "invoiceType", label: "Invoice type", w: "90px" },
  { key: "lineNumber", label: "Line Number in Invoice Item", num: true, w: "80px" },
  { key: "rate", label: "Rate", num: true, w: "60px" },
  { key: "taxableValue", label: "Taxable Value (for every Line Item)", num: true, w: "120px" },
  { key: "igstAmount", label: "IGST Amt (for every Line Item)", num: true, w: "120px" },
  { key: "cgstAmount", label: "CGST Amt (for every Line Item)", num: true, w: "120px" },
  { key: "sgstAmount", label: "SGST Amt (for every Line Item)", num: true, w: "120px" },
  { key: "cessAmount", label: "Cess Amt (for every Line Item)", num: true, w: "100px" },
  { key: "reverseCharge", label: "Reverse Charge", w: "90px" },
  { key: "taxpayerAction", label: "Tax payer action", w: "100px" },
  { key: "invoiceChecksum", label: "Invoice Checksum value", w: "150px" },
];

function GstB2BExport() {
  const [from, setFrom] = useState("2026-06-01");
  const [to, setTo] = useState("2026-06-30");
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<keyof GstB2BExportRow>("invoiceNumber");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    const rows = gstB2BExportRows.filter(
      (r) =>
        !ql ||
        r.invoiceNumber.toLowerCase().includes(ql) ||
        r.customerGstin.toLowerCase().includes(ql),
    );
    rows.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return rows;
  }, [q, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (k: keyof GstB2BExportRow) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  };

  return (
    <div className="space-y-3">
      <ReportToolbar
        title="GST B2B Export"
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
      </ReportToolbar>

      <div className="print-area">
        <div className="border-2 border-foreground/70 bg-card mb-2">
          <div className="text-center py-1 text-[12px] font-semibold">
            {gstCompany.name} — GSTIN {gstCompany.gstin} — B2B Export ({from} to {to})
          </div>
        </div>

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
                        {c.num
                          ? typeof r[c.key] === "number"
                            ? inr(Number(r[c.key]))
                            : "0.00"
                          : String(r[c.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
                {pageRows.length === 0 && (
                  <tr><td colSpan={COLS.length} className="text-center p-6 text-muted-foreground border border-border">No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex items-center justify-between text-xs no-print mt-2">
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
