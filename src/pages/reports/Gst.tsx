import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useApi } from "@/hooks/use-api";
import { reportsApi } from "@/lib/services";
import { Loading, ErrorState } from "@/components/data-state";
import { inr } from "@/lib/num";

function Gst() {
  const today = new Date();
  const [from, setFrom] = useState(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10));
  const [to, setTo] = useState(today.toISOString().slice(0, 10));
  const { data, loading, error, refresh } = useApi(() => reportsApi.gst(from, to), [from, to]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold mr-auto">GST Report</h1>
        <Input type="date" className="w-44" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input type="date" className="w-44" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      {error && <ErrorState message={error} onRetry={refresh} />}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading && <Loading label="Loading GST report..." />}
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-muted/50 text-left">
              <tr><th className="p-2">GST %</th><th className="text-right">Taxable</th><th className="text-right">CGST</th><th className="text-right">SGST</th><th className="text-right">IGST</th><th className="text-right">Total Tax</th></tr>
            </thead>
            <tbody>
              {(data || []).map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{r.gstPct}%</td>
                  <td className="text-right">₹ {inr(r.taxable)}</td>
                  <td className="text-right">₹ {inr(r.cgst)}</td>
                  <td className="text-right">₹ {inr(r.sgst)}</td>
                  <td className="text-right">₹ {inr(r.igst)}</td>
                  <td className="text-right font-semibold">₹ {inr(r.totalTax)}</td>
                </tr>
              ))}
              {!loading && (data || []).length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No GST data available.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default Gst;
