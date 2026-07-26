import { useState, useMemo } from "react";
import { Search, Eye, ZoomIn, Download, X, Check, Clock, XCircle, CreditCard } from "lucide-react";
import { getApplications, updateApplicationStatus, type Application } from "@/lib/adminStore";
import { toast } from "sonner";
import { Reveal } from "@/components/site/Reveal";
import {
  AdminPageHeader, AdminCard, AdminBadge, AdminButton, AdminSelect,
  C, DiamondAccent,
} from "@/components/admin/AdminUI";

export default function AdminPaymentsPage() {
  const [apps, setApps] = useState<Application[]>(getApplications());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [viewApp, setViewApp] = useState<Application | null>(null);
  const [zoomImage, setZoomImage] = useState(false);

  const filtered = useMemo(() => {
    return apps.filter((a) => {
      const matchSearch = !search ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase()) ||
        a.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [apps, search, statusFilter]);

  function handleStatusChange(id: string, status: Application["status"]) {
    const updated = updateApplicationStatus(id, status);
    setApps(updated);
    setViewApp((prev) => (prev ? { ...prev, status } : null));
    toast.success(`Payment ${id} ${status}.`);
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Verification"
        title="Payments"
        subtitle="Verify payment proofs and manage statuses"
      />

      {/* Summary cards — matches site stat-block pattern */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Reveal delay={0}>
          <div className="card-lift p-5" style={{ background: "#fff", border: `1px solid ${C.platinum200}` }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full" style={{ background: C.warning }} />
              <p className="text-xs font-medium uppercase tracking-widest" style={{ color: C.muted }}>Pending</p>
            </div>
            <p className="font-display text-3xl font-medium" style={{ color: C.warning }}>{apps.filter((a) => a.status === "pending").length}</p>
          </div>
        </Reveal>
        <Reveal delay={1}>
          <div className="card-lift p-5" style={{ background: "#fff", border: `1px solid ${C.platinum200}` }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full" style={{ background: C.success }} />
              <p className="text-xs font-medium uppercase tracking-widest" style={{ color: C.muted }}>Approved</p>
            </div>
            <p className="font-display text-3xl font-medium" style={{ color: C.success }}>{apps.filter((a) => a.status === "approved").length}</p>
          </div>
        </Reveal>
        <Reveal delay={2}>
          <div className="card-lift p-5" style={{ background: "#fff", border: `1px solid ${C.platinum200}` }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full" style={{ background: C.error }} />
              <p className="text-xs font-medium uppercase tracking-widest" style={{ color: C.muted }}>Rejected</p>
            </div>
            <p className="font-display text-3xl font-medium" style={{ color: C.error }}>{apps.filter((a) => a.status === "rejected").length}</p>
          </div>
        </Reveal>
        <Reveal delay={3}>
          <div
            className="card-lift p-5 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg,#0C1E3D 0%,#040D1A 100%)", border: "1px solid rgba(201,168,76,0.3)" }}
          >
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg,${C.gold},${C.goldLight})` }} />
            <div className="flex items-center gap-2 mb-2">
              <DiamondAccent size={6} />
              <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(201,168,76,0.7)" }}>Revenue</p>
            </div>
            <p
              className="font-display text-3xl font-medium"
              style={{ background: `linear-gradient(135deg,${C.goldLight},${C.gold})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
            >
              ₹{apps.filter((a) => a.status === "approved").reduce((s, a) => s + a.registrationFee, 0).toLocaleString("en-IN")}
            </p>
          </div>
        </Reveal>
      </div>

      {/* Filters */}
      <Reveal delay={1}>
        <AdminCard className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: C.platinum400 }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or ID..."
                className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none transition-all duration-300"
                style={{ background: C.platinum100, border: `1.5px solid ${C.platinum200}`, color: C.ink }}
                onFocus={(e) => (e.currentTarget.style.borderColor = C.gold)}
                onBlur={(e) => (e.currentTarget.style.borderColor = C.platinum200)}
              />
            </div>
            <AdminSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "All Status" },
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
              ]}
            />
          </div>
        </AdminCard>
      </Reveal>

      {/* Payment cards grid — matches site offerings card pattern */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <Reveal className="col-span-full">
            <div
              className="text-center py-16 rounded-xl"
              style={{ background: "#fff", border: `1px solid ${C.platinum200}`, color: C.platinum400 }}
            >
              <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-40" />
              No payments found.
            </div>
          </Reveal>
        ) : (
          filtered.map((app, i) => (
            <Reveal key={app.id} delay={(i % 3) as 0 | 1 | 2}>
              <div
                className="card-lift h-full overflow-hidden group"
                style={{ background: "#fff", border: `1px solid ${C.platinum200}` }}
              >
                {/* Gold top accent on hover */}
                <div
                  className="h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left"
                  style={{ background: `linear-gradient(90deg,${C.gold},${C.goldLight})` }}
                />
                {/* Image */}
                <div className="relative" style={{ background: "#fff" }}>
                  <img
                    src={app.paymentScreenshot}
                    alt="Payment proof"
                    className="w-full h-40 object-cover cursor-pointer"
                    onClick={() => { setViewApp(app); setZoomImage(false); }}
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button onClick={() => { setViewApp(app); setZoomImage(true); }} className="p-1.5 rounded-lg transition-all" style={{ background: "rgba(4,13,26,0.7)", color: C.gold }}>
                      <ZoomIn className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => { setViewApp(app); setZoomImage(false); }} className="p-1.5 rounded-lg transition-all" style={{ background: "rgba(4,13,26,0.7)", color: C.gold }}>
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {/* Content */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs" style={{ color: C.goldDark }}>{app.id}</span>
                    <AdminBadge status={app.status} />
                  </div>
                  <p className="font-display text-lg font-medium" style={{ color: C.ink }}>{app.name}</p>
                  <p className="text-xs" style={{ color: C.muted }}>{app.course} — ₹{app.registrationFee.toLocaleString("en-IN")}</p>
                  <div className="flex gap-1.5 pt-3">
                    <button
                      onClick={() => handleStatusChange(app.id, "approved")}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded text-xs font-semibold transition-all duration-300"
                      style={{ background: "rgba(22,163,74,0.08)", color: C.success, border: "1px solid rgba(22,163,74,0.2)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(22,163,74,0.15)"; e.currentTarget.style.borderColor = "rgba(22,163,74,0.4)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(22,163,74,0.08)"; e.currentTarget.style.borderColor = "rgba(22,163,74,0.2)"; }}
                    >
                      <Check className="h-3 w-3" /> Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(app.id, "pending")}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded text-xs font-semibold transition-all duration-300"
                      style={{ background: "rgba(202,138,4,0.08)", color: C.warning, border: "1px solid rgba(202,138,4,0.2)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(202,138,4,0.15)"; e.currentTarget.style.borderColor = "rgba(202,138,4,0.4)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(202,138,4,0.08)"; e.currentTarget.style.borderColor = "rgba(202,138,4,0.2)"; }}
                    >
                      <Clock className="h-3 w-3" /> Pending
                    </button>
                    <button
                      onClick={() => handleStatusChange(app.id, "rejected")}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded text-xs font-semibold transition-all duration-300"
                      style={{ background: "rgba(220,38,38,0.08)", color: C.error, border: "1px solid rgba(220,38,38,0.2)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(220,38,38,0.15)"; e.currentTarget.style.borderColor = "rgba(220,38,38,0.4)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(220,38,38,0.08)"; e.currentTarget.style.borderColor = "rgba(220,38,38,0.2)"; }}
                    >
                      <XCircle className="h-3 w-3" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          ))
        )}
      </div>

      {/* View modal */}
      {viewApp && !zoomImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(4,13,26,0.8)", backdropFilter: "blur(8px)" }} onClick={() => setViewApp(null)}>
          <div className="relative rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" style={{ background: "#fff", border: `1px solid ${C.platinum200}`, boxShadow: "0 24px 64px -16px rgba(0,0,0,0.3)" }} onClick={(e) => e.stopPropagation()}>
            <div className="h-0.5" style={{ background: `linear-gradient(90deg,transparent,${C.gold} 25%,${C.goldLight} 50%,${C.gold} 75%,transparent)` }} />
            <div className="px-6 py-4 flex items-center justify-between sticky top-0" style={{ background: "#fff", borderBottom: `1px solid ${C.platinum200}` }}>
              <div className="flex items-center gap-2">
                <DiamondAccent size={6} />
                <h3 className="font-display text-lg font-medium" style={{ color: C.ink }}>Payment Details — {viewApp.id}</h3>
              </div>
              <button onClick={() => setViewApp(null)} className="p-1.5 rounded-full" style={{ background: C.platinum100 }}>
                <X className="h-4 w-4" style={{ color: C.muted }} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Detail label="Name" value={viewApp.name} />
                <Detail label="Email" value={viewApp.email} />
                <Detail label="Mobile" value={viewApp.mobile} />
                <Detail label="College" value={viewApp.college} />
                <Detail label="Education" value={viewApp.education} />
                <Detail label="Course" value={viewApp.course} />
                <Detail label="Fee" value={`₹${viewApp.registrationFee.toLocaleString("en-IN")}`} />
                <Detail label="Status" value={<AdminBadge status={viewApp.status} />} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: C.goldDark }}>Payment Screenshot</p>
                <div className="relative rounded-lg overflow-hidden" style={{ border: `1px solid ${C.platinum200}` }}>
                  <img src={viewApp.paymentScreenshot} alt="Payment proof" className="w-full max-h-64 object-contain" style={{ background: "#fff" }} />
                  <button onClick={() => setZoomImage(true)} className="absolute top-2 right-2 p-2 rounded-lg" style={{ background: "rgba(4,13,26,0.7)", color: C.gold }}>
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>
                <a href={viewApp.paymentScreenshot} download={`payment-${viewApp.id}.jpg`} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-2 text-xs font-medium" style={{ color: C.goldDark }}>
                  <Download className="h-3.5 w-3.5" /> Download screenshot
                </a>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <AdminButton variant="success" onClick={() => handleStatusChange(viewApp.id, "approved")}><Check className="h-4 w-4" /> Approve</AdminButton>
                <AdminButton variant="outline" onClick={() => handleStatusChange(viewApp.id, "pending")}><Clock className="h-4 w-4" /> Pending</AdminButton>
                <AdminButton variant="danger" onClick={() => handleStatusChange(viewApp.id, "rejected")}><XCircle className="h-4 w-4" /> Reject</AdminButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewApp && zoomImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(4,13,26,0.95)" }} onClick={() => setZoomImage(false)}>
          <img src={viewApp.paymentScreenshot} alt="Payment proof zoomed" className="max-w-full max-h-full rounded-lg" />
          <button onClick={() => setZoomImage(false)} className="absolute top-4 right-4 p-2 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
            <X className="h-5 w-5" style={{ color: "#fff" }} />
          </button>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return <div><p className="text-xs" style={{ color: C.muted }}>{label}</p><p className="text-sm font-medium mt-0.5" style={{ color: C.ink }}>{value}</p></div>;
}
