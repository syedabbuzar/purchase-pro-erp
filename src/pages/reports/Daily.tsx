import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { format, startOfDay, endOfDay } from "date-fns";
import { exportSheet } from "@/lib/xlsx-export";
import { inr } from "@/lib/num";

function DailyDispatch() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const data = useLiveQuery(async () => {
    const d = new Date(date);
    const from = startOfDay(d).getTime();
    const to = endOfDay(d).getTime();
    const invoices = (await db.invoices.toArray()).filter((i) => i.status === "active" && i.date >= from && i.date <= to);
    const items = (await db.invoiceItems.toArray()).filter((it) => invoices.some((i) => i.id === it.invoiceId));
    const products = await db.products.toArray();
    const agg = new Map<number, { name: string; boxes: number; pieces: number; invoices: Set<number>; amount: number }>();
    for (const it of items) {
      const p = products.find((x) => x.id === it.productId);
      const cur = agg.get(it.productId) || { name: p?.name || it.description, boxes: 0, pieces: 0, invoices: new Set<number>(), amount: 0 };
      cur.boxes += it.boxes; cur.pieces += it.pieces; cur.amount += it.netAmount;
      cur.invoices.add(it.invoiceId);
      agg.set(it.productId, cur);
    }
    return { rows: [...agg.values()].sort((a, b) => b.amount - a.amount), invoiceCount: invoices.length };
  }, [date]);

  if (!data) return <div>Loading...</div>;

  const exportRows = () => exportSheet(data.rows.map((r) => ({
    Product: r.name, "Boxes Sold": r.boxes, "Pieces Sold": r.pieces,
    "Invoices": r.invoices.size, Amount: r.amount,
  })), `daily-dispatch-${date}.xlsx`);

  const totBoxes = data.rows.reduce((s, r) => s + r.boxes, 0);
  const totPcs = data.rows.reduce((s, r) => s + r.pieces, 0);
  const totAmt = data.rows.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <h1 className="text-2xl font-bold mr-auto">Daily Dispatch Report</h1>
        <Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />
        <Button variant="outline" onClick={exportRows}>Export Excel</Button>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><div className="text-xs uppercase text-muted-foreground">Invoices</div><div className="text-2xl font-bold">{data.invoiceCount}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs uppercase text-muted-foreground">Boxes</div><div className="text-2xl font-bold">{totBoxes}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs uppercase text-muted-foreground">Pieces</div><div className="text-2xl font-bold">{totPcs}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs uppercase text-muted-foreground">Total Sales</div><div className="text-2xl font-bold">₹ {inr(totAmt)}</div></CardContent></Card>
      </div>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left"><tr>
              <th className="p-2">Product</th><th className="text-right">Boxes Sold</th><th className="text-right">Pieces Sold</th><th className="text-right">Invoices</th><th className="text-right">Amount</th>
            </tr></thead>
            <tbody>
              {data.rows.map((r, i) => (
                <tr key={i} className="border-t"><td className="p-2 font-medium">{r.name}</td>
                  <td className="text-right">{r.boxes}</td><td className="text-right">{r.pieces}</td>
                  <td className="text-right">{r.invoices.size}</td>
                  <td className="text-right">₹ {inr(r.amount)}</td>
                </tr>
              ))}
              {data.rows.length === 0 && <tr><td colSpan={5} className="text-center p-6 text-muted-foreground">No sales for this date.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">This report auto-updates from active invoices. {format(new Date(date), "dd MMM yyyy")}.</p>
    </div>
  );
}
