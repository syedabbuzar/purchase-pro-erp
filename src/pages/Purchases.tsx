import { useLiveQuery } from "dexie-react-hooks";
import { db, type Product } from "@/lib/db";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { inr } from "@/lib/num";

interface Row {
  // productId undefined => new product (will be auto-created on save)
  productId?: number;
  name: string;
  hsn: string;           // manually typed / editable, NOT auto-filled
  gstPct: number;
  boxSize: number;       // pieces per box
  boxes: number;
  pieces: number;
  rate: number;          // per piece
}

function totalPiecesOf(r: Row) {
  return (r.boxes || 0) * (r.boxSize || 1) + (r.pieces || 0);
}

function computeRow(r: Row) {
  const totalPieces = totalPiecesOf(r);
  const taxable = totalPieces * (r.rate || 0);
  const gstAmount = +(taxable * ((r.gstPct || 0) / 100)).toFixed(2);
  const cgst = +(gstAmount / 2).toFixed(2);
  const sgst = +(gstAmount - cgst).toFixed(2);
  const total = +(taxable + gstAmount).toFixed(2);
  return { totalPieces, taxable: +taxable.toFixed(2), gstAmount, cgst, sgst, total };
}

function Purchases() {
  const products = useLiveQuery(() => db.products.orderBy("name").toArray(), []);
  const purchases = useLiveQuery(
    () => db.purchases.toArray().then((a) => a.sort((x, y) => y.date - x.date)),
    [],
  );
  const [form, setForm] = useState({
    invoiceNo: "",
    supplier: "",
    date: new Date().toISOString().slice(0, 10),
    note: "",
  });
  const [rows, setRows] = useState<Row[]>([]);
  const [addSearch, setAddSearch] = useState("");

  const totals = rows.reduce(
    (acc, r) => {
      const c = computeRow(r);
      acc.taxable += c.taxable;
      acc.gst += c.gstAmount;
      acc.total += c.total;
      return acc;
    },
    { taxable: 0, gst: 0, total: 0 },
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
        hsn: "", // manually typed each time — never auto-filled
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
        date: new Date(form.date).getTime(),
        total: totals.total,
        note: form.note,
      })) as number;

      let created = 0;
      for (const r of rows) {
        let pid = r.productId;

        // Auto-create product if new (Products module gets ONLY name/gst/box size).
        // Purchase Rate & MRP are NEVER copied — user fills them later in Products.
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
              hsn: "",
              description: "",
              mrp: 0,        // stays empty — user enters later
              rate: 0,       // stays empty — user enters later
              gstPct: r.gstPct || 0,
              unit: "PCS",
              boxSize: r.boxSize || 1,
              minStockAlert: 0,
              status: "active",
              openingBoxes: 0,
              openingPieces: 0,
              createdAt: Date.now(),
            })) as number;
            created += 1;
          }
        }

        const c = computeRow(r);

        // Store snapshot on the purchase item (purchase bill = permanent history).
        await db.purchaseItems.add({
          purchaseId,
          productId: pid,
          name: r.name,
          hsn: r.hsn,
          gstPct: r.gstPct,
          boxSize: r.boxSize,
          boxes: r.boxes,
          pieces: r.pieces,
          rate: r.rate,
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

      toast.success(
        created > 0
          ? `Purchase saved · ${created} new product(s) created · Stock updated`
          : "Purchase saved · Stock updated",
      );
      setRows([]);
      setForm({
        invoiceNo: "",
        supplier: "",
        date: new Date().toISOString().slice(0, 10),
        note: "",
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
          <CardTitle className="sm:mr-auto">New Purchase Entry</CardTitle>
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
                    {p.name}
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
            <div>
              <Label>Supplier *</Label>
              <Input
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              />
            </div>
            <div>
              <Label>Invoice No</Label>
              <Input
                value={form.invoiceNo}
                onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })}
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div>
              <Label>Note</Label>
              <Input
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[900px]">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="p-2">Product</th>
                  <th>HSN</th>
                  <th className="text-right">GST%</th>
                  <th className="text-right">Pcs/Box</th>
                  <th className="text-right">Boxes</th>
                  <th className="text-right">Pieces</th>
                  <th className="text-right">Total Pcs</th>
                  <th className="text-right">Rate/Pc</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">GST</th>
                  <th className="text-right">Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const c = computeRow(r);
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
                          className="h-7 w-24"
                          value={r.hsn}
                          placeholder="HSN"
                          onChange={(e) => updateRow(i, { hsn: e.target.value })}
                        />
                      </td>
                      <td>
                        <Input
                          className="h-7 w-14"
                          type="number"
                          value={r.gstPct}
                          onChange={(e) =>
                            updateRow(i, { gstPct: +e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <Input
                          className="h-7 w-16"
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
                          className="h-7 w-16"
                          type="number"
                          value={r.boxes}
                          onChange={(e) =>
                            updateRow(i, { boxes: +e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <Input
                          className="h-7 w-16"
                          type="number"
                          value={r.pieces}
                          onChange={(e) =>
                            updateRow(i, { pieces: +e.target.value })
                          }
                        />
                      </td>
                      <td className="text-right pr-2 font-medium">
                        {c.totalPieces}
                      </td>
                      <td>
                        <Input
                          className="h-7 w-20"
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
                      colSpan={12}
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
              Total Pieces = (Boxes × Pcs/Box) + Pieces. Rate is per piece.
              Amount = Total Pieces × Rate. HSN, MRP & Rate are typed manually —
              new products get only Name / GST / Pcs-per-Box copied to Products.
            </div>
            <div className="text-right space-y-1">
              <div className="text-xs text-muted-foreground">
                Taxable ₹ {inr(totals.taxable)} · GST ₹ {inr(totals.gst)}
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
        <CardHeader>
          <CardTitle>Recent Purchases</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-2">Date</th>
                <th>Supplier</th>
                <th>Inv #</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {(purchases || []).map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-2">{format(p.date, "dd/MM/yyyy")}</td>
                  <td>{p.supplier}</td>
                  <td>{p.invoiceNo}</td>
                  <td className="text-right">₹ {inr(p.total)}</td>
                </tr>
              ))}
              {(!purchases || purchases.length === 0) && (
                <tr>
                  <td
                    colSpan={4}
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

export default totalPiecesOf;
