import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, type Purchase, type PurchaseItem, type Company } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { inr, inrWords } from "@/lib/num";
import { formatQty } from "@/lib/qty";
import { format } from "date-fns";
import { ArrowLeft, Printer } from "lucide-react";

function PurchaseView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    (async () => {
      const pid = Number(id);
      if (!pid) return;
      const p = await db.purchases.get(pid);
      const its = await db.purchaseItems.where("purchaseId").equals(pid).toArray();
      const c = await db.company.toCollection().first();
      setPurchase(p || null);
      setItems(its);
      setCompany(c || null);
    })();
  }, [id]);

  if (!purchase) {
    return <div className="p-6 text-sm text-muted-foreground">Loading purchase bill…</div>;
  }

  const interState = !!purchase.igst && purchase.igst > 0;
  const grand = purchase.total;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 no-print">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <h1 className="text-xl font-bold">Purchase Bill (Read-only)</h1>
        <Button className="ml-auto" size="sm" variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-1" /> Print
        </Button>
      </div>

      <Card className="print-area">
        <CardContent className="p-4 space-y-4">
          {/* Header */}
          <div className="text-center border-b pb-2">
            <div className="text-lg font-bold">{company?.name || "STAR ENTERPRISES"}</div>
            <div className="text-xs text-muted-foreground">{company?.address}</div>
            <div className="text-xs text-muted-foreground">
              GSTIN: {company?.gstin} · State: {company?.state} ({company?.stateCode})
            </div>
            <div className="mt-2 text-sm font-semibold uppercase tracking-wide">
              Purchase Invoice
            </div>
          </div>

          {/* Supplier + Invoice info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="rounded border p-3">
              <div className="text-xs uppercase text-muted-foreground mb-1">Supplier</div>
              <div className="font-semibold">{purchase.supplier}</div>
              {purchase.supplierGstin && <div className="text-xs">GSTIN: {purchase.supplierGstin}</div>}
              {purchase.supplierState && <div className="text-xs">State Code: {purchase.supplierState}</div>}
              {purchase.placeOfSupply && <div className="text-xs">Place of Supply: {purchase.placeOfSupply}</div>}
            </div>
            <div className="rounded border p-3">
              <div className="text-xs uppercase text-muted-foreground mb-1">Invoice Information</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <span className="text-muted-foreground">Invoice No:</span><span className="font-medium">{purchase.invoiceNo || "—"}</span>
                <span className="text-muted-foreground">Date:</span><span>{format(purchase.date, "dd/MM/yyyy")}</span>
                {purchase.referenceNo && (<><span className="text-muted-foreground">Reference:</span><span>{purchase.referenceNo}</span></>)}
                {purchase.lrNo && (<><span className="text-muted-foreground">LR No:</span><span>{purchase.lrNo}</span></>)}
                {purchase.transport && (<><span className="text-muted-foreground">Transport:</span><span>{purchase.transport}</span></>)}
                {purchase.vehicleNo && (<><span className="text-muted-foreground">Vehicle:</span><span>{purchase.vehicleNo}</span></>)}
                {purchase.driver && (<><span className="text-muted-foreground">Driver:</span><span>{purchase.driver}</span></>)}
                <span className="text-muted-foreground">Tax Type:</span><span>{interState ? "IGST (Inter-State)" : "CGST + SGST (Intra-State)"}</span>
              </div>
            </div>
          </div>

          {/* Items table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse min-w-[1100px]">
              <thead className="bg-muted/60">
                <tr>
                  <th className="border p-2 text-left w-10">#</th>
                  <th className="border p-2 text-left min-w-[220px]">Product</th>
                  <th className="border p-2 text-left w-24">HSN</th>
                  <th className="border p-2 text-left w-24">Batch</th>
                  <th className="border p-2 text-left w-24">Expiry</th>
                  <th className="border p-2 text-right w-16">GST%</th>
                  <th className="border p-2 text-right w-28">Qty</th>
                  <th className="border p-2 text-right w-24">Rate</th>
                  <th className="border p-2 text-right w-28">Taxable</th>
                  <th className="border p-2 text-right w-24">GST Amt</th>
                  <th className="border p-2 text-right w-28">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => {
                  const bs = it.boxSize || 1;
                  const totalPieces = (it.boxes || 0) * bs + (it.pieces || 0);
                  return (
                    <tr key={it.id} className="border-t">
                      <td className="border p-2">{i + 1}</td>
                      <td className="border p-2 font-medium">{it.name || `#${it.productId}`}</td>
                      <td className="border p-2">{it.hsn || "—"}</td>
                      <td className="border p-2">{it.batch || "—"}</td>
                      <td className="border p-2">{it.expiry ? format(it.expiry, "MM/yyyy") : "—"}</td>
                      <td className="border p-2 text-right">{it.gstPct ?? 0}%</td>
                      <td className="border p-2 text-right">
                        <div>{formatQty(totalPieces, bs)}</div>
                        <div className="text-[10px] text-muted-foreground">{totalPieces} pcs</div>
                      </td>
                      <td className="border p-2 text-right">{inr(it.rate)}</td>
                      <td className="border p-2 text-right">{inr(it.taxable ?? totalPieces * it.rate)}</td>
                      <td className="border p-2 text-right">{inr(it.gstAmount ?? 0)}</td>
                      <td className="border p-2 text-right font-semibold">{inr(it.amount)}</td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                  <tr><td colSpan={11} className="border p-6 text-center text-muted-foreground">No items on this bill.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Tax + Grand total */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded border p-3 text-xs space-y-1">
              <div className="font-semibold text-sm mb-1">Tax Summary</div>
              <div className="flex justify-between"><span className="text-muted-foreground">Taxable Value</span><span>₹ {inr(purchase.taxable || 0)}</span></div>
              {interState ? (
                <div className="flex justify-between"><span className="text-muted-foreground">IGST</span><span>₹ {inr(purchase.igst || 0)}</span></div>
              ) : (
                <>
                  <div className="flex justify-between"><span className="text-muted-foreground">CGST</span><span>₹ {inr(purchase.cgst || 0)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">SGST</span><span>₹ {inr(purchase.sgst || 0)}</span></div>
                </>
              )}
              <div className="flex justify-between border-t pt-1 mt-1"><span className="text-muted-foreground">Total GST</span><span>₹ {inr(purchase.gstAmount || 0)}</span></div>
            </div>
            <div className="rounded border p-3 bg-primary/10 flex flex-col justify-between">
              <div className="text-xs uppercase text-muted-foreground">Grand Total</div>
              <div className="text-2xl font-bold">₹ {inr(grand)}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{inrWords(grand)}</div>
            </div>
          </div>

          {/* Narration */}
          {(purchase.narration || purchase.remarks || purchase.note) && (
            <div className="rounded border p-3 text-xs">
              <div className="font-semibold mb-1">Narration / Remarks</div>
              {purchase.remarks && <div>{purchase.remarks}</div>}
              {purchase.narration && <div className="mt-1 whitespace-pre-line">{purchase.narration}</div>}
              {purchase.note && <div className="mt-1 text-muted-foreground">{purchase.note}</div>}
            </div>
          )}

          {/* Footer */}
          <div className="border-t pt-2 text-[10px] text-center text-muted-foreground">
            This is a system-generated, read-only view of the purchase bill as originally recorded.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PurchaseView;