import { useState, useMemo } from "react";
import { Search, Download, Users as UsersIcon } from "lucide-react";
import { getUsers, getApplications, type UserRecord } from "@/lib/adminStore";
import { toast } from "sonner";
import { Reveal } from "@/components/site/Reveal";
import {
  AdminPageHeader, AdminCard, AdminBadge, AdminButton, AdminInput,
  C, DiamondAccent,
} from "@/components/admin/AdminUI";

export default function AdminUsersPage() {
  const [users] = useState<UserRecord[]>(getUsers());
  const [search, setSearch] = useState("");

  const enriched = useMemo(() => {
    const apps = getApplications();
    return users.map((u) => ({
      ...u,
      appsCount: apps.filter((a) => a.userId === u.email).length,
    }));
  }, [users]);

  const filtered = enriched.filter(
    (u) =>
      !search ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase())
  );

  function exportCSV() {
    const headers = ["User ID", "Email", "Registration Date", "Applications Submitted", "Last Login", "Status"];
    const rows = filtered.map((u) => [
      u.id, u.email, new Date(u.registrationDate).toLocaleDateString("en-IN"),
      String(u.appsCount), new Date(u.lastLogin).toLocaleString("en-IN"), u.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Users CSV exported!");
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Management"
        title="Users"
        subtitle={`${filtered.length} registered user${filtered.length !== 1 ? "s" : ""}`}
        actions={
          <AdminButton variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4" /> Export CSV
          </AdminButton>
        }
      />

      {/* Search */}
      <Reveal delay={1}>
        <AdminCard className="p-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: C.platinum400 }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or user ID..."
              className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none transition-all duration-300"
              style={{ background: C.platinum100, border: `1.5px solid ${C.platinum200}`, color: C.ink }}
              onFocus={(e) => (e.currentTarget.style.borderColor = C.gold)}
              onBlur={(e) => (e.currentTarget.style.borderColor = C.platinum200)}
            />
          </div>
        </AdminCard>
      </Reveal>

      {/* Table */}
      <Reveal delay={2}>
        <AdminCard>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.platinum200}` }}>
                  <Th>User ID</Th><Th>Email</Th><Th>Registration Date</Th><Th>Applications</Th><Th>Last Login</Th><Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16" style={{ color: C.platinum400 }}>
                      <UsersIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr
                      key={u.id}
                      style={{ borderBottom: `1px solid ${C.platinum100}` }}
                      className="transition-colors hover:bg-[#F9F3E3]/30"
                    >
                      <Td><span className="font-mono text-xs" style={{ color: C.goldDark }}>{u.id}</span></Td>
                      <Td><span className="font-medium">{u.email}</span></Td>
                      <Td>{new Date(u.registrationDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</Td>
                      <Td>
                        <span
                          className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full text-xs font-bold"
                          style={{ background: "rgba(201,168,76,0.12)", color: C.goldDark, border: "1px solid rgba(201,168,76,0.2)" }}
                        >
                          {u.appsCount}
                        </span>
                      </Td>
                      <Td>{new Date(u.lastLogin).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</Td>
                      <Td><AdminBadge status={u.status} /></Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </AdminCard>
      </Reveal>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: C.muted, background: C.platinum100 }}>{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: C.ink, borderBottom: `1px solid ${C.platinum100}` }}>{children}</td>;
}
