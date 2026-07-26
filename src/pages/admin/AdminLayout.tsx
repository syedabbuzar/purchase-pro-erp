import { useState } from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard, FileText, Users, CreditCard, QrCode,
  FileEdit, Settings, LogOut, Menu, X, ChevronLeft, Mail,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { C, DiamondAccent } from "@/components/admin/AdminUI";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/applications", label: "Applications", icon: FileText },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/enquiries", label: "Contact Enquiries", icon: Mail },
  { to: "/admin/qr-management", label: "QR Management", icon: QrCode },
  { to: "/admin/success-content", label: "Success Page Content", icon: FileEdit },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { session, signOut } = useAuth();

  function handleLogout() {
    signOut();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="min-h-screen flex" style={{ background: C.cream }}>
      {/* ─── Sidebar ─── */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 shrink-0 transition-transform duration-500 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          background: "linear-gradient(180deg,#040D1A 0%,#071326 100%)",
          borderRight: "1px solid rgba(201,168,76,0.15)",
        }}
      >
        <div className="flex flex-col h-full">
          {/* Gold top border accent (matches site header) */}
          <div
            className="h-0.5 w-full"
            style={{ background: "linear-gradient(90deg,transparent,#C9A84C 25%,#E2C878 50%,#C9A84C 75%,transparent)" }}
          />

          {/* Logo */}
          <div
            className="px-6 py-6 flex items-center justify-between"
            style={{ borderBottom: "1px solid rgba(201,168,76,0.12)" }}
          >
            <Link to="/admin/dashboard" className="flex items-center gap-3">
              <img src="/realpng.png" alt="Logo" className="h-12 w-auto" />
              <div className="flex flex-col leading-none">
                <span className="font-display text-lg font-semibold" style={{ color: "#F9F3E3" }}>
                  MellowMoon
                </span>
                <span className="text-[9px] font-medium tracking-[0.18em]" style={{ color: "rgba(249,243,227,0.6)" }}>
                  Admin Panel
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
            <div className="section-label mb-4 px-2" style={{ color: "rgba(201,168,76,0.7)" }}>
              Management
            </div>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className="group relative flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-300"
                  style={({ isActive }) => ({
                    background: isActive ? "rgba(201,168,76,0.12)" : "transparent",
                    color: isActive ? "#C9A84C" : "rgba(250,251,252,0.6)",
                    borderLeft: isActive ? "2px solid #C9A84C" : "2px solid transparent",
                  })}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    const isActive = el.style.borderLeft.includes("#C9A84C");
                    if (!isActive) {
                      el.style.background = "rgba(201,168,76,0.06)";
                      el.style.color = "#E2C878";
                      el.style.paddingLeft = "1.75rem";
                    }
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    const isActive = el.style.borderLeft.includes("#C9A84C");
                    if (!isActive) {
                      el.style.background = "transparent";
                      el.style.color = "rgba(250,251,252,0.6)";
                      el.style.paddingLeft = "1rem";
                    }
                  }}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Admin info + logout */}
          <div
            className="px-4 py-5 space-y-3"
            style={{ borderTop: "1px solid rgba(201,168,76,0.12)" }}
          >
            <div
              className="px-4 py-3 rounded-lg"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.1)" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <DiamondAccent size={6} />
                <span className="text-xs font-semibold" style={{ color: "#C9A84C" }}>
                  {session?.name ?? "Admin"}
                </span>
              </div>
              <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
                {session?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300"
              style={{ color: "rgba(239,68,68,0.8)", border: "1px solid rgba(239,68,68,0.2)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)";
              }}
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Overlay for mobile ─── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(4,13,26,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Main content ─── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar (mobile) */}
        <header
          className="lg:hidden sticky top-0 z-30 px-4 py-3 flex items-center justify-between"
          style={{
            background: "linear-gradient(180deg,#040D1A 0%,#071326 100%)",
            borderBottom: "1px solid rgba(201,168,76,0.15)",
          }}
        >
          <button onClick={() => setSidebarOpen(true)} style={{ color: "#C9A84C" }}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/realpng.png" alt="Logo" className="h-8 w-auto" />
            <span className="font-display text-sm font-semibold" style={{ color: "#C9A84C" }}>
              Admin
            </span>
          </div>
          <Link to="/" style={{ color: "rgba(255,255,255,0.5)" }}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-x-hidden">
          <div className="container-x max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
