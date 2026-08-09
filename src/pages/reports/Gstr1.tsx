import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApi } from "@/hooks/use-api";
import { companyApi } from "@/lib/services";
import { generateGstr1Workbook, GSTR1_SHEETS, type Gstr1Result } from "@/lib/gstr1-export";
import { apiErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { Download, FileSpreadsheet } from "lucide-react";

const iso = (d: Date) => d.toISOString().slice(0, 10);
const monthStart = () => { const d = new Date(); return iso(new Date(d.getFullYear(), d.getMonth(), 1)); };
const monthEnd = () => { const d = new Date(); return iso(new Date(d.getFullYear(), d.getMonth() + 1, 0)); };

function Gstr1() {
  const { data: company } = useApi(() => companyApi.get(), []);
  const [from, setFrom] = useState(monthStart());
  const [to, setTo] = useState(monthEnd());
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Gstr1Result | null>(null);

  const generate = async () => {
    if (!from || !to) return toast.error("Select start and end date");
    if (new Date(from) > new Date(to)) return toast.error("Start date cannot be after end date");
    if (!company?.gstin) toast.warning("Company GSTIN missing — file name will not contain GSTIN");
    try {
      setBusy(true);
      const res = await generateGstr1Workbook({ from, to });
      setResult(res);
      toast.success(`GSTR-1 workbook generated (${res.counts.invoices} invoices)`);
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold mr-auto">GSTR-1 Excel Export</h1>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="space-y-1">
              <Label>GST Entity</Label>
              <Input value={company?.name || "—"} readOnly />
            </div>
            <div className="space-y-1">
              <Label>GSTIN</Label>
              <Input value={company?.gstin || "—"} readOnly />
            </div>
            <div className="space-y-1">
              <Label>Start Date</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>End Date</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
          <Button onClick={generate} disabled={busy}>
            <Download className="h-4 w-4 mr-1" />
            {busy ? "Generating..." : "Generate GSTR-1 Excel"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-sm font-semibold mb-2 flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" /> Sheets included (in order)
          </div>
          <div className="flex flex-wrap gap-2">
            {GSTR1_SHEETS.map((s) => (
              <span key={s} className="rounded border px-2 py-0.5 text-xs text-muted-foreground">{s}</span>
            ))}
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="p-4 space-y-2 text-sm">
            <div className="font-semibold">Generated: {result.fileName}</div>
            <div className="text-muted-foreground">
              B2B rows: {result.counts.b2b} · B2CL: {result.counts.b2cl} · B2CS: {result.counts.b2cs} ·
              HSN: {result.counts.hsn} · Cancelled documents: {result.counts.cancelled}
            </div>
            {result.warnings.length > 0 && (
              <div className="space-y-1">
                <div className="font-semibold text-destructive">Validation warnings</div>
                <ul className="list-disc pl-5 text-muted-foreground">
                  {result.warnings.slice(0, 25).map((w) => <li key={w}>{w}</li>)}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Gstr1;
