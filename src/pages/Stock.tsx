import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { exportSheet } from "@/lib/xlsx-export";
import { format } from "date-fns";
import { formatQty } from "@/lib/qty";
import { useApi } from "@/hooks/use-api";
import { stockApi } from "@/lib/services";
import { apiErrorMessage } from "@/lib/api";
import { Loading, ErrorState } from "@/components/data-state";
import type { LedgerEntry } from "@/lib/types";

function Stock() {
  const [q, setQ] = useState("");
  const [adj, setAdj] = useState<{ productId: string; boxes: number; pieces: number; note: string } | null>(null);
  const [ledgerProduct, setLedgerProduct] = useState<{ id: string; name: string } | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const { data: rows, loading, error, refresh } = useApi(() => stockApi.list(), []);
  const stock = rows || [];

  const filtered = stock.filter(
    (p) => !q || p.productName.toLowerCase().includes(q.toLowerCase()) || (p.hsn || "").includes(q),
  );

  const saveAdj = async () => {
    if (!adj?.productId) { toast.error("Select a product"); return; }
    try {
      await stockApi.adjust(adj);
      toast.success("Stock adjusted");
      setAdj(null);
      await refresh();
    } catch (e) {
      toast.error(apiErrorMessage(e));
    }
  };

  const openLedger = async (productId: string, name: string) => {
    setLedgerProduct({ id: productId, name });
    setLedgerLoading(true);
    try {
      const data = await stockApi.ledger(productId);
      setLedger(data || []);
    } catch (e) {
      toast.error(apiErrorMessage(e));
      setLedger([]);
    } finally {
      setLedgerLoading(false);
    }
  };

  const exportAll = () =>
    exportSheet(
      stock.map((p) => ({
        Name: p.productName, HSN: p.hsn, "Pcs/Box": p.boxSize,
        Purchased: p.purchased, Sold: p.sold,
        "Remaining Pieces": p.remainingPieces,
        "Remaining Boxes": p.remainingBoxes,
        "Loose Pieces": p.loosePieces,
        "Min Alert (boxes)": p.minStockAlert,
      })),
      "stock.xlsx",
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <h1 className="text-2xl font-bold mr-auto">Stock</h1>
        <Input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} className="w-72" />
        <Button variant="outline" onClick={exportAll}>Export Excel</Button>
        <Dialog open={!!adj} onOpenChange={(v) => !v && setAdj(null)}>
          <DialogTrigger asChild>
            <Button onClick={() => setAdj({ productId: stock[0]?.productId || "", boxes: 0, pieces: 0, note: "" })}>
              Stock Adjustment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Stock Adjustment</DialogTitle></DialogHeader>
            {adj && (
              <div className="space-y-3">
                <div>
                  <Label>Product</Label>
                  <Select value={adj.productId} onValueChange={(v) => setAdj({ ...adj, productId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent>
                      {stock.map((p) => <SelectItem key={p.productId} value={p.productId}>{p.productName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Boxes (±)</Label><Input type="number" value={adj.boxes} onChange={(e) => setAdj({ ...adj, boxes: +e.target.value })} /></div>
                  <div><Label>Pieces (±)</Label><Input type="number" value={adj.pieces} onChange={(e) => setAdj({ ...adj, pieces: +e.target.value })} /></div>
                </div>
                <div><Label>Note</Label><Input value={adj.note} onChange={(e) => setAdj({ ...adj, note: e.target.value })} /></div>
              </div>
            )}
            <DialogFooter><Button onClick={saveAdj}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && <ErrorState message={error} onRetry={refresh} />}

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading && <Loading label="Loading stock..." />}
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left"><tr>
              <th className="p-2">Product</th><th>HSN</th>
              <th className="text-right">Pcs / Box</th>
              <th className="text-right">Purchased</th>
              <th className="text-right">Sold</th>
              <th className="text-right">Remaining</th>
              <th>Alert</th><th></th>
            </tr></thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.productId} className={"border-t " + (p.lowStock ? "bg-destructive/10" : "")}>
                  <td className="p-2 font-medium">{p.productName}</td>
                  <td>{p.hsn || "—"}</td>
                  <td className="text-right">{p.boxSize}</td>
                  <td className="text-right text-green-700">{formatQty(p.purchased, p.boxSize || 1)}</td>
                  <td className="text-right text-destructive">{formatQty(p.sold, p.boxSize || 1)}</td>
                  <td className="text-right font-semibold text-green-700">
                    {formatQty(p.remainingPieces, p.boxSize || 1)}
                    <span className="text-muted-foreground text-xs ml-1">({p.remainingPieces} pcs)</span>
                  </td>
                  <td>{p.lowStock ? <span className="text-destructive font-semibold">LOW</span> : "OK"}</td>
                  <td className="text-right pr-2">
                    <Button size="sm" variant="ghost" onClick={() => openLedger(p.productId, p.productName)}>Ledger</Button>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center p-6 text-muted-foreground">No stock records.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={!!ledgerProduct} onOpenChange={(v) => !v && setLedgerProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Stock Ledger — {ledgerProduct?.name}</DialogTitle></DialogHeader>
          <div className="max-h-96 overflow-auto">
            {ledgerLoading ? <Loading label="Loading ledger..." /> : (
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left"><tr><th className="p-2">Date</th><th>Type</th><th className="text-right">Boxes</th><th className="text-right">Pieces</th><th>Note</th></tr></thead>
                <tbody>
                  {ledger.map((e) => (
                    <tr key={e._id} className="border-t">
                      <td className="p-2">{format(new Date(e.ts), "dd/MM/yy HH:mm")}</td>
                      <td>{e.type}</td>
                      <td className={"text-right " + (e.boxes < 0 ? "text-destructive" : "text-green-700")}>{e.boxes}</td>
                      <td className={"text-right " + (e.pieces < 0 ? "text-destructive" : "text-green-700")}>{e.pieces}</td>
                      <td>{e.note || "—"}</td>
                    </tr>
                  ))}
                  {ledger.length === 0 && <tr><td colSpan={5} className="text-center p-6 text-muted-foreground">No movements.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Stock;
