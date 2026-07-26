import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Role } from "@/lib/db";
import { useState } from "react";
import bcrypt from "bcryptjs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Trash2, KeyRound, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings/users")({
  component: Users,
  head: () => ({ meta: [{ title: "Users — STAR ENTERPRISES" }] }),
});

function Users() {
  const session = useAuth((s) => s.session);
  const users = useLiveQuery(() => db.users.toArray(), []);
  const [form, setForm] = useState<{ open: boolean; name: string; username: string; password: string; role: Role }>({
    open: false, name: "", username: "", password: "", role: "billing",
  });
  const [pwUserId, setPwUserId] = useState<number | null>(null);
  const [newPw, setNewPw] = useState("");

  if (session?.role !== "admin") {
    return <div className="text-muted-foreground">Admin only.</div>;
  }

  const save = async () => {
    if (!form.name || !form.username || !form.password) { toast.error("All fields required"); return; }
    const dup = await db.users.where("username").equals(form.username).first();
    if (dup) { toast.error("Username taken"); return; }
    const hash = await bcrypt.hash(form.password, 8);
    await db.users.add({ name: form.name, username: form.username, passwordHash: hash, role: form.role, createdAt: Date.now() });
    toast.success("User added");
    setForm({ open: false, name: "", username: "", password: "", role: "billing" });
  };

  const changeRole = async (id: number, role: Role) => {
    await db.users.update(id, { role });
    toast.success("Role updated");
  };

  const del = async (id: number) => {
    if (id === session.userId) { toast.error("Cannot delete yourself"); return; }
    if (!confirm("Delete user?")) return;
    await db.users.delete(id);
    toast.success("Deleted");
  };

  const resetPw = async () => {
    if (!pwUserId || !newPw) return;
    const hash = await bcrypt.hash(newPw, 8);
    await db.users.update(pwUserId, { passwordHash: hash });
    toast.success("Password updated");
    setPwUserId(null); setNewPw("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold mr-auto">Users</h1>
        <Dialog open={form.open} onOpenChange={(v) => setForm({ ...form, open: v })}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />New User</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add User</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Username</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
              <div><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              <div><Label>Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="manager">Manager</SelectItem><SelectItem value="billing">Billing Staff</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card><CardContent className="p-0">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left"><tr><th className="p-2">Name</th><th>Username</th><th>Role</th><th></th></tr></thead>
          <tbody>
            {(users || []).map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-2 font-medium">{u.name}</td><td>{u.username}</td>
                <td>
                  <Select value={u.role} onValueChange={(v) => changeRole(u.id!, v as Role)}>
                    <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="manager">Manager</SelectItem><SelectItem value="billing">Billing Staff</SelectItem></SelectContent>
                  </Select>
                </td>
                <td className="text-right pr-2">
                  <Button size="icon" variant="ghost" onClick={() => setPwUserId(u.id!)}><KeyRound className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => del(u.id!)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
      <Dialog open={!!pwUserId} onOpenChange={(v) => !v && setPwUserId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reset Password</DialogTitle></DialogHeader>
          <Input type="password" placeholder="New password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
          <DialogFooter><Button onClick={resetPw}>Update</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
