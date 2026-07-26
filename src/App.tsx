import { useEffect } from "react";
import { Routes, Route, Navigate, Outlet, useNavigate, Link } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/lib/auth";
import { ensureSeed } from "@/lib/db";

import AuthPage from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Billing from "@/pages/Billing";
import BillingLegacyRedirect from "@/pages/BillingLegacyRedirect";
import Invoices from "@/pages/Invoices";
import InvoicePreview from "@/pages/InvoicePreview";
import Products from "@/pages/Products";
import Customers from "@/pages/Customers";
import CustomerProfile from "@/pages/CustomerProfile";
import Stock from "@/pages/Stock";
import Purchases from "@/pages/Purchases";
import Daily from "@/pages/reports/Daily";
import Sales from "@/pages/reports/Sales";
import Gst from "@/pages/reports/Gst";
import Gstr1B2B from "@/pages/reports/Gstr1B2B";
import Gstr3b from "@/pages/reports/Gstr3b";
import GstB2BExport from "@/pages/reports/GstB2BExport";
import Company from "@/pages/settings/Company";
import Users from "@/pages/settings/Users";
import Backup from "@/pages/settings/Backup";

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Go home</Link>
        </div>
      </div>
    </div>
  );
}

function AuthLayout() {
  const navigate = useNavigate();
  const session = useAuth((s) => s.session);
  useEffect(() => {
    if (!session || session.expiresAt <= Date.now()) navigate("/auth");
  }, [session, navigate]);
  if (!session) return null;
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 border-b bg-card/50 backdrop-blur flex items-center px-2 gap-2 no-print">
            <SidebarTrigger />
            <div className="text-sm font-semibold">STAR ENTERPRISES</div>
            <div className="ml-auto text-xs text-muted-foreground">
              {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  useEffect(() => { ensureSeed().catch(console.error); }, []);
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<AuthLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/billing/:id" element={<BillingLegacyRedirect />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoice-preview/:id" element={<InvoicePreview />} />
          <Route path="/products" element={<Products />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerProfile />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/reports/daily" element={<Daily />} />
          <Route path="/reports/sales" element={<Sales />} />
          <Route path="/reports/gst" element={<Gst />} />
          <Route path="/reports/gstr1-b2b" element={<Gstr1B2B />} />
          <Route path="/reports/gstr3b" element={<Gstr3b />} />
          <Route path="/reports/gst-b2b-export" element={<GstB2BExport />} />
          <Route path="/settings/company" element={<Company />} />
          <Route path="/settings/users" element={<Users />} />
          <Route path="/settings/backup" element={<Backup />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;