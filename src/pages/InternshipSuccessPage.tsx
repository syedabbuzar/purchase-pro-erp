import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, Clock, Mail, Home, MessageCircle, MapPin, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/site/Logo";
import { getSuccessContent, initStore, type SuccessContent } from "@/lib/adminStore";

interface Registration {
  name: string;
  email: string;
  mobile: string;
  college: string;
  education: string;
  duration: string;
  course: string;
  registrationFee: number;
  applicationStatus: string;
  createdAt: string;
}

export default function InternshipSuccessPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [reg, setReg] = useState<Registration | null>(null);
  const [content, setContent] = useState<SuccessContent | null>(null);

  useEffect(() => {
    initStore();
    setContent(getSuccessContent());
    if (!session) {
      navigate("/internship/login");
      return;
    }
    try {
      const apps = JSON.parse(localStorage.getItem("mm_internship_apps") || "[]");
      const userApps = apps.filter((a: Registration) => a.email === session.email);
      if (userApps.length > 0) {
        setReg(userApps[userApps.length - 1]);
      }
    } catch {
      // ignore parse errors
    }
  }, [session, navigate]);

  const durationLabel = reg?.duration === "2_months" ? "2 Months (8 Weeks)" : "6 Months (24 Weeks)";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(135deg,#040D1A 0%,#071326 60%,#0a1a33 100%)" }}
    >
      <header
        className="py-5 px-6 flex items-center justify-between border-b"
        style={{ borderColor: "rgba(201,168,76,0.15)" }}
      >
        <Link to="/" aria-label="MellowMoon home">
          <Logo variant="light" />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg text-center">
          {/* Success icon with pulse */}
          <div className="flex justify-center mb-7">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full animate-ping"
                style={{ background: "rgba(201,168,76,0.2)", animationDuration: "2s" }}
              />
              <div
                className="relative h-20 w-20 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg,rgba(201,168,76,0.25),rgba(201,168,76,0.1))",
                  border: "2px solid rgba(201,168,76,0.5)",
                }}
              >
                <CheckCircle className="h-10 w-10" style={{ color: "#C9A84C" }} />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2" style={{ color: "#fff", fontFamily: "Cormorant Garamond, serif" }}>
            {content?.title ?? "Registration Submitted!"}
          </h1>
          <p className="text-base mb-7" style={{ color: "rgba(255,255,255,0.55)" }}>
            {content?.description ?? "Your internship application has been received."}
          </p>

          {reg && (
            <div
              className="rounded-2xl text-left mb-7 overflow-hidden"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,168,76,0.2)" }}
            >
              <div
                className="px-6 py-4"
                style={{ borderBottom: "1px solid rgba(201,168,76,0.12)", background: "rgba(201,168,76,0.06)" }}
              >
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#C9A84C" }}>
                  Application Summary
                </p>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: "Name", value: reg.name },
                  { label: "Email", value: reg.email },
                  { label: "Mobile", value: reg.mobile },
                  { label: "College", value: reg.college },
                  { label: "Education", value: reg.education },
                  { label: "Duration", value: durationLabel },
                  { label: "Course", value: reg.course },
                  { label: "Registration Fee", value: `₹${reg.registrationFee.toLocaleString("en-IN")}` },
                  { label: "Status", value: <StatusBadge status={reg.applicationStatus} /> },
                  {
                    label: "Applied On",
                    value: new Date(reg.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }),
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-4">
                    <span
                      className="text-sm shrink-0"
                      style={{ color: "rgba(255,255,255,0.45)", minWidth: 110 }}
                    >
                      {label}
                    </span>
                    <span className="text-sm font-medium text-right" style={{ color: "#fff" }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin-editable contact info */}
          {content && (
            <div
              className="rounded-xl p-5 mb-7 text-left space-y-3"
              style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)" }}
            >
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#C9A84C" }}>
                Next Steps & Contact
              </p>
              {content.whatsappNumber && (
                <div className="flex items-center gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                  <MessageCircle className="h-4 w-4 shrink-0" style={{ color: "#22c55e" }} />
                  <span>{content.whatsappNumber}</span>
                </div>
              )}
              {content.whatsappGroupLink && (
                <a
                  href={content.whatsappGroupLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm transition-colors"
                  style={{ color: "#22c55e" }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  <span>Join WhatsApp Group</span>
                </a>
              )}
              {content.address && (
                <div className="flex items-start gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "#C9A84C" }} />
                  <span>{content.address}</span>
                </div>
              )}
              {content.additionalNotes && (
                <div
                  className="rounded-lg p-3 text-xs leading-relaxed"
                  style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.55)" }}
                >
                  {content.additionalNotes}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{ background: "linear-gradient(135deg,#C9A84C,#A07C30)", color: "#040D1A" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "linear-gradient(135deg,#E2C878,#C9A84C)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "linear-gradient(135deg,#C9A84C,#A07C30)")}
            >
              <Home className="h-4 w-4" /> Back to Home
            </Link>
            <a
              href="mailto:mellowmoonsofttech@gmail.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{ border: "1px solid rgba(201,168,76,0.35)", color: "#C9A84C" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201,168,76,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Mail className="h-4 w-4" /> Contact Support
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
      style={{
        background: status === "pending" ? "rgba(234,179,8,0.15)" : "rgba(34,197,94,0.15)",
        color: status === "pending" ? "#eab308" : "#22c55e",
        border: `1px solid ${status === "pending" ? "rgba(234,179,8,0.35)" : "rgba(34,197,94,0.35)"}`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: status === "pending" ? "#eab308" : "#22c55e" }}
      />
      {status}
    </span>
  );
}
