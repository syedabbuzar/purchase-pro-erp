import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { format, startOfDay, endOfDay, subDays, startOfMonth, startOfYear } from "date-fns";
import { exportSheet } from "@/lib/xlsx-export";
import { inr, inrCompact } from "@/lib/num";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

type Preset = "today" | "yesterday" | "7d" | "30d" | "mtd" | "ytd" | "custom";

function SalesReport() {
  const [preset, setPreset] = useState<Preset>("30d");
  const [from, setFrom] = useState(subDays(new Date(), 30).toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));

  const applyPreset = (p: Preset) => {
    const now = new Date();
    let f = new Date();
    if (p === "today") f = startOfDay(now);
    else if (p === "yesterday") { f = startOfDay(subDays(now, 1)); setTo(subDays(now, 1).toISOString().slice(0, 10)); }
    else if (p === "7d") f = subDays(now, 7);
    else if (p === "30d") f = subDays(now, 30);
    else if (p === "mtd") f = startOfMonth(now);
    else if (p === "ytd") f = startOfYear(now);
    setFrom(f.toISOString().slice(0, 10));
    if (p !== "yesterday") setTo(now.toISOString().slice(0, 10));
    setPreset(p);
  };

  const data = useLiveQuery(async () => {
    const f = startOfDay(new Date(from)).getTime();
    const t = endOfDay(new Date(to)).getTime();
    const invoices = (await db.invoices.toArray()).filter((i) => i.status === "active" && i.date >= f && i.date <= t);
    const items = (await db.invoiceItems.toArray()).filter((it) => invoices.some((i) => i.id === it.invoiceId));
    const products = await db.products.toArray();
    const customers = await db.customers.toArray();

    const byDay = new Map<string, number>();
    for (const i of invoices) {
      const k = format(i.date, "dd MMM");
      byDay.set(k, (byDay.get(k) || 0) + i.total);
    }
    const daily = [...byDay.entries()].map(([day, sales]) => ({ day, sales }));

    const byProduct = new Map<number, number>();
    for (const it of items) byProduct.set(it.productId, (byProduct.get(it.productId) || 0) + it.netAmount);
    const topProducts = [...byProduct.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([pid, amt]) => ({ name: products.find((p) => p.id === pid)?.name || "—", amt }));

    const byCustomer = new Map<number, number>();
    for (const i of invoices) byCustomer.set(i.customerId, (byCustomer.get(i.customerId) || 0) + i.total);
    const topCustomers = [...byCustomer.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([cid, amt]) => ({ name: customers.find((c) => c.id === cid)?.name || "—", amt }));

    const total = invoices.reduce((s, i) => s + i.total, 0);

    // Period summaries computed from real invoice data (all active invoices).
    const allActive = (await db.invoices.toArray()).filter((i) => i.status === "active");
    const now = new Date();
    const sum = (fromTs: number) => allActive.filter((i) => i.date >= fromTs).reduce((s, i) => s + i.total, 0);
    const summary = {
      today: sum(startOfDay(now).getTime()),
      week: sum(startOfDay(subDays(now, 6)).getTime()),
      month: sum(startOfMonth(now).getTime()),
      year: sum(startOfYear(now).getTime()),
      all: allActive.reduce((s, i) => s + i.total, 0),
      count: allActive.length,
    };
    return { invoices, total, daily, topProducts, topCustomers, summary };
  }, [from, to]);

  if (!data) return <div>Loading...</div>;

  const exportAll = () => exportSheet(data.invoices.map((i) => ({
    "Invoice #": i.number, Date: format(i.date, "dd/MM/yyyy"),
    Taxable: i.taxable, Tax: i.cgst + i.sgst + i.igst, Total: i.total,
  })), `sales-${from}-to-${to}.xlsx`);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold mr-auto">Sales Report</h1>
        {(["today", "yesterday", "7d", "30d", "mtd", "ytd"] as Preset[]).map((p) => (
          <Button key={p} size="sm" variant={preset === p ? "default" : "outline"} onClick={() => applyPreset(p)}>{p.toUpperCase()}</Button>
        ))}
        <Label>From</Label><Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPreset("custom"); }} className="w-36" />
        <Label>To</Label><Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPreset("custom"); }} className="w-36" />
        <Button variant="outline" onClick={exportAll}>Export Excel</Button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4"><div className="text-xs uppercase text-muted-foreground">Invoices</div><div className="text-2xl font-bold">{data.invoices.length}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs uppercase text-muted-foreground">Total Sales</div><div className="text-2xl font-bold">₹ {inrCompact(data.total)}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs uppercase text-muted-foreground">Avg Bill</div><div className="text-2xl font-bold">₹ {inrCompact(data.invoices.length ? data.total / data.invoices.length : 0)}</div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Sales Summary</CardTitle></CardHeader>
        <CardContent>
          {data.summary.count === 0 ? (
            <div className="text-sm text-muted-foreground">No sales available.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
              <div><div className="text-xs uppercase text-muted-foreground">Today</div><div className="text-lg font-bold">₹ {inr(data.summary.today)}</div></div>
              <div><div className="text-xs uppercase text-muted-foreground">This Week</div><div className="text-lg font-bold">₹ {inr(data.summary.week)}</div></div>
              <div><div className="text-xs uppercase text-muted-foreground">This Month</div><div className="text-lg font-bold">₹ {inr(data.summary.month)}</div></div>
              <div><div className="text-xs uppercase text-muted-foreground">This Year</div><div className="text-lg font-bold">₹ {inr(data.summary.year)}</div></div>
              <div><div className="text-xs uppercase text-muted-foreground">Total Sales</div><div className="text-lg font-bold">₹ {inr(data.summary.all)}</div></div>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Sales Trend</CardTitle></CardHeader>
        <CardContent style={{ height: 280 }}>
          {data.daily.length === 0 ? (
            <div className="text-sm text-muted-foreground">No sales available.</div>
          ) : (
          <ResponsiveContainer><BarChart data={data.daily}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="day" /><YAxis />
            <Tooltip formatter={(v: unknown) => "₹ " + inrCompact(Number(v))} />
            <Bar dataKey="sales" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
          </BarChart></ResponsiveContainer>
          )}
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card><CardHeader><CardTitle>Top Products</CardTitle></CardHeader>
          <CardContent><ul className="space-y-1 text-sm">
            {data.topProducts.length === 0 && <li className="text-muted-foreground">No sales available.</li>}
            {data.topProducts.map((t, i) => <li key={i} className="flex justify-between"><span>{i + 1}. {t.name}</span><span className="font-semibold">₹ {inr(t.amt)}</span></li>)}
          </ul></CardContent></Card>
        <Card><CardHeader><CardTitle>Top Customers</CardTitle></CardHeader>
          <CardContent><ul className="space-y-1 text-sm">
            {data.topCustomers.length === 0 && <li className="text-muted-foreground">No sales available.</li>}
            {data.topCustomers.map((t, i) => <li key={i} className="flex justify-between"><span>{i + 1}. {t.name}</span><span className="font-semibold">₹ {inr(t.amt)}</span></li>)}
          </ul></CardContent></Card>
      </div>
    </div>
  );
}

export default SalesReport;
