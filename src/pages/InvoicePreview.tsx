import { useParams } from "react-router-dom";
import { InvoicePreviewView } from "@/components/invoice-preview-view";

function InvoicePreviewPage() {
  const { id } = useParams();
  return <InvoicePreviewView invoiceId={Number(id)} />;
}
