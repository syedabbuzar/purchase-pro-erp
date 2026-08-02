import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { inr } from "@/lib/num";
import { formatQty } from "@/lib/qty";
import { useApi } from "@/hooks/use-api";
import { apiErrorMessage } from "@/lib/api";
import { companyApi, productsApi, purchasesApi, stockApi } from "@/lib/services";
import { Loading, ErrorState } from "@/components/data-state";
import type { Product } from "@/lib/types";

interface Row {
  /** undefined => new product (auto-created on save) */
  productId?: string;
  name: string;
  hsn: string;
  batch?: string;
  expiry?: string; // yyyy-mm-dd
  gstPct: number;
  boxSize: number; // pieces per box
  boxes: number;
  pieces: number; // loose pieces
  rate: number; // per piece
  discount: number; // item discount %
}

function totalPiecesOf(r: Row) {
  // Total Pieces = (Boxes × Pieces Per Box) + Loose Pieces
  return (r.boxes || 0) * (r.boxSize || 1) + (r.pieces || 0);
}

function computeRow(r: Row, interState: boolean, billFactor = 1) {
  const totalPieces = totalPiecesOf(r);
  const gross = totalPieces * (r.rate || 0);
  const discountAmount = +(gross * ((r.discount || 0) / 100)).toFixed(2);
  // Bill-level discount is applied on the rate/taxable value (before GST),
  // distributed proportionally across the lines.
  const taxable = Math.max(0, (gross - discountAmount) * billFactor);
  const gstAmount = +(taxable * ((r.gstPct || 0) / 100)).toFixed(2);
  const cgst = interState ? 0 : +(gstAmount / 2).toFixed(2);
  const sgst = interState ? 0 : +(gstAmount - cgst).toFixed(2);
  const igst = interState ? gstAmount : 0;
  const total = +(taxable + gstAmount).toFixed(2);
  return { totalPieces, discountAmount, taxable: +taxable.toFixed(2), gstAmount, cgst, sgst, igst, total };
}

const emptyForm = {
  invoiceNo: "",
  supplier: "",
  supplierGstin: "",
  supplierState: "",
  referenceNo: "",
  placeOfSupply: "",
  transport: "",
  vehicleNo: "",
  driver: "",
  lrNo: "",
  date: new Date().toISOString().slice(0, 10),
  remarks: "",
  narration: "",
  note: "",
  discount: 0, // bill level discount (amount)
};

function Purchases() {
  const navigate = useNavigate();
  const savingRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [historyQuery, setHistoryQuery] = useState("");
  const [form, setForm] = useState({ ...emptyForm });
  const [rows, setRows] = useState<Row[]>([]);
  const [addSearch, setAddSearch] = useState("");

  const { data: products, refresh: refreshProducts } = useApi(() => productsApi.list(), []);
  const { data: company } = useApi(() => companyApi.get(), []);
  const {
    data: purchases,
    loading: purchasesLoading,
    error: purchasesError,
    refresh: refreshPurchases,
  } = useApi(() => purchasesApi.list(), []);

  const companyState = (company?.stateCode || "").trim();
  const supplierState = (form.supplierState || "").trim();
  const interState = !!companyState && !!supplierState && companyState !== supplierState;

  const billDiscount = +(form.discount || 0);
  const baseTaxable = rows.reduce((s, r) => {
    const gross = totalPiecesOf(r) * (r.rate || 0);
    return s + Math.max(0, gross - gross * ((r.discount || 0) / 100));
  }, 0);
  const billFactor = baseTaxable > 0 ? Math.max(0, (baseTaxable - billDiscount) / baseTaxable) : 1;

  const totals = rows.reduce(
    (acc, r) => {
      const c = computeRow(r, interState, billFactor);
      acc.taxable += c.taxable;
      acc.discount += c.discountAmount;
      acc.gst += c.gstAmount;
      acc.cgst += c.cgst;
      acc.sgst += c.sgst;
      acc.igst += c.igst;
      acc.total += c.total;
      return acc;
    },
    { taxable: 0, discount: 0, gst: 0, cgst: 0, sgst: 0, igst: 0, total: 0 },
  );
  const grandTotal = +totals.total.toFixed(2);

  const addExistingProduct = (p: Product) => {
    if (rows.some((r) => r.productId === p._id)) {
      toast.info("Already added");
      return;
    }
    setRows((rs) => [
      ...rs,
      {
        productId: p._id,
        name: p.name,
        hsn: p.hsn || "",
        gstPct: p.gstPct,
        boxSize: p.boxSize || 1,
        boxes: 0,
        pieces: 0,
        rate: 0,
        discount: 0,
      },
    ]);
    setAddSearch("");
  };

  const addNewProductRow = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (rows.some((r) => r.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.info("Already in this purchase");
      return;
    }
    setRows((rs) => [
      ...rs,
      { productId: undefined, name: trimmed, hsn: "", gstPct: 5, boxSize: 1, boxes: 0, pieces: 0, rate: 0, discount: 0 },
    ]);
    setAddSearch("");
  };

  const updateRow = (i: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, x) => (x === i ? { ...r, ...patch } : r)));

  const save = async () => {
    if (!form.supplier || rows.length === 0) {
      toast.error("Supplier and items required");
      return;
    }
    if (savingRef.current) return;
    for (const r of rows) {
      if (!r.name.trim()) { toast.error("Every row needs a product name"); return; }
      if (totalPiecesOf(r) <= 0) { toast.error(`Enter boxes / pieces for "${r.name}"`); return; }
    }

    try {
      savingRef.current = true;
      setSaving(true);

      const existing = products || [];
      let created = 0;
      let updated = 0;

      // 1. Resolve every row to a real product id (auto-create when missing).
      const resolved: { row: Row; productId: string }[] = [];
      for (const r of rows) {
        let pid = r.productId;
        if (!pid) {
          const byName = existing.find(
            (p) => p.name.trim().toLowerCase() === r.name.trim().toLowerCase(),
          );
          if (byName) {
            pid = byName._id;
          } else {
            const createdProduct = await productsApi.create({
              name: r.name.trim(),
              hsn: r.hsn.trim(),
              description: "",
              mrp: 0, // user sets selling price later in Products
              rate: 0,
              gstPct: r.gstPct || 0,
              unit: "PCS",
              boxSize: r.boxSize || 1,
              minStockAlert: 0,
              status: "active",
            });
            pid = createdProduct._id;
            created += 1;
          }
        } else {
          // Sync-back HSN / GST% / Pcs-per-Box to latest purchase. Never MRP/Rate.
          const prod = existing.find((p) => p._id === pid);
          if (prod) {
            const patch: Partial<Product> = {};
            if (r.hsn.trim() && prod.hsn !== r.hsn.trim()) patch.hsn = r.hsn.trim();
            if (prod.gstPct !== r.gstPct) patch.gstPct = r.gstPct;
            if ((r.boxSize || 1) !== prod.boxSize) patch.boxSize = r.boxSize || 1;
            if (Object.keys(patch).length > 0) {
              await productsApi.update(pid, patch);
              updated += 1;
            }
          }
        }
        resolved.push({ row: r, productId: pid as string });
      }

      // 2. Save the immutable purchase bill with its item snapshot.
      await purchasesApi.create({
        supplier: form.supplier,
        supplierGstin: form.supplierGstin || undefined,
        supplierState: form.supplierState || undefined,
        placeOfSupply: form.placeOfSupply || undefined,
        invoiceNo: form.invoiceNo,
        date: new Date(form.date).toISOString(),
        referenceNo: form.referenceNo || undefined,
        lrNo: form.lrNo || undefined,
        transport: form.transport || undefined,
        vehicleNo: form.vehicleNo || undefined,
        driver: form.driver || undefined,
        taxable: +totals.taxable.toFixed(2),
        cgst: +totals.cgst.toFixed(2),
        sgst: +totals.sgst.toFixed(2),
        igst: +totals.igst.toFixed(2),
        gstAmount: +totals.gst.toFixed(2),
        discount: billDiscount,
        total: grandTotal,
        narration: form.narration || undefined,
        remarks: form.remarks || undefined,
        note: form.note || undefined,
        items: resolved.map(({ row: r, productId }) => {
          const c = computeRow(r, interState, billFactor);
          return {
            productId,
            name: r.name,
            hsn: r.hsn,
            batch: r.batch || undefined,
            expiry: r.expiry ? new Date(r.expiry).toISOString() : null,
            gstPct: r.gstPct,
            boxes: r.boxes,
            pieces: r.pieces,
            boxSize: r.boxSize,
            rate: r.rate,
            discount: r.discount || 0,
            taxable: c.taxable,
            gstAmount: c.gstAmount,
            amount: c.total,
          };
        }),
      });

      // 3. Purchase is the only source of stock — push each line into the ledger.
      for (const { row: r, productId } of resolved) {
        await stockApi.adjust({
          productId,
          boxes: r.boxes || 0,
          pieces: r.pieces || 0,
          note: `Purchase from ${form.supplier}${form.invoiceNo ? ` (${form.invoiceNo})` : ""}`,
        });
      }

      const bits: string[] = ["Purchase saved"];
      if (created > 0) bits.push(`${created} new product(s)`);
      if (updated > 0) bits.push(`${updated} product(s) synced (HSN/GST/Box)`);
      bits.push("Stock updated");
      toast.success(bits.join(" · "));
      setRows([]);
      setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 10) });
      await Promise.all([refreshPurchases(), refreshProducts()]);
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const searchResults = addSearch
    ? (products || []).filter((p) => p.name.toLowerCase().includes(addSearch.toLowerCase())).slice(0, 10)
    : [];
  const exactMatch = addSearch
    ? (products || []).some((p) => p.name.toLowerCase() === addSearch.trim().toLowerCase())
    : true;

  const colCount = interState ? 16 : 17;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Purchases</h1>
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <CardTitle className="sm:mr-auto">
            New Purchase Entry
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {interState ? "IGST (Inter-State)" : "CGST + SGST (Intra-State)"}
            </span>
          </CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search or type new product name..."
              value={addSearch}
              onChange={(e) => setAddSearch(e.target.value)}
              className="pl-8 w-full"
            />
            {(searchResults.length > 0 || (addSearch.trim() && !exactMatch)) && (
              <div className="absolute z-10 mt-1 w-full max-h-64 overflow-auto rounded-md border bg-popover shadow-lg">
                {searchResults.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => addExistingProduct(p)}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-accent"
                  >
                    {p.name}{" "}
                    <span className="text-muted-foreground text-xs">
                      — {p.hsn || "no HSN"} · GST {p.gstPct}% · 1×{p.boxSize}
                    </span>
                  </button>
                ))}
                {addSearch.trim() && !exactMatch && (
                  <button
                    onClick={() => addNewProductRow(addSearch)}
                    className="block w-full text-left px-3 py-2 text-sm border-t bg-accent/40 hover:bg-accent font-medium"
                  >
                    + Add new product “{addSearch.trim()}” (auto-create on save)
                  </button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div><Label>Supplier *</Label><Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></div>
            <div><Label>Supplier GSTIN</Label><Input value={form.supplierGstin} onChange={(e) => setForm({ ...form, supplierGstin: e.target.value.toUpperCase() })} /></div>
            <div><Label>Supplier State Code</Label><Input placeholder="e.g. 27" value={form.supplierState} onChange={(e) => setForm({ ...form, supplierState: e.target.value })} /></div>
            <div><Label>Invoice No</Label><Input value={form.invoiceNo} onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })} /></div>
            <div><Label>Invoice Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div><Label>Reference No</Label><Input value={form.referenceNo} onChange={(e) => setForm({ ...form, referenceNo: e.target.value })} /></div>
            <div><Label>Place of Supply</Label><Input value={form.placeOfSupply} onChange={(e) => setForm({ ...form, placeOfSupply: e.target.value })} /></div>
            <div><Label>Transport</Label><Input value={form.transport} onChange={(e) => setForm({ ...form, transport: e.target.value })} /></div>
            <div><Label>Vehicle No</Label><Input value={form.vehicleNo} onChange={(e) => setForm({ ...form, vehicleNo: e.target.value.toUpperCase() })} /></div>
            <div><Label>Driver</Label><Input value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })} /></div>
            <div><Label>LR No</Label><Input value={form.lrNo} onChange={(e) => setForm({ ...form, lrNo: e.target.value })} /></div>
            <div><Label>Bill Discount (₹)</Label><Input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: +e.target.value })} /></div>
            <div><Label>Remarks</Label><Input value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></div>
            <div className="sm:col-span-2 md:col-span-3"><Label>Narration</Label><Textarea rows={2} value={form.narration} onChange={(e) => setForm({ ...form, narration: e.target.value })} /></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[1320px]">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="p-2 min-w-[220px]">Product</th>
                  <th className="min-w-[110px]">HSN</th>
                  <th className="min-w-[110px]">Batch</th>
                  <th className="min-w-[140px]">Expiry</th>
                  <th className="text-right">GST%</th>
                  {interState
                    ? <th className="text-right">IGST%</th>
                    : (<><th className="text-right">CGST%</th><th className="text-right">SGST%</th></>)}
                  <th className="text-right">Pcs/Box</th>
                  <th className="text-right">Boxes</th>
                  <th className="text-right">Loose Pcs</th>
                  <th className="text-right">Total Pcs</th>
                  <th className="text-right min-w-[110px]">Rate/Pc</th>
                  <th className="text-right min-w-[100px]">Disc%</th>
                  <th className="text-right min-w-[110px]">Taxable</th>
                  <th className="text-right min-w-[100px]">GST</th>
                  <th className="text-right min-w-[120px]">Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const c = computeRow(r, interState, billFactor);
                  return (
                    <tr key={i} className="border-t">
                      <td className="p-1 font-medium">
                        {r.name}
                        {!r.productId && (
                          <span className="ml-1 rounded bg-primary/15 px-1 py-0.5 text-[10px] text-primary">NEW</span>
                        )}
                      </td>
                      <td><Input className="h-7 w-28" value={r.hsn} placeholder="HSN" onChange={(e) => updateRow(i, { hsn: e.target.value })} /></td>
                      <td><Input className="h-7 w-28" value={r.batch || ""} onChange={(e) => updateRow(i, { batch: e.target.value })} /></td>
                      <td><Input className="h-7 w-36" type="date" value={r.expiry || ""} onChange={(e) => updateRow(i, { expiry: e.target.value })} /></td>
                      <td>
                        <Select value={String(r.gstPct)} onValueChange={(v) => updateRow(i, { gstPct: +v })}>
                          <SelectTrigger className="h-7 w-16"><SelectValue /></SelectTrigger>
                          <SelectContent>{[0, 5, 12, 18, 28].map((g) => <SelectItem key={g} value={String(g)}>{g}%</SelectItem>)}</SelectContent>
                        </Select>
                      </td>
                      {interState
                        ? <td className="text-right pr-2 text-muted-foreground">{r.gstPct}%</td>
                        : (<>
                            <td className="text-right pr-2 text-muted-foreground">{r.gstPct / 2}%</td>
                            <td className="text-right pr-2 text-muted-foreground">{r.gstPct / 2}%</td>
                          </>)}
                      <td><Input className="h-7 w-20" type="number" value={r.boxSize} onChange={(e) => updateRow(i, { boxSize: Math.max(1, +e.target.value || 1) })} /></td>
                      <td><Input className="h-7 w-20" type="number" value={r.boxes} onChange={(e) => updateRow(i, { boxes: +e.target.value })} /></td>
                      <td><Input className="h-7 w-20" type="number" value={r.pieces} onChange={(e) => updateRow(i, { pieces: +e.target.value })} /></td>
                      <td className="text-right pr-2 font-medium">
                        <div>{c.totalPieces}</div>
                        <div className="text-[10px] text-muted-foreground">{formatQty(c.totalPieces, r.boxSize || 1)}</div>
                      </td>
                      <td><Input className="h-7 w-24" type="number" value={r.rate} onChange={(e) => updateRow(i, { rate: +e.target.value })} /></td>
                      <td><Input className="h-7 w-20" type="number" value={r.discount} onChange={(e) => updateRow(i, { discount: +e.target.value })} /></td>
                      <td className="text-right pr-2">{inr(c.taxable)}</td>
                      <td className="text-right pr-2">{inr(c.gstAmount)}</td>
                      <td className="text-right pr-2 font-semibold">{inr(c.total)}</td>
                      <td>
                        <Button size="icon" variant="ghost" onClick={() => setRows((rs) => rs.filter((_, k) => k !== i))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={colCount} className="text-center p-6 text-muted-foreground">
                      Search / type a product above to add rows. <Plus className="inline h-4 w-4" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-end">
            <div className="text-xs text-muted-foreground">
              Total Pieces = (Boxes × Pcs/Box) + Loose Pieces. Rate is per piece, item discount is a %.
              GST auto-splits into {interState ? "IGST" : "CGST + SGST"} based on supplier state.
              New products auto-create with only Name / HSN / GST% / Pcs-per-Box. MRP & Selling Rate stay independent.
            </div>
            <div className="text-right space-y-1">
              <div className="text-xs text-muted-foreground">
                Taxable ₹ {inr(totals.taxable)} · Item Disc ₹ {inr(totals.discount)} ·{" "}
                {interState ? <>IGST ₹ {inr(totals.igst)}</> : <>CGST ₹ {inr(totals.cgst)} · SGST ₹ {inr(totals.sgst)}</>}
                {billDiscount > 0 && <> · Bill Disc ₹ {inr(billDiscount)}</>}
              </div>
              <div className="text-xl font-bold">Total: ₹ {inr(grandTotal)}</div>
            </div>
          </div>
          <Button onClick={save} disabled={rows.length === 0 || saving}>
            {saving ? "Saving..." : "Save Purchase"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <CardTitle className="sm:mr-auto">Purchase History</CardTitle>
          <Input
            placeholder="Search supplier / invoice no..."
            value={historyQuery}
            onChange={(e) => setHistoryQuery(e.target.value)}
            className="w-full sm:w-72"
          />
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {purchasesLoading && <Loading label="Loading purchases..." />}
          {purchasesError && <div className="p-4"><ErrorState message={purchasesError} onRetry={refreshPurchases} /></div>}
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-2">Invoice No</th>
                <th>Date</th>
                <th>Supplier</th>
                <th>GSTIN</th>
                <th className="text-right">Discount</th>
                <th className="text-right">GST Amt</th>
                <th className="text-right">Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(purchases || [])
                .filter((p) => {
                  if (!historyQuery.trim()) return true;
                  const q = historyQuery.trim().toLowerCase();
                  return (
                    (p.supplier || "").toLowerCase().includes(q) ||
                    (p.invoiceNo || "").toLowerCase().includes(q) ||
                    (p.supplierGstin || "").toLowerCase().includes(q)
                  );
                })
                .map((p) => (
                  <tr
                    key={p._id}
                    className="border-t hover:bg-muted/40 cursor-pointer"
                    onClick={() => navigate(`/purchases/${p._id}`)}
                  >
                    <td className="p-2 font-medium">{p.invoiceNo || p._id.slice(-6)}</td>
                    <td>{p.date ? format(new Date(p.date), "dd/MM/yyyy") : "—"}</td>
                    <td>{p.supplier}</td>
                    <td className="text-xs">{p.supplierGstin || "—"}</td>
                    <td className="text-right">₹ {inr(p.discount || 0)}</td>
                    <td className="text-right">₹ {inr(p.gstAmount || 0)}</td>
                    <td className="text-right font-semibold">₹ {inr(p.total || 0)}</td>
                    <td className="text-right pr-2">
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); navigate(`/purchases/${p._id}`); }}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              {!purchasesLoading && (purchases || []).length === 0 && (
                <tr><td colSpan={8} className="text-center p-6 text-muted-foreground">No purchases yet.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default Purchases;
