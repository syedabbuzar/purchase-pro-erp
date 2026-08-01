import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loading, ErrorState } from "@/components/data-state";
import { useApi } from "@/hooks/use-api";
import { invoicesApi } from "@/lib/services";
import { inr } from "@/lib/num";
import { format } from "date-fns";

function Invoices() {
  const [q, setQ] = useState("");
  const { data, loading, error, refresh } = useApi(() => invoicesApi.list(), []);
  const rows = (data || []).filter((i) =>
    q ? (i.number || "").toLowerCase().includes(q.toLowerCase()) : true,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold mr-auto">Invoices</h1>
        <Input placeholder="Search invoice no..." value={q} onChange={(e) => setQ(e.target.value)} className="w-72" />
      </div>
      {error && <ErrorState message={error} onRetry={refresh} />}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading && <Loading label="Loading invoices..." />}
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-muted/50 text-left">
              <tr><th className="p-2">Invoice No</th><th>Date</th><th className="text-right">Taxable</th><th className="text-right">GST</th><th className="text-right">Total</th><th>Status</th></tr>
            </thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i._id} className="border-t hover:bg-muted/30">
                  <td className="p-2"><Link className="font-medium text-primary hover:underline" to={`/invoices/${i._id}`}>{i.number}</Link></td>
                  <td>{i.date ? format(new Date(i.date), "dd/MM/yyyy") : "—"}</td>
                  <td className="text-right">₹ {inr(i.taxable || 0)}</td>
                  <td className="text-right">₹ {inr((i.cgst || 0) + (i.sgst || 0) + (i.igst || 0))}</td>
                  <td className="text-right font-semibold">₹ {inr(i.total || 0)}</td>
                  <td className="capitalize">{i.status}</td>
                </tr>
              ))}
              {!loading && rows.length === 0 && <tr><td colSpan={6} className="text-center p-6 text-muted-foreground">No invoices yet.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default Invoices;
