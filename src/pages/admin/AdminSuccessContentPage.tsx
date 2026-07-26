import { useState } from "react";
import { Save, Loader2, Eye, X, CheckCircle } from "lucide-react";
import { getSuccessContent, saveSuccessContent, type SuccessContent } from "@/lib/adminStore";
import { toast } from "sonner";
import { Reveal } from "@/components/site/Reveal";
import {
  AdminPageHeader, AdminCard, AdminButton, AdminInput, AdminTextarea,
  C, DiamondAccent, GoldLine,
} from "@/components/admin/AdminUI";

export default function AdminSuccessContentPage() {
  const [content, setContent] = useState<SuccessContent>(getSuccessContent());
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      saveSuccessContent(content);
      toast.success("Success page content saved! Changes are live for users.");
    } catch {
      toast.error("Failed to save content.");
    } finally {
      setSaving(false);
    }
  }

  function update(field: keyof SuccessContent, value: string) {
    setContent({ ...content, [field]: value });
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Content"
        title="Success Page Content"
        subtitle="Edit what users see after submitting their internship registration."
        actions={
          <AdminButton variant="outline" size="sm" onClick={() => setPreview(true)}>
            <Eye className="h-4 w-4" /> Preview
          </AdminButton>
        }
      />

      <form onSubmit={handleSave} className="space-y-6">
        <Reveal delay={1}>
          <AdminCard className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <DiamondAccent size={6} />
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.goldDark }}>
                Editable Content Fields
              </p>
            </div>
            <AdminInput
              label="Title"
              value={content.title}
              onChange={(v) => update("title", v)}
              placeholder="Registration Submitted!"
            />
            <AdminTextarea
              label="Description"
              value={content.description}
              onChange={(v) => update("description", v)}
              placeholder="Your application has been received..."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <AdminInput
                label="WhatsApp Number"
                value={content.whatsappNumber}
                onChange={(v) => update("whatsappNumber", v)}
                placeholder="+91 98765 43210"
              />
              <AdminInput
                label="WhatsApp Group Link"
                value={content.whatsappGroupLink}
                onChange={(v) => update("whatsappGroupLink", v)}
                placeholder="https://chat.whatsapp.com/..."
              />
            </div>
            <AdminTextarea
              label="Address"
              value={content.address}
              onChange={(v) => update("address", v)}
              placeholder="Company address..."
            />
            <AdminTextarea
              label="Additional Notes"
              value={content.additionalNotes}
              onChange={(v) => update("additionalNotes", v)}
              placeholder="Any extra instructions for the user..."
            />
          </AdminCard>
        </Reveal>

        <Reveal delay={2}>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 disabled:opacity-50"
              style={{ background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, color: C.navy950 }}
              onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = `linear-gradient(135deg,${C.goldLight},${C.gold})`; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = `linear-gradient(135deg,${C.gold},${C.goldDark})`; }}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes
            </button>
            <GoldLine width={40} />
            <p className="text-xs" style={{ color: C.muted }}>
              Changes appear instantly on the user success page.
            </p>
          </div>
        </Reveal>
      </form>

      {/* Preview modal — matches site dark section pattern */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(4,13,26,0.8)", backdropFilter: "blur(8px)" }}
          onClick={() => setPreview(false)}
        >
          <div
            className="relative rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            style={{
              background: "linear-gradient(135deg,#040D1A 0%,#071326 60%,#0a1a33 100%)",
              border: "1px solid rgba(201,168,76,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-0.5" style={{ background: `linear-gradient(90deg,transparent,${C.gold} 25%,${C.goldLight} 50%,${C.gold} 75%,transparent)` }} />
            <button onClick={() => setPreview(false)} className="absolute top-3 right-3 p-1.5 rounded-full z-10" style={{ background: "rgba(255,255,255,0.06)" }}>
              <X className="h-4 w-4" style={{ color: "rgba(255,255,255,0.6)" }} />
            </button>
            <div className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div
                  className="relative h-16 w-16 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg,rgba(201,168,76,0.25),rgba(201,168,76,0.1))",
                    border: "2px solid rgba(201,168,76,0.5)",
                  }}
                >
                  <CheckCircle className="h-8 w-8" style={{ color: C.gold }} />
                </div>
              </div>
              <h1 className="font-display text-2xl font-bold mb-2" style={{ color: "#fff" }}>{content.title}</h1>
              <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.55)" }}>{content.description}</p>
              <div
                className="rounded-xl p-5 text-left space-y-3"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,168,76,0.15)" }}
              >
                <InfoRow label="WhatsApp" value={content.whatsappNumber} />
                <InfoRow label="Group Link" value={content.whatsappGroupLink} />
                <InfoRow label="Address" value={content.address} />
                <InfoRow label="Notes" value={content.additionalNotes} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.gold }}>{label}</p>
      <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>{value || "—"}</p>
    </div>
  );
}
