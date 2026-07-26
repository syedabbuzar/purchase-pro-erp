import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, Phone, Mail, ChevronDown, Globe } from "lucide-react";
import { Logo } from "./Logo";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  {
    to: "/services",
    label: "Services",
    children: [
      { to: "/services/agentic-ai", label: "Agentic AI" },
      { to: "/services/web-apps", label: "Web Applications" },
      { to: "/services/mobile-apps", label: "Hybrid Mobile Apps" },
      { to: "/services/custom-software", label: "Custom Software" },
      { to: "/services/crm-inventory", label: "CRM & Inventory" },
      { to: "/services/business-sites", label: "Business Websites" },
    ],
  },
  { to: "/industries", label: "Industries" },
  { to: "/training", label: "Training" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/careers", label: "Careers" },
];

export function Header({ transparent = false }: { transparent?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overlay = transparent && !scrolled;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        overlay
          ? "bg-transparent"
          : "shadow-[0_4px_32px_-8px_rgba(4,13,26,0.22)]"
      }`}
      style={overlay ? {} : {
        background: "linear-gradient(180deg,#040D1A 0%,#071326 100%)",
      }}
    >
      {/* Utility bar */}
      <div
        className={`text-xs overflow-hidden transition-all duration-500 ${
          scrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
        }`}
        style={{ background: "rgba(201,168,76,0.12)", borderBottom: "1px solid rgba(201,168,76,0.18)" }}
      >
        <div className="container-x flex h-9 items-center justify-end gap-5" style={{ color: "rgba(249,243,227,0.75)" }}>
          <a
            href="tel:+917058123707"
            className="hidden md:flex items-center gap-1.5 transition-colors"
            style={{ color: "inherit" }}
            aria-label="Call us at +91 7058123707"
            onMouseEnter={e => (e.currentTarget.style.color = "#C9A84C")}
            onMouseLeave={e => (e.currentTarget.style.color = "")}
          >
            <Phone className="h-3 w-3" aria-hidden="true" /> +91 7058123707
          </a>
          <a
            href="mailto:mellowmoonsofttech@gmail.com"
            className="hidden md:flex items-center gap-1.5 transition-colors"
            style={{ color: "inherit" }}
            aria-label="Email us at mellowmoonsofttech@gmail.com"
            onMouseEnter={e => (e.currentTarget.style.color = "#C9A84C")}
            onMouseLeave={e => (e.currentTarget.style.color = "")}
          >
            <Mail className="h-3 w-3" aria-hidden="true" /> mellowmoonsofttech@gmail.com
          </a>
          <Link
            to="/contact"
            className="transition-colors"
            style={{ color: "inherit" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#C9A84C")}
            onMouseLeave={e => (e.currentTarget.style.color = "")}
          >
            Contact Us
          </Link>
          <span style={{ opacity: 0.3 }}>|</span>
          <Link
            to="/internship/login"
            className="transition-colors"
            style={{ color: "inherit" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#C9A84C")}
            onMouseLeave={e => (e.currentTarget.style.color = "")}
          >
            Internships
          </Link>
          <Globe className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />
        </div>
      </div>

      {/* Gold top border accent */}
      <div
        className={`h-px w-full transition-all duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`}
        style={{ background: "linear-gradient(90deg, transparent, #C9A84C 30%, #E2C878 50%, #C9A84C 70%, transparent)" }}
      />

      {/* Main bar */}
      <div
        className="container-x flex items-center justify-between transition-all duration-500"
        style={{ height: scrolled ? 68 : 88 }}
      >
        <Link to="/" className="shrink-0" aria-label="MellowMoon SoftTech — Home">
          <Logo variant="light" />
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
          {nav.map((item) => (
            <div key={item.to} className="group relative">
              <NavLink
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `relative flex items-center gap-1 px-4 text-sm font-medium tracking-wide transition-colors duration-200 ${
                    isActive
                      ? "text-[#C9A84C]"
                      : "text-[rgba(250,251,252,0.82)] hover:text-[#E2C878]"
                  }`
                }
                style={{ paddingBlock: scrolled ? "22px" : "28px" }}
              >
                <span className="relative">
                  {item.label}
                  {/* Gold underline */}
                  <span
                    className="absolute -bottom-0.5 left-0 h-px w-0 group-hover:w-full transition-all duration-300"
                    style={{ background: "linear-gradient(90deg,#C9A84C,#E2C878)" }}
                    aria-hidden="true"
                  />
                </span>
                {item.children && (
                  <ChevronDown className="h-3 w-3 opacity-60 transition-transform duration-200 group-hover:rotate-180" />
                )}
              </NavLink>

              {/* Dropdown */}
              {item.children && (
                <div
                  role="menu"
                  aria-label="Services submenu"
                  className="invisible opacity-0 translate-y-3 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 absolute top-full left-0 w-72 py-2 shadow-[0_16px_48px_-8px_rgba(4,13,26,0.4)]"
                  style={{
                    background: "linear-gradient(180deg,#071326 0%,#040D1A 100%)",
                    borderTop: "2px solid #C9A84C",
                    borderLeft: "1px solid rgba(201,168,76,0.15)",
                    borderRight: "1px solid rgba(201,168,76,0.15)",
                    borderBottom: "1px solid rgba(201,168,76,0.15)",
                  }}
                >
                  {item.children.map((c) => (
                    <Link
                      key={c.to}
                      to={c.to}
                      className="flex items-center gap-3 px-5 py-3 text-sm transition-all duration-200 group/item"
                      style={{ color: "rgba(250,251,252,0.75)", borderLeft: "2px solid transparent" }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = "#C9A84C";
                        e.currentTarget.style.borderLeftColor = "#C9A84C";
                        e.currentTarget.style.paddingLeft = "1.75rem";
                        e.currentTarget.style.background = "rgba(201,168,76,0.06)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = "rgba(250,251,252,0.75)";
                        e.currentTarget.style.borderLeftColor = "transparent";
                        e.currentTarget.style.paddingLeft = "1.25rem";
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rotate-45 shrink-0 opacity-60"
                        style={{ background: "#C9A84C" }}
                      />
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all duration-300"
            style={{
              background: "linear-gradient(135deg,#C9A84C,#A07C30)",
              color: "#040D1A",
              letterSpacing: "0.04em",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "linear-gradient(135deg,#E2C878,#C9A84C)")}
            onMouseLeave={e => (e.currentTarget.style.background = "linear-gradient(135deg,#C9A84C,#A07C30)")}
          >
            Get a Quote
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2 transition-colors"
          style={{ color: "#C9A84C" }}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          id="mobile-menu"
          className="lg:hidden"
          role="navigation"
          aria-label="Mobile navigation"
          style={{
            background: "#040D1A",
            borderTop: "1px solid rgba(201,168,76,0.2)",
          }}
        >
          <div className="container-x py-4 flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm font-medium transition-colors"
                style={{ color: "rgba(250,251,252,0.8)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#C9A84C")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(250,251,252,0.8)")}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium"
              style={{
                background: "linear-gradient(135deg,#C9A84C,#A07C30)",
                color: "#040D1A",
              }}
            >
              Get a Quote
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
