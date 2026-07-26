import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FileText, Clock, CheckCircle, XCircle, Calendar, TrendingUp,
  ArrowRight, Users, CreditCard, Sparkles, Mail,
} from "lucide-react";
import { getApplications, getUsers, getEnquiries } from "@/lib/adminStore";
import { Reveal } from "@/components/site/Reveal";
import {
  AdminPageHeader, AdminStatCard, AdminCard, AdminBadge,
  C, DiamondAccent, GoldLine,
} from "@/components/admin/AdminUI";

export default function AdminDashboardPage() {
  const apps = getApplications();
  const users = getUsers();
  const enquiries = getEnquiries();

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    return {
      total: apps.length,
      pending: apps.filter((a) => a.status === "pending").length,
      approved: apps.filter((a) => a.status === "approved").length,
      rejected: apps.filter((a) => a.status === "rejected").length,
      today: apps.filter((a) => new Date(a.createdAt).toDateString() === today).length,
      totalRevenue: apps
        .filter((a) => a.status === "approved")
        .reduce((sum, a) => sum + a.registrationFee, 0),
      enquiries: enquiries.length,
      newEnquiries: enquiries.filter((e) => e.status === "new").length,
    };
  }, [apps, enquiries]);

  const recentApps = [...apps]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Overview"
        title="Dashboard"
        subtitle="Internship applications and platform activity at a glance"
      />

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <AdminStatCard label="Total Applications" value={stats.total} icon={<FileText className="h-5 w-5" />} delay={0} />
        <AdminStatCard label="Pending Approval" value={stats.pending} icon={<Clock className="h-5 w-5" />} color={C.warning} delay={1} />
        <AdminStatCard label="Approved Applications" value={stats.approved} icon={<CheckCircle className="h-5 w-5" />} color={C.success} delay={2} />
        <AdminStatCard label="Rejected Applications" value={stats.rejected} icon={<XCircle className="h-5 w-5" />} color={C.error} delay={3} />
        <AdminStatCard label="Registered Users" value={users.length} icon={<Users className="h-5 w-5" />} color={C.navy700} delay={0} />
        <AdminStatCard label="Contact Enquiries" value={stats.enquiries} icon={<Mail className="h-5 w-5" />} color={C.goldDark} delay={1} />
        <AdminStatCard label="Today's Registrations" value={stats.today} icon={<Calendar className="h-5 w-5" />} color={C.navy700} delay={2} />
      </div>

      {/* ── Revenue + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue card — matches site training stat card pattern */}
        <Reveal delay={1}>
          <div
            className="card-lift h-full p-7 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg,#0C1E3D 0%,#040D1A 100%)",
              border: "1px solid rgba(201,168,76,0.3)",
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-0.5"
              style={{ background: "linear-gradient(90deg,#C9A84C,#E2C878)" }}
            />
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5" style={{ color: C.gold }} />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(201,168,76,0.7)" }}>
                Total Revenue
              </span>
            </div>
            <p
              className="font-display font-medium"
              style={{ fontSize: "clamp(2.25rem,4vw,3rem)", background: `linear-gradient(135deg,${C.goldLight},${C.gold})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
            >
              ₹{stats.totalRevenue.toLocaleString("en-IN")}
            </p>
            <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>
              From approved applications
            </p>
            <div className="mt-5 flex items-center gap-2">
              <DiamondAccent size={6} />
              <GoldLine width={32} />
            </div>
          </div>
        </Reveal>

        {/* Quick actions — matches site offerings card pattern */}
        <Reveal delay={2} className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 h-full">
            <QuickAction to="/admin/applications" label="View Applications" icon={<FileText className="h-5 w-5" />} count={stats.total} />
            <QuickAction to="/admin/users" label="Manage Users" icon={<Users className="h-5 w-5" />} count={users.length} />
            <QuickAction to="/admin/payments" label="Payment Verification" icon={<CreditCard className="h-5 w-5" />} count={stats.pending} />
            <QuickAction to="/admin/enquiries" label="Contact Enquiries" icon={<Mail className="h-5 w-5" />} count={stats.enquiries} />
          </div>
        </Reveal>
      </div>

      {/* ── Recent Applications ── */}
      <Reveal delay={2}>
        <div className="mb-5">
          <div className="section-label" style={{ color: C.goldDark }}>Recent Activity</div>
          <h2 className="mt-3 font-display text-2xl font-medium" style={{ color: C.ink }}>
            Latest Applications
          </h2>
        </div>
      </Reveal>

      <Reveal delay={3}>
        <AdminCard>
          {/* Table header bar */}
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${C.platinum200}`, background: C.platinum100 }}
          >
            <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: C.navy800 }}>
              Recent Applications
            </h3>
            <Link
              to="/admin/applications"
              className="flex items-center gap-1 text-xs font-medium transition-colors group"
              style={{ color: C.navy800 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.navy800)}
            >
              View all <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.platinum200}` }}>
                  <Th>ID</Th><Th>Name</Th><Th>Course</Th><Th>Fee</Th><Th>Date</Th><Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {recentApps.map((app) => (
                  <tr
                    key={app.id}
                    style={{ borderBottom: `1px solid ${C.platinum100}` }}
                    className="transition-colors hover:bg-[#F9F3E3]/30"
                  >
                    <Td><span className="font-mono text-xs" style={{ color: C.goldDark }}>{app.id}</span></Td>
                    <Td><span className="font-medium">{app.name}</span></Td>
                    <Td>{app.course}</Td>
                    <Td>₹{app.registrationFee.toLocaleString("en-IN")}</Td>
                    <Td>{new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</Td>
                    <Td><AdminBadge status={app.status} /></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      </Reveal>

      {/* ── Recent Enquiries ── */}
      <Reveal delay={3}>
        <div className="mt-8 mb-5">
          <div className="section-label" style={{ color: C.goldDark }}>Latest Activity</div>
          <h2 className="mt-3 font-display text-2xl font-medium" style={{ color: C.ink }}>
            Recent Contact Enquiries
          </h2>
        </div>
      </Reveal>

      <Reveal delay={4}>
        <AdminCard>
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${C.platinum200}`, background: C.platinum100 }}
          >
            <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: C.navy800 }}>
              Recent Enquiries
            </h3>
            <Link
              to="/admin/enquiries"
              className="flex items-center gap-1 text-xs font-medium transition-colors group"
              style={{ color: C.navy800 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.navy800)}
            >
              View all <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.platinum200}` }}>
                  <Th>Name</Th><Th>Service</Th><Th>Email</Th><Th>Date</Th><Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {enquiries.slice(0, 5).map((enq) => (
                  <tr
                    key={enq.id}
                    style={{ borderBottom: `1px solid ${C.platinum100}` }}
                    className="transition-colors hover:bg-[#F9F3E3]/30"
                  >
                    <Td><span className="font-medium">{enq.name}</span></Td>
                    <Td>{enq.service}</Td>
                    <Td><span className="text-xs">{enq.email}</span></Td>
                    <Td>{new Date(enq.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</Td>
                    <Td>
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
                        style={{
                          background: enq.status === "new" ? "rgba(201,168,76,0.1)" : enq.status === "replied" ? "rgba(22,163,74,0.1)" : "rgba(159,167,181,0.1)",
                          color: enq.status === "new" ? C.goldDark : enq.status === "replied" ? C.success : C.platinum400,
                          border: `1px solid ${enq.status === "new" ? "rgba(201,168,76,0.3)" : enq.status === "replied" ? "rgba(22,163,74,0.3)" : "rgba(159,167,181,0.3)"}`,
                        }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: enq.status === "new" ? C.goldDark : enq.status === "replied" ? C.success : C.platinum400 }} />
                        {enq.status}
                      </span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      </Reveal>
    </div>
  );
}

function QuickAction({ to, label, icon, count }: { to: string; label: string; icon: React.ReactNode; count: number }) {
  return (
    <Link
      to={to}
      className="card-lift group block h-full p-6 relative overflow-hidden"
      style={{ background: "#fff", border: `1px solid ${C.platinum200}` }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left"
        style={{ background: `linear-gradient(90deg,${C.gold},${C.goldLight})` }}
      />
      <div
        className="h-11 w-11 grid place-items-center mb-4"
        style={{ background: `linear-gradient(135deg,${C.navy800},${C.navy950})`, boxShadow: `0 4px 20px -4px rgba(4,13,26,0.3)` }}
      >
        <span style={{ color: C.gold }}>{icon}</span>
      </div>
      <div className="font-display text-3xl font-medium" style={{ color: C.ink }}>{count}</div>
      <div className="text-xs mt-1 uppercase tracking-widest" style={{ color: C.muted }}>{label}</div>
      <div
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors"
        style={{ color: C.gold }}
      >
        <Sparkles className="h-3 w-3" /> Open
      </div>
    </Link>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: C.muted, background: C.platinum100 }}>{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: C.ink }}>{children}</td>;
}
