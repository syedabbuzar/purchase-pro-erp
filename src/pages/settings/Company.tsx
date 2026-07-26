import { useLiveQuery } from "dexie-react-hooks";
import { db, DEFAULT_COMPANY, type Company } from "@/lib/db";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

function CompanySettings() {
  const company = useLiveQuery(() => db.company.toCollection().first(), []);
  const [form, setForm] = useState<Company>(DEFAULT_COMPANY);
  useEffect(() => { if (company) setForm(company); }, [company]);

  const save = async () => {
    if (form.id) await db.company.update(form.id, form);
    else await db.company.add(form);
    toast.success("Saved");
  };

  const set = (k: keyof Company, v: string) => setForm({ ...form, [k]: v });
  const fields: { k: keyof Company; label: string; full?: boolean; area?: boolean }[] = [
    { k: "name", label: "Company Name", full: true },
    { k: "address", label: "Address", full: true, area: true },
    { k: "city", label: "City" },
    { k: "state", label: "State" },
    { k: "stateCode", label: "State Code" },
    { k: "phone", label: "Phone" },
    { k: "gstin", label: "GSTIN" },
    { k: "pan", label: "PAN" },
    { k: "fssai", label: "FSSAI" },
    { k: "bankName", label: "Bank Name" },
    { k: "accountNo", label: "Account No" },
    { k: "ifsc", label: "IFSC Code" },
    { k: "invoicePrefix", label: "Invoice Prefix" },
    { k: "footer", label: "Invoice Footer", full: true, area: true },
    { k: "terms", label: "Terms & Declaration", full: true, area: true },
  ];

  return (
    <div className="space-y-4 max-w-4xl">
      <h1 className="text-2xl font-bold">Company Settings</h1>
      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          {fields.map((f) => (
            <div key={f.k} className={f.full ? "col-span-2" : ""}>
              <Label>{f.label}</Label>
              {f.area
                ? <Textarea rows={2} value={String(form[f.k] || "")} onChange={(e) => set(f.k, e.target.value)} />
                : <Input value={String(form[f.k] || "")} onChange={(e) => set(f.k, e.target.value)} />}
            </div>
          ))}
          <div className="col-span-2"><Button onClick={save}>Save Settings</Button></div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CompanySettings;
