import { lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route, Navigate, Outlet, useNavigate, Link } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/lib/auth";
const starLogo = "./star-logo.png";

const AuthPage = lazy(() => import("@/pages/Auth"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Billing = lazy(() => import("@/pages/Billing"));
const BillingLegacyRedirect = lazy(() => import("@/pages/BillingLegacyRedirect"));
const Invoices = lazy(() => import("@/pages/Invoices"));
const InvoicePreview = lazy(() => import("@/pages/InvoicePreview"));
const Products = lazy(() => import("@/pages/Products"));
const Customers = lazy(() => import("@/pages/Customers"));
const CustomerProfile = lazy(() => import("@/pages/CustomerProfile"));
const Stock = lazy(() => import("@/pages/Stock"));
const Purchases = lazy(() => import("@/pages/Purchases"));
const PurchaseView = lazy(() => import("@/pages/PurchaseView"));
const Daily = lazy(() => import("@/pages/reports/Daily"));
const Sales = lazy(() => import("@/pages/reports/Sales"));
const Gst = lazy(() => import("@/pages/reports/Gst"));
const Gstr1 = lazy(() => import("@/pages/reports/Gstr1"));
const Company = lazy(() => import("@/pages/settings/Company"));
const Users = lazy(() => import("@/pages/settings/Users"));
const Backup = lazy(() => import("@/pages/settings/Backup"));

function StartupLoader() {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowLoader(false), 1400);
    return () => window.clearTimeout(timer);
  }, []);

  if (!showLoader) return null;

  return (
    <div className="app-loader-screen">
      <div className="app-loader-card">
        <img src={starLogo} alt="STAR ENTERPRISES" className="app-loader-logo" />
        <div className="app-loader-progress">
          <div className="app-loader-progress-bar" />
        </div>
      </div>
    </div>
  );
}

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
            <img src={starLogo} alt="STAR ENTERPRISES" className="h-8 w-auto object-contain" />
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
  return (
    <>
      <StartupLoader />
      <Suspense fallback={<div className="hidden" />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route element={<AuthLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/billing/:id" element={<BillingLegacyRedirect />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoices/:id" element={<InvoicePreview />} />
            <Route path="/invoice-preview/:id" element={<InvoicePreview />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<CustomerProfile />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/purchases/:id" element={<PurchaseView />} />
            <Route path="/reports/daily" element={<Daily />} />
            <Route path="/reports/sales" element={<Sales />} />
            <Route path="/reports/gst" element={<Gst />} />
            <Route path="/reports/gstr1" element={<Gstr1 />} />
            <Route path="/settings/company" element={<Company />} />
            <Route path="/settings/users" element={<Users />} />
            <Route path="/settings/backup" element={<Backup />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;