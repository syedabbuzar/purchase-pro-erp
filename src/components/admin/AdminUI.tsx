// Shared admin UI kit — built to match the MellowMoon SoftTech website design language.
// Uses the same colors, typography, borders, shadows, and animations as the public site.
// Import these instead of writing inline styles on every admin page.

import type { ReactNode, CSSProperties } from "react";
import { Reveal } from "@/components/site/Reveal";

// ── Design tokens (mirrors styles.css) ──
export const C = {
  navy950: "#040D1A",
  navy900: "#071326",
  navy800: "#0C1E3D",
  navy700: "#122754",
  gold: "#C9A84C",
  goldLight: "#E2C878",
  goldDark: "#A07C30",
  goldSoft: "#F9F3E3",
  platinum100: "#F5F6F8",
  platinum200: "#E8EAEE",
  platinum300: "#CDD1D9",
  platinum400: "#9FA7B5",
  ink: "#080F1C",
  muted: "#4A5568",
  cream: "#FAFBFC",
  success: "#16A34A",
  warning: "#CA8A04",
  error: "#DC2626",
};

// ── Page header (matches PageHero pattern from SiteLayout) ──
export function AdminPageHeader({
  eyebrow, title, subtitle, actions,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <Reveal>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="section-label" style={{ color: C.gold }}>{eyebrow}</div>
          <h1
            className="mt-3 font-display font-medium leading-tight"
            style={{ fontSize: "clamp(1.75rem,3.5vw,2.5rem)", color: C.ink }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm" style={{ color: C.muted }}>{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </Reveal>
  );
}

// ── Card (matches site card pattern: white bg, platinum border, hover lift) ──
export function AdminCard({
  children, className = "", hover = false, style, onClick,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div
      className={`${hover ? "card-lift" : ""} ${className}`}
      onClick={onClick}
      style={{
        background: "#fff",
        border: `1px solid ${C.platinum200}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Stat card (matches site stat-block pattern) ──
export function AdminStatCard({
  label, value, icon, color = C.gold, delay = 0, prefix = "",
}: {
  label: string;
  value: number | string;
  icon: ReactNode;
  color?: string;
  delay?: 0 | 1 | 2 | 3 | 4;
  prefix?: string;
}) {
  return (
    <Reveal delay={delay}>
      <div
        className="card-lift group p-6 h-full relative overflow-hidden"
        style={{ background: "#fff", border: `1px solid ${C.platinum200}` }}
      >
        {/* Gold top accent line on hover */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left"
          style={{ background: `linear-gradient(90deg,${C.gold},${C.goldLight})` }}
        />
        <div className="flex items-start justify-between mb-4">
          <div
            className="h-11 w-11 grid place-items-center"
            style={{
              background: `linear-gradient(135deg,${C.navy800},${C.navy950})`,
              boxShadow: `0 4px 20px -4px rgba(4,13,26,0.3)`,
            }}
          >
            <span style={{ color }}>{icon}</span>
          </div>
          <div
            className="font-display text-5xl font-medium select-none"
            style={{ color: "rgba(201,168,76,0.08)", lineHeight: 1 }}
            aria-hidden="true"
          >
            {label.charAt(0).toUpperCase()}
          </div>
        </div>
        <div
          className="font-display font-medium"
          style={{ fontSize: "clamp(1.75rem,3vw,2.25rem)", color: C.ink }}
        >
          {prefix}{typeof value === "number" ? value.toLocaleString("en-IN") : value}
        </div>
        <div
          className="text-xs mt-1.5 uppercase tracking-widest"
          style={{ color: C.muted }}
        >
          {label}
        </div>
      </div>
    </Reveal>
  );
}

// ── Section wrapper (matches site section pattern) ──
export function AdminSection({
  children, className = "", style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={className} style={{ ...style }}>
      {children}
    </div>
  );
}

// ── Button (matches .btn-primary and .btn-outline from site) ──
export function AdminButton({
  children, variant = "primary", size = "md", onClick, disabled, type = "button", className = "",
}: {
  children: ReactNode;
  variant?: "primary" | "outline" | "gold" | "danger" | "success";
  size?: "sm" | "md";
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  const sizes = {
    sm: "px-3.5 py-2 text-xs",
    md: "px-5 py-2.5 text-sm",
  };
  const variants: Record<string, CSSProperties> = {
    primary: {
      background: `linear-gradient(135deg,${C.navy800},${C.navy950})`,
      color: "#fff",
      border: "1px solid transparent",
    },
    gold: {
      background: `linear-gradient(135deg,${C.gold},${C.goldDark})`,
      color: C.navy950,
      border: "1px solid transparent",
    },
    outline: {
      background: "transparent",
      color: C.navy800,
      border: `1.5px solid ${C.platinum300}`,
    },
    danger: {
      background: "transparent",
      color: C.error,
      border: `1.5px solid rgba(220,38,38,0.3)`,
    },
    success: {
      background: "transparent",
      color: C.success,
      border: `1.5px solid rgba(22,163,74,0.3)`,
    },
  };
  const hoverStyles: Record<string, CSSProperties> = {
    primary: { background: `linear-gradient(135deg,${C.goldDark},${C.gold})`, color: C.navy950 },
    gold: { background: `linear-gradient(135deg,${C.goldLight},${C.gold})` },
    outline: { borderColor: C.gold, color: C.goldDark, background: C.goldSoft },
    danger: { background: "rgba(220,38,38,0.06)", borderColor: C.error },
    success: { background: "rgba(22,163,74,0.06)", borderColor: C.success },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 font-medium tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${className}`}
      style={variants[variant]}
      onMouseEnter={(e) => { if (!disabled) Object.assign(e.currentTarget.style, hoverStyles[variant]); }}
      onMouseLeave={(e) => Object.assign(e.currentTarget.style, variants[variant])}
    >
      {children}
    </button>
  );
}

// ── Input (matches site form inputs) ──
export function AdminInput({
  label, icon, type = "text", value, onChange, placeholder, error, autoFocus,
}: {
  label?: string;
  icon?: ReactNode;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-2" style={{ color: C.ink }}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: C.gold }}>
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full py-3 rounded-lg text-sm outline-none transition-all duration-300"
          style={{
            paddingLeft: icon ? "2.75rem" : "1rem",
            paddingRight: "1rem",
            background: C.platinum100,
            border: `1.5px solid ${error ? C.error : C.platinum200}`,
            color: C.ink,
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = C.gold)}
          onBlur={(e) => (e.currentTarget.style.borderColor = error ? C.error : C.platinum200)}
        />
      </div>
    </div>
  );
}

// ── Textarea ──
export function AdminTextarea({
  label, value, onChange, placeholder, rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: C.ink }}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-300 resize-none"
        style={{
          background: C.platinum100,
          border: `1.5px solid ${C.platinum200}`,
          color: C.ink,
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = C.gold)}
        onBlur={(e) => (e.currentTarget.style.borderColor = C.platinum200)}
      />
    </div>
  );
}

// ── Select ──
export function AdminSelect({
  value, onChange, options, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full sm:w-auto px-4 py-3 rounded-lg text-sm outline-none cursor-pointer transition-all duration-300"
      style={{
        background: C.platinum100,
        border: `1.5px solid ${C.platinum200}`,
        color: C.ink,
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = C.gold)}
      onBlur={(e) => (e.currentTarget.style.borderColor = C.platinum200)}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ── Status badge (matches site badge patterns) ──
export function AdminBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    pending: { bg: "rgba(202,138,4,0.1)", text: C.warning, border: "rgba(202,138,4,0.3)" },
    approved: { bg: "rgba(22,163,74,0.1)", text: C.success, border: "rgba(22,163,74,0.3)" },
    rejected: { bg: "rgba(220,38,38,0.1)", text: C.error, border: "rgba(220,38,38,0.3)" },
    active: { bg: "rgba(22,163,74,0.1)", text: C.success, border: "rgba(22,163,74,0.3)" },
    inactive: { bg: "rgba(159,167,181,0.1)", text: C.platinum400, border: "rgba(159,167,181,0.3)" },
  };
  const c = colors[status] || colors.pending;
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

// ── Table (matches site table patterns with platinum borders) ──
export function AdminTable({ children }: { children: ReactNode }) {
  return (
    <div
      className="overflow-x-auto"
      style={{ background: "#fff", border: `1px solid ${C.platinum200}` }}
    >
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function AdminTh({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={`text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${className}`}
      style={{ color: C.muted, borderBottom: `1px solid ${C.platinum200}`, background: C.platinum100 }}
    >
      {children}
    </th>
  );
}

export function AdminTd({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <td
      className={`px-4 py-3.5 whitespace-nowrap ${className}`}
      style={{ color: C.ink, borderBottom: `1px solid ${C.platinum100}` }}
    >
      {children}
    </td>
  );
}

// ── Diamond accent (matches .diamond-gem from site) ──
export function DiamondAccent({ size = 8, color = C.gold }: { size?: number; color?: string }) {
  return (
    <span
      className="inline-block shrink-0"
      style={{ width: size, height: size, background: color, transform: "rotate(45deg)" }}
    />
  );
}

// ── Gold accent line (matches .accent-line from site) ──
export function GoldLine({ width = 40 }: { width?: number }) {
  return (
    <div style={{ height: 2, width, background: `linear-gradient(90deg,${C.gold},${C.goldLight})` }} />
  );
}
