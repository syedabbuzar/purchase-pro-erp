import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loading, ErrorState } from "@/components/data-state";
import { useApi } from "@/hooks/use-api";
import { invoicesApi } from "@/lib/services";
import { apiErrorMessage } from "@/lib/api";
import { inr } from "@/lib/num";
import { format } from "date-fns";
import { toast } from "sonner";
import { Ban, Copy, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Confirm = { id: string; number: string; action: "cancel" | "delete" } | null;

function Invoices() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "cancelled">("all");
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [busy, setBusy] = useState(false);
  const { data, loading, error, refresh } = useApi(() => invoicesApi.list(), []);

  const rows = (data || [])
    .filter((i) => (status === "all" ? true : i.status === status))
    .filter((i) => (q ? (i.number || "").toLowerCase().includes(q.toLowerCase()) : true));

  const runConfirm = async () => {
    if (!confirm) return;
    try {
      setBusy(true);
      if (confirm.action === "cancel") {
        await invoicesApi.cancel(confirm.id);
        toast.success(`Invoice ${confirm.number} cancelled — stock restored`);
      } else {
        await invoicesApi.remove(confirm.id);
        toast.success(`Invoice ${confirm.number} deleted`);
      }
      setConfirm(null);
      await refresh();
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold mr-auto">Invoices</h1>
        <div className="flex gap-1">
          {(["all", "active", "cancelled"] as const).map((s) => (
            <Button key={s} size="sm" variant={status === s ? "default" : "outline"} className="capitalize" onClick={() => setStatus(s)}>
              {s}
            </Button>
          ))}
        </div>
        <Input placeholder="Search invoice no..." value={q} onChange={(e) => setQ(e.target.value)} className="w-64" />
        <Button size="sm" onClick={() => navigate("/billing")}>
          <Plus className="h-4 w-4 mr-1" /> New Invoice
        </Button>
      </div>
      {error && <ErrorState message={error} onRetry={refresh} />}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading && <Loading label="Loading invoices..." />}
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-2">Invoice No</th><th>Date</th>
                <th className="text-right">Taxable</th><th className="text-right">GST</th>
                <th className="text-right">Total</th><th>Status</th>
                <th className="text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i._id} className="border-t hover:bg-muted/30">
                  <td className="p-2">
                    <button className="font-medium text-primary hover:underline" onClick={() => navigate(`/invoices/${i._id}`)}>
                      {i.number}
                    </button>
                  </td>
                  <td>{i.date ? format(new Date(i.date), "dd/MM/yyyy") : "—"}</td>
                  <td className="text-right">₹ {inr(i.taxable || 0)}</td>
                  <td className="text-right">₹ {inr((i.cgst || 0) + (i.sgst || 0) + (i.igst || 0))}</td>
                  <td className="text-right font-semibold">₹ {inr(i.total || 0)}</td>
                  <td className="capitalize">{i.status}</td>
                  <td className="pr-2">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" title="View" onClick={() => navigate(`/invoices/${i._id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" title="Duplicate" onClick={() => navigate(`/billing?duplicate=${i._id}`)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" title="Edit" disabled={i.status !== "active"} onClick={() => navigate(`/billing?edit=${i._id}`)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" title="Cancel" disabled={i.status !== "active"} onClick={() => setConfirm({ id: i._id, number: i.number, action: "cancel" })}>
                        <Ban className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" title="Delete" onClick={() => setConfirm({ id: i._id, number: i.number, action: "delete" })}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && <tr><td colSpan={7} className="text-center p-6 text-muted-foreground">No invoices yet.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.action === "cancel" ? "Cancel invoice" : "Delete invoice"} {confirm?.number}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.action === "cancel"
                ? "The invoice will be marked cancelled and the sold stock restored."
                : "The invoice will be deleted and its stock movements reversed. This cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Back</AlertDialogCancel>
            <AlertDialogAction disabled={busy} onClick={(e) => { e.preventDefault(); void runConfirm(); }}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Invoices;
