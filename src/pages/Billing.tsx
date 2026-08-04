import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { inr } from "@/lib/num";
import { formatQty } from "@/lib/qty";
import { computeInvoice, computeItem, nextInvoiceNumber, type ComputedItem } from "@/lib/gst";
import { useApi } from "@/hooks/use-api";
import { apiErrorMessage } from "@/lib/api";
import { companyApi, customersApi, invoicesApi, productsApi, stockApi } from "@/lib/services";
import { fixEditRestore } from "@/lib/stock-fix";
import type { Product, StockRow } from "@/lib/types";

interface Row {
  productId: string;
  name: string;
  hsn: string;
  batch?: string;
  gstPct: number;
  boxSize: number;
  boxes: number;
  pieces: number;
  rate: number;
  discount: number;
}

function Billing() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get("edit");
  const duplicateId = params.get("duplicate");

  const savingRef = useRef(false);
  const oldItemsRef = useRef<{ productId: string; boxes: number; pieces: number }[]>([]);
  const [saving, setSaving] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState("");
  const [loadedNumber, setLoadedNumber] = useState<string>("");

  const { data: products } = useApi(() => productsApi.list(), []);
  const { data: customers } = useApi(() => customersApi.list(), []);
  const { data: company } = useApi(() => companyApi.get(), []);
  const { data: invoices, refresh: refreshInvoices } = useApi(() => invoicesApi.list(), []);
  const { data: stock } = useApi(() => stockApi.list(), []);

  const stockByProduct = useMemo(() => {
    const m = new Map<string, StockRow>();
    (stock || []).forEach((s) => m.set(String(s.productId), s));
    return m;
  }, [stock]);

  useEffect(() => {
    const id = editId || duplicateId;
    if (!id) return;
    (async () => {
      try {
        const res = await invoicesApi.getById(id);
        if (!res?.invoice) return;
        setCustomerId(String(res.invoice.customerId));
        oldItemsRef.current = editId
          ? (res.items || []).map((it) => ({
              productId: String(it.productId),
              boxes: it.boxes || 0,
              pieces: it.pieces || 0,
            }))
          : [];
        if (editId) {
          setLoadedNumber(res.invoice.number);
          setDate(new Date(res.invoice.date).toISOString().slice(0, 10));
        }
        setRows(
          (res.items || []).map((it) => ({
            productId: String(it.productId),
            name: it.name,
            hsn: it.hsn || "",
            batch: it.batch || "",
            gstPct: it.gstPct || 0,
            boxSize: it.boxSize || 1,
            boxes: it.boxes || 0,
            pieces: it.pieces || 0,
            rate: it.rate || 0,
            discount: 0,
          })),
        );
      } catch (e) {
        toast.error(apiErrorMessage(e));
      }
    })();
  }, [editId, duplicateId]);

  const customer = (customers || []).find((c) => String(c._id) === customerId) || null;

  const computedRows: ComputedItem[] = rows.map((r) => {
    const c = computeItem(r);
    return { ...r, taxable: c.taxable, gstAmount: c.gstAmount, netAmount: c.netAmount };
  });
  const totals = computeInvoice(computedRows, company || null, customer);
  const interState =
    !!customer?.stateCode && !!company?.stateCode && customer.stateCode !== company.stateCode;

  const addProduct = (p: Product) => {
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
        rate: p.rate || 0,
        discount: 0,
      },
    ]);
    setSearch("");
  };

  const updateRow = (i: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, x) => (x === i ? { ...r, ...patch } : r)));

  const resetForm = () => {
    setRows([]);
    setCustomerId("");
    setLoadedNumber("");
    setDate(new Date().toISOString().slice(0, 10));
    setSearch("");
  };

  const save = async () => {
    if (!customerId) { toast.error("Select a customer"); return; }
    if (rows.length === 0) { toast.error("Add at least one item"); return; }
    for (const r of rows) {
      const qty = r.boxes * (r.boxSize || 1) + r.pieces;
      if (qty <= 0) { toast.error(`Enter quantity for "${r.name}"`); return; }
      if (!editId) {
        const available = stockByProduct.get(r.productId)?.remainingPieces ?? 0;
        if (qty > available) {
          toast.error(`Only ${formatQty(available, r.boxSize || 1)} available for "${r.name}"`);
          return;
        }
      }
    }
    if (savingRef.current) return;

    try {
      savingRef.current = true;
      setSaving(true);

      const number =
        loadedNumber ||
        nextInvoiceNumber(company?.invoicePrefix || "INV", (invoices || []).map((i) => i.number));

      const payload = {
        number,
        customerId,
        date: new Date(date).toISOString(),
        taxable: totals.taxable,
        cgst: totals.cgst,
        sgst: totals.sgst,
        igst: totals.igst,
        total: totals.total,
        status: "active" as const,
        items: rows.map((r) => {
          const c = computeItem(r);
          return {
            productId: r.productId,
            name: r.name,
            hsn: r.hsn,
            batch: r.batch || undefined,
            gstPct: r.gstPct,
            boxes: r.boxes,
            pieces: r.pieces,
            boxSize: r.boxSize,
            rate: r.rate,
            taxable: c.taxable,
            gstAmount: c.gstAmount,
            amount: c.netAmount,
          };
        }),
      };

      const saved = editId
        ? await invoicesApi.update(editId, payload)
        : await invoicesApi.create(payload);

      if (editId && oldItemsRef.current.length) {
        await fixEditRestore(oldItemsRef.current, number);
        oldItemsRef.current = [];
      }

      toast.success(editId ? "Invoice updated" : "Invoice saved");
      await refreshInvoices();
      resetForm();
      const id = (saved as { _id?: string })?._id || editId;
      navigate(id ? `/invoices/${id}` : "/invoices");
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const cancelEntry = () => {
    resetForm();
    toast.info("Entry cancelled — nothing was saved");
    navigate("/invoices");
  };

  const results = search
    ? (products || []).filter((p) => p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 10)
    : [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{editId ? "Edit Invoice" : "Billing"}</h1>
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <CardTitle className="sm:mr-auto">
            {editId ? `Invoice ${loadedNumber}` : "New Invoice"}
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {interState ? "IGST (Inter-State)" : "CGST + SGST (Intra-State)"}
            </span>
          </CardTitle>
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-full"
            />
            {results.length > 0 && (
              <div className="absolute z-10 mt-1 w-full max-h-64 overflow-auto rounded-md border bg-popover shadow-lg">
                {results.map((p) => {
                  const rem = stockByProduct.get(p._id)?.remainingPieces ?? 0;
                  return (
                    <button
                      key={p._id}
                      onClick={() => addProduct(p)}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-accent"
                    >
                      {p.name}
                      <span className="text-muted-foreground text-xs">
                        {" "}— ₹{inr(p.rate)} · GST {p.gstPct}% · Stock {formatQty(rem, p.boxSize || 1)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label>Customer *</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {(customers || []).map((c) => (
                    <SelectItem key={c._id} value={String(c._id)}>
                      {c.name}{c.shopName ? ` — ${c.shopName}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Invoice Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div><Label>Invoice No</Label><Input value={loadedNumber} placeholder="Auto-generated on save" readOnly /></div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-xs min-w-[1150px]">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="p-2 w-[240px] min-w-[240px]">Description</th>
                  <th className="p-2 w-[110px] min-w-[110px]">HSN</th>
                  <th className="p-2 w-[110px] min-w-[110px]">Batch</th>
                  <th className="p-2 w-[110px] min-w-[110px] text-right">Rate/Pc</th>
                  <th className="p-2 w-[90px] min-w-[90px] text-right">Pcs/Box</th>
                  <th className="p-2 w-[90px] min-w-[90px] text-right">Box</th>
                  <th className="p-2 w-[90px] min-w-[90px] text-right">Pcs</th>
                  <th className="p-2 w-[90px] min-w-[90px] text-right">Disc%</th>
                  <th className="p-2 w-[90px] min-w-[90px] text-right">GST%</th>
                  <th className="p-2 w-[110px] min-w-[110px] text-right">Taxable</th>
                  <th className="p-2 w-[110px] min-w-[110px] text-right">Net Amt</th>
                  <th className="p-2 w-[40px] min-w-[40px]"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const c = computeItem(r);
                  const rem = stockByProduct.get(r.productId)?.remainingPieces ?? 0;
                  return (
                    <tr key={r.productId} className="border-t">
                      <td className="p-1 w-[240px] min-w-[240px]">
                        <div className="font-medium truncate">{r.name}</div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          Stock: {formatQty(rem, r.boxSize || 1)} · Qty: {c.totalPieces} pcs
                        </div>
                      </td>
                      <td className="p-1 w-[110px] min-w-[110px]">{r.hsn || "—"}</td>
                      <td className="p-1 w-[110px] min-w-[110px]">
                        <Input className="h-7 w-full" value={r.batch || ""} onChange={(e) => updateRow(i, { batch: e.target.value })} />
                      </td>
                      <td className="p-1 w-[110px] min-w-[110px]">
                        <Input className="h-7 w-full text-right" type="number" value={r.rate} onChange={(e) => updateRow(i, { rate: +e.target.value })} />
                      </td>
                      <td className="p-1 w-[90px] min-w-[90px] text-right pr-2">{r.boxSize}</td>
                      <td className="p-1 w-[90px] min-w-[90px]">
                        <Input className="h-7 w-full text-right" type="number" value={r.boxes} onChange={(e) => updateRow(i, { boxes: +e.target.value })} />
                      </td>
                      <td className="p-1 w-[90px] min-w-[90px]">
                        <Input className="h-7 w-full text-right" type="number" value={r.pieces} onChange={(e) => updateRow(i, { pieces: +e.target.value })} />
                      </td>
                      <td className="p-1 w-[90px] min-w-[90px]">
                        <Input className="h-7 w-full text-right" type="number" value={r.discount} onChange={(e) => updateRow(i, { discount: +e.target.value })} />
                      </td>
                      <td className="p-1 w-[90px] min-w-[90px] text-right pr-2">{r.gstPct}%</td>
                      <td className="p-1 w-[110px] min-w-[110px] text-right pr-2">{inr(c.taxable)}</td>
                      <td className="p-1 w-[110px] min-w-[110px] text-right pr-2 font-semibold">{inr(c.netAmount)}</td>
                      <td className="p-1 w-[40px] min-w-[40px]">
                        <Button size="icon" variant="ghost" onClick={() => setRows((rs) => rs.filter((_, k) => k !== i))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr><td colSpan={12} className="text-center p-6 text-muted-foreground">Search a product above to start billing.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-end">
            <div className="text-xs text-muted-foreground">
              Sales reduce stock automatically. Editing an invoice restores the old quantities and applies the new ones.
            </div>
            <div className="text-right space-y-1">
              <div className="text-xs text-muted-foreground">
                Taxable ₹ {inr(totals.taxable)} · Disc ₹ {inr(totals.totalDiscount)} ·{" "}
                {interState ? <>IGST ₹ {inr(totals.igst)}</> : <>CGST ₹ {inr(totals.cgst)} · SGST ₹ {inr(totals.sgst)}</>}
                {" "}· Round Off ₹ {inr(totals.roundOff)}
              </div>
              <div className="text-xl font-bold">Total: ₹ {inr(totals.total)}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={save} disabled={rows.length === 0 || saving}>
              {saving ? "Saving..." : editId ? "Update Invoice" : "Save Invoice"}
            </Button>
            <Button variant="outline" onClick={cancelEntry} disabled={saving}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Billing;