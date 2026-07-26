import { useState, useRef } from "react";
import { Upload, Trash2, ZoomIn, Download, X, QrCode, Check } from "lucide-react";
import { getQrCodes, addQrCode, deleteQrCode, type QrCode as QrType } from "@/lib/adminStore";
import { toast } from "sonner";
import { Reveal } from "@/components/site/Reveal";
import {
  AdminPageHeader, AdminCard, AdminButton, C, DiamondAccent, GoldLine,
} from "@/components/admin/AdminUI";

export default function AdminQrManagementPage() {
  const [qrCodes, setQrCodes] = useState<QrType[]>(getQrCodes());
  const [zoomQr, setZoomQr] = useState<QrType | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentQr = qrCodes.length > 0 ? qrCodes[qrCodes.length - 1] : null;

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB."); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const newQr: QrType = {
        id: `qr-${Date.now()}`,
        url: reader.result as string,
        uploadedAt: new Date().toISOString(),
        label: file.name,
      };
      addQrCode(newQr);
      setQrCodes(getQrCodes());
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("New QR code uploaded! Users will see this immediately.");
    };
    reader.onerror = () => { setUploading(false); toast.error("Failed to upload image."); };
    reader.readAsDataURL(file);
  }

  function handleDelete(id: string) {
    if (qrCodes.length <= 1) { toast.error("Cannot delete the last QR code. Upload a new one first."); return; }
    deleteQrCode(id);
    setQrCodes(getQrCodes());
    toast.success("QR code deleted.");
  }

  function downloadQr(qr: QrType) {
    const a = document.createElement("a");
    a.href = qr.url;
    a.download = `qr-${qr.id}.jpg`;
    a.target = "_blank";
    a.click();
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Configuration"
        title="QR Management"
        subtitle="Upload, preview, and delete payment QR codes. Users always see the latest one."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current QR — matches site training stat card pattern */}
        <Reveal delay={0}>
          <div
            className="card-lift h-full p-7 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg,#0C1E3D 0%,#040D1A 100%)",
              border: "1px solid rgba(201,168,76,0.3)",
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg,${C.gold},${C.goldLight})` }} />
            <div className="flex items-center gap-2 mb-5">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: "rgba(22,163,74,0.15)", color: C.success, border: "1px solid rgba(22,163,74,0.35)" }}
              >
                <Check className="h-3 w-3" /> Active
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(201,168,76,0.7)" }}>Current QR Code</span>
            </div>
            {currentQr ? (
              <div className="flex flex-col items-center gap-4">
                <div
                  className="rounded-lg overflow-hidden"
                  style={{ background: "#fff", border: "2px solid rgba(201,168,76,0.4)", padding: 8 }}
                >
                  <img src={currentQr.url} alt="Current QR" className="h-48 w-48 object-cover rounded" />
                </div>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Uploaded: {new Date(currentQr.uploadedAt).toLocaleString("en-IN")}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setZoomQr(currentQr)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300"
                    style={{ background: "rgba(201,168,76,0.12)", color: C.gold, border: "1px solid rgba(201,168,76,0.3)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201,168,76,0.2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(201,168,76,0.12)")}
                  >
                    <ZoomIn className="h-4 w-4" /> Zoom
                  </button>
                  <button
                    onClick={() => downloadQr(currentQr)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300"
                    style={{ background: "rgba(201,168,76,0.12)", color: C.gold, border: "1px solid rgba(201,168,76,0.3)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201,168,76,0.2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(201,168,76,0.12)")}
                  >
                    <Download className="h-4 w-4" /> Download
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8" style={{ color: "rgba(255,255,255,0.3)" }}>
                <QrCode className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">No QR code uploaded yet.</p>
              </div>
            )}
          </div>
        </Reveal>

        {/* Upload — matches site form pattern */}
        <Reveal delay={1}>
          <AdminCard className="p-7 h-full">
            <div className="flex items-center gap-2 mb-4">
              <DiamondAccent size={6} />
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.goldDark }}>Upload New QR Code</p>
            </div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl p-10 text-center cursor-pointer transition-all duration-300 group"
              style={{ background: C.platinum100, border: `2px dashed ${C.platinum300}` }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.background = C.goldSoft; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.platinum300; e.currentTarget.style.background = C.platinum100; }}
            >
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 rounded-full border-2 animate-spin" style={{ borderColor: C.gold, borderTopColor: "transparent" }} />
                  <p className="text-sm" style={{ color: C.muted }}>Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="h-12 w-12 grid place-items-center transition-transform group-hover:scale-110"
                    style={{ background: `linear-gradient(135deg,${C.navy800},${C.navy950})` }}
                  >
                    <Upload className="h-6 w-6" style={{ color: C.gold }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: C.ink }}>Click to upload new QR</p>
                  <p className="text-xs" style={{ color: C.muted }}>PNG, JPG up to 5MB</p>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <GoldLine width={24} />
              <p className="text-xs" style={{ color: C.muted }}>
                Uploading a new QR will instantly replace the one users see on the registration form.
              </p>
            </div>
          </AdminCard>
        </Reveal>
      </div>

      {/* QR History */}
      <Reveal delay={2}>
        <div className="mb-5">
          <div className="section-label" style={{ color: C.goldDark }}>History</div>
          <h2 className="mt-3 font-display text-2xl font-medium" style={{ color: C.ink }}>QR Code History</h2>
        </div>
      </Reveal>

      <Reveal delay={3}>
        <AdminCard className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {qrCodes.slice().reverse().map((qr, idx) => (
              <div
                key={qr.id}
                className="card-lift overflow-hidden group"
                style={{ background: C.platinum100, border: `1px solid ${C.platinum200}` }}
              >
                <div className="relative" style={{ background: "#fff" }}>
                  <img src={qr.url} alt={qr.label} className="w-full h-32 object-cover" />
                  {idx === 0 && (
                    <span
                      className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: "rgba(22,163,74,0.9)", color: "#fff" }}
                    >
                      Active
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium truncate" style={{ color: C.ink }}>{qr.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: C.muted }}>{new Date(qr.uploadedAt).toLocaleDateString("en-IN")}</p>
                  <div className="flex gap-1.5 mt-2">
                    <button
                      onClick={() => setZoomQr(qr)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs transition-all"
                      style={{ background: "rgba(201,168,76,0.1)", color: C.goldDark }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201,168,76,0.2)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(201,168,76,0.1)")}
                    >
                      <ZoomIn className="h-3 w-3" /> View
                    </button>
                    <button
                      onClick={() => handleDelete(qr.id)}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 rounded text-xs transition-all"
                      style={{ background: "rgba(220,38,38,0.08)", color: C.error }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(220,38,38,0.15)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(220,38,38,0.08)")}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      </Reveal>

      {/* Zoom modal */}
      {zoomQr && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(4,13,26,0.9)", backdropFilter: "blur(8px)" }}
          onClick={() => setZoomQr(null)}
        >
          <div
            className="relative rounded-2xl p-6 max-w-sm w-full"
            style={{ background: "#fff", border: `1px solid ${C.platinum200}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-0.5 -mx-6 -mt-6 mb-4" style={{ background: `linear-gradient(90deg,transparent,${C.gold} 25%,${C.goldLight} 50%,${C.gold} 75%,transparent)` }} />
            <button onClick={() => setZoomQr(null)} className="absolute top-3 right-3 p-1.5 rounded-full" style={{ background: C.platinum100 }}>
              <X className="h-4 w-4" style={{ color: C.muted }} />
            </button>
            <img src={zoomQr.url} alt="QR Code" className="w-full rounded-lg" />
            <p className="text-center mt-3 font-display text-lg font-medium" style={{ color: C.ink }}>{zoomQr.label}</p>
            <button
              onClick={() => downloadQr(zoomQr)}
              className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-300"
              style={{ background: `linear-gradient(135deg,${C.gold},${C.goldDark})`, color: C.navy950 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = `linear-gradient(135deg,${C.goldLight},${C.gold})`)}
              onMouseLeave={(e) => (e.currentTarget.style.background = `linear-gradient(135deg,${C.gold},${C.goldDark})`)}
            >
              <Download className="h-4 w-4" /> Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
