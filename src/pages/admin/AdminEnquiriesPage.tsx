import { useState, useMemo } from "react";
import {
  Search, Eye, X, Filter, ChevronLeft, ChevronRight,
  Mail, MailOpen, MessageSquareReply, Archive, Trash2, Download,
  FileSpreadsheet,
} from "lucide-react";
import {
  getEnquiries, updateEnquiryStatus, deleteEnquiry,
  type ContactEnquiry,
} from "@/lib/adminStore";
import { toast } from "sonner";
import { Reveal } from "@/components/site/Reveal";
import {
  AdminPageHeader, AdminCard, AdminButton,
  AdminSelect, C, DiamondAccent,
} from "@/components/admin/AdminUI";

const PAGE_SIZE = 5;

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
  { value: "closed", label: "Closed" },
];

const SERVICE_OPTIONS = [
  { value: "all", label: "All Services" },
  { value: "Web application", label: "Web Application" },
  { value: "Business website", label: "Business Website" },
  { value: "Mobile app", label: "Mobile App" },
  { value: "CRM / Inventory", label: "CRM / Inventory" },
  { value: "Agentic AI", label: "Agentic AI" },
  { value: "Partnership", label: "Partnership" },
  { value: "New project", label: "New Project" },
];

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>(getEnquiries());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [viewEnq, setViewEnq] = useState<ContactEnquiry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return enquiries.filter((e) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.phone.includes(search) ||
        e.company.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || e.status === statusFilter;
      const matchService = serviceFilter === "all" || e.service === serviceFilter;
      return matchSearch && matchStatus && matchService;
    });
  }, [enquiries, search, statusFilter, serviceFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const currentPage = Math.min(page, totalPages);
  const pageData = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleStatusChange(id: string, status: ContactEnquiry["status"]) {
    const updated = updateEnquiryStatus(id, status);
    setEnquiries(updated);
    setViewEnq((prev) => (prev ? { ...prev, status } : null));
    toast.success(`Enquiry ${id} marked as ${status}.`);
  }

  function handleDelete(id: string) {
    const updated = deleteEnquiry(id);
    setEnquiries(updated);
    setDeleteId(null);
    toast.success(`Enquiry ${id} deleted.`);
  }

  function exportCSV() {
    const headers = ["Enquiry ID", "Name", "Company", "Email", "Phone", "Service", "Message", "Submitted Date", "Status"];
    const rows = filtered.map((e) => [
      e.id, e.name, e.company, e.email, e.phone, e.service,
      e.message.replace(/"/g, '""'),
      new Date(e.createdAt).toLocaleString("en-IN"), e.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    downloadFile(csv, "contact-enquiries.csv", "text/csv");
    toast.success("CSV exported successfully!");
  }

  function exportExcel() {
    const headers = ["Enquiry ID", "Name", "Company", "Email", "Phone", "Service", "Message", "Submitted Date", "Status"];
    const rows = filtered.map((e) => [
      e.id, e.name, e.company, e.email, e.phone, e.service,
      e.message, new Date(e.createdAt).toLocaleString("en-IN"), e.status,
    ]);
    const html = `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    downloadFile(html, "contact-enquiries.xls", "application/vnd.ms-excel");
    toast.success("Excel exported successfully!");
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Management"
        title="Contact Enquiries"
        subtitle={`${filtered.length} enquiry${filtered.length !== 1 ? "ies" : ""} found`}
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

      {/* Filters */}
      <Reveal delay={1}>
        <AdminCard className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: C.platinum400 }} />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name, email, phone, company, or ID..."
                className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none transition-all duration-300"
                style={{ background: C.platinum100, border: `1.5px solid ${C.platinum200}`, color: C.ink }}
                onFocus={(e) => (e.currentTarget.style.borderColor = C.gold)}
                onBlur={(e) => (e.currentTarget.style.borderColor = C.platinum200)}
              />
            </div>
            <AdminSelect
              value={statusFilter}
              onChange={(v) => { setStatusFilter(v); setPage(1); }}
              options={STATUS_OPTIONS}
            />
            <AdminSelect
              value={serviceFilter}
              onChange={(v) => { setServiceFilter(v); setPage(1); }}
              options={SERVICE_OPTIONS}
            />
          </div>
        </AdminCard>
      </Reveal>

      {/* Table */}
      <Reveal delay={2}>
        <AdminCard>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1100px]">
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.platinum200}` }}>
                  <Th>Full Name</Th><Th>Company</Th><Th>Email</Th><Th>Phone</Th>
                  <Th>Service</Th><Th>Message</Th><Th>Submitted</Th><Th>Status</Th><Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {pageData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16" style={{ color: C.platinum400 }}>
                      <Filter className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      No enquiries found.
                    </td>
                  </tr>
                ) : (
                  pageData.map((enq) => (
                    <tr
                      key={enq.id}
                      style={{ borderBottom: `1px solid ${C.platinum100}` }}
                      className="transition-colors hover:bg-[#F9F3E3]/30"
                    >
                      <Td><span className="font-medium">{enq.name}</span></Td>
                      <Td>{enq.company || <span style={{ color: C.platinum400 }}>—</span>}</Td>
                      <Td><span className="text-xs">{enq.email}</span></Td>
                      <Td><span className="text-xs">{enq.phone}</span></Td>
                      <Td><span className="text-xs">{enq.service}</span></Td>
                      <Td>
                        <span className="text-xs block max-w-[200px] truncate" title={enq.message}>
                          {enq.message}
                        </span>
                      </Td>
                      <Td><span className="text-xs">{new Date(enq.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span></Td>
                      <Td><EnquiryBadge status={enq.status} /></Td>
                      <Td>
                        <div className="flex items-center gap-1.5">
                          <ActionBtn onClick={() => setViewEnq(enq)} title="View" color={C.gold}><Eye className="h-3.5 w-3.5" /></ActionBtn>
                          <ActionBtn onClick={() => handleStatusChange(enq.id, "read")} title="Mark as Read" color={C.navy700}><MailOpen className="h-3.5 w-3.5" /></ActionBtn>
                          <ActionBtn onClick={() => handleStatusChange(enq.id, "replied")} title="Mark as Replied" color={C.success}><MessageSquareReply className="h-3.5 w-3.5" /></ActionBtn>
                          <ActionBtn onClick={() => handleStatusChange(enq.id, "closed")} title="Close" color={C.platinum400}><Archive className="h-3.5 w-3.5" /></ActionBtn>
                          <ActionBtn onClick={() => setDeleteId(enq.id)} title="Delete" color={C.error}><Trash2 className="h-3.5 w-3.5" /></ActionBtn>
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

      {/* View Modal */}
      {viewEnq && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(4,13,26,0.8)", backdropFilter: "blur(8px)" }}
          onClick={() => setViewEnq(null)}
        >
          <div
            className="relative rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            style={{ background: "#fff", border: `1px solid ${C.platinum200}`, boxShadow: "0 24px 64px -16px rgba(0,0,0,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-0.5" style={{ background: `linear-gradient(90deg,transparent,${C.gold} 25%,${C.goldLight} 50%,${C.gold} 75%,transparent)` }} />
            <div className="px-6 py-4 flex items-center justify-between sticky top-0" style={{ background: "#fff", borderBottom: `1px solid ${C.platinum200}` }}>
              <div className="flex items-center gap-2">
                <DiamondAccent size={6} />
                <h3 className="font-display text-lg font-medium" style={{ color: C.ink }}>Enquiry Details</h3>
              </div>
              <button onClick={() => setViewEnq(null)} className="p-1.5 rounded-full transition-colors" style={{ background: C.platinum100 }}>
                <X className="h-4 w-4" style={{ color: C.muted }} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Detail label="Enquiry ID" value={<span className="font-mono text-xs" style={{ color: C.goldDark }}>{viewEnq.id}</span>} />
                <Detail label="Status" value={<EnquiryBadge status={viewEnq.status} />} />
                <Detail label="Full Name" value={viewEnq.name} />
                <Detail label="Company" value={viewEnq.company || "—"} />
                <Detail label="Email" value={viewEnq.email} />
                <Detail label="Phone" value={viewEnq.phone} />
                <Detail label="Service" value={viewEnq.service} />
                <Detail label="Submitted" value={new Date(viewEnq.createdAt).toLocaleString("en-IN")} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: C.goldDark }}>Message</p>
                <div
                  className="p-4 rounded-lg text-sm leading-relaxed"
                  style={{ background: C.platinum100, border: `1px solid ${C.platinum200}`, color: C.ink }}
                >
                  {viewEnq.message}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <AdminButton variant="outline" size="sm" onClick={() => handleStatusChange(viewEnq.id, "read")}>
                  <MailOpen className="h-4 w-4" /> Read
                </AdminButton>
                <AdminButton variant="success" size="sm" onClick={() => handleStatusChange(viewEnq.id, "replied")}>
                  <MessageSquareReply className="h-4 w-4" /> Replied
                </AdminButton>
                <AdminButton variant="outline" size="sm" onClick={() => handleStatusChange(viewEnq.id, "closed")}>
                  <Archive className="h-4 w-4" /> Close
                </AdminButton>
                <AdminButton variant="danger" size="sm" onClick={() => { setDeleteId(viewEnq.id); setViewEnq(null); }}>
                  <Trash2 className="h-4 w-4" /> Delete
                </AdminButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(4,13,26,0.8)", backdropFilter: "blur(8px)" }}
          onClick={() => setDeleteId(null)}
        >
          <div
            className="relative rounded-2xl max-w-sm w-full"
            style={{ background: "#fff", border: `1px solid ${C.platinum200}`, boxShadow: "0 24px 64px -16px rgba(0,0,0,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-0.5" style={{ background: `linear-gradient(90deg,transparent,${C.error} 25%,${C.error} 75%,transparent)` }} />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 grid place-items-center rounded-full" style={{ background: "rgba(220,38,38,0.1)" }}>
                  <Trash2 className="h-5 w-5" style={{ color: C.error }} />
                </div>
                <div>
                  <h3 className="font-display text-lg font-medium" style={{ color: C.ink }}>Delete Enquiry?</h3>
                  <p className="text-xs mt-0.5" style={{ color: C.muted }}>This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <AdminButton variant="outline" size="sm" onClick={() => setDeleteId(null)} className="flex-1 justify-center">
                  Cancel
                </AdminButton>
                <AdminButton variant="danger" size="sm" onClick={() => handleDelete(deleteId)} className="flex-1 justify-center">
                  <Trash2 className="h-4 w-4" /> Delete
                </AdminButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Enquiry-specific status badge ──
function EnquiryBadge({ status }: { status: ContactEnquiry["status"] }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    new: { bg: "rgba(201,168,76,0.1)", text: C.goldDark, border: "rgba(201,168,76,0.3)" },
    read: { bg: "rgba(18,39,84,0.1)", text: C.navy700, border: "rgba(18,39,84,0.3)" },
    replied: { bg: "rgba(22,163,74,0.1)", text: C.success, border: "rgba(22,163,74,0.3)" },
    closed: { bg: "rgba(159,167,181,0.1)", text: C.platinum400, border: "rgba(159,167,181,0.3)" },
  };
  const c = colors[status] || colors.new;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.text }} />
      {status}
    </span>
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
