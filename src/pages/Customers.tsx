import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Customer } from "@/lib/db";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { exportSheet } from "@/lib/xlsx-export";

const empty: Partial<Customer> = {
  name: "", shopName: "", mobile: "", state: "Maharashtra", stateCode: "27", status: "active",
};

function Customers() {
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Partial<Customer> | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const customers = useLiveQuery(() => db.customers.orderBy("name").toArray(), []);

  const filtered = (customers || []).filter((c) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return c.name.toLowerCase().includes(s) || (c.shopName || "").toLowerCase().includes(s) ||
      c.mobile.includes(s) || (c.gstin || "").toLowerCase().includes(s);
  });

  const save = async () => {
    if (!editing) return;
    if (!editing.name || !editing.mobile) { toast.error("Name and mobile required"); return; }
    if (editing.id) await db.customers.update(editing.id, editing);
    else await db.customers.add({ ...(editing as Customer), createdAt: Date.now() });
    toast.success("Saved");
    setEditing(null);
  };

  const confirmDelete = async () => {
    if (!deleting?.id) return;
    const linked = await db.invoices.where("customerId").equals(deleting.id).count();
    if (linked > 0) {
      toast.error("Customer has invoices and cannot be deleted");
      setDeleting(null);
      return;
    }
    await db.customers.delete(deleting.id);
    toast.success("Customer deleted");
    setDeleting(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold mr-auto">Customers</h1>
        <Input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} className="w-72" />
        <Button variant="outline" onClick={() => exportSheet((customers || []).map((c) => ({
          Name: c.name, Shop: c.shopName, Mobile: c.mobile, GSTIN: c.gstin, City: c.city, State: c.state,
        })), "customers.xlsx")}>Export Excel</Button>
        <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
          <DialogTrigger asChild><Button onClick={() => setEditing({ ...empty })}><Plus className="h-4 w-4 mr-1" />New Customer</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "New"} Customer</DialogTitle></DialogHeader>
            {editing && (
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Customer Name *</Label><Input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                <div><Label>Shop Name</Label><Input value={editing.shopName || ""} onChange={(e) => setEditing({ ...editing, shopName: e.target.value })} /></div>
                <div><Label>Mobile *</Label><Input value={editing.mobile || ""} onChange={(e) => setEditing({ ...editing, mobile: e.target.value })} /></div>
                <div><Label>Alt Mobile</Label><Input value={editing.altMobile || ""} onChange={(e) => setEditing({ ...editing, altMobile: e.target.value })} /></div>
                <div><Label>GSTIN</Label><Input value={editing.gstin || ""} onChange={(e) => setEditing({ ...editing, gstin: e.target.value.toUpperCase() })} /></div>
                <div><Label>PAN</Label><Input value={editing.pan || ""} onChange={(e) => setEditing({ ...editing, pan: e.target.value.toUpperCase() })} /></div>
                <div className="col-span-2"><Label>Address</Label><Textarea rows={2} value={editing.address || ""} onChange={(e) => setEditing({ ...editing, address: e.target.value })} /></div>
                <div><Label>City</Label><Input value={editing.city || ""} onChange={(e) => setEditing({ ...editing, city: e.target.value })} /></div>
                <div><Label>State</Label><Input value={editing.state || ""} onChange={(e) => setEditing({ ...editing, state: e.target.value })} /></div>
                <div><Label>State Code</Label><Input value={editing.stateCode || ""} onChange={(e) => setEditing({ ...editing, stateCode: e.target.value })} /></div>
                <div><Label>Pincode</Label><Input value={editing.pincode || ""} onChange={(e) => setEditing({ ...editing, pincode: e.target.value })} /></div>
                <div><Label>Email</Label><Input value={editing.email || ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></div>
                <div><Label>Credit Limit</Label><Input type="number" value={editing.creditLimit ?? 0} onChange={(e) => setEditing({ ...editing, creditLimit: +e.target.value })} /></div>
                <div><Label>Opening Balance</Label><Input type="number" value={editing.openingBalance ?? 0} onChange={(e) => setEditing({ ...editing, openingBalance: +e.target.value })} /></div>
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
              <tr><th className="p-2">Name</th><th>Shop</th><th>Mobile</th><th>GSTIN</th><th>City</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t hover:bg-muted/30">
                  <td className="p-2"><Link to={`/customers/${String(c.id)}`} className="font-medium text-primary hover:underline">{c.name}</Link></td>
                  <td>{c.shopName || "—"}</td>
                  <td>{c.mobile}</td>
                  <td>{c.gstin || "—"}</td>
                  <td>{c.city || "—"}</td>
                  <td className="text-right pr-2">
                    <Button size="icon" variant="ghost" onClick={() => setEditing(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeleting(c)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="text-center p-6 text-muted-foreground">No customers yet.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete customer?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.name} will be removed permanently. Customers with existing invoices cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Customers;
