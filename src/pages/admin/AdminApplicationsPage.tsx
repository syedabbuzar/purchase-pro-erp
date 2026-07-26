import { useState, useMemo } from "react";
import {
  Search, Download, Eye, ZoomIn, X, Check, Clock, XCircle,
  ChevronLeft, ChevronRight, FileSpreadsheet, Filter,
} from "lucide-react";
import { getApplications, updateApplicationStatus, type Application } from "@/lib/adminStore";
import { toast } from "sonner";
import { Reveal } from "@/components/site/Reveal";
import {
  AdminPageHeader, AdminCard, AdminBadge, AdminButton, AdminInput,
  AdminSelect, C, DiamondAccent,
} from "@/components/admin/AdminUI";

const PAGE_SIZE = 5;

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<Application[]>(getApplications());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [durationFilter, setDurationFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [viewApp, setViewApp] = useState<Application | null>(null);
  const [zoomImage, setZoomImage] = useState(false);

  const filtered = useMemo(() => {
    return apps.filter((a) => {
      const matchSearch =
        !search ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase()) ||
        a.mobile.includes(search) ||
        a.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || a.status === statusFilter;
      const matchDuration = durationFilter === "all" || a.duration === durationFilter;
      return matchSearch && matchStatus && matchDuration;
    });
  }, [apps, search, statusFilter, durationFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const currentPage = Math.min(page, totalPages);
  const pageData = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleStatusChange(id: string, status: Application["status"]) {
    const updated = updateApplicationStatus(id, status);
    setApps(updated);
    setViewApp((prev) => (prev ? { ...prev, status } : null));
    toast.success(`Application ${id} marked as ${status}.`);
  }

  function exportCSV() {
    const headers = ["Application ID", "Name", "Mobile", "Email", "College", "Education", "Duration", "Course", "Registration Fee", "Payment Screenshot", "Submission Date", "Status"];
    const rows = filtered.map((a) => [
      a.id, a.name, a.mobile, a.email, a.college, a.education,
      a.duration === "2_months" ? "2 Months" : "6 Months",
      a.course, `₹${a.registrationFee}`, a.paymentScreenshot,
      new Date(a.createdAt).toLocaleString("en-IN"), a.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    downloadFile(csv, "applications.csv", "text/csv");
    toast.success("CSV exported successfully!");
  }

  function exportExcel() {
    const headers = ["Application ID", "Name", "Mobile", "Email", "College", "Education", "Duration", "Course", "Registration Fee", "Payment Screenshot", "Submission Date", "Status"];
    const rows = filtered.map((a) => [
      a.id, a.name, a.mobile, a.email, a.college, a.education,
      a.duration === "2_months" ? "2 Months" : "6 Months",
      a.course, `₹${a.registrationFee}`, a.paymentScreenshot,
      new Date(a.createdAt).toLocaleString("en-IN"), a.status,
    ]);
    const html = `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    downloadFile(html, "applications.xls", "application/vnd.ms-excel");
    toast.success("Excel exported successfully!");
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Management"
        title="Applications"
        subtitle={`${filtered.length} application${filtered.length !== 1 ? "s" : ""} found`}
        actions={
          <>
            <AdminButton variant="outline" size="sm" onClick={exportCSV}>
              <Download className="h-4 w-4" /> CSV
            </AdminButton>
            <AdminButton variant="outline" size="sm" onClick={exportExcel}>
              <FileSpreadsheet className="h-4 w-4" /> Excel
            </AdminButton>
          </>
        }
      />

      {/* Filters — matches site form pattern */}
      <Reveal delay={1}>
        <AdminCard className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: C.platinum400 }} />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name, email, mobile, or ID..."
                className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none transition-all duration-300"
                style={{ background: C.platinum100, border: `1.5px solid ${C.platinum200}`, color: C.ink }}
                onFocus={(e) => (e.currentTarget.style.borderColor = C.gold)}
                onBlur={(e) => (e.currentTarget.style.borderColor = C.platinum200)}
              />
            </div>
            <AdminSelect
              value={statusFilter}
              onChange={(v) => { setStatusFilter(v); setPage(1); }}
              options={[
                { value: "all", label: "All Status" },
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
              ]}
            />
            <AdminSelect
              value={durationFilter}
              onChange={(v) => { setDurationFilter(v); setPage(1); }}
              options={[
                { value: "all", label: "All Durations" },
                { value: "2_months", label: "2 Months" },
                { value: "6_months", label: "6 Months" },
              ]}
            />
          </div>
        </AdminCard>
      </Reveal>

      {/* Table */}
      <Reveal delay={2}>
        <AdminCard>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.platinum200}` }}>
                  <Th>App ID</Th><Th>Name</Th><Th>Mobile</Th><Th>Email</Th>
                  <Th>College</Th><Th>Education</Th><Th>Duration</Th><Th>Course</Th><Th>Fee</Th><Th>Proof</Th>
                  <Th>Date</Th><Th>Status</Th><Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {pageData.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="text-center py-16" style={{ color: C.platinum400 }}>
                      <Filter className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  pageData.map((app) => (
                    <tr
                      key={app.id}
                      style={{ borderBottom: `1px solid ${C.platinum100}` }}
                      className="transition-colors hover:bg-[#F9F3E3]/30"
                    >
                      <Td><span className="font-mono text-xs" style={{ color: C.goldDark }}>{app.id}</span></Td>
                      <Td><span className="font-medium">{app.name}</span></Td>
                      <Td>{app.mobile}</Td>
                      <Td><span className="text-xs">{app.email}</span></Td>
                      <Td>{app.college}</Td>
                      <Td>{app.education}</Td>
                      <Td>{app.duration === "2_months" ? "2 Mo" : "6 Mo"}</Td>
                      <Td>{app.course}</Td>
                      <Td>₹{app.registrationFee.toLocaleString("en-IN")}</Td>
                      <Td>
                        <button
                          onClick={() => { setViewApp(app); setZoomImage(false); }}
                          className="transition-colors p-1.5 rounded"
                          style={{ color: C.gold }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201,168,76,0.1)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </Td>
                      <Td><span className="text-xs">{new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span></Td>
                      <Td><AdminBadge status={app.status} /></Td>
                      <Td>
                        <div className="flex items-center gap-1.5">
                          <ActionBtn onClick={() => handleStatusChange(app.id, "approved")} title="Approve" color={C.success}><Check className="h-3.5 w-3.5" /></ActionBtn>
                          <ActionBtn onClick={() => handleStatusChange(app.id, "pending")} title="Pending" color={C.warning}><Clock className="h-3.5 w-3.5" /></ActionBtn>
                          <ActionBtn onClick={() => handleStatusChange(app.id, "rejected")} title="Reject" color={C.error}><XCircle className="h-3.5 w-3.5" /></ActionBtn>
                        </div>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > 0 && (
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{ borderTop: `1px solid ${C.platinum200}`, background: C.platinum100 }}
            >
              <span className="text-xs" style={{ color: C.muted }}>
                Page {currentPage} of {totalPages} — {filtered.length} total
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg transition-all disabled:opacity-30"
                  style={{ border: `1px solid ${C.platinum300}`, color: C.navy800 }}
                  onMouseEnter={(e) => { if (currentPage !== 1) e.currentTarget.style.borderColor = C.gold; }}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.platinum300)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg transition-all disabled:opacity-30"
                  style={{ border: `1px solid ${C.platinum300}`, color: C.navy800 }}
                  onMouseEnter={(e) => { if (currentPage !== totalPages) e.currentTarget.style.borderColor = C.gold; }}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.platinum300)}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </AdminCard>
      </Reveal>

      {/* Payment Verification Modal */}
      {viewApp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(4,13,26,0.8)", backdropFilter: "blur(8px)" }}
          onClick={() => setViewApp(null)}
        >
          <div
            className="relative rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            style={{ background: "#fff", border: `1px solid ${C.platinum200}`, boxShadow: "0 24px 64px -16px rgba(0,0,0,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gold top border */}
            <div className="h-0.5" style={{ background: `linear-gradient(90deg,transparent,${C.gold} 25%,${C.goldLight} 50%,${C.gold} 75%,transparent)` }} />
            <div className="px-6 py-4 flex items-center justify-between sticky top-0" style={{ background: "#fff", borderBottom: `1px solid ${C.platinum200}` }}>
              <div className="flex items-center gap-2">
                <DiamondAccent size={6} />
                <h3 className="font-display text-lg font-medium" style={{ color: C.ink }}>Payment Verification</h3>
              </div>
              <button onClick={() => setViewApp(null)} className="p-1.5 rounded-full transition-colors" style={{ background: C.platinum100 }}>
                <X className="h-4 w-4" style={{ color: C.muted }} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Detail label="Application ID" value={<span className="font-mono text-xs" style={{ color: C.goldDark }}>{viewApp.id}</span>} />
                <Detail label="Status" value={<AdminBadge status={viewApp.status} />} />
                <Detail label="Name" value={viewApp.name} />
                <Detail label="Mobile" value={viewApp.mobile} />
                <Detail label="Email" value={viewApp.email} />
                <Detail label="College" value={viewApp.college} />
                <Detail label="Education" value={viewApp.education} />
                <Detail label="Duration" value={viewApp.duration === "2_months" ? "2 Months" : "6 Months"} />
                <Detail label="Course" value={viewApp.course} />
                <Detail label="Fee" value={`₹${viewApp.registrationFee.toLocaleString("en-IN")}`} />
                <Detail label="Submitted" value={new Date(viewApp.createdAt).toLocaleString("en-IN")} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: C.goldDark }}>Payment Screenshot</p>
                <div className="relative rounded-lg overflow-hidden" style={{ border: `1px solid ${C.platinum200}` }}>
                  <img src={viewApp.paymentScreenshot} alt="Payment proof" className="w-full max-h-64 object-contain" style={{ background: "#fff" }} />
                  <button
                    onClick={() => setZoomImage(!zoomImage)}
                    className="absolute top-2 right-2 p-2 rounded-lg transition-all"
                    style={{ background: "rgba(4,13,26,0.7)", color: C.gold }}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>
                <a
                  href={viewApp.paymentScreenshot}
                  download={`payment-${viewApp.id}.jpg`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-2 text-xs font-medium transition-colors"
                  style={{ color: C.goldDark }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = C.goldDark)}
                >
                  <Download className="h-3.5 w-3.5" /> Download screenshot
                </a>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <AdminButton variant="success" onClick={() => handleStatusChange(viewApp.id, "approved")}>
                  <Check className="h-4 w-4" /> Approve
                </AdminButton>
                <AdminButton variant="outline" onClick={() => handleStatusChange(viewApp.id, "pending")}>
                  <Clock className="h-4 w-4" /> Pending
                </AdminButton>
                <AdminButton variant="danger" onClick={() => handleStatusChange(viewApp.id, "rejected")}>
                  <XCircle className="h-4 w-4" /> Reject
                </AdminButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zoom modal */}
      {viewApp && zoomImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: "rgba(4,13,26,0.95)" }}
          onClick={() => setZoomImage(false)}
        >
          <img src={viewApp.paymentScreenshot} alt="Payment proof zoomed" className="max-w-full max-h-full rounded-lg" />
          <button
            onClick={() => setZoomImage(false)}
            className="absolute top-4 right-4 p-2 rounded-full"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <X className="h-5 w-5" style={{ color: "#fff" }} />
          </button>
        </div>
      )}
    </div>
  );
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs" style={{ color: C.muted }}>{label}</p>
      <p className="text-sm font-medium mt-0.5" style={{ color: C.ink }}>{value}</p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: C.muted, borderBottom: `1px solid ${C.platinum200}`, background: C.platinum100 }}>{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: C.ink, borderBottom: `1px solid ${C.platinum100}` }}>{children}</td>;
}
function ActionBtn({ onClick, title, color, children }: { onClick: () => void; title: string; color: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-1.5 rounded-lg transition-all duration-300"
      style={{ background: `${color}10`, border: `1px solid ${color}30` }}
      onMouseEnter={(e) => { e.currentTarget.style.background = `${color}20`; e.currentTarget.style.borderColor = `${color}60`; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = `${color}10`; e.currentTarget.style.borderColor = `${color}30`; }}
    >
      <span style={{ color }}>{children}</span>
    </button>
  );
}
