import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { startOfDay, endOfDay, startOfMonth } from "date-fns";
import { exportSheet } from "@/lib/xlsx-export";
import { inr } from "@/lib/num";

export const Route = createFileRoute("/_authenticated/reports/gst")({
  component: GstReport,
  head: () => ({ meta: [{ title: "GST Report — STAR ENTERPRISES" }] }),
});

function GstReport() {
  const [from, setFrom] = useState(startOfMonth(new Date()).toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));

  const data = useLiveQuery(async () => {
    const f = startOfDay(new Date(from)).getTime();
    const t = endOfDay(new Date(to)).getTime();
    const invoices = (await db.invoices.toArray()).filter((i) => i.status === "active" && i.date >= f && i.date <= t);
    const items = (await db.invoiceItems.toArray()).filter((it) => invoices.some((i) => i.id === it.invoiceId));
    const byRate = new Map<number, { taxable: number; cgst: number; sgst: number; igst: number }>();
    for (const inv of invoices) {
      const invItems = items.filter((x) => x.invoiceId === inv.id);
      const invTaxable = invItems.reduce((s, x) => s + x.taxable, 0);
      // Distribute inv-level cgst/sgst/igst proportionally per rate bucket
      const rates = new Map<number, number>();
      for (const it of invItems) rates.set(it.gstPct, (rates.get(it.gstPct) || 0) + it.taxable);
      for (const [rate, taxable] of rates.entries()) {
        const cur = byRate.get(rate) || { taxable: 0, cgst: 0, sgst: 0, igst: 0 };
        const share = invTaxable > 0 ? taxable / invTaxable : 0;
        cur.taxable += taxable;
        cur.cgst += inv.cgst * share;
        cur.sgst += inv.sgst * share;
        cur.igst += inv.igst * share;
        byRate.set(rate, cur);
      }
    }
    const rows = [...byRate.entries()].sort((a, b) => a[0] - b[0]).map(([rate, v]) => ({
      "GST%": rate, Taxable: +v.taxable.toFixed(2),
      CGST: +v.cgst.toFixed(2), SGST: +v.sgst.toFixed(2), IGST: +v.igst.toFixed(2),
      "Total Tax": +(v.cgst + v.sgst + v.igst).toFixed(2),
    }));
    return rows;
  }, [from, to]);

  if (!data) return <div>Loading...</div>;

  const totals = data.reduce((s, r) => ({
    Taxable: s.Taxable + r.Taxable, CGST: s.CGST + r.CGST, SGST: s.SGST + r.SGST, IGST: s.IGST + r.IGST, Total: s.Total + r["Total Tax"],
  }), { Taxable: 0, CGST: 0, SGST: 0, IGST: 0, Total: 0 });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold mr-auto">GST Report</h1>
        <Label>From</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-36" />
        <Label>To</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-36" />
        <Button variant="outline" onClick={() => exportSheet(data, `gst-${from}-to-${to}.xlsx`)}>Export Excel</Button>
      </div>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left"><tr>
              <th className="p-2">GST%</th><th className="text-right">Taxable</th>
              <th className="text-right">CGST</th><th className="text-right">SGST</th>
              <th className="text-right">IGST</th><th className="text-right">Total Tax</th>
            </tr></thead>
            <tbody>
              {data.map((r, i) => (
                <tr key={i} className="border-t"><td className="p-2">{r["GST%"]}%</td>
                  <td className="text-right">{inr(r.Taxable)}</td><td className="text-right">{inr(r.CGST)}</td>
                  <td className="text-right">{inr(r.SGST)}</td><td className="text-right">{inr(r.IGST)}</td>
                  <td className="text-right font-semibold">{inr(r["Total Tax"])}</td>
                </tr>
              ))}
              <tr className="border-t bg-muted/40 font-bold">
                <td className="p-2">Total</td>
                <td className="text-right">{inr(totals.Taxable)}</td><td className="text-right">{inr(totals.CGST)}</td>
                <td className="text-right">{inr(totals.SGST)}</td><td className="text-right">{inr(totals.IGST)}</td>
                <td className="text-right">{inr(totals.Total)}</td>
              </tr>
              {data.length === 0 && <tr><td colSpan={6} className="text-center p-6 text-muted-foreground">No data for this period.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
