import { Navigate, useParams } from "react-router-dom";
function LegacyInvoiceRedirect() {
  const { id } = useParams();
  return <Navigate to={`/invoice-preview/${id}`} replace />;
}
