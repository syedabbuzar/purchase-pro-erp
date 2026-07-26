import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User, Phone, Mail, Clock, BookOpen, CreditCard,
  QrCode, Upload, CheckSquare, Loader2, ChevronLeft,
  ZoomIn, Download, X, Eye, LogOut, FileText, GraduationCap,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/site/Logo";
import { Reveal } from "@/components/site/Reveal";
import { toast } from "sonner";
import { getCurrentQr, initStore, addApplication, type Application } from "@/lib/adminStore";
import { submitApplication } from "@/lib/api";

const DURATION_OPTIONS = [
  { value: "2_months", label: "2 Months (8 Weeks)", fee: 500 },
  { value: "6_months", label: "6 Months (24 Weeks)", fee: 5000 },
] as const;

const COURSE_OPTIONS: Record<string, string[]> = {
  "2_months": ["Frontend", "Python & AI", "Linux & Shell Scripting", "Backend"],
  "6_months": ["MERN Full Stack", "Python Full Stack", "Java Full Stack", "Linux & Shell Scripting"],
};

interface FormState {
  name: string;
  mobile: string;
  college: string;
  education: string;
  educationOther: string;
  duration: "2_months" | "6_months" | "";
  course: string;
  declared: boolean;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-5 sm:p-6 space-y-4"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,168,76,0.18)" }}
    >
      <h2
        className="text-xs font-bold uppercase tracking-widest pb-3"
        style={{ color: "#C9A84C", borderBottom: "1px solid rgba(201,168,76,0.15)" }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function LabeledField({ label, icon, children, error }: { label: string; icon: React.ReactNode; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: "rgba(255,255,255,0.8)" }}>
        <span style={{ color: "#C9A84C" }}>{icon}</span>
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs" style={{ color: "#ef4444" }}>{error}</p>}
    </div>
  );
}

export default function InternshipRegisterPage() {
  const navigate = useNavigate();
  const { session, signOut } = useAuth();

  // Initialize admin store (seeds mock data on first load) and get current QR
  initStore();
  const [qrUrl] = useState(() => getCurrentQr()?.url ?? "https://images.pexels.com/photos/278430/pexels-photo-278430.jpeg?auto=compress&w=400");

  const [form, setForm] = useState<FormState>({
    name: "",
    mobile: "",
    college: "",
    education: "",
    educationOther: "",
    duration: "",
    course: "",
    declared: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrZoomed, setQrZoomed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Reset course when duration changes
    setForm((f) => ({ ...f, course: "" }));
  }, [form.duration]);

  const fee = form.duration
    ? DURATION_OPTIONS.find((d) => d.value === form.duration)?.fee ?? 0
    : 0;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG, and PDF files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB.");
      return;
    }
    setPaymentProof(file);
    if (file.type !== "application/pdf") {
      setProofPreview(URL.createObjectURL(file));
    } else {
      setProofPreview(null);
    }
  }

  function removeFile() {
    setPaymentProof(null);
    setProofPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function downloadQR() {
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = "MellowMoon-Payment-QR.jpg";
    a.target = "_blank";
    a.click();
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.mobile.trim()) e.mobile = "Mobile number is required.";
    else if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) e.mobile = "Enter a valid 10-digit Indian mobile number.";
    if (!form.college.trim()) e.college = "College Name is required.";
    if (!form.education) e.education = "Please select your education / degree.";
    else if (form.education === "Other" && !form.educationOther.trim()) e.educationOther = "Please specify your degree.";
    if (!form.duration) e.duration = "Please select a duration.";
    if (!form.course) e.course = "Please select a course.";
    if (!paymentProof) e.paymentProof = "Please upload payment proof.";
    if (!form.declared) e.declared = "Please confirm the declaration.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    if (!validate()) {
      toast.error("Please complete all required fields.");
      return;
    }

    setLoading(true);
    try {
      if (!paymentProof) {
        toast.error("Please upload payment proof.");
        setLoading(false);
        return;
      }

      // Convert file to base64 data URL for backend upload
      const paymentScreenshot = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(paymentProof);
      });

      const education =
        form.education === "Other" ? form.educationOther.trim() : form.education;

      await submitApplication({
        name: form.name.trim(),
        email: session.email,
        mobile: form.mobile.trim(),
        college: form.college.trim(),
        education,
        duration: form.duration as "2_months" | "6_months",
        course: form.course,
        paymentScreenshot,
      });

      // Mirror into admin store for the local admin panel view
      const adminApp: Application = {
        id: `APP-${String(Date.now()).slice(-6)}`,
        userId: session.email,
        name: form.name.trim(),
        email: session.email,
        mobile: form.mobile.trim(),
        college: form.college.trim(),
        education,
        duration: form.duration as "2_months" | "6_months",
        course: form.course,
        registrationFee: fee,
        paymentScreenshot: proofPreview ?? paymentScreenshot,
        createdAt: new Date().toISOString(),
        status: "pending",
      };
      addApplication(adminApp);

      toast.success("Registration submitted successfully!");
      navigate("/internship/success", { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit =
    form.name.trim() &&
    form.mobile.trim() &&
    form.college.trim() &&
    form.education &&
    (form.education !== "Other" || form.educationOther.trim()) &&
    form.duration &&
    form.course &&
    paymentProof &&
    form.declared &&
    !loading;

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(135deg,#040D1A 0%,#071326 60%,#0a1a33 100%)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{
          background: "rgba(4,13,26,0.92)",
          borderBottom: "1px solid rgba(201,168,76,0.2)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Link to="/" aria-label="MellowMoon home">
          <Logo variant="light" />
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden sm:block text-xs truncate max-w-[140px]" style={{ color: "rgba(255,255,255,0.45)" }}>
            {session?.email}
          </span>
          <button
            onClick={() => {
              signOut();
              navigate("/internship/login");
            }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all shrink-0"
            style={{ color: "#C9A84C", border: "1px solid rgba(201,168,76,0.3)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201,168,76,0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Sign Out</span><span className="sm:hidden">Exit</span>
          </button>
        </div>
      </header>

      <main className="px-4 py-10 max-w-2xl mx-auto">
        {/* Page title */}
        <Reveal className="text-center mb-8">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ background: "rgba(201,168,76,0.12)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.3)" }}
          >
            Internship Program
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ color: "#fff", fontFamily: "Cormorant Garamond, serif" }}>
            MellowMoon SoftTech Pvt. Ltd.
          </h1>
          <p className="text-base mt-1.5 font-medium" style={{ color: "#C9A84C" }}>
            has Organized an Internship Program
          </p>
          <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.5)" }}>
            Fill in the details below to complete your registration
          </p>
        </Reveal>

        <Reveal delay={1}>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* ─── Personal Details ─── */}
          <Section title="Personal Details">
            <LabeledField label="Full Name (As per HSC Marksheet)" icon={<User className="h-4 w-4" />} error={errors.name}>
              <input
                type="text"
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${errors.name ? "#ef4444" : "rgba(201,168,76,0.25)"}`,
                  color: "#fff",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#C9A84C")}
                onBlur={(e) => {
                  if (!errors.name) e.currentTarget.style.borderColor = "rgba(201,168,76,0.25)";
                }}
              />
            </LabeledField>

            <LabeledField label="Mobile Number" icon={<Phone className="h-4 w-4" />} error={errors.mobile}>
              <input
                type="tel"
                value={form.mobile}
                onChange={(e) => {
                  setForm({ ...form, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) });
                  if (errors.mobile) setErrors({ ...errors, mobile: "" });
                }}
                placeholder="10-digit mobile number"
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${errors.mobile ? "#ef4444" : "rgba(201,168,76,0.25)"}`,
                  color: "#fff",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#C9A84C")}
                onBlur={(e) => {
                  if (!errors.mobile) e.currentTarget.style.borderColor = "rgba(201,168,76,0.25)";
                }}
              />
            </LabeledField>

            <LabeledField label="Email Address" icon={<Mail className="h-4 w-4" />}>
              <input
                type="email"
                value={session?.email ?? ""}
                readOnly
                className="w-full px-4 py-3 rounded-lg text-sm cursor-not-allowed outline-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(201,168,76,0.15)",
                  color: "rgba(255,255,255,0.6)",
                }}
              />
              <p className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                Auto-filled from your verified account
              </p>
            </LabeledField>

            <LabeledField label="College Name" icon={<GraduationCap className="h-4 w-4" />} error={errors.college}>
              <input
                type="text"
                value={form.college}
                onChange={(e) => {
                  setForm({ ...form, college: e.target.value });
                  if (errors.college) setErrors({ ...errors, college: "" });
                }}
                placeholder="Enter your College Name"
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${errors.college ? "#ef4444" : "rgba(201,168,76,0.25)"}`,
                  color: "#fff",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#C9A84C")}
                onBlur={(e) => {
                  if (!errors.college) e.currentTarget.style.borderColor = "rgba(201,168,76,0.25)";
                }}
              />
            </LabeledField>

            <LabeledField label="Education / Degree" icon={<BookOpen className="h-4 w-4" />} error={errors.education}>
              <EducationDropdown
                value={form.education}
                error={!!errors.education}
                onChange={(v) => {
                  setForm({ ...form, education: v, educationOther: "" });
                  if (errors.education) setErrors({ ...errors, education: "" });
                }}
              />
            </LabeledField>

            {form.education === "Other" && (
              <LabeledField label="Specify Degree" icon={<BookOpen className="h-4 w-4" />} error={errors.educationOther}>
                <input
                  type="text"
                  value={form.educationOther}
                  onChange={(e) => {
                    setForm({ ...form, educationOther: e.target.value });
                    if (errors.educationOther) setErrors({ ...errors, educationOther: "" });
                  }}
                  placeholder="Enter your Degree"
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${errors.educationOther ? "#ef4444" : "rgba(201,168,76,0.25)"}`,
                    color: "#fff",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#C9A84C")}
                  onBlur={(e) => {
                    if (!errors.educationOther) e.currentTarget.style.borderColor = "rgba(201,168,76,0.25)";
                  }}
                />
              </LabeledField>
            )}
          </Section>

          {/* ─── Duration ─── */}
          <Section title="Internship Duration">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setForm({ ...form, duration: opt.value, course: "" });
                    if (errors.duration) setErrors({ ...errors, duration: "" });
                  }}
                  className="p-4 rounded-xl text-left transition-all duration-200"
                  style={{
                    background: form.duration === opt.value ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
                    border: `2px solid ${form.duration === opt.value ? "#C9A84C" : errors.duration ? "#ef4444" : "rgba(201,168,76,0.2)"}`,
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 shrink-0" style={{ color: "#C9A84C" }} />
                    <span className="text-sm font-semibold" style={{ color: "#fff" }}>
                      {opt.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            {errors.duration && <p className="text-xs" style={{ color: "#ef4444" }}>{errors.duration}</p>}
          </Section>

          {/* ─── Course ─── */}
          {form.duration && (
            <Section title="Select Course">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {COURSE_OPTIONS[form.duration].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setForm({ ...form, course: c });
                      if (errors.course) setErrors({ ...errors, course: "" });
                    }}
                    className="p-4 rounded-xl text-left transition-all duration-200"
                    style={{
                      background: form.course === c ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
                      border: `2px solid ${form.course === c ? "#C9A84C" : "rgba(201,168,76,0.2)"}`,
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="h-4 w-4 shrink-0" style={{ color: "#C9A84C" }} />
                      <span className="text-sm font-medium" style={{ color: "#fff" }}>{c}</span>
                    </div>
                  </button>
                ))}
              </div>
              {errors.course && <p className="text-xs" style={{ color: "#ef4444" }}>{errors.course}</p>}
            </Section>
          )}

          {/* ─── Fee Card ─── */}
          {form.duration && (
            <div
              className="rounded-xl p-5 flex items-center justify-between gap-4"
              style={{
                background: "linear-gradient(135deg,rgba(201,168,76,0.18),rgba(201,168,76,0.07))",
                border: "1px solid rgba(201,168,76,0.4)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(201,168,76,0.2)" }}
                >
                  <CreditCard className="h-5 w-5" style={{ color: "#C9A84C" }} />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(201,168,76,0.7)" }}>
                    Registration Fee
                  </p>
                  <p className="text-2xl font-bold" style={{ color: "#C9A84C" }}>
                    ₹{fee.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              <div className="text-right text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                {DURATION_OPTIONS.find((d) => d.value === form.duration)?.label}
              </div>
            </div>
          )}

          {/* ─── Payment QR ─── */}
          {form.duration && (
            <Section title="Payment QR Code">
              <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.55)" }}>
                Scan the QR code below to pay ₹{fee.toLocaleString("en-IN")} via UPI/BHIM.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div
                  className="relative rounded-xl overflow-hidden"
                  style={{ border: "2px solid rgba(201,168,76,0.4)", background: "#fff", padding: 8 }}
                >
                  <img
                    src={qrUrl}
                    alt="Payment QR Code"
                    className="h-40 w-40 object-cover rounded"
                  />
                  <p className="text-center text-xs mt-1 font-semibold" style={{ color: "#040D1A" }}>
                    MellowMoon SoftTech
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setQrZoomed(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={{ background: "rgba(201,168,76,0.12)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.3)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201,168,76,0.2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(201,168,76,0.12)")}
                  >
                    <ZoomIn className="h-4 w-4" /> View / Zoom QR
                  </button>
                  <button
                    type="button"
                    onClick={downloadQR}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={{ background: "rgba(201,168,76,0.12)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.3)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201,168,76,0.2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(201,168,76,0.12)")}
                  >
                    <Download className="h-4 w-4" /> Download QR
                  </button>
                </div>
              </div>
            </Section>
          )}

          {/* ─── Payment Proof Upload ─── */}
          <Section title="Upload Payment Proof">
            <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>
              Accepted: JPG, JPEG, PNG, PDF — Max 10MB
            </p>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative rounded-xl p-6 text-center cursor-pointer transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `2px dashed ${paymentProof ? "#C9A84C" : errors.paymentProof ? "#ef4444" : "rgba(201,168,76,0.25)"}`,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#C9A84C")}
              onMouseLeave={(e) => {
                if (!paymentProof) e.currentTarget.style.borderColor = errors.paymentProof ? "#ef4444" : "rgba(201,168,76,0.25)";
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              {paymentProof ? (
                <div className="flex flex-col items-center gap-2">
                  {proofPreview ? (
                    <img src={proofPreview} alt="Payment proof" className="h-28 w-auto rounded-lg object-cover" />
                  ) : (
                    <FileText className="h-12 w-12" style={{ color: "#C9A84C" }} />
                  )}
                  <p className="text-sm font-medium" style={{ color: "#C9A84C" }}>{paymentProof.name}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {(paymentProof.size / 1024).toFixed(1)} KB — Click to change
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload className="h-10 w-10" style={{ color: "rgba(201,168,76,0.5)" }} />
                  <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
                    Click to upload payment screenshot
                  </p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>JPG, PNG, PDF up to 10MB</p>
                </div>
              )}
            </div>

            {errors.paymentProof && (
              <p className="mt-2 text-xs" style={{ color: "#ef4444" }}>{errors.paymentProof}</p>
            )}

            {paymentProof && (
              <button
                type="button"
                onClick={removeFile}
                className="mt-2 flex items-center gap-1 text-xs transition-colors"
                style={{ color: "rgba(255,100,100,0.7)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ff6464")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,100,100,0.7)")}
              >
                <X className="h-3.5 w-3.5" /> Remove file
              </button>
            )}
          </Section>

          {/* ─── Declaration ─── */}
          <div
            className="rounded-xl p-5"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,168,76,0.2)" }}
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={form.declared}
                  onChange={(e) => {
                    setForm({ ...form, declared: e.target.checked });
                    if (errors.declared) setErrors({ ...errors, declared: "" });
                  }}
                  className="sr-only"
                />
                <div
                  className="h-5 w-5 rounded flex items-center justify-center transition-all"
                  style={{
                    background: form.declared ? "#C9A84C" : "rgba(255,255,255,0.06)",
                    border: `2px solid ${form.declared ? "#C9A84C" : errors.declared ? "#ef4444" : "rgba(201,168,76,0.35)"}`,
                  }}
                >
                  {form.declared && <CheckSquare className="h-3.5 w-3.5" style={{ color: "#040D1A" }} />}
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                I confirm that the payment has been completed and the information provided is correct.
              </p>
            </label>
            {errors.declared && (
              <p className="mt-2 text-xs" style={{ color: "#ef4444" }}>{errors.declared}</p>
            )}
          </div>

          {/* ─── Submit ─── */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg,#C9A84C,#A07C30)", color: "#040D1A" }}
            onMouseEnter={(e) => {
              if (canSubmit) e.currentTarget.style.background = "linear-gradient(135deg,#E2C878,#C9A84C)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg,#C9A84C,#A07C30)";
            }}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" /> Submit Registration
              </>
            )}
          </button>
        </form>
        </Reveal>
      </main>

      {/* QR Zoom Modal */}
      {qrZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
          onClick={() => setQrZoomed(false)}
        >
          <div
            className="relative rounded-2xl p-6 max-w-sm w-full"
            style={{ background: "#fff" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setQrZoomed(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full transition-colors"
              style={{ background: "rgba(0,0,0,0.08)" }}
            >
              <X className="h-4 w-4" style={{ color: "#040D1A" }} />
            </button>
            <img src={qrUrl} alt="Payment QR Code" className="w-full rounded-lg" />
            <p className="text-center mt-3 font-bold text-sm" style={{ color: "#040D1A" }}>
              MellowMoon SoftTech Pvt. Ltd.
            </p>
            <p className="text-center text-xs mt-1" style={{ color: "#718096" }}>
              UPI / BHIM Payment
            </p>
            <button
              onClick={downloadQR}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold"
              style={{ background: "linear-gradient(135deg,#C9A84C,#A07C30)", color: "#040D1A" }}
            >
              <Download className="h-4 w-4" /> Download QR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Custom Education Dropdown (dark-theme, replaces native <select>) ──
const EDUCATION_OPTIONS = [
  "BCA", "MCA", "B.Tech", "B.E.", "B.Sc", "M.Sc",
  "B.Com", "M.Com", "BBA", "MBA", "Diploma", "Other",
];

function EducationDropdown({
  value, error, onChange,
}: {
  value: string; error: boolean; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 rounded-lg text-sm outline-none cursor-pointer transition-all flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: `1px solid ${error ? "#ef4444" : open ? "#C9A84C" : "rgba(201,168,76,0.25)"}`,
          color: value ? "#fff" : "rgba(255,255,255,0.4)",
        }}
      >
        <span className="truncate">{value || "Select your education / degree"}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 ml-2 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          style={{ color: "rgba(201,168,76,0.7)" }}
        />
      </button>

      {open && (
        <div
          className="absolute z-50 left-0 right-0 mt-1.5 rounded-lg overflow-hidden"
          style={{
            background: "#0a1a33",
            border: "1px solid rgba(201,168,76,0.3)",
            boxShadow: "0 16px 48px -8px rgba(0,0,0,0.6)",
            backdropFilter: "blur(12px)",
            maxHeight: "240px",
            overflowY: "auto",
          }}
        >
          {EDUCATION_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm transition-colors duration-200"
              style={{
                color: value === opt ? "#C9A84C" : "rgba(255,255,255,0.75)",
                background: value === opt ? "rgba(201,168,76,0.12)" : "transparent",
                borderBottom: "1px solid rgba(201,168,76,0.08)",
              }}
              onMouseEnter={(e) => {
                if (value !== opt) e.currentTarget.style.background = "rgba(201,168,76,0.08)";
              }}
              onMouseLeave={(e) => {
                if (value !== opt) e.currentTarget.style.background = "transparent";
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
