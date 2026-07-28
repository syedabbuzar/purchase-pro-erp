import { useLiveQuery } from "dexie-react-hooks";
import { db, type Product } from "@/lib/db";
import { useState } from "react";
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

interface Row {
  // productId undefined => new product (will be auto-created on save)
  productId?: number;
  name: string;
  hsn: string;           // manually typed / editable
  batch?: string;
  expiry?: string;       // yyyy-mm-dd
  gstPct: number;
  boxSize: number;       // pieces per box
  boxes: number;
  pieces: number;        // loose pieces
  rate: number;          // per piece
}

function totalPiecesOf(r: Row) {
  // Total Pieces = (Boxes × Pieces Per Box) + Loose Pieces
  return (r.boxes || 0) * (r.boxSize || 1) + (r.pieces || 0);
}

function computeRow(r: Row, interState: boolean) {
  const totalPieces = totalPiecesOf(r);
  const taxable = totalPieces * (r.rate || 0);
  const gstAmount = +(taxable * ((r.gstPct || 0) / 100)).toFixed(2);
  const cgst = interState ? 0 : +(gstAmount / 2).toFixed(2);
  const sgst = interState ? 0 : +(gstAmount - cgst).toFixed(2);
  const igst = interState ? gstAmount : 0;
  const total = +(taxable + gstAmount).toFixed(2);
  return { totalPieces, taxable: +taxable.toFixed(2), gstAmount, cgst, sgst, igst, total };
}

function Purchases() {
  const products = useLiveQuery(() => db.products.orderBy("name").toArray(), []);
  const company = useLiveQuery(() => db.company.toCollection().first(), []);
  const purchases = useLiveQuery(
    () => db.purchases.toArray().then((a) => a.sort((x, y) => y.date - x.date)),
    [],
  );
  const navigate = useNavigate();
  const [historyQuery, setHistoryQuery] = useState("");
  const [form, setForm] = useState({
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
  });
  const [rows, setRows] = useState<Row[]>([]);
  const [addSearch, setAddSearch] = useState("");

  const companyState = (company?.stateCode || "").trim();
  const supplierState = (form.supplierState || "").trim();
  const interState = !!companyState && !!supplierState && companyState !== supplierState;

  const totals = rows.reduce(
    (acc, r) => {
      const c = computeRow(r, interState);
      acc.taxable += c.taxable;
      acc.gst += c.gstAmount;
      acc.cgst += c.cgst;
      acc.sgst += c.sgst;
      acc.igst += c.igst;
      acc.total += c.total;
      return acc;
    },
    { taxable: 0, gst: 0, cgst: 0, sgst: 0, igst: 0, total: 0 },
  );

  const addExistingProduct = (p: Product) => {
    if (rows.some((r) => r.productId === p.id)) {
      toast.info("Already added");
      return;
    }
    setRows((rs) => [
      ...rs,
      {
        productId: p.id!,
        name: p.name,
        hsn: p.hsn || "", // pre-fill with last known HSN, editable
        gstPct: p.gstPct,
        boxSize: p.boxSize || 1,
        boxes: 0,
        pieces: 0,
        rate: 0,
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
      {
        productId: undefined,
        name: trimmed,
        hsn: "",
        gstPct: 5,
        boxSize: 1,
        boxes: 0,
        pieces: 0,
        rate: 0,
      },
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
    for (const r of rows) {
      if (!r.name.trim()) {
        toast.error("Every row needs a product name");
        return;
      }
      if (totalPiecesOf(r) <= 0) {
        toast.error(`Enter boxes / pieces for "${r.name}"`);
        return;
      }
    }

    try {
      const purchaseId = (await db.purchases.add({
        invoiceNo: form.invoiceNo,
        supplier: form.supplier,
        supplierGstin: form.supplierGstin || undefined,
        supplierState: form.supplierState || undefined,
        referenceNo: form.referenceNo || undefined,
        placeOfSupply: form.placeOfSupply || undefined,
        transport: form.transport || undefined,
        vehicleNo: form.vehicleNo || undefined,
        driver: form.driver || undefined,
        lrNo: form.lrNo || undefined,
        remarks: form.remarks || undefined,
        narration: form.narration || undefined,
        date: new Date(form.date).getTime(),
        total: totals.total,
        taxable: +totals.taxable.toFixed(2),
        gstAmount: +totals.gst.toFixed(2),
        cgst: +totals.cgst.toFixed(2),
        sgst: +totals.sgst.toFixed(2),
        igst: +totals.igst.toFixed(2),
        note: form.note,
      })) as number;

      let created = 0;
      let updated = 0;
      for (const r of rows) {
        let pid = r.productId;

        // Auto-create product if new. Products module gets ONLY
        // name / HSN / GST% / pieces-per-box. Purchase Rate & MRP are NEVER
        // copied — user sets those manually later in Products.
        if (!pid) {
          const existingByName = await db.products
            .where("name")
            .equalsIgnoreCase(r.name.trim())
            .first();
          if (existingByName) {
            pid = existingByName.id!;
          } else {
            pid = (await db.products.add({
              name: r.name.trim(),
              hsn: r.hsn.trim(),
              description: "",
              mrp: 0,        // stays empty — user enters later in Products
              rate: 0,       // stays empty — user enters later in Products
              gstPct: r.gstPct || 0,
              unit: "PCS",
              boxSize: r.boxSize || 1,
              minStockAlert: 0,
              status: "active",
              createdAt: Date.now(),
            })) as number;
            created += 1;
          }
        }

        // Sync-back to Product master: HSN, GST%, Pieces-Per-Box always reflect
        // the latest Purchase. MRP and Selling Rate are NEVER touched.
        if (pid) {
          const existing = await db.products.get(pid);
          if (existing) {
            const patch: Partial<Product> = {};
            if ((r.hsn || "").trim() && existing.hsn !== r.hsn.trim()) patch.hsn = r.hsn.trim();
            if (existing.gstPct !== r.gstPct) patch.gstPct = r.gstPct;
            if ((r.boxSize || 1) !== existing.boxSize) patch.boxSize = r.boxSize || 1;
            if (Object.keys(patch).length > 0) {
              await db.products.update(pid, patch);
              updated += 1;
            }
          }
        }

        const c = computeRow(r, interState);

        // Immutable snapshot on the purchase item — purchase bill = permanent history.
        await db.purchaseItems.add({
          purchaseId,
          productId: pid,
          name: r.name,
          hsn: r.hsn,
          batch: r.batch || undefined,
          expiry: r.expiry ? new Date(r.expiry).getTime() : undefined,
          gstPct: r.gstPct,
          cgstPct: interState ? 0 : r.gstPct / 2,
          sgstPct: interState ? 0 : r.gstPct / 2,
          igstPct: interState ? r.gstPct : 0,
          boxSize: r.boxSize,
          boxes: r.boxes,
          pieces: r.pieces,
          rate: r.rate,
          taxable: c.taxable,
          gstAmount: c.gstAmount,
          amount: c.total,
        });

        // Increase Live Stock.
        await db.stockLedger.add({
          productId: pid,
          ts: Date.now(),
          type: "purchase",
          boxes: r.boxes,
          pieces: r.pieces,
          refId: purchaseId,
          note: `Purchase from ${form.supplier}`,
        });
      }

      const bits: string[] = ["Purchase saved"];
      if (created > 0) bits.push(`${created} new product(s)`);
      if (updated > 0) bits.push(`${updated} product(s) synced (HSN/GST/Box)`);
      bits.push("Stock updated");
      toast.success(bits.join(" · "));
      setRows([]);
      setForm({
        invoiceNo: "", supplier: "", supplierGstin: "", supplierState: "",
        referenceNo: "", placeOfSupply: "", transport: "", vehicleNo: "",
        driver: "", lrNo: "", date: new Date().toISOString().slice(0, 10),
        remarks: "", narration: "", note: "",
      });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const searchResults = addSearch
    ? (products || [])
        .filter((p) => p.name.toLowerCase().includes(addSearch.toLowerCase()))
        .slice(0, 10)
    : [];
  const exactMatch = addSearch
    ? (products || []).some(
        (p) => p.name.toLowerCase() === addSearch.trim().toLowerCase(),
      )
    : true;

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
                    key={p.id}
                    onClick={() => addExistingProduct(p)}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-accent"
                  >
                    {p.name} <span className="text-muted-foreground text-xs">— {p.hsn || "no HSN"} · GST {p.gstPct}% · 1×{p.boxSize}</span>
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
            <div><Label>Remarks</Label><Input value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></div>
            <div className="sm:col-span-2 md:col-span-4"><Label>Narration</Label><Textarea rows={2} value={form.narration} onChange={(e) => setForm({ ...form, narration: e.target.value })} /></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[1200px]">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="p-2 min-w-[220px]">Product</th>
                  <th className="min-w-[110px]">HSN</th>
                  <th className="min-w-[110px]">Batch</th>
                  <th className="min-w-[140px]">Expiry</th>
                  <th className="text-right">GST%</th>
                  {interState
                    ? <th className="text-right">IGST%</th>
                    : (<><th className="text-right">CGST%</th><th className="text-right">SGST%</th></>)
                  }
                  <th className="text-right">Pcs/Box</th>
                  <th className="text-right">Boxes</th>
                  <th className="text-right">Loose Pcs</th>
                  <th className="text-right">Total Pcs</th>
                  <th className="text-right min-w-[110px]">Rate/Pc</th>
                  <th className="text-right min-w-[110px]">Taxable</th>
                  <th className="text-right min-w-[100px]">GST</th>
                  <th className="text-right min-w-[120px]">Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const c = computeRow(r, interState);
                  return (
                    <tr key={i} className="border-t">
                      <td className="p-1 font-medium">
                        {r.name}
                        {!r.productId && (
                          <span className="ml-1 rounded bg-primary/15 px-1 py-0.5 text-[10px] text-primary">
                            NEW
                          </span>
                        )}
                      </td>
                      <td>
                        <Input
                          className="h-7 w-28"
                          value={r.hsn}
                          placeholder="HSN"
                          onChange={(e) => updateRow(i, { hsn: e.target.value })}
                        />
                      </td>
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
                            <td className="text-right pr-2 text-muted-foreground">{(r.gstPct / 2)}%</td>
                            <td className="text-right pr-2 text-muted-foreground">{(r.gstPct / 2)}%</td>
                          </>)
                      }
                      <td>
                        <Input
                          className="h-7 w-20"
                          type="number"
                          value={r.boxSize}
                          onChange={(e) =>
                            updateRow(i, {
                              boxSize: Math.max(1, +e.target.value || 1),
                            })
                          }
                        />
                      </td>
                      <td>
                        <Input
                          className="h-7 w-20"
                          type="number"
                          value={r.boxes}
                          onChange={(e) =>
                            updateRow(i, { boxes: +e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <Input
                          className="h-7 w-20"
                          type="number"
                          value={r.pieces}
                          onChange={(e) =>
                            updateRow(i, { pieces: +e.target.value })
                          }
                        />
                      </td>
                      <td className="text-right pr-2 font-medium">
                        <div>{c.totalPieces}</div>
                        <div className="text-[10px] text-muted-foreground">{formatQty(c.totalPieces, r.boxSize || 1)}</div>
                      </td>
                      <td>
                        <Input
                          className="h-7 w-24"
                          type="number"
                          value={r.rate}
                          onChange={(e) =>
                            updateRow(i, { rate: +e.target.value })
                          }
                        />
                      </td>
                      <td className="text-right pr-2">{inr(c.taxable)}</td>
                      <td className="text-right pr-2">{inr(c.gstAmount)}</td>
                      <td className="text-right pr-2 font-semibold">
                        {inr(c.total)}
                      </td>
                      <td>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            setRows((rs) => rs.filter((_, k) => k !== i))
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={interState ? 14 : 15}
                      className="text-center p-6 text-muted-foreground"
                    >
                      Search / type a product above to add rows.{" "}
                      <Plus className="inline h-4 w-4" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-end">
            <div className="text-xs text-muted-foreground">
              Total Pieces = (Boxes × Pcs/Box) + Loose Pieces. Rate is per piece.
              GST auto-splits into {interState ? "IGST" : "CGST + SGST"} based on supplier state.
              New products auto-create with only Name / HSN / GST% / Pcs-per-Box.
              MRP & Selling Rate stay independent and are set in Products.
            </div>
            <div className="text-right space-y-1">
              <div className="text-xs text-muted-foreground">
                Taxable ₹ {inr(totals.taxable)} ·{" "}
                {interState
                  ? <>IGST ₹ {inr(totals.igst)}</>
                  : <>CGST ₹ {inr(totals.cgst)} · SGST ₹ {inr(totals.sgst)}</>
                }
              </div>
              <div className="text-xl font-bold">
                Total: ₹ {inr(totals.total)}
              </div>
            </div>
          </div>
          <Button onClick={save} disabled={rows.length === 0}>
            Save Purchase
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
          <table className="w-full text-sm min-w-[820px]">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-2">Invoice No</th>
                <th>Date</th>
                <th>Supplier</th>
                <th>GSTIN</th>
                <th className="text-right">GST Amt</th>
                <th className="text-right">Total</th>
                <th>Status</th>
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
                    key={p.id}
                    className="border-t hover:bg-muted/40 cursor-pointer"
                    onClick={() => navigate(`/purchases/${p.id}`)}
                  >
                    <td className="p-2 font-medium">{p.invoiceNo || `#${p.id}`}</td>
                    <td>{format(p.date, "dd/MM/yyyy")}</td>
                    <td>{p.supplier}</td>
                    <td className="text-xs">{p.supplierGstin || "—"}</td>
                    <td className="text-right">₹ {inr(p.gstAmount || 0)}</td>
                    <td className="text-right font-semibold">₹ {inr(p.total)}</td>
                    <td><span className="text-green-700 text-xs">Saved</span></td>
                    <td className="text-right pr-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); navigate(`/purchases/${p.id}`); }}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              {(!purchases || purchases.length === 0) && (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center p-6 text-muted-foreground"
                  >
                    No purchases yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default Purchases;
