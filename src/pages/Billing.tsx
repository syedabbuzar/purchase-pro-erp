import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useMemo, useState } from "react";
import { db, currentStock, type Product, type Customer } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { computeItem, computeInvoice, nextInvoiceNumber } from "@/lib/gst";
import { inr } from "@/lib/num";
import { inrWords } from "@/lib/num";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Trash2, Search } from "lucide-react";

interface Row {
  productId: number;
  hsn: string; description: string;
  mrp: number; rate: number;
  boxes: number; pieces: number; boxSize: number;
  free: number; scheme: number; discount: number; gstPct: number;
}

interface StockIssue {
  productName: string;
  available: number;
  required: number;
  remaining: number;
}

function BillingPage() {
    const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit") ? Number(searchParams.get("edit")) || undefined : undefined;
  const duplicateId = searchParams.get("duplicate") ? Number(searchParams.get("duplicate")) || undefined : undefined;
  const products = useLiveQuery(() => db.products.where("status").equals("active").sortBy("name"), []);
  const customers = useLiveQuery(() => db.customers.orderBy("name").toArray(), []);
  const company = useLiveQuery(() => db.company.toCollection().first(), []);
  const [rows, setRows] = useState<Row[]>([]);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [newCust, setNewCust] = useState(false);
  const [meta, setMeta] = useState({
    paymentMode: "Cash", placeOfSupply: "Maharashtra",
    date: new Date().toISOString().slice(0, 10),
  });
  const [addSearch, setAddSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [stockIssue, setStockIssue] = useState<StockIssue | null>(null);
  const [loadedDraftFor, setLoadedDraftFor] = useState<string | null>(null);
  const navigate = useNavigate();
  const session = useAuth((s) => s.session);

  const customer = customers?.find((c) => c.id === customerId) || null;
  const isEditing = !!editId;

  useEffect(() => {
    const sourceId = editId || duplicateId;
    if (!sourceId) return;
    const key = `${editId ? "edit" : "duplicate"}:${sourceId}`;
    if (loadedDraftFor === key) return;

    let cancelled = false;
    async function loadInvoiceDraft() {
      const invoice = await db.invoices.get(sourceId);
      if (!invoice || cancelled) return;
      const items = (await db.invoiceItems.where("invoiceId").equals(sourceId).toArray()).sort((a, b) => a.srNo - b.srNo);
      if (cancelled) return;
      setCustomerId(invoice.customerId);
      setMeta({
        paymentMode: invoice.paymentMode || "Cash",
        placeOfSupply: invoice.placeOfSupply || "Maharashtra",
        date: editId ? new Date(invoice.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      });
      setRows(items.map((it) => ({
        productId: it.productId,
        hsn: it.hsn,
        description: it.description,
        mrp: it.mrp,
        rate: it.rate,
        boxes: it.boxes,
        pieces: it.pieces,
        boxSize: it.boxSize,
        free: it.free,
        scheme: it.scheme,
        discount: it.discount,
        gstPct: it.gstPct,
      })));
      setLoadedDraftFor(key);
      toast.info(editId ? `Editing invoice ${invoice.number}` : `Duplicated from invoice ${invoice.number}`);
    }
    loadInvoiceDraft();

    return () => { cancelled = true; };
  }, [editId, duplicateId, loadedDraftFor]);


  const updateRow = (idx: number, patch: Partial<Row>) => {
    setRows((rs) => rs.map((r, i) => i === idx ? { ...r, ...patch } : r));
  };

  const addProductToInvoice = (p: Product) => {
    if (rows.some((r) => r.productId === p.id)) { toast.info("Already in invoice"); return; }
    setRows((rs) => [...rs, {
      productId: p.id!, hsn: p.hsn, description: p.name,
      mrp: p.mrp, rate: p.rate, boxes: 0, pieces: 1, boxSize: p.boxSize,
      free: 0, scheme: 0, discount: 0, gstPct: p.gstPct,
    }]);
    setAddSearch("");
  };

  const computedRows = rows.map((r) => {
    const c = computeItem(r);
    return { ...r, taxable: c.taxable, gstAmount: c.gstAmount, netAmount: c.netAmount, totalPieces: c.totalPieces };
  });

  const totals = company ? computeInvoice(computedRows, company, customer) : null;

  const findStockIssue = async (): Promise<StockIssue | null> => {
    const originalSold = new Map<number, number>();
    if (editId) {
      const oldItems = await db.invoiceItems.where("invoiceId").equals(editId).toArray();
      for (const it of oldItems) {
        originalSold.set(it.productId, (originalSold.get(it.productId) || 0) + it.boxes * it.boxSize + it.pieces + it.free);
      }
    }

    for (const r of rows) {
      const st = await currentStock(r.productId);
      const available = st.totalPieces + (originalSold.get(r.productId) || 0);
      const required = r.boxes * r.boxSize + r.pieces + r.free;
      if (available < required) {
        const p = products!.find((x) => x.id === r.productId);
        return {
          productName: p?.name || r.description,
          available,
          required,
          remaining: available - required,
        };
      }
    }
    return null;
  };

  const saveInvoice = async () => {
    if (!customer || !company || !totals) { toast.error("Customer required"); return; }
    if (rows.length === 0) { toast.error("Add at least one item"); return; }
    if (computedRows.some((r) => r.totalPieces <= 0 && r.free <= 0)) { toast.error("Every item must have boxes, pieces, or free quantity"); return; }
    if (saving) return;

    // Stock must NEVER go negative. Block save if requested > available.
    const issue = await findStockIssue();
    if (issue) {
      setStockIssue(issue);
      return;
    }

    setSaving(true);
    const dateTs = new Date(meta.date).getTime();
    try {
      const invoiceId = await db.transaction("rw", [db.invoices, db.invoiceItems, db.invoiceReturns, db.stockLedger, db.payments, db.audit], async () => {
        let savedInvoiceId = editId;
        let number: string;

        if (editId) {
          const existing = await db.invoices.get(editId);
          if (!existing) throw new Error("Invoice not found");
          const returnCount = await db.invoiceReturns.where("invoiceId").equals(editId).count();
          if (returnCount > 0) throw new Error("Invoice has returned items and cannot be edited");
          number = existing.number;
          await db.invoices.update(editId, {
            date: dateTs, customerId: customer.id!,
            placeOfSupply: meta.placeOfSupply,
            paymentMode: meta.paymentMode,
            subtotal: totals.subtotal, totalDiscount: totals.totalDiscount,
            taxable: totals.taxable, cgst: totals.cgst, sgst: totals.sgst, igst: totals.igst,
            roundOff: totals.roundOff, total: totals.total,
            amountInWords: inrWords(totals.total),
            status: "active",
          });
          await db.invoiceItems.where("invoiceId").equals(editId).delete();
          const saleLedgers = (await db.stockLedger.where("refId").equals(editId).toArray()).filter((x) => x.type === "sale");
          await Promise.all(saleLedgers.map((x) => db.stockLedger.delete(x.id!)));
          await db.payments.where("invoiceId").equals(editId).delete();
        } else {
          const numbers = (await db.invoices.toArray()).map((x) => x.number);
          number = nextInvoiceNumber(company.invoicePrefix, numbers);
          savedInvoiceId = await db.invoices.add({
            number, date: dateTs, customerId: customer.id!,
            placeOfSupply: meta.placeOfSupply,
            paymentMode: meta.paymentMode,
            subtotal: totals.subtotal, totalDiscount: totals.totalDiscount,
            taxable: totals.taxable, cgst: totals.cgst, sgst: totals.sgst, igst: totals.igst,
            roundOff: totals.roundOff, total: totals.total,
            amountInWords: inrWords(totals.total),
            status: "active", createdBy: session?.userId, createdAt: Date.now(),
          }) as number;
        }

        for (let i = 0; i < computedRows.length; i++) {
          const r = computedRows[i];
          await db.invoiceItems.add({
            invoiceId: savedInvoiceId as number, srNo: i + 1,
            productId: r.productId, hsn: r.hsn, description: r.description,
            mrp: r.mrp, rate: r.rate, boxes: r.boxes, pieces: r.pieces, boxSize: r.boxSize,
            free: r.free, scheme: r.scheme, discount: r.discount, gstPct: r.gstPct,
            taxable: r.taxable, gstAmount: r.gstAmount, netAmount: r.netAmount,
          });
          await db.stockLedger.add({
            productId: r.productId, ts: Date.now(), type: "sale",
            boxes: -r.boxes, pieces: -(r.pieces + r.free),
            refId: savedInvoiceId as number, note: `Sale ${number}`,
          });
        }

        if (meta.paymentMode === "Cash") {
          await db.payments.add({
            customerId: customer.id!, invoiceId: savedInvoiceId as number,
            amount: totals.total, mode: "Cash", ts: dateTs,
          });
        }

        await db.audit.add({
          ts: Date.now(), userId: session?.userId,
          action: editId ? "update" : "create", entity: "invoice", entityId: savedInvoiceId as number,
        });
        return savedInvoiceId as number;
      });

      setStockIssue(null);
      toast.success(isEditing ? "Invoice updated successfully" : "Invoice saved successfully");
      navigate(`/invoice-preview/${String(invoiceId)}`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">{isEditing ? "Edit Invoice" : "New Invoice"}</h1>
        <Button className="ml-auto" onClick={() => saveInvoice()} disabled={saving}>{saving ? "Saving..." : isEditing ? "Update Invoice" : "Save Invoice"}</Button>
      </div>


      <Card>
        <CardContent className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-2">
            <Label>Customer *</Label>
            <div className="flex gap-2">
              <Select value={customerId ? String(customerId) : ""} onValueChange={(v) => setCustomerId(+v)}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>{customers?.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name} — {c.mobile}</SelectItem>)}</SelectContent>
              </Select>
              <Dialog open={newCust} onOpenChange={setNewCust}>
                <DialogTrigger asChild><Button variant="outline">New</Button></DialogTrigger>
                <QuickCustomer onSaved={(id) => { setCustomerId(id); setNewCust(false); }} />
              </Dialog>
            </div>
          </div>
          <div><Label>Bill Date</Label><Input type="date" value={meta.date} onChange={(e) => setMeta({ ...meta, date: e.target.value })} /></div>
          <div><Label>Place of Supply</Label><Input value={meta.placeOfSupply} onChange={(e) => setMeta({ ...meta, placeOfSupply: e.target.value })} /></div>
          <div><Label>Payment Mode</Label>
            <Select value={meta.paymentMode} onValueChange={(v) => setMeta({ ...meta, paymentMode: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Cash", "Credit", "UPI", "Cheque", "Bank Transfer"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <CardTitle className="mr-auto">Items</CardTitle>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground" />
            <Input placeholder="Add another product..." value={addSearch} onChange={(e) => setAddSearch(e.target.value)} className="pl-8 w-72" />
            {addSearch && (
              <div className="absolute z-10 mt-1 w-72 max-h-64 overflow-auto rounded-md border bg-popover shadow-lg">
                {(products || []).filter((p) => p.name.toLowerCase().includes(addSearch.toLowerCase()) || p.hsn.includes(addSearch)).slice(0, 10).map((p) => (
                  <button key={p.id} onClick={() => addProductToInvoice(p)} className="block w-full text-left px-3 py-2 text-sm hover:bg-accent">
                    {p.name} <span className="text-muted-foreground text-xs">— {p.hsn}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-1">Sr</th><th>HSN</th><th className="text-left">Description</th>
                <th>MRP</th><th>Rate</th><th>Box</th><th>Pcs</th><th>Free</th><th>Scheme</th>
                <th>Disc%</th><th>GST%</th><th>Taxable</th><th>GST</th><th>Net</th><th></th>
              </tr>
            </thead>
            <tbody>
              {computedRows.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="p-1 text-center">{i + 1}</td>
                  <td className="text-center">{r.hsn}</td>
                  <td>{r.description}</td>
                  <td><Input className="h-7 w-16" type="number" value={r.mrp} onChange={(e) => updateRow(i, { mrp: +e.target.value })} /></td>
                  <td><Input className="h-7 w-16" type="number" value={r.rate} onChange={(e) => updateRow(i, { rate: +e.target.value })} /></td>
                  <td><Input className="h-7 w-14" type="number" value={r.boxes} onChange={(e) => updateRow(i, { boxes: +e.target.value })} /></td>
                  <td><Input className="h-7 w-14" type="number" value={r.pieces} onChange={(e) => updateRow(i, { pieces: +e.target.value })} /></td>
                  <td><Input className="h-7 w-14" type="number" value={r.free} onChange={(e) => updateRow(i, { free: +e.target.value })} /></td>
                  <td><Input className="h-7 w-16" type="number" value={r.scheme} onChange={(e) => updateRow(i, { scheme: +e.target.value })} /></td>
                  <td><Input className="h-7 w-14" type="number" value={r.discount} onChange={(e) => updateRow(i, { discount: +e.target.value })} /></td>
                  <td><Input className="h-7 w-14" type="number" value={r.gstPct} onChange={(e) => updateRow(i, { gstPct: +e.target.value })} /></td>
                  <td className="text-right pr-1">{inr(r.taxable)}</td>
                  <td className="text-right pr-1">{inr(r.gstAmount)}</td>
                  <td className="text-right pr-1 font-semibold">{inr(r.netAmount)}</td>
                  <td><Button size="icon" variant="ghost" onClick={() => setRows((rs) => rs.filter((_, x) => x !== i))}><Trash2 className="h-3 w-3" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {totals && (
        <Card>
          <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><div className="text-muted-foreground text-xs">Subtotal</div><div className="font-semibold">₹ {inr(totals.subtotal)}</div></div>
            <div><div className="text-muted-foreground text-xs">Discount</div><div className="font-semibold">₹ {inr(totals.totalDiscount)}</div></div>
            <div><div className="text-muted-foreground text-xs">Taxable</div><div className="font-semibold">₹ {inr(totals.taxable)}</div></div>
            {totals.igst > 0 ? (
              <div><div className="text-muted-foreground text-xs">IGST</div><div className="font-semibold">₹ {inr(totals.igst)}</div></div>
            ) : (
              <>
                <div><div className="text-muted-foreground text-xs">CGST</div><div className="font-semibold">₹ {inr(totals.cgst)}</div></div>
                <div><div className="text-muted-foreground text-xs">SGST</div><div className="font-semibold">₹ {inr(totals.sgst)}</div></div>
              </>
            )}
            <div><div className="text-muted-foreground text-xs">Round Off</div><div className="font-semibold">₹ {inr(totals.roundOff)}</div></div>
            <div className="col-span-2 md:col-span-1 md:col-start-4 rounded-md bg-primary/20 p-3">
              <div className="text-xs uppercase">Grand Total</div>
              <div className="text-2xl font-bold">₹ {inr(totals.total)}</div>
            </div>
            <div className="col-span-full text-xs text-muted-foreground">{inrWords(totals.total)}</div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!stockIssue} onOpenChange={(open) => !open && setStockIssue(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Insufficient Stock</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-foreground">
                <div className="grid grid-cols-2 gap-2 rounded-md border bg-muted/30 p-3">
                  <span className="text-muted-foreground">Product:</span><b>{stockIssue?.productName}</b>
                  <span className="text-muted-foreground">Available:</span><b>{stockIssue?.available} Pieces</b>
                  <span className="text-muted-foreground">Required:</span><b>{stockIssue?.required} Pieces</b>
                </div>
                <p className="font-semibold text-destructive">
                  Invoice cannot be saved. Requested quantity exceeds available stock.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setStockIssue(null)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function QuickCustomer({ onSaved }: { onSaved: (id: number) => void }) {
  const [form, setForm] = useState<Partial<Customer>>({ name: "", mobile: "", state: "Maharashtra", stateCode: "27", status: "active" });
  const save = async () => {
    if (!form.name || !form.mobile) { toast.error("Name & mobile required"); return; }
    const id = await db.customers.add({ ...(form as Customer), createdAt: Date.now() });
    toast.success("Customer added");
    onSaved(id as number);
  };
  return (
    <DialogContent className="max-w-lg">
      <DialogHeader><DialogTitle>Quick add customer</DialogTitle></DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><Label>Name *</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><Label>Shop</Label><Input value={form.shopName || ""} onChange={(e) => setForm({ ...form, shopName: e.target.value })} /></div>
        <div><Label>Mobile *</Label><Input value={form.mobile || ""} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /></div>
        <div><Label>GSTIN</Label><Input value={form.gstin || ""} onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })} /></div>
        <div><Label>State Code</Label><Input value={form.stateCode || ""} onChange={(e) => setForm({ ...form, stateCode: e.target.value })} /></div>
        <div className="col-span-2"><Label>Address</Label><Textarea rows={2} value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
        <div className="col-span-2"><Button className="w-full" onClick={save}>Save Customer</Button></div>
      </div>
    </DialogContent>
  );
}
