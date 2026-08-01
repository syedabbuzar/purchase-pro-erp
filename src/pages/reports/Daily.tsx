import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useApi } from "@/hooks/use-api";
import { reportsApi } from "@/lib/services";
import { Loading, ErrorState } from "@/components/data-state";
import { inr } from "@/lib/num";

function Daily() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const { data, loading, error, refresh } = useApi(() => reportsApi.daily(date), [date]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold mr-auto">Daily Dispatch</h1>
        <Input type="date" className="w-48" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      {error && <ErrorState message={error} onRetry={refresh} />}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading && <Loading label="Loading dispatch..." />}
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-muted/50 text-left">
              <tr><th className="p-2">Product</th><th className="text-right">Boxes</th><th className="text-right">Pieces</th><th className="text-right">Invoices</th><th className="text-right">Amount</th></tr>
            </thead>
            <tbody>
              {(data?.rows || []).map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{r.name}</td>
                  <td className="text-right">{r.boxes}</td>
                  <td className="text-right">{r.pieces}</td>
                  <td className="text-right">{r.invoices}</td>
                  <td className="text-right">₹ {inr(r.amount)}</td>
                </tr>
              ))}
              {!loading && (data?.rows || []).length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No dispatch available.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default Daily;
