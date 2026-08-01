import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { companyApi } from "@/lib/services";
import { apiErrorMessage } from "@/lib/api";
import type { Company } from "@/lib/types";

const blank: Partial<Company> = {
  name: "", address: "", city: "", state: "", stateCode: "", phone: "", gstin: "", pan: "",
  fssai: "", bankName: "", accountNo: "", ifsc: "", invoicePrefix: "INV", footer: "", terms: "",
};

const fields: { key: keyof Company; label: string }[] = [
  { key: "name", label: "Company Name" },
  { key: "phone", label: "Phone" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "stateCode", label: "State Code" },
  { key: "gstin", label: "GSTIN" },
  { key: "pan", label: "PAN" },
  { key: "fssai", label: "FSSAI" },
  { key: "bankName", label: "Bank Name" },
  { key: "accountNo", label: "Account No" },
  { key: "ifsc", label: "IFSC" },
  { key: "invoicePrefix", label: "Invoice Prefix" },
];

function CompanySettings() {
  const [form, setForm] = useState<Partial<Company>>({ ...blank });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const c = await companyApi.get();
        if (c) setForm(c);
      } catch (e) {
        toast.error(apiErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      const saved = form._id ? await companyApi.update(form._id, form) : await companyApi.create(form);
      setForm(saved || form);
      toast.success("Company profile saved");
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading company profile…</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Company Profile</h1>
      <Card>
        <CardHeader><CardTitle>Details used on invoices</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {fields.map((f) => (
            <div key={f.key}>
              <Label>{f.label}</Label>
              <Input
                value={(form[f.key] as string) || ""}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            </div>
          ))}
          <div className="sm:col-span-2 md:col-span-3"><Label>Address</Label><Textarea rows={2} value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div className="sm:col-span-2 md:col-span-3"><Label>Invoice Footer</Label><Textarea rows={2} value={form.footer || ""} onChange={(e) => setForm({ ...form, footer: e.target.value })} /></div>
          <div className="sm:col-span-2 md:col-span-3"><Label>Terms & Conditions</Label><Textarea rows={3} value={form.terms || ""} onChange={(e) => setForm({ ...form, terms: e.target.value })} /></div>
          <div><Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button></div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CompanySettings;
