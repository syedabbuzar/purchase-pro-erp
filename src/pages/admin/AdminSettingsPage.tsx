import { useState } from "react";
import { Save, Loader2, Shield, Mail, Lock, Bell, Globe, Database } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Reveal } from "@/components/site/Reveal";
import {
  AdminPageHeader, AdminCard, AdminInput, C, DiamondAccent, GoldLine,
} from "@/components/admin/AdminUI";

export default function AdminSettingsPage() {
  const { session } = useAuth();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: "MellowMoon SoftTech",
    adminEmail: session?.email ?? "syedabbuzar0777@gmail.com",
    notifications: true,
    autoApprove: false,
    maintenanceMode: false,
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      localStorage.setItem("mm_admin_settings", JSON.stringify(settings));
      toast.success("Settings saved successfully!");
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Configuration"
        title="Settings"
        subtitle="Manage admin account and platform settings"
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Account — matches site why-us card pattern */}
        <Reveal delay={1}>
          <AdminCard className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-5 pb-4" style={{ borderBottom: `1px solid ${C.platinum200}` }}>
              <div
                className="h-10 w-10 grid place-items-center"
                style={{ background: `linear-gradient(135deg,${C.navy800},${C.navy950})` }}
              >
                <Shield className="h-5 w-5" style={{ color: C.gold }} />
              </div>
              <div>
                <h2 className="font-display text-lg font-medium" style={{ color: C.ink }}>Admin Account</h2>
                <p className="text-xs" style={{ color: C.muted }}>Manage your admin credentials</p>
              </div>
            </div>
            <div className="space-y-4">
              <AdminInput
                label="Admin Email"
                icon={<Mail className="h-4 w-4" />}
                value={settings.adminEmail}
                onChange={(v) => setSettings({ ...settings, adminEmail: v })}
              />
              <AdminInput
                label="Current Password"
                icon={<Lock className="h-4 w-4" />}
                type="password"
                value="••••••"
                onChange={() => {}}
              />
              <div className="flex items-center gap-2">
                <GoldLine width={24} />
                <p className="text-xs" style={{ color: C.muted }}>
                  Password changes are disabled in frontend-only mode. Connect your backend to enable.
                </p>
              </div>
            </div>
          </AdminCard>
        </Reveal>

        {/* Platform */}
        <Reveal delay={2}>
          <AdminCard className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-5 pb-4" style={{ borderBottom: `1px solid ${C.platinum200}` }}>
              <div
                className="h-10 w-10 grid place-items-center"
                style={{ background: `linear-gradient(135deg,${C.navy800},${C.navy950})` }}
              >
                <Globe className="h-5 w-5" style={{ color: C.gold }} />
              </div>
              <div>
                <h2 className="font-display text-lg font-medium" style={{ color: C.ink }}>Platform Settings</h2>
                <p className="text-xs" style={{ color: C.muted }}>Configure platform behavior</p>
              </div>
            </div>
            <div className="space-y-5">
              <AdminInput
                label="Site Name"
                icon={<Database className="h-4 w-4" />}
                value={settings.siteName}
                onChange={(v) => setSettings({ ...settings, siteName: v })}
              />
              <Toggle
                label="Email Notifications"
                desc="Receive email alerts for new applications"
                icon={<Bell className="h-4 w-4" />}
                checked={settings.notifications}
                onChange={(v) => setSettings({ ...settings, notifications: v })}
              />
              <Toggle
                label="Auto-Approve Payments"
                desc="Automatically approve all payment proofs"
                icon={<Shield className="h-4 w-4" />}
                checked={settings.autoApprove}
                onChange={(v) => setSettings({ ...settings, autoApprove: v })}
              />
              <Toggle
                label="Maintenance Mode"
                desc="Temporarily disable user registrations"
                icon={<Lock className="h-4 w-4" />}
                checked={settings.maintenanceMode}
                onChange={(v) => setSettings({ ...settings, maintenanceMode: v })}
              />
            </div>
          </AdminCard>
        </Reveal>

        <Reveal delay={3}>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 disabled:opacity-50"
              style={{ background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, color: C.navy950 }}
              onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = `linear-gradient(135deg,${C.goldLight},${C.gold})`; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = `linear-gradient(135deg,${C.gold},${C.goldDark})`; }}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Settings
            </button>
            <DiamondAccent size={6} />
          </div>
        </Reveal>
      </form>
    </div>
  );
}

function Toggle({ label, desc, icon, checked, onChange }: { label: string; desc: string; icon: React.ReactNode; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex items-start gap-3">
        <span style={{ color: C.gold }}>{icon}</span>
        <div>
          <p className="text-sm font-medium" style={{ color: C.ink }}>{label}</p>
          <p className="text-xs mt-0.5" style={{ color: C.muted }}>{desc}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="relative h-6 w-11 rounded-full transition-all duration-300 shrink-0"
        style={{ background: checked ? C.gold : C.platinum300 }}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full transition-all duration-300"
          style={{ left: checked ? "1.5rem" : "0.125rem", background: checked ? C.navy950 : "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.15)" }}
        />
      </button>
    </div>
  );
}
