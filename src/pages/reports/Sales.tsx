import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useApi } from "@/hooks/use-api";
import { reportsApi } from "@/lib/services";
import { Loading, ErrorState } from "@/components/data-state";
import { inr } from "@/lib/num";
import { format } from "date-fns";

function Sales() {
  const today = new Date();
  const [from, setFrom] = useState(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10));
  const [to, setTo] = useState(today.toISOString().slice(0, 10));
  const { data, loading, error, refresh } = useApi(() => reportsApi.sales(from, to), [from, to]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold mr-auto">Sales Report</h1>
        <Input type="date" className="w-44" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input type="date" className="w-44" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      {error && <ErrorState message={error} onRetry={refresh} />}
      {loading && <Loading label="Loading sales..." />}

      <Card>
        <CardContent className="p-4">
          <div className="text-xs uppercase text-muted-foreground">Total Sales ({from} → {to})</div>
          <div className="text-2xl font-bold">₹ {inr(data?.total || 0)}</div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card>
          <CardHeader><CardTitle>Top Products</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <tbody>
                {(data?.topProducts || []).map((t, i) => (
                  <tr key={i} className="border-t"><td className="p-2">{t.name}</td><td className="p-2 text-right">₹ {inr(t.amt)}</td></tr>
                ))}
                {(data?.topProducts || []).length === 0 && <tr><td className="p-6 text-center text-muted-foreground">No sales available.</td></tr>}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Top Customers</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <tbody>
                {(data?.topCustomers || []).map((t, i) => (
                  <tr key={i} className="border-t"><td className="p-2">{t.name}</td><td className="p-2 text-right">₹ {inr(t.amt)}</td></tr>
                ))}
                {(data?.topCustomers || []).length === 0 && <tr><td className="p-6 text-center text-muted-foreground">No sales available.</td></tr>}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Invoices</CardTitle></CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-muted/50 text-left">
              <tr><th className="p-2">Invoice No</th><th>Date</th><th className="text-right">Taxable</th><th className="text-right">Total</th></tr>
            </thead>
            <tbody>
              {(data?.invoices || []).map((i) => (
                <tr key={i._id} className="border-t">
                  <td className="p-2"><Link className="text-primary hover:underline" to={`/invoices/${i._id}`}>{i.number}</Link></td>
                  <td>{i.date ? format(new Date(i.date), "dd/MM/yyyy") : "—"}</td>
                  <td className="text-right">₹ {inr(i.taxable || 0)}</td>
                  <td className="text-right font-semibold">₹ {inr(i.total || 0)}</td>
                </tr>
              ))}
              {(data?.invoices || []).length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No sales available.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default Sales;
