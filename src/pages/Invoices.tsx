import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/num";
import { format } from "date-fns";
import { exportSheet } from "@/lib/xlsx-export";

function Invoices() {
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const data = useLiveQuery(async () => {
    const invoices = (await db.invoices.toArray()).filter((i) => i.status !== "deleted").sort((a, b) => b.date - a.date);
    const customers = await db.customers.toArray();
    return { invoices, customers };
  }, []);
  if (!data) return <div>Loading...</div>;

  const filtered = data.invoices.filter((i) => {
    const c = data.customers.find((x) => x.id === i.customerId);
    if (q) {
      const s = q.toLowerCase();
      if (!i.number.toLowerCase().includes(s) && !(c?.name || "").toLowerCase().includes(s) && !(c?.mobile || "").includes(s)) return false;
    }
    if (from && i.date < new Date(from).getTime()) return false;
    if (to && i.date > new Date(to).getTime() + 86400000) return false;
    return true;
  });

  const total = filtered.filter((i) => i.status === "active").reduce((s, i) => s + i.total, 0);

  const exportAll = () => {
    exportSheet(filtered.map((i) => {
      const c = data.customers.find((x) => x.id === i.customerId);
      return {
        "Invoice #": i.number, Date: format(i.date, "dd/MM/yyyy"),
        Customer: c?.name || "", Mobile: c?.mobile || "",
        Taxable: i.taxable, CGST: i.cgst, SGST: i.sgst, IGST: i.igst,
        Total: i.total, Status: i.status,
      };
    }), "invoices.xlsx");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <h1 className="text-2xl font-bold mr-auto">Invoices</h1>
        <Input placeholder="Search #, customer, mobile..." value={q} onChange={(e) => setQ(e.target.value)} className="w-72" />
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
        <Button variant="outline" onClick={exportAll}>Export Excel</Button>
        <Button asChild><Link to="/billing">New Bill</Link></Button>
      </div>
      <Card><CardContent className="p-4 text-sm">
        <span className="text-muted-foreground">Showing {filtered.length} invoices — </span>
        <b>Total: ₹ {inr(total)}</b>
      </CardContent></Card>
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left"><tr>
              <th className="p-2">Invoice #</th><th>Date</th><th>Customer</th>
              <th className="text-right">Taxable</th><th className="text-right">Tax</th>
              <th className="text-right">Total</th><th>Status</th><th></th>
            </tr></thead>
            <tbody>
              {filtered.map((i) => {
                const c = data.customers.find((x) => x.id === i.customerId);
                return (
                  <tr key={i.id} className="border-t hover:bg-muted/30">
                    <td className="p-2"><Link to={`/invoice-preview/${String(i.id)}`} className="text-primary font-medium hover:underline">{i.number}</Link></td>
                    <td>{format(i.date, "dd/MM/yyyy")}</td>
                    <td>{c?.name || "—"}</td>
                    <td className="text-right">{inr(i.taxable)}</td>
                    <td className="text-right">{inr(i.cgst + i.sgst + i.igst)}</td>
                    <td className="text-right font-semibold">₹ {inr(i.total)}</td>
                    <td className={i.status === "cancelled" ? "text-destructive" : ""}>{i.status}</td>
                    <td className="text-right pr-2"><Link to={`/invoice-preview/${String(i.id)}`} className="text-primary hover:underline">Open</Link></td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={8} className="text-center p-6 text-muted-foreground">No invoices.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default Invoices;
