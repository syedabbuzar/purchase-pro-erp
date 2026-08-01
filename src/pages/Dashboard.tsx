import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading, ErrorState } from "@/components/data-state";
import { useApi } from "@/hooks/use-api";
import { reportsApi } from "@/lib/services";
import { inr } from "@/lib/num";
import { Link } from "react-router-dom";
import { format } from "date-fns";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs uppercase text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold mt-1">{value}</div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { data, loading, error, refresh } = useApi(() => reportsApi.dashboard(), []);

  if (loading) return <Loading label="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  const d = data;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Today's Sales" value={`₹ ${inr(d?.todaySales || 0)}`} />
        <Stat label="Today's Bills" value={String(d?.todayBills || 0)} />
        <Stat label="Customers" value={String(d?.customers || 0)} />
        <Stat label="Products" value={String(d?.products || 0)} />
        <Stat label="Low Stock" value={String(d?.lowStock || 0)} />
        <Stat label="Today Boxes" value={String(d?.todayBoxes || 0)} />
        <Stat label="Today Pieces" value={String(d?.todayPieces || 0)} />
        <Stat label="Pending" value={`₹ ${inr(d?.pending || 0)}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card>
          <CardHeader><CardTitle>Top Products</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <tbody>
                {(d?.top || []).map((t, i) => (
                  <tr key={i} className="border-t"><td className="p-2">{t.name}</td><td className="p-2 text-right">₹ {inr(t.amt)}</td></tr>
                ))}
                {(d?.top || []).length === 0 && <tr><td className="p-6 text-center text-muted-foreground">No sales available.</td></tr>}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recent Invoices</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <tbody>
                {(d?.recent || []).map((r) => (
                  <tr key={r._id} className="border-t">
                    <td className="p-2"><Link className="text-primary hover:underline" to={`/invoices/${r._id}`}>{r.number}</Link></td>
                    <td className="p-2">{r.date ? format(new Date(r.date), "dd/MM/yyyy") : "—"}</td>
                    <td className="p-2 text-right">₹ {inr(r.total || 0)}</td>
                  </tr>
                ))}
                {(d?.recent || []).length === 0 && <tr><td className="p-6 text-center text-muted-foreground">No invoices yet.</td></tr>}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
