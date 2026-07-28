import { useLiveQuery } from "dexie-react-hooks";
import { db, type Product } from "@/lib/db";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { inr } from "@/lib/num";
import { exportSheet } from "@/lib/xlsx-export";

const empty: Partial<Product> = {
  name: "", hsn: "", description: "", mrp: 0, rate: 0, gstPct: 5, unit: "PCS",
  boxSize: 1, minStockAlert: 0, status: "active",
};

function Products() {
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const products = useLiveQuery(() => db.products.orderBy("name").toArray(), []);

  const filtered = (products || []).filter((p) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return p.name.toLowerCase().includes(s) || p.hsn.toLowerCase().includes(s);
  });


  const save = async () => {
    if (!editing) return;
    if (!editing.name) { toast.error("Name required"); return; }
    try {
      const isEdit = !!editing.id;
      const dupName = await db.products.where("name").equalsIgnoreCase(editing.name).first();
      if (dupName && dupName.id !== editing.id) { toast.error("Product name must be unique"); return; }

      if (isEdit) {
        await db.products.update(editing.id!, editing);
        toast.success("Product updated");
      } else {
        await db.products.add({ ...(editing as Product), createdAt: Date.now() });
        toast.success("Product added");
      }
      setEditing(null);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const del = async (id: number) => {
    if (!confirm("Delete this product? Stock history for it will remain.")) return;
    await db.products.delete(id);
    toast.success("Deleted");
  };

  const exportAll = () => {
    exportSheet(
      (products || []).map((p) => ({
        Name: p.name, HSN: p.hsn, MRP: p.mrp, Rate: p.rate, "GST%": p.gstPct,
        Unit: p.unit, "Box Size": p.boxSize, Status: p.status,
      })),
      "products.xlsx",
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold mr-auto">Products</h1>
        <Input placeholder="Search name / HSN..." value={q} onChange={(e) => setQ(e.target.value)} className="w-72" />
        <Button variant="outline" onClick={exportAll}>Export Excel</Button>
        <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing({ ...empty })}><Plus className="h-4 w-4 mr-1" />New Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "New"} Product</DialogTitle></DialogHeader>
            {editing && (
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Label>Name *</Label><Input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                <div className="col-span-2"><Label>Description</Label><Textarea rows={2} value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
                <div>
                  <Label>HSN <span className="text-muted-foreground text-[10px]">(from latest Purchase)</span></Label>
                  <Input value={editing.hsn || ""} readOnly disabled className="bg-muted/50" />
                </div>
                <div><Label>Unit</Label><Input value={editing.unit || ""} onChange={(e) => setEditing({ ...editing, unit: e.target.value })} /></div>
                <div><Label>MRP</Label><Input type="number" value={editing.mrp ?? 0} onChange={(e) => setEditing({ ...editing, mrp: +e.target.value })} /></div>
                <div><Label>Rate (per piece)</Label><Input type="number" value={editing.rate ?? 0} onChange={(e) => setEditing({ ...editing, rate: +e.target.value })} /></div>
                <div><Label>GST %</Label>
                  <Select value={String(editing.gstPct ?? 5)} onValueChange={(v) => setEditing({ ...editing, gstPct: +v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{[0, 5, 12, 18, 28].map((r) => <SelectItem key={r} value={String(r)}>{r}%</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Barcode</Label><Input value={editing.barcode || ""} onChange={(e) => setEditing({ ...editing, barcode: e.target.value })} /></div>
                <div><Label>Box Size (pcs / box)</Label><Input type="number" value={editing.boxSize ?? 1} onChange={(e) => setEditing({ ...editing, boxSize: Math.max(1, +e.target.value) })} /></div>
                <div><Label>Min Stock Alert (boxes)</Label><Input type="number" value={editing.minStockAlert ?? 0} onChange={(e) => setEditing({ ...editing, minStockAlert: +e.target.value })} /></div>
                <div />

                <div><Label>Status</Label>
                  <Select value={editing.status || "active"} onValueChange={(v) => setEditing({ ...editing, status: v as "active" | "inactive" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-2">Name</th><th>HSN</th>
                <th className="text-right">MRP</th><th className="text-right">Rate</th>
                <th className="text-right">GST%</th><th className="text-right">Box</th>
                <th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t hover:bg-muted/30">
                  <td className="p-2 font-medium">{p.name}</td>
                  <td>{p.hsn}</td>
                  <td className="text-right">{inr(p.mrp)}</td>
                  <td className="text-right">{inr(p.rate)}</td>
                  <td className="text-right">{p.gstPct}%</td>
                  <td className="text-right">1×{p.boxSize}</td>
                  <td><span className={p.status === "active" ? "text-green-700" : "text-muted-foreground"}>{p.status}</span></td>
                  <td className="text-right pr-2">
                    <Button size="icon" variant="ghost" onClick={() => setEditing(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => del(p.id!)}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} className="text-center p-6 text-muted-foreground">No products yet.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default Products;
