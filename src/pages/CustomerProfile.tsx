import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { inr, inrCompact } from "@/lib/num";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";
import { exportMultiSheet } from "@/lib/xlsx-export";
import { useApi } from "@/hooks/use-api";
import { customersApi } from "@/lib/services";
import { Loading, ErrorState } from "@/components/data-state";

function CustomerProfile() {
  const { id } = useParams();
  const { data, loading, error, refresh } = useApi(() => customersApi.profile(String(id)), [id]);

  if (loading) return <Loading label="Loading customer..." />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!data) return <div className="text-muted-foreground">Customer not found.</div>;

  const { customer: c, invoices, invoiceItems, totalSales, outstanding, lastPurchase, months } = data;

  const exportHistory = () => {
    const invRows = invoices.map((i) => ({
      "Invoice #": i.number, Date: format(new Date(i.date), "dd/MM/yyyy"),
      Total: i.total, Status: i.status,
    }));
    const monthWise: Record<string, { Month: string; Sales: number; Invoices: number }> = {};
    for (const i of invoices) {
      if (i.status !== "active") continue;
      const m = format(new Date(i.date), "MMM yyyy");
      if (!monthWise[m]) monthWise[m] = { Month: m, Sales: 0, Invoices: 0 };
      monthWise[m].Sales += i.total;
      monthWise[m].Invoices += 1;
    }
    const itemRows = invoices.flatMap((i) =>
      invoiceItems.filter((it) => String(it.invoiceId) === String(i._id)).map((it) => ({
        "Invoice #": i.number, Date: format(new Date(i.date), "dd/MM/yyyy"),
        Product: it.name, HSN: it.hsn, Boxes: it.boxes, Pieces: it.pieces,
        Rate: it.rate, "GST%": it.gstPct, Net: it.amount,
      })),
    );
    exportMultiSheet(
      { Invoices: invRows, "Month-wise": Object.values(monthWise), "Line Items": itemRows },
      `${c.name}-history.xlsx`,
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">{c.name}</h1>
        <span className="text-muted-foreground">{c.shopName}</span>
        <Button variant="outline" className="ml-auto" onClick={exportHistory}>Export History (Excel)</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><div className="text-xs uppercase text-muted-foreground">Total Sales</div><div className="text-2xl font-bold">₹ {inrCompact(totalSales)}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs uppercase text-muted-foreground">Outstanding</div><div className="text-2xl font-bold">₹ {inrCompact(outstanding)}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs uppercase text-muted-foreground">Invoices</div><div className="text-2xl font-bold">{invoices.length}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs uppercase text-muted-foreground">Last Purchase</div><div className="text-lg font-semibold">{lastPurchase ? format(new Date(lastPurchase), "dd MMM yyyy") : "—"}</div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Monthly Purchases</CardTitle></CardHeader>
          <CardContent style={{ height: 250 }}>
            <ResponsiveContainer><BarChart data={months}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" /><YAxis />
              <Tooltip formatter={(v: unknown) => "₹ " + inrCompact(Number(v))} />
              <Bar dataKey="sales" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart></ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <div><b>Mobile:</b> {c.mobile}</div>
            {c.gstin && <div><b>GSTIN:</b> {c.gstin}</div>}
            {c.address && <div>{c.address}</div>}
            {c.city && <div>{c.city} {c.pincode}</div>}
            {c.state && <div>{c.state} ({c.stateCode})</div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>All Bills</CardTitle></CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left"><tr><th className="p-2">Invoice #</th><th>Date</th><th className="text-right">Amount</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i._id} className="border-t hover:bg-muted/30">
                  <td className="p-2 font-medium">{i.number}</td>
                  <td>{format(new Date(i.date), "dd/MM/yyyy")}</td>
                  <td className="text-right">₹ {inr(i.total)}</td>
                  <td>{i.status}</td>
                  <td className="text-right pr-2"><Link to={`/invoice-preview/${i._id}`} className="text-primary hover:underline">View</Link></td>
                </tr>
              ))}
              {invoices.length === 0 && <tr><td colSpan={5} className="text-center p-6 text-muted-foreground">No bills yet.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default CustomerProfile;
