import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/billing/$id")({
  component: LegacyInvoiceRedirect,
  head: () => ({ meta: [{ title: "Invoice Preview — STAR ENTERPRISES" }] }),
});

function LegacyInvoiceRedirect() {
  const { id } = Route.useParams();
  return <Navigate to="/invoice-preview/$id" params={{ id }} replace />;
}
