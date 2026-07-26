import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { exportSheet } from "@/lib/xlsx-export";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/stock")({
  component: Stock,
  head: () => ({ meta: [{ title: "Stock — STAR ENTERPRISES" }] }),
});

function Stock() {
  const [q, setQ] = useState("");
  const [adj, setAdj] = useState<{ productId: number; boxes: number; pieces: number; note: string } | null>(null);
  const [ledgerProduct, setLedgerProduct] = useState<number | null>(null);

  const data = useLiveQuery(async () => {
    const products = await db.products.orderBy("name").toArray();
    const ledger = await db.stockLedger.toArray();
    const stock = new Map<number, { boxes: number; pieces: number; totalPieces: number }>();
    for (const p of products) {
      const entries = ledger.filter((e) => e.productId === p.id);
      const totalPieces = entries.reduce((s, e) => s + e.boxes * (p.boxSize || 1) + e.pieces, 0);
      const boxes = Math.floor(totalPieces / (p.boxSize || 1));
      const pieces = totalPieces - boxes * (p.boxSize || 1);
      stock.set(p.id!, { boxes, pieces, totalPieces });
    }
    return { products, ledger, stock };
  }, []);

  if (!data) return <div>Loading...</div>;

  const filtered = data.products.filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.hsn.includes(q));

  const saveAdj = async () => {
    if (!adj) return;
    await db.stockLedger.add({
      productId: adj.productId, ts: Date.now(), type: "adjustment",
      boxes: adj.boxes, pieces: adj.pieces, note: adj.note || "Manual adjustment",
    });
    toast.success("Adjusted");
    setAdj(null);
  };

  const exportAll = () => exportSheet(data.products.map((p) => {
    const s = data.stock.get(p.id!)!;
    const opening = (p.openingBoxes || 0) * (p.boxSize || 1) + (p.openingPieces || 0);
    return {
      Name: p.name, HSN: p.hsn,
      "Opening Boxes": p.openingBoxes || 0, "Pcs/Box": p.boxSize,
      "Total Pieces": opening, Sold: Math.max(0, opening - s.totalPieces),
      Remaining: s.totalPieces,
      "Min Alert (boxes)": p.minStockAlert,
    };
  }), "stock.xlsx");


  const ledgerRows = ledgerProduct
    ? data.ledger.filter((e) => e.productId === ledgerProduct).sort((a, b) => b.ts - a.ts)
    : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <h1 className="text-2xl font-bold mr-auto">Stock</h1>
        <Input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} className="w-72" />
        <Button variant="outline" onClick={exportAll}>Export Excel</Button>
        <Dialog open={!!adj} onOpenChange={(v) => !v && setAdj(null)}>
          <DialogTrigger asChild><Button onClick={() => setAdj({ productId: data.products[0]?.id || 0, boxes: 0, pieces: 0, note: "" })}>Stock Adjustment</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Stock Adjustment</DialogTitle></DialogHeader>
            {adj && (<div className="space-y-3">
              <div><Label>Product</Label>
                <Select value={String(adj.productId)} onValueChange={(v) => setAdj({ ...adj, productId: +v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{data.products.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Boxes (±)</Label><Input type="number" value={adj.boxes} onChange={(e) => setAdj({ ...adj, boxes: +e.target.value })} /></div>
                <div><Label>Pieces (±)</Label><Input type="number" value={adj.pieces} onChange={(e) => setAdj({ ...adj, pieces: +e.target.value })} /></div>
              </div>
              <div><Label>Note</Label><Input value={adj.note} onChange={(e) => setAdj({ ...adj, note: e.target.value })} /></div>
            </div>)}
            <DialogFooter><Button onClick={saveAdj}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left"><tr>
              <th className="p-2">Product</th><th>HSN</th>
              <th className="text-right">Opening Boxes</th>
              <th className="text-right">Pcs / Box</th>
              <th className="text-right">Total Pieces</th>
              <th className="text-right">Sold</th>
              <th className="text-right">Remaining</th>
              <th>Alert</th><th></th>
            </tr></thead>
            <tbody>
              {filtered.map((p) => {
                const s = data.stock.get(p.id!)!;
                const openingTotal = (p.openingBoxes || 0) * (p.boxSize || 1) + (p.openingPieces || 0);
                const sold = Math.max(0, openingTotal - s.totalPieces);
                const remaining = s.totalPieces;
                const remBoxes = Math.floor(remaining / (p.boxSize || 1));
                const remPieces = remaining - remBoxes * (p.boxSize || 1);
                const low = remBoxes <= (p.minStockAlert || 0);
                return (
                  <tr key={p.id} className={"border-t " + (low ? "bg-destructive/10" : "")}>
                    <td className="p-2 font-medium">{p.name}</td>
                    <td>{p.hsn}</td>
                    <td className="text-right">{p.openingBoxes || 0}</td>
                    <td className="text-right">{p.boxSize}</td>
                    <td className="text-right">{openingTotal}</td>
                    <td className="text-right text-destructive">{sold}</td>
                    <td className="text-right font-semibold text-green-700">
                      {remaining} <span className="text-muted-foreground text-xs">({remBoxes} box + {remPieces} pcs)</span>
                    </td>
                    <td>{low ? <span className="text-destructive font-semibold">LOW</span> : "OK"}</td>
                    <td className="text-right pr-2"><Button size="sm" variant="ghost" onClick={() => setLedgerProduct(p.id!)}>Ledger</Button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>


      <Dialog open={!!ledgerProduct} onOpenChange={(v) => !v && setLedgerProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Stock Ledger — {data.products.find((p) => p.id === ledgerProduct)?.name}</DialogTitle></DialogHeader>
          <div className="max-h-96 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left"><tr><th className="p-2">Date</th><th>Type</th><th className="text-right">Boxes</th><th className="text-right">Pieces</th><th>Note</th></tr></thead>
              <tbody>
                {ledgerRows.map((e) => (
                  <tr key={e.id} className="border-t"><td className="p-2">{format(e.ts, "dd/MM/yy HH:mm")}</td><td>{e.type}</td>
                    <td className={"text-right " + (e.boxes < 0 ? "text-destructive" : "text-green-700")}>{e.boxes}</td>
                    <td className={"text-right " + (e.pieces < 0 ? "text-destructive" : "text-green-700")}>{e.pieces}</td>
                    <td>{e.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
