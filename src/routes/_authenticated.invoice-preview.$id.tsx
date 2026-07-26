import { createFileRoute } from "@tanstack/react-router";
import { InvoicePreviewView } from "@/components/invoice-preview-view";

export const Route = createFileRoute("/_authenticated/invoice-preview/$id")({
  component: InvoicePreviewPage,
  head: () => ({ meta: [{ title: "Invoice Preview — STAR ENTERPRISES" }] }),
});

function InvoicePreviewPage() {
  const { id } = Route.useParams();
  return <InvoicePreviewView invoiceId={Number(id)} />;
}
