import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Linkedin, Twitter, Facebook, Instagram, MapPin, Phone, Mail, ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer style={{ background: "linear-gradient(180deg,#071326 0%,#040D1A 100%)", color: "rgba(250,251,252,0.85)" }}>
      {/* Gold top border */}
      <div style={{ height: 2, background: "linear-gradient(90deg,transparent,#C9A84C 25%,#E2C878 50%,#C9A84C 75%,transparent)" }} />

      <div className="container-x py-16 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo variant="light" />
          <p className="mt-5 text-sm leading-relaxed max-w-sm" style={{ color: "rgba(250,251,252,0.55)" }}>
            MellowMoon SoftTech Pvt Ltd builds AI-powered software, web & mobile applications,
            and business platforms that turn ambitious ideas into shipped products.
          </p>
          <div className="mt-6 flex gap-2">
            {[Linkedin, Twitter, Facebook, Instagram].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="h-9 w-9 grid place-items-center transition-all duration-300"
                style={{
                  border: "1px solid rgba(201,168,76,0.25)",
                  background: "rgba(201,168,76,0.04)",
                  color: "rgba(250,251,252,0.6)",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.background = "#C9A84C";
                  el.style.color = "#040D1A";
                  el.style.borderColor = "#C9A84C";
                  el.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.background = "rgba(201,168,76,0.04)";
                  el.style.color = "rgba(250,251,252,0.6)";
                  el.style.borderColor = "rgba(201,168,76,0.25)";
                  el.style.transform = "translateY(0)";
                }}
              >
                <Icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>

          {/* Certifications / trust badges */}
          <div className="mt-8 flex items-center gap-3">
            <div
              className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-semibold"
              style={{ border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C" }}
            >
              Pvt Ltd
            </div>
          
          </div>
        </div>

        <div>
          <h4
            className="text-xs font-semibold uppercase tracking-widest mb-5 pb-3"
            style={{ color: "#C9A84C", borderBottom: "1px solid rgba(201,168,76,0.2)" }}
          >
            Services
          </h4>
          <ul className="space-y-2.5 text-sm">
            {[
              { to: "/services/agentic-ai", l: "Agentic AI" },
              { to: "/services/web-apps", l: "Web Applications" },
              { to: "/services/mobile-apps", l: "Hybrid Mobile Apps" },
              { to: "/services/custom-software", l: "Custom Software" },
              { to: "/services/crm-inventory", l: "CRM & Inventory" },
              { to: "/services/business-sites", l: "Business Websites" },
            ].map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="flex items-center gap-2 transition-all duration-200"
                  style={{ color: "rgba(250,251,252,0.6)" }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = "#C9A84C";
                    e.currentTarget.style.paddingLeft = "0.375rem";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = "rgba(250,251,252,0.6)";
                    e.currentTarget.style.paddingLeft = "0";
                  }}
                >
                  <span className="h-1 w-1 rotate-45 shrink-0" style={{ background: "currentColor", opacity: 0.5 }} />
                  {item.l}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4
            className="text-xs font-semibold uppercase tracking-widest mb-5 pb-3"
            style={{ color: "#C9A84C", borderBottom: "1px solid rgba(201,168,76,0.2)" }}
          >
            Company
          </h4>
          <ul className="space-y-2.5 text-sm">
            {[
              { to: "/about", l: "About Us" },
              { to: "/industries", l: "Industries" },
              { to: "/portfolio", l: "Portfolio" },
              { to: "/training", l: "Training & Internship" },
              { to: "/careers", l: "Careers" },
            ].map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="flex items-center gap-2 transition-all duration-200"
                  style={{ color: "rgba(250,251,252,0.6)" }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = "#C9A84C";
                    e.currentTarget.style.paddingLeft = "0.375rem";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = "rgba(250,251,252,0.6)";
                    e.currentTarget.style.paddingLeft = "0";
                  }}
                >
                  <span className="h-1 w-1 rotate-45 shrink-0" style={{ background: "currentColor", opacity: 0.5 }} />
                  {item.l}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4
            className="text-xs font-semibold uppercase tracking-widest mb-5 pb-3"
            style={{ color: "#C9A84C", borderBottom: "1px solid rgba(201,168,76,0.2)" }}
          >
            Contact
          </h4>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3" style={{ color: "rgba(250,251,252,0.65)" }}>
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#C9A84C" }} />
              <span>Nanded, Maharashtra, India</span>
            </li>
            <li className="flex gap-3">
              <Phone className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#C9A84C" }} />
              <a
                href="tel:+917058123707"
                className="transition-colors"
                style={{ color: "rgba(250,251,252,0.65)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#C9A84C")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(250,251,252,0.65)")}
              >
                +91 7058123707
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#C9A84C" }} />
              <a
                href="mailto:mellowmoonsofttech@gmail.com"
                className="transition-colors break-all"
                style={{ color: "rgba(250,251,252,0.65)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#C9A84C")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(250,251,252,0.65)")}
              >
                mellowmoonsofttech@gmail.com
              </a>
            </li>
          </ul>

          <Link
            to="/contact"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest transition-all duration-300"
            style={{ background: "linear-gradient(135deg,#C9A84C,#A07C30)", color: "#040D1A" }}
            onMouseEnter={e => (e.currentTarget.style.background = "linear-gradient(135deg,#E2C878,#C9A84C)")}
            onMouseLeave={e => (e.currentTarget.style.background = "linear-gradient(135deg,#C9A84C,#A07C30)")}
          >
            Start a Project <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(201,168,76,0.12)" }}>
        <div className="container-x py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: "rgba(250,251,252,0.4)" }}>
          <p>© {new Date().getFullYear()} MellowMoon SoftTech Pvt Ltd. All rights reserved.</p>
          <div className="flex gap-5">
            {["Privacy", "Terms", "Sitemap"].map((l) => (
              <a
                key={l}
                href="#"
                className="transition-colors"
                style={{ color: "inherit" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#C9A84C")}
                onMouseLeave={e => (e.currentTarget.style.color = "")}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
