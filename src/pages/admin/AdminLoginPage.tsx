import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail, Lock, Eye, EyeOff, Loader2, Shield, ChevronLeft, AlertCircle, Sparkles,
} from "lucide-react";
import { adminLogin } from "@/lib/api";
import { saveAuth } from "@/lib/authStore";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/site/Logo";
import { C, DiamondAccent, GoldLine } from "@/components/admin/AdminUI";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data } = await adminLogin({
        email: email.trim().toLowerCase(),
        password,
      });
      const s = saveAuth(data.token, { ...data.admin, role: "admin" });
      setSession(s);
      toast.success("Welcome back, Admin!");
      navigate("/admin/dashboard", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "linear-gradient(135deg,#040D1A 0%,#071326 60%,#0a1a33 100%)" }}
    >
      {/* Radial gold gradient overlay (matches site PageHero) */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 20% 30%, #C9A84C 0%, transparent 45%)" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 80% 70%, #4A90D9 0%, transparent 40%)" }}
        aria-hidden="true"
      />

      {/* Header */}
      <header
        className="py-5 px-6 flex items-center justify-between border-b relative z-10"
        style={{ borderColor: "rgba(201,168,76,0.15)" }}
      >
        <Link to="/" aria-label="MellowMoon home">
          <Logo variant="light" />
        </Link>
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: "rgba(255,255,255,0.55)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#C9A84C")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
        >
          <ChevronLeft className="h-4 w-4" /> Back to Site
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md" style={{ animation: "fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both" }}>
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
              style={{
                background: "rgba(201,168,76,0.12)",
                color: "#C9A84C",
                border: "1px solid rgba(201,168,76,0.3)",
              }}
            >
              <Shield className="h-3.5 w-3.5" /> Admin Portal
            </span>
          </div>

          {/* Card with glassmorphism (matches site dark section pattern) */}
          <div
            className="relative overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(201,168,76,0.2)",
              boxShadow: "0 24px 64px -16px rgba(0,0,0,0.5)",
              backdropFilter: "blur(16px)",
            }}
          >
            {/* Gold top border accent */}
            <div
              className="h-0.5 w-full"
              style={{ background: "linear-gradient(90deg,transparent,#C9A84C 25%,#E2C878 50%,#C9A84C 75%,transparent)" }}
            />

            <div className="px-8 pt-8 pb-6 text-center" style={{ borderBottom: "1px solid rgba(201,168,76,0.12)" }}>
              <div className="flex justify-center mb-3">
                <div className="flex items-center gap-2">
                  <DiamondAccent size={6} />
                  <GoldLine width={24} />
                  <DiamondAccent size={6} />
                </div>
              </div>
              <h1
                className="text-3xl font-bold mb-2"
                style={{ color: "#fff", fontFamily: "Cormorant Garamond, serif" }}
              >
                Admin Login
              </h1>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                Sign in to manage internship applications
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5" noValidate>
              {error && (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#ef4444",
                    animation: "scaleIn 0.3s ease both",
                  }}
                >
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.75)" }}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "rgba(201,168,76,0.7)" }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
                    placeholder="admin@mellowmoon.com"
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none transition-all duration-300"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(201,168,76,0.25)", color: "#fff" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#C9A84C")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.25)")}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.75)" }}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "rgba(201,168,76,0.7)" }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-10 pr-10 py-3 rounded-lg text-sm outline-none transition-all duration-300"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(201,168,76,0.25)", color: "#fff" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#C9A84C")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.25)")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg text-sm font-semibold transition-all duration-300 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#C9A84C,#A07C30)", color: "#040D1A" }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "linear-gradient(135deg,#E2C878,#C9A84C)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "linear-gradient(135deg,#C9A84C,#A07C30)"; }}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Shield className="h-4 w-4" /> Sign In to Admin</>}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            Authorized personnel only. All actions are logged.
          </p>
        </div>
      </main>
    </div>
  );
}
