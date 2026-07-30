import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { reportsApi } from "@/lib/services";
import { Loading, ErrorState } from "@/components/data-state";
import { inr } from "@/lib/num";
import { format } from "date-fns";
import { exportSheet } from "@/lib/xlsx-export";

function GstB2BExport() {
  const { data, loading, error, refresh } = useApi(() => reportsApi.gstB2B(), []);
  const rows = data || [];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold mr-auto">GST B2B Export</h1>
        <Button variant="outline" onClick={() => exportSheet(rows, "gst-b2b.xlsx")}>Export Excel</Button>
      </div>
      {error && <ErrorState message={error} onRetry={refresh} />}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading && <Loading label="Loading B2B data..." />}
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left"><tr>
              <th className="p-2">Invoice No</th><th>Date</th><th>Customer</th><th>GSTIN</th>
              <th className="text-right">Taxable</th><th className="text-right">CGST</th>
              <th className="text-right">SGST</th><th className="text-right">IGST</th>
              <th className="text-right">Total Tax</th><th className="text-right">Invoice Value</th>
            </tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{r.invoiceNo || "—"}</td>
                  <td>{r.invoiceDate ? format(new Date(r.invoiceDate), "dd/MM/yyyy") : "—"}</td>
                  <td>{r.customerName || "—"}</td>
                  <td>{r.gstin || "—"}</td>
                  <td className="text-right">{inr(r.taxableValue)}</td>
                  <td className="text-right">{inr(r.cgst)}</td>
                  <td className="text-right">{inr(r.sgst)}</td>
                  <td className="text-right">{inr(r.igst)}</td>
                  <td className="text-right">{inr(r.totalTax)}</td>
                  <td className="text-right font-semibold">{inr(r.invoiceValue)}</td>
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

export default GstB2BExport;
