import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InvoiceSheet } from "@/components/invoice-sheet";
import { Loading, ErrorState } from "@/components/data-state";
import { ArrowLeft, Ban, Copy, Pencil, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiErrorMessage } from "@/lib/api";
import { companyApi, customersApi, invoicesApi } from "@/lib/services";
import type { Company, Customer, Invoice, InvoiceItem } from "@/lib/types";

export function InvoicePreviewView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [res, c] = await Promise.all([invoicesApi.getById(id), companyApi.get()]);
      setInvoice(res?.invoice || null);
      setItems(res?.items || []);
      setCompany(c || null);
      if (res?.invoice?.customerId) {
        const profile = await customersApi.profile(String(res.invoice.customerId));
        setCustomer(profile?.customer || null);
      }
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const cancelInvoice = async () => {
    if (!invoice) return;
    if (invoice.status !== "active") { toast.info("Invoice is already cancelled"); return; }
    try {
      setBusy(true);
      await invoicesApi.cancel(invoice._id);
      toast.success("Invoice cancelled — stock restored");
      await load();
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const deleteInvoice = async () => {
    if (!invoice) return;
    try {
      setBusy(true);
      await invoicesApi.remove(invoice._id);
      toast.success("Invoice deleted — stock restored");
      navigate("/invoices");
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loading label="Loading invoice..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!invoice) return <div className="p-6 text-sm text-muted-foreground">Invoice not found.</div>;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 no-print">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <h1 className="text-xl font-bold">
          Invoice {invoice.number}
          {invoice.status !== "active" && (
            <span className="ml-2 text-xs uppercase text-destructive">({invoice.status})</span>
          )}
        </h1>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1" /> Print
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate(`/billing?duplicate=${invoice._id}`)}>
            <Copy className="h-4 w-4 mr-1" /> Duplicate
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={invoice.status !== "active" || busy}
            onClick={() => navigate(`/billing?edit=${invoice._id}`)}
          >
            <Pencil className="h-4 w-4 mr-1" /> Edit
          </Button>
          <Button size="sm" variant="outline" disabled={invoice.status !== "active" || busy} onClick={cancelInvoice}>
            <Ban className="h-4 w-4 mr-1" /> Cancel
          </Button>
          <Button size="sm" variant="destructive" disabled={busy} onClick={deleteInvoice}>
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </div>

      {customer && company ? (
        <InvoiceSheet invoice={invoice} items={items} customer={customer} company={company} />
      ) : (
        <div className="p-6 text-sm text-muted-foreground">
          Customer or company details missing — set up your company profile in Settings to print this invoice.
        </div>
      )}
    </div>
  );
}

export default InvoicePreviewView;
