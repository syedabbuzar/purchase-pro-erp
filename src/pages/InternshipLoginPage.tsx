import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail, Lock, User, ArrowRight, Shield, Loader2, ChevronLeft,
  RefreshCw, Eye, EyeOff, AlertCircle, CheckCircle2, Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { saveAuth } from "@/lib/authStore";
import {
  authCheckEmail, authRegister, authVerifyOtp,
  authResendOtp, authLogin,
} from "@/lib/api";
import { Logo } from "@/components/site/Logo";
import { toast } from "sonner";

type Mode = "login" | "register";
type RegStep = "details" | "otp";

export default function InternshipLoginPage() {
  const navigate = useNavigate();
  const { session, setSession } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [regStep, setRegStep] = useState<RegStep>("details");

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // Shared state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (session) {
      if (session.role === "admin") navigate("/admin/dashboard", { replace: true });
      else navigate("/internship/register", { replace: true });
    }
  }, [session, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  function switchMode(m: Mode) {
    setMode(m);
    setRegStep("details");
    setError("");
    setOtp(["", "", "", "", "", ""]);
  }

  // ── Login ──
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data } = await authLogin({
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
      });
      const s = saveAuth(data.token, data.user);
      setSession(s);
      if (s.role === "admin") {
        toast.success("Welcome back, Admin!");
        navigate("/admin/dashboard", { replace: true });
      } else {
        toast.success("Login successful!", { description: "Redirecting to internship form..." });
        navigate("/internship/register", { replace: true });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Register: Step 1 — details ──
  async function handleRegisterDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!regName.trim()) { setError("Please enter your name."); return; }
    if (!regEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      setError("Please enter a valid email address."); return;
    }
    if (regPassword.length < 6) { setError("Password must be at least 6 characters."); return; }

    setError("");
    setLoading(true);
    try {
      // Optional pre-check (backend also validates in /register)
      try { await authCheckEmail(regEmail.trim().toLowerCase()); } catch (err: any) {
        setError(err?.response?.data?.message || "This email is already registered.");
        setLoading(false);
        return;
      }
      await authRegister({
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
      });
      toast.success("OTP sent to your email!", { duration: 6000 });
      setRegStep("otp");
      setResendCooldown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Register: Step 2 — OTP ──
  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    setError("");
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  }
  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  }
  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const updated = [...otp];
    pasted.split("").forEach((ch, i) => { updated[i] = ch; });
    setOtp(updated);
    const nextEmpty = updated.findIndex((v) => !v);
    otpRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) { setError("Please enter the full 6-digit OTP."); return; }
    setError("");
    setLoading(true);
    try {
      const { data } = await authVerifyOtp({
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
        otp: code,
      });
      const s = saveAuth(data.token, data.user);
      setSession(s);
      toast.success("Account created! Welcome to MellowMoon.", {
        description: "Redirecting to internship registration form...",
      });
      navigate("/internship/register", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setLoading(true);
    try {
      await authResendOtp(regEmail.trim().toLowerCase());
      setOtp(["", "", "", "", "", ""]);
      setResendCooldown(60);
      toast.success("New OTP sent to your email!");
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to resend OTP.");
    } finally { setLoading(false); }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(135deg,#040D1A 0%,#071326 60%,#0a1a33 100%)" }}
    >
      {/* Header */}
      <header
        className="py-5 px-6 flex items-center justify-between border-b"
        style={{ borderColor: "rgba(201,168,76,0.15)" }}
      >
        <Link to="/" aria-label="MellowMoon home" className="flex items-center gap-2">
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
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-12">
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
              <Sparkles className="h-3.5 w-3.5" /> Internship Portal
            </span>
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(201,168,76,0.2)",
              boxShadow: "0 24px 64px -16px rgba(0,0,0,0.5)",
              backdropFilter: "blur(16px)",
            }}
          >
            {/* Tab switcher — only show on details step */}
            {regStep === "details" && (
              <div className="flex p-1.5 m-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                <TabButton active={mode === "login"} onClick={() => switchMode("login")}>
                  Login
                </TabButton>
                <TabButton active={mode === "register"} onClick={() => switchMode("register")}>
                  Register
                </TabButton>
              </div>
            )}

            <div className="px-6 sm:px-8 pb-8">
              {/* ── LOGIN ── */}
              {mode === "login" && (
                <div style={{ animation: "fadeIn 0.4s ease both" }}>
                  <div className="text-center mb-6 pt-2">
                    <h1 className="text-2xl font-bold mb-1.5" style={{ color: "#fff", fontFamily: "Cormorant Garamond, serif" }}>
                      Welcome Back
                    </h1>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                      Sign in to access your internship application
                    </p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4" noValidate>
                    {error && <ErrorBanner message={error} />}

                    <InputField
                      icon={<Mail className="h-4 w-4" />}
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(v) => { setLoginEmail(v); if (error) setError(""); }}
                      autoFocus
                    />
                    <PasswordField
                      placeholder="Password"
                      value={loginPassword}
                      onChange={(v) => { setLoginPassword(v); if (error) setError(""); }}
                      show={showLoginPassword}
                      toggle={() => setShowLoginPassword(!showLoginPassword)}
                    />

                    <SubmitButton loading={loading} disabled={!loginEmail.trim() || !loginPassword.trim()}>
                      Sign In <ArrowRight className="h-4 w-4" />
                    </SubmitButton>
                  </form>

                  <p className="mt-5 text-center text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("register")}
                      className="font-semibold transition-colors"
                      style={{ color: "#C9A84C" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#E2C878")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#C9A84C")}
                    >
                      Register here
                    </button>
                  </p>
                </div>
              )}

              {/* ── REGISTER: Details ── */}
              {mode === "register" && regStep === "details" && (
                <div style={{ animation: "fadeIn 0.4s ease both" }}>
                  <div className="text-center mb-6 pt-2">
                    <h1 className="text-2xl font-bold mb-1.5" style={{ color: "#fff", fontFamily: "Cormorant Garamond, serif" }}>
                      Create Your Account
                    </h1>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                      Register with your email — we'll verify via OTP
                    </p>
                  </div>

                  <form onSubmit={handleRegisterDetails} className="space-y-4" noValidate>
                    {error && <ErrorBanner message={error} />}

                    <InputField
                      icon={<User className="h-4 w-4" />}
                      placeholder="Full name"
                      value={regName}
                      onChange={(v) => { setRegName(v); if (error) setError(""); }}
                    />
                    <InputField
                      icon={<Mail className="h-4 w-4" />}
                      type="email"
                      placeholder="you@example.com"
                      value={regEmail}
                      onChange={(v) => { setRegEmail(v); if (error) setError(""); }}
                    />
                    <PasswordField
                      placeholder="Create a password (min 6 chars)"
                      value={regPassword}
                      onChange={(v) => { setRegPassword(v); if (error) setError(""); }}
                      show={showRegPassword}
                      toggle={() => setShowRegPassword(!showRegPassword)}
                    />

                    <SubmitButton loading={loading} disabled={!regName.trim() || !regEmail.trim() || regPassword.length < 6}>
                      Send OTP <ArrowRight className="h-4 w-4" />
                    </SubmitButton>
                  </form>

                  <p className="mt-5 text-center text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="font-semibold transition-colors"
                      style={{ color: "#C9A84C" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#E2C878")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#C9A84C")}
                    >
                      Login here
                    </button>
                  </p>
                </div>
              )}

              {/* ── REGISTER: OTP ── */}
              {mode === "register" && regStep === "otp" && (
                <div style={{ animation: "fadeIn 0.4s ease both" }}>
                  <div className="text-center mb-6 pt-2">
                    <div className="flex justify-center mb-3">
                      <div
                        className="h-12 w-12 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)" }}
                      >
                        <Shield className="h-6 w-6" style={{ color: "#C9A84C" }} />
                      </div>
                    </div>
                    <h1 className="text-2xl font-bold mb-1.5" style={{ color: "#fff", fontFamily: "Cormorant Garamond, serif" }}>
                      Verify Your Email
                    </h1>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                      We sent a 6-digit code to <span style={{ color: "#C9A84C" }}>{regEmail}</span>
                    </p>
                  </div>

                  <form onSubmit={handleOtpSubmit} className="space-y-5" noValidate>
                    {error && <ErrorBanner message={error} />}

                    <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { otpRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className="w-10 h-14 sm:w-11 sm:h-14 text-center text-xl font-bold rounded-lg outline-none transition-all"
                          style={{
                            background: digit ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.06)",
                            border: digit ? "2px solid #C9A84C" : `1px solid ${error ? "#ef4444" : "rgba(201,168,76,0.25)"}`,
                            color: "#fff",
                          }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "#C9A84C")}
                          onBlur={(e) => { if (!digit) e.currentTarget.style.borderColor = error ? "#ef4444" : "rgba(201,168,76,0.25)"; }}
                        />
                      ))}
                    </div>

                    <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                      Check your inbox for the 6-digit code.
                    </p>


                    <SubmitButton loading={loading} disabled={otp.join("").length !== 6}>
                      <CheckCircle2 className="h-4 w-4" /> Verify & Create Account
                    </SubmitButton>

                    <div className="flex items-center justify-between text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                      <button
                        type="button"
                        onClick={() => { setRegStep("details"); setOtp(["", "", "", "", "", ""]); setError(""); }}
                        className="flex items-center gap-1 transition-colors hover:text-white"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" /> Back
                      </button>
                      <button
                        type="button"
                        disabled={resendCooldown > 0 || loading}
                        onClick={handleResendOtp}
                        className="flex items-center gap-1 transition-colors disabled:opacity-40 hover:text-white"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Flow indicator */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            {mode === "login" ? (
              <>
                <StepDot active label="Login" />
                <StepLine />
                <StepDot active={false} label="Internship Form" />
              </>
            ) : (
              <>
                <StepDot active={regStep === "details"} label="Details" />
                <StepLine />
                <StepDot active={regStep === "otp"} label="Verify" />
                <StepLine />
                <StepDot active={false} label="Internship Form" />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Reusable sub-components ──
function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300"
      style={{
        background: active ? "linear-gradient(135deg,#C9A84C,#A07C30)" : "transparent",
        color: active ? "#040D1A" : "rgba(255,255,255,0.5)",
      }}
    >
      {children}
    </button>
  );
}

function InputField({
  icon, type = "text", placeholder, value, onChange, autoFocus,
}: {
  icon: React.ReactNode; type?: string; placeholder: string; value: string; onChange: (v: string) => void; autoFocus?: boolean;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "rgba(201,168,76,0.7)" }}>
        {icon}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none transition-all"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(201,168,76,0.25)", color: "#fff" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#C9A84C")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.25)")}
      />
    </div>
  );
}

function PasswordField({
  placeholder, value, onChange, show, toggle,
}: {
  placeholder: string; value: string; onChange: (v: string) => void; show: boolean; toggle: () => void;
}) {
  return (
    <div className="relative">
      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "rgba(201,168,76,0.7)" }} />
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-3 rounded-lg text-sm outline-none transition-all"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(201,168,76,0.25)", color: "#fff" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#C9A84C")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.25)")}
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function SubmitButton({ loading, disabled, children }: { loading: boolean; disabled: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ background: "linear-gradient(135deg,#C9A84C,#A07C30)", color: "#040D1A" }}
      onMouseEnter={(e) => { if (!loading && !disabled) e.currentTarget.style.background = "linear-gradient(135deg,#E2C878,#C9A84C)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "linear-gradient(135deg,#C9A84C,#A07C30)"; }}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm"
      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", animation: "scaleIn 0.3s ease both" }}
    >
      <AlertCircle className="h-4 w-4 shrink-0" /> {message}
    </div>
  );
}

function StepDot({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-2 w-2 rounded-full transition-all duration-300" style={{ background: active ? "#C9A84C" : "rgba(255,255,255,0.2)" }} />
      <span style={{ color: active ? "#C9A84C" : "rgba(255,255,255,0.4)" }}>{label}</span>
    </div>
  );
}

function StepLine() {
  return <div className="h-px w-4 sm:w-6" style={{ background: "rgba(255,255,255,0.15)" }} />;
}
