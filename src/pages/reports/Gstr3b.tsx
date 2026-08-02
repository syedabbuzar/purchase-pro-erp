import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import { reportsApi } from "@/lib/services";
import { Loading, ErrorState } from "@/components/data-state";
import { inr } from "@/lib/num";
import { exportSheet } from "@/lib/xlsx-export";

function Gstr3b() {
  const { data, loading, error, refresh } = useApi(() => reportsApi.gstr3b(), []);

  if (loading) return <Loading label="Loading GSTR-3B..." />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  const tiles = [
    { label: "Total Invoices", value: String(data?.totalInvoices ?? 0) },
    { label: "Taxable Value", value: "₹ " + inr(data?.taxableValue ?? 0) },
    { label: "CGST", value: "₹ " + inr(data?.cgst ?? 0) },
    { label: "SGST", value: "₹ " + inr(data?.sgst ?? 0) },
    { label: "IGST", value: "₹ " + inr(data?.igst ?? 0) },
    { label: "Total Tax", value: "₹ " + inr(data?.totalTax ?? 0) },
    { label: "Invoice Value", value: "₹ " + inr(data?.invoiceValue ?? 0) },
  ];

  const exportExcel = () =>
    exportSheet(
      [
        { Particulars: "Total Invoices", Value: data?.totalInvoices ?? 0 },
        { Particulars: "Taxable Value", Value: data?.taxableValue ?? 0 },
        { Particulars: "CGST", Value: data?.cgst ?? 0 },
        { Particulars: "SGST", Value: data?.sgst ?? 0 },
        { Particulars: "IGST", Value: data?.igst ?? 0 },
        { Particulars: "Total Tax", Value: data?.totalTax ?? 0 },
        { Particulars: "Invoice Value", Value: data?.invoiceValue ?? 0 },
      ],
      "gstr-3b.xlsx",
      "GSTR-3B",
    );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold mr-auto">GSTR-3B</h1>
        <Button variant="outline" onClick={exportExcel}>Export Excel</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tiles.map((t) => (
          <Card key={t.label}><CardContent className="p-4">
            <div className="text-xs uppercase text-muted-foreground">{t.label}</div>
            <div className="text-xl font-bold">{t.value}</div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}

export default Gstr3b;
