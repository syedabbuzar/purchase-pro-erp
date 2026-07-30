import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { reportsApi } from "@/lib/services";
import { Loading, ErrorState } from "@/components/data-state";
import { inr } from "@/lib/num";
import { format } from "date-fns";
import { exportSheet } from "@/lib/xlsx-export";

function Gstr1B2B() {
  const { data, loading, error, refresh } = useApi(() => reportsApi.gstr1B2B(), []);
  const rows = data || [];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold mr-auto">GSTR-1 B2B</h1>
        <Button variant="outline" onClick={() => exportSheet(rows as unknown as Record<string, unknown>[], "gstr1-b2b.xlsx")}>Export Excel</Button>
      </div>
      {error && <ErrorState message={error} onRetry={refresh} />}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading && <Loading label="Loading GSTR-1 B2B..." />}
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left"><tr>
              <th className="p-2">GSTIN</th><th>Customer</th><th>Invoice No</th><th>Date</th>
              <th className="text-right">Invoice Value</th><th className="text-right">Taxable</th>
              <th className="text-right">CGST</th><th className="text-right">SGST</th>
              <th className="text-right">IGST</th><th className="text-right">Tax</th>
            </tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{r.gstin || "—"}</td>
                  <td>{r.customerName || "—"}</td>
                  <td>{r.invoiceNumber || "—"}</td>
                  <td>{r.invoiceDate ? format(new Date(r.invoiceDate), "dd/MM/yyyy") : "—"}</td>
                  <td className="text-right">{inr(r.invoiceValue)}</td>
                  <td className="text-right">{inr(r.taxableValue)}</td>
                  <td className="text-right">{inr(r.cgst)}</td>
                  <td className="text-right">{inr(r.sgst)}</td>
                  <td className="text-right">{inr(r.igst)}</td>
                  <td className="text-right font-semibold">{inr(r.taxAmount)}</td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={10} className="text-center p-8 text-muted-foreground">No B2B invoices found.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default Gstr1B2B;
