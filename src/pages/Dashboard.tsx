import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { inr, inrCompact } from "@/lib/num";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { format, startOfDay, endOfDay, startOfMonth, subMonths } from "date-fns";

function Dashboard() {
  const data = useLiveQuery(async () => {
    const now = new Date();
    const dayStart = startOfDay(now).getTime();
    const dayEnd = endOfDay(now).getTime();
    const invoices = await db.invoices.toArray();
    const activeInvoices = invoices.filter((i) => i.status === "active");
    const today = activeInvoices.filter((i) => i.date >= dayStart && i.date <= dayEnd);
    const items = await db.invoiceItems.toArray();
    const todayItems = items.filter((it) => today.some((i) => i.id === it.invoiceId));
    const payments = await db.payments.toArray();
    const todayCollection = payments.filter((p) => p.ts >= dayStart && p.ts <= dayEnd).reduce((s, p) => s + p.amount, 0);
    const totalSales = activeInvoices.reduce((s, i) => s + i.total, 0);
    const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
    const products = await db.products.toArray();
    const customers = await db.customers.toArray();

    // Low stock
    const stockEntries = await db.stockLedger.toArray();
    const stockByProduct = new Map<number, number>();
    for (const e of stockEntries) {
      const p = products.find((x) => x.id === e.productId);
      const bs = p?.boxSize || 1;
      stockByProduct.set(e.productId, (stockByProduct.get(e.productId) || 0) + e.boxes * bs + e.pieces);
    }
    const lowStock = products.filter((p) => {
      const total = stockByProduct.get(p.id!) || 0;
      const boxes = Math.floor(total / (p.boxSize || 1));
      return boxes <= (p.minStockAlert || 0);
    });

    // Monthly sales chart (last 6 months)
    const monthly: { month: string; sales: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const m = subMonths(now, i);
      const ms = startOfMonth(m).getTime();
      const me = startOfMonth(subMonths(now, i - 1)).getTime();
      const sales = activeInvoices.filter((x) => x.date >= ms && x.date < me).reduce((s, x) => s + x.total, 0);
      monthly.push({ month: format(m, "MMM"), sales });
    }

    // Top selling
    const productSales = new Map<number, number>();
    for (const it of items) {
      productSales.set(it.productId, (productSales.get(it.productId) || 0) + it.netAmount);
    }
    const top = [...productSales.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pid, amt]) => ({ name: products.find((p) => p.id === pid)?.name || "—", amt }));

    const recent = [...activeInvoices].sort((a, b) => b.date - a.date).slice(0, 8);

    // today boxes/pieces
    let todayBoxes = 0, todayPieces = 0;
    for (const it of todayItems) { todayBoxes += it.boxes; todayPieces += it.pieces; }

    return {
      todaySales: today.reduce((s, i) => s + i.total, 0),
      todayBills: today.length,
      todayCollection,
      pending: totalSales - totalPaid,
      customers: customers.length,
      products: products.length,
      lowStock: lowStock.length,
      todayBoxes, todayPieces,
      monthly, top, recent, invoicesById: activeInvoices, customersById: customers,
    };
  }, []);

  if (!data) return <div>Loading...</div>;

  const kpis = [
    { label: "Today's Sales", value: "₹ " + inrCompact(data.todaySales) },
    { label: "Today's Bills", value: data.todayBills },
    { label: "Today's Collection", value: "₹ " + inrCompact(data.todayCollection) },
    { label: "Pending Amount", value: "₹ " + inrCompact(data.pending) },
    { label: "Customers", value: data.customers },
    { label: "Products", value: data.products },
    { label: "Low Stock", value: data.lowStock, danger: data.lowStock > 0 },
    { label: "Boxes Sold Today", value: data.todayBoxes },
    { label: "Pieces Sold Today", value: data.todayPieces },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {kpis.map((k) => (
          <Card key={k.label} className={k.danger ? "border-destructive" : ""}>
            <CardContent className="p-4">
              <div className="text-xs uppercase text-muted-foreground tracking-wide">{k.label}</div>
              <div className={"text-2xl font-bold mt-1 " + (k.danger ? "text-destructive" : "")}>{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Monthly Sales</CardTitle></CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthly}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v: unknown) => "₹ " + inrCompact(Number(v))} />
                <Bar dataKey="sales" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top Selling Products</CardTitle></CardHeader>
          <CardContent>
            {data.top.length === 0 ? (
              <div className="text-sm text-muted-foreground">No sales yet.</div>
            ) : (
              <ul className="space-y-2">
                {data.top.map((t, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span className="truncate mr-2">{i + 1}. {t.name}</span>
                    <span className="font-semibold">₹ {inrCompact(t.amt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Bills</CardTitle></CardHeader>
        <CardContent>
          {data.recent.length === 0 ? (
            <div className="text-sm text-muted-foreground">No invoices yet. <Link to="/billing" className="text-primary underline">Create your first bill</Link>.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground border-b">
                <tr><th className="py-2">Invoice #</th><th>Date</th><th>Customer</th><th className="text-right">Amount</th></tr>
              </thead>
              <tbody>
                {data.recent.map((r) => {
                  const c = data.customersById.find((x) => x.id === r.customerId);
                  return (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-2"><Link to={`/invoice-preview/${String(r.id)}`} className="text-primary hover:underline">{r.number}</Link></td>
                      <td>{format(r.date, "dd/MM/yyyy")}</td>
                      <td>{c?.name || "—"}</td>
                      <td className="text-right font-semibold">₹ {inr(r.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
