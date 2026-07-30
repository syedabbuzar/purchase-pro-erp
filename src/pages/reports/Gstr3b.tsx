import { Card, CardContent } from "@/components/ui/card";
import { useApi } from "@/hooks/use-api";
import { reportsApi } from "@/lib/services";
import { Loading, ErrorState } from "@/components/data-state";
import { inr } from "@/lib/num";

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

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">GSTR-3B</h1>
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
