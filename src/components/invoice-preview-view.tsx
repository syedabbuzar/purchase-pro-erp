import { Link, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo, useState } from "react";
import { db, type InvoiceItem, type InvoiceReturnItem } from "@/lib/db";
import { InvoiceSheet } from "@/components/invoice-sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { inr } from "@/lib/num";
import { toast } from "sonner";
import {
  ArrowLeft,
  FilePlus,
  History,
  Download,
  Share2,
  Copy,
  LayoutDashboard,
  User,
  Pencil,
  Printer,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";

interface ReturnDraft {
  invoiceItemId: number;
  boxes: number;
  pieces: number;
}

export function InvoicePreviewView({ invoiceId }: { invoiceId: number }) {
  const navigate = useNavigate();
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnNote, setReturnNote] = useState("");
  const [returnRows, setReturnRows] = useState<ReturnDraft[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const data = useLiveQuery(async () => {
    const invoice = await db.invoices.get(invoiceId);
    if (!invoice) return null;
    const items = (await db.invoiceItems.where("invoiceId").equals(invoiceId).toArray()).sort((a, b) => a.srNo - b.srNo);
    const customer = await db.customers.get(invoice.customerId);
    const company = await db.company.toCollection().first();
    const returns = (await db.invoiceReturns.where("invoiceId").equals(invoiceId).toArray()).sort((a, b) => b.date - a.date);
    const returnItems = await db.invoiceReturnItems.where("invoiceId").equals(invoiceId).toArray();
    return { invoice, items, customer, company, returns, returnItems };
  }, [invoiceId]);

  const returnedByItem = useMemo(() => {
    const map = new Map<number, { boxes: number; pieces: number; totalPieces: number; amount: number }>();
    for (const it of data?.returnItems || []) {
      const current = map.get(it.invoiceItemId) || { boxes: 0, pieces: 0, totalPieces: 0, amount: 0 };
      current.boxes += it.boxes;
      current.pieces += it.pieces;
      current.totalPieces += it.boxes * it.boxSize + it.pieces;
      current.amount += it.netAmount;
      map.set(it.invoiceItemId, current);
    }
    return map;
  }, [data?.returnItems]);

  if (!data) return <div>Loading...</div>;
  if (!data.invoice || !data.customer || !data.company) return <div>Not found</div>;

  const invoice = data.invoice;
  const customer = data.customer;
  const company = data.company;

  const returnTotal = data.returns.reduce((s, r) => s + r.total, 0);
  const canModify = invoice.status === "active";

  const openReturnDialog = () => {
    setReturnRows(data.items.map((it) => ({ invoiceItemId: it.id!, boxes: 0, pieces: 0 })));
    setReturnNote("");
    setReturnOpen(true);
  };

  const updateReturnRow = (invoiceItemId: number, patch: Partial<ReturnDraft>) => {
    setReturnRows((rows) => rows.map((row) => (row.invoiceItemId === invoiceItemId ? { ...row, ...patch } : row)));
  };

  const getRemainingPieces = (item: InvoiceItem) => {
    const sold = item.boxes * item.boxSize + item.pieces + item.free;
    return sold - (returnedByItem.get(item.id!)?.totalPieces || 0);
  };

  const saveReturn = async () => {
    const selected = returnRows
      .map((row) => {
        const item = data.items.find((it) => it.id === row.invoiceItemId)!;
        const totalPieces = row.boxes * item.boxSize + row.pieces;
        return { row, item, totalPieces };
      })
      .filter((x) => x.totalPieces > 0);

    if (selected.length === 0) { toast.error("Enter return quantity"); return; }

    for (const x of selected) {
      const remaining = getRemainingPieces(x.item);
      if (x.totalPieces > remaining) {
        toast.error(`Return quantity exceeds sold quantity for ${x.item.description}`);
        return;
      }
    }

    const taxable = selected.reduce((s, x) => s + x.item.taxable * (x.totalPieces / Math.max(1, x.item.boxes * x.item.boxSize + x.item.pieces + x.item.free)), 0);
    const gstAmount = selected.reduce((s, x) => s + x.item.gstAmount * (x.totalPieces / Math.max(1, x.item.boxes * x.item.boxSize + x.item.pieces + x.item.free)), 0);
    const total = selected.reduce((s, x) => s + x.item.netAmount * (x.totalPieces / Math.max(1, x.item.boxes * x.item.boxSize + x.item.pieces + x.item.free)), 0);

    await db.transaction("rw", [db.invoiceReturns, db.invoiceReturnItems, db.stockLedger, db.audit], async () => {
      const returnId = await db.invoiceReturns.add({
        invoiceId,
        customerId: data.customer!.id!,
        date: Date.now(),
        taxable: +taxable.toFixed(2),
        gstAmount: +gstAmount.toFixed(2),
        total: +total.toFixed(2),
        note: returnNote,
        createdAt: Date.now(),
      }) as number;

      for (const x of selected) {
        const soldPieces = Math.max(1, x.item.boxes * x.item.boxSize + x.item.pieces + x.item.free);
        const ratio = x.totalPieces / soldPieces;
        await db.invoiceReturnItems.add({
          returnId,
          invoiceId,
          invoiceItemId: x.item.id!,
          productId: x.item.productId,
          hsn: x.item.hsn,
          description: x.item.description,
          boxes: x.row.boxes,
          pieces: x.row.pieces,
          boxSize: x.item.boxSize,
          taxable: +(x.item.taxable * ratio).toFixed(2),
          gstAmount: +(x.item.gstAmount * ratio).toFixed(2),
          netAmount: +(x.item.netAmount * ratio).toFixed(2),
        });
        await db.stockLedger.add({
          productId: x.item.productId,
          ts: Date.now(),
          type: "return",
          boxes: x.row.boxes,
          pieces: x.row.pieces,
          refId: invoiceId,
          note: `Return ${data.invoice!.number}`,
        });
      }
      await db.audit.add({ ts: Date.now(), action: "return", entity: "invoice", entityId: invoiceId, note: returnNote });
    });

    toast.success("Return saved and stock updated");
    setReturnOpen(false);
  };

  const cancelInvoice = async () => {
    if (data.invoice!.status !== "active") { toast.error("Invoice is already cancelled"); return; }
    await db.transaction("rw", [db.invoices, db.stockLedger, db.audit], async () => {
      const fresh = await db.invoices.get(invoiceId);
      if (!fresh || fresh.status !== "active") throw new Error("Invoice is already cancelled");
      await db.invoices.update(invoiceId, { status: "cancelled" });
      // Restore exactly what was sold (sale minus what was already returned).
      const alreadyReturned = returnedByItem;
      for (const it of data.items) {
        const sold = it.boxes * it.boxSize + it.pieces + it.free;
        const restore = sold - (alreadyReturned.get(it.id!)?.totalPieces || 0);
        if (restore <= 0) continue;
        await db.stockLedger.add({
          productId: it.productId, ts: Date.now(), type: "cancel",
          boxes: 0, pieces: restore,
          refId: invoiceId, note: `Cancel ${data.invoice!.number}`,
        });
      }
      await db.audit.add({ ts: Date.now(), action: "cancel", entity: "invoice", entityId: invoiceId });
    });
    toast.success("Invoice cancelled and stock restored");
  };

  const deleteInvoice = async () => {
    await db.transaction("rw", [db.invoices, db.stockLedger, db.payments, db.audit], async () => {
      await db.invoices.update(invoiceId, { status: "deleted" });
      if (data.invoice!.status === "active") {
        for (const it of data.items) {
          await db.stockLedger.add({
            productId: it.productId, ts: Date.now(), type: "cancel",
            boxes: it.boxes, pieces: it.pieces + it.free,
            refId: invoiceId, note: `Delete ${data.invoice!.number}`,
          });
        }
      }
      await db.payments.where("invoiceId").equals(invoiceId).delete();
      await db.audit.add({ ts: Date.now(), action: "delete", entity: "invoice", entityId: invoiceId });
    });
    setDeleteOpen(false);
    toast.success("Invoice deleted");
    navigate("/invoices");
  };

  const share = async () => {
    const text = `Invoice ${invoice.number} — ${customer.name} — ₹${invoice.total.toFixed(2)}`;
    try {
      if (navigator.share) await navigator.share({ title: `Invoice ${invoice.number}`, text });
      else {
        await navigator.clipboard.writeText(text);
        toast.success("Invoice details copied to clipboard");
      }
    } catch {
      // sharing cancelled
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 no-print">
        <Button variant="outline" size="sm" onClick={() => navigate("/billing")}>
          <ArrowLeft className="h-4 w-4 mr-1" />Billing
        </Button>
        <h1 className="text-lg font-bold">Invoice {invoice.number}</h1>
        {invoice.status !== "active" && <Badge variant="destructive">{invoice.status.toUpperCase()}</Badge>}
        {returnTotal > 0 && <Badge variant="secondary">Return ₹ {inr(returnTotal)}</Badge>}
      </div>

      <div className="flex flex-wrap gap-2 no-print">
        <Button size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-1" />Print Invoice
        </Button>
        <Button size="sm" variant="secondary" onClick={() => window.print()}>
          <Download className="h-4 w-4 mr-1" />Download PDF
        </Button>
        <Button size="sm" variant="outline" onClick={share}>
          <Share2 className="h-4 w-4 mr-1" />Share
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link to={`/billing?duplicate=${invoiceId}`}><Copy className="h-4 w-4 mr-1" />Duplicate Invoice</Link>
        </Button>
        <Button size="sm" variant="outline" disabled={!canModify || returnTotal > 0} asChild={canModify && returnTotal === 0}>
          {canModify && returnTotal === 0 ? <Link to={`/billing?edit=${invoiceId}`}><Pencil className="h-4 w-4 mr-1" />Edit Invoice</Link> : <span><Pencil className="h-4 w-4 mr-1" />Edit Invoice</span>}
        </Button>
        <Button size="sm" variant="outline" onClick={openReturnDialog} disabled={!canModify}>
          <RotateCcw className="h-4 w-4 mr-1" />Return Item
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link to="/billing"><FilePlus className="h-4 w-4 mr-1" />Create New Bill</Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link to="/invoices"><History className="h-4 w-4 mr-1" />Invoice History</Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link to={`/customers/${customer.id}`}><User className="h-4 w-4 mr-1" />Customer History</Link>
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link to="/dashboard"><LayoutDashboard className="h-4 w-4 mr-1" />Back to Dashboard</Link>
        </Button>
        {canModify && (
          <Button size="sm" variant="destructive" onClick={cancelInvoice} className="ml-auto">
            <X className="h-4 w-4 mr-1" />Cancel Invoice
          </Button>
        )}
      </div>

      <div className="bg-white shadow-md mx-auto max-w-4xl">
        <InvoiceSheet invoice={invoice} items={data.items} customer={customer} company={company} returnItems={data.returnItems} />
      </div>

      {data.returns.length > 0 && (
        <div className="no-print rounded-md border bg-card p-3 text-sm">
          <h2 className="font-semibold mb-2">Return History</h2>
          <table className="w-full">
            <thead className="text-left text-muted-foreground"><tr><th>Date</th><th>Note</th><th className="text-right">Return Amount</th></tr></thead>
            <tbody>{data.returns.map((r) => <tr key={r.id} className="border-t"><td className="py-2">{new Date(r.date).toLocaleDateString("en-IN")}</td><td>{r.note || "—"}</td><td className="text-right">₹ {inr(r.total)}</td></tr>)}</tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end no-print">
        <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)} className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4 mr-1" />Delete Invoice
        </Button>
      </div>

      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>Return Items — {data.invoice.number}</DialogTitle></DialogHeader>
          <div className="max-h-[55vh] overflow-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left"><tr><th className="p-2">Product</th><th className="text-right">Sold</th><th className="text-right">Already Returned</th><th className="text-right">Return Boxes</th><th className="text-right">Return Pieces</th></tr></thead>
              <tbody>
                {data.items.map((it) => {
                  const returned = returnedByItem.get(it.id!);
                  const row = returnRows.find((r) => r.invoiceItemId === it.id) || { boxes: 0, pieces: 0 };
                  const sold = it.boxes * it.boxSize + it.pieces + it.free;
                  return (
                    <tr key={it.id} className="border-t">
                      <td className="p-2 font-medium">{it.description}<div className="text-xs text-muted-foreground">HSN {it.hsn} • {it.boxSize} pcs/box</div></td>
                      <td className="text-right">{sold} pcs</td>
                      <td className="text-right">{returned?.totalPieces || 0} pcs</td>
                      <td className="text-right"><Input type="number" min={0} className="ml-auto h-8 w-24" value={row.boxes} onChange={(e) => updateReturnRow(it.id!, { boxes: Math.max(0, +e.target.value) })} /></td>
                      <td className="text-right"><Input type="number" min={0} className="ml-auto h-8 w-24" value={row.pieces} onChange={(e) => updateReturnRow(it.id!, { pieces: Math.max(0, +e.target.value) })} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div><Label>Return Note</Label><Textarea rows={2} value={returnNote} onChange={(e) => setReturnNote(e.target.value)} /></div>
          <DialogFooter><Button variant="outline" onClick={() => setReturnOpen(false)}>Cancel</Button><Button onClick={saveReturn}>Save Return</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the invoice from active reports and restore sold stock if it is still active.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteInvoice}>Delete Invoice</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
