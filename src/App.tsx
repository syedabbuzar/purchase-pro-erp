import { Routes, Route } from "react-router-dom";
import { GlobalSchema } from "@/components/site/Schema";
import { ScrollToTop } from "@/components/site/ScrollToTop";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/auth/AdminProtectedRoute";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import TrainingPage from "./pages/TrainingPage";
import PortfolioPage from "./pages/PortfolioPage";
import IndustriesPage from "./pages/IndustriesPage";
import CareersPage from "./pages/CareersPage";
import ContactPage from "./pages/ContactPage";
import AgenticAiPage from "./pages/AgenticAiPage";
import WebAppsPage from "./pages/WebAppsPage";
import MobileAppsPage from "./pages/MobileAppsPage";
import CustomSoftwarePage from "./pages/CustomSoftwarePage";
import CrmInventoryPage from "./pages/CrmInventoryPage";
import BusinessSitesPage from "./pages/BusinessSitesPage";
import NotFoundPage from "./pages/NotFoundPage";
import InternshipLoginPage from "./pages/InternshipLoginPage";
import InternshipRegisterPage from "./pages/InternshipRegisterPage";
import InternshipSuccessPage from "./pages/InternshipSuccessPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminApplicationsPage from "./pages/admin/AdminApplicationsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminPaymentsPage from "./pages/admin/AdminPaymentsPage";
import AdminQrManagementPage from "./pages/admin/AdminQrManagementPage";
import AdminSuccessContentPage from "./pages/admin/AdminSuccessContentPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminEnquiriesPage from "./pages/admin/AdminEnquiriesPage";

export default function App() {
  return (
    <>
      <GlobalSchema />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/agentic-ai" element={<AgenticAiPage />} />
        <Route path="/services/web-apps" element={<WebAppsPage />} />
        <Route path="/services/mobile-apps" element={<MobileAppsPage />} />
        <Route path="/services/custom-software" element={<CustomSoftwarePage />} />
        <Route path="/services/crm-inventory" element={<CrmInventoryPage />} />
        <Route path="/services/business-sites" element={<BusinessSitesPage />} />
        <Route path="/industries" element={<IndustriesPage />} />
        <Route path="/training" element={<TrainingPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/contact" element={<ContactPage />} />
        {/* Internship auth + portal */}
        <Route path="/internship/login" element={<InternshipLoginPage />} />
        <Route
          path="/internship/register"
          element={
            <ProtectedRoute>
              <InternshipRegisterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/internship/success"
          element={
            <ProtectedRoute>
              <InternshipSuccessPage />
            </ProtectedRoute>
          }
        />
        {/* Admin panel */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="applications" element={<AdminApplicationsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="qr-management" element={<AdminQrManagementPage />} />
          <Route path="enquiries" element={<AdminEnquiriesPage />} />
          <Route path="success-content" element={<AdminSuccessContentPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
