import { Link } from "react-router-dom";
import {
  ArrowRight, Sparkles, Code2, Smartphone, Database, Globe2, Bot,
  CheckCircle2, GraduationCap, Building2, Briefcase, Phone, Mail,
  Palette, Cloud, Headphones, Users, Lightbulb, Globe, Target,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { HeroCarousel } from "@/components/site/HeroCarousel";
import { Reveal } from "@/components/site/Reveal";
import { SEOHead } from "@/components/site/SEOHead";
import { WebPageSchema } from "@/components/site/Schema";
import { PAGE_SEO, SITE_URL } from "@/lib/seo";
import ctaBand from "@/assets/cta-band.jpg";
import training from "@/assets/training.jpg";
import caseRE from "@/assets/case-realestate.jpg";
import caseBeauty from "@/assets/case-beauty.jpg";
import caseEdu from "@/assets/case-education.jpg";

const services = [
  { icon: Bot, title: "Agentic AI", desc: "Autonomous AI agents that reason, plan and act inside your workflows.", to: "/services/agentic-ai" },
  { icon: Globe2, title: "Web Development", desc: "Building responsive and high-performance websites tailored to your business needs.", to: "/services/web-apps" },
  { icon: Smartphone, title: "Mobile App Development", desc: "Creating user-friendly and feature-rich mobile applications for Android and iOS platforms.", to: "/services/mobile-apps" },
  { icon: Palette, title: "UI/UX Design", desc: "Designing intuitive and engaging user interfaces and experiences that delight users.", to: "/services/custom-software" },
  { icon: Cloud, title: "Cloud Solutions", desc: "Providing scalable and secure cloud services to enhance your business operations.", to: "/services/custom-software" },
  { icon: Code2, title: "Software Development", desc: "Offering comprehensive custom software development solutions to meet your business needs.", to: "/services/custom-software" },
  { icon: Database, title: "CRM & Inventory", desc: "Sales, inventory and operations portals that scale with your team.", to: "/services/crm-inventory" },
  { icon: Headphones, title: "IT Consulting", desc: "Delivering expert IT consulting services to drive your business growth and efficiency.", to: "/services/custom-software" },
  { icon: Building2, title: "Business Websites", desc: "Real-estate, education, retail and service websites that convert.", to: "/services/business-sites" },
];

const offerings = [
  { icon: Lightbulb, title: "Innovative Solutions", desc: "We deliver cutting-edge solutions to modernize your business processes. From AI-driven automation to scalable cloud platforms, we cater to diverse industry needs — digital transformation, cybersecurity, and advanced analytics — all designed to optimize efficiency and drive growth." },
  { icon: Users, title: "Expert Team", desc: "Our team of engineers, designers and consultants is dedicated to delivering top-quality work. With years of hands-on industry experience, we tackle complex challenges and deliver sustainable, production-grade solutions across software, IT consulting and project management." },
  { icon: Headphones, title: "Customer Satisfaction", desc: "We prioritise customer satisfaction with tailored solutions and proactive support. From onboarding and training to ongoing maintenance, our team anticipates your needs and ensures smooth operations — building long-term partnerships, not one-off deliveries." },
];

const whyUs = [
  { icon: Briefcase, title: "Industry Expertise", desc: "Hands-on experience across Ed-Tech, E-commerce, Healthcare, Real Estate, Beauty & Wellness and more — we understand the unique challenges of each sector and tailor solutions accordingly." },
  { icon: Globe, title: "International Reach", desc: "We build and maintain partnerships with distinguished collaborators across India and abroad, giving us access to modern technologies and the ability to deliver tailored solutions to customers worldwide." },
  { icon: Target, title: "Mission & Vision", desc: "Our mission is simple — prioritise client success. We work closely with you to understand your unique needs and ship software that creates measurable business outcomes." },
];

const stats = [
  { v: "25+", l: "Projects Delivered" },
  { v: "25+", l: "Happy Clients" },
  { v: "100+", l: "Students Trained" },
  { v: "6", l: "Industries Served" },
];

const cases = [
  { img: caseEdu, tag: "Education", title: "Scholar Educational Campus", desc: "A full institutional website for admissions, programmes and student services." },
  { img: caseBeauty, tag: "Beauty & Wellness", title: "Muskan Beauty Parlour", desc: "Service catalogue, gallery and online bookings for a premium beauty studio." },
  { img: caseRE, tag: "Real Estate", title: "Developers Portal", desc: "Project listings, floor plans and a lead-capture pipeline for a developer." },
];

const NAVY = "#040D1A";
const NAVY_800 = "#0C1E3D";
const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E2C878";
const PLATINUM_100 = "#F5F6F8";
const PLATINUM_200 = "#E8EAEE";
const INK = "#080F1C";
const MUTED = "#4A5568";

const seo = PAGE_SEO.home;

export default function HomePage() {
  return (
    <SiteLayout>
      <SEOHead {...seo} />
      <WebPageSchema
        name={seo.title}
        description={seo.description}
        url={SITE_URL}
        breadcrumbs={[{ name: "Home", url: SITE_URL }]}
      />

      <HeroCarousel />

      {/* ── Stats bar ── */}
      <section aria-label="Company statistics" style={{ background: NAVY, borderBottom: `1px solid rgba(201,168,76,0.2)` }}>
        <div className="container-x py-10 grid grid-cols-2 md:grid-cols-4 gap-0">
          {stats.map((s, i) => (
            <Reveal key={s.l} delay={(i % 4) as 0 | 1 | 2 | 3}>
              <div
                className="text-center md:text-left py-6 md:px-8 relative"
                style={{ borderRight: i < 3 ? "1px solid rgba(201,168,76,0.15)" : "none" }}
              >
                <div
                  className="font-display font-medium"
                  style={{ fontSize: "clamp(2rem,4vw,3rem)", background: `linear-gradient(135deg,${GOLD_LIGHT},${GOLD})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
                >
                  {s.v}
                </div>
                <div className="text-xs mt-1.5 uppercase tracking-widest" style={{ color: "rgba(250,251,252,0.45)" }}>
                  {s.l}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── About snippet ── */}
      <section aria-labelledby="about-heading" style={{ background: PLATINUM_100, borderBottom: `1px solid ${PLATINUM_200}` }}>
        <div className="container-x py-24 md:py-32 grid md:grid-cols-2 gap-16 items-center">
          <Reveal>
            <div className="section-label" style={{ color: GOLD }}>About MellowMoon</div>
            <h2
              id="about-heading"
              className="mt-5 font-display font-medium leading-tight"
              style={{ fontSize: "clamp(2rem,4vw,3.25rem)", color: INK }}
            >
              A software house where craft meets corporate discipline.
            </h2>
            <div className="mt-6 flex items-center gap-3" aria-hidden="true">
              <div style={{ height: 2, width: 40, background: `linear-gradient(90deg,${GOLD},${GOLD_LIGHT})` }} />
              <div style={{ height: 6, width: 6, background: GOLD, transform: "rotate(45deg)" }} />
              <div style={{ height: 2, width: 24, background: `linear-gradient(90deg,${GOLD_LIGHT},transparent)` }} />
            </div>
          </Reveal>
          <Reveal delay={1} className="space-y-5">
            <p style={{ color: MUTED, lineHeight: 1.8 }}>
              MellowMoon SoftTech Pvt Ltd is a full-stack technology partner for businesses that
              want serious engineering without enterprise bloat. From agentic AI to CRMs, hybrid
              mobile apps to fully bespoke platforms, we ship work that holds up in production.
            </p>
            <p style={{ color: MUTED, lineHeight: 1.8 }}>
              Alongside our client work we train BCA, MCA, Diploma and Engineering students
              through structured internships — the same engineers who go on to build with us.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-sm font-medium transition-all duration-300 group"
              style={{ color: NAVY_800 }}
              onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
              onMouseLeave={e => (e.currentTarget.style.color = NAVY_800)}
            >
              More about us
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── Services ── */}
      <section aria-labelledby="services-heading" style={{ background: "#F8F9FB", borderTop: `1px solid ${PLATINUM_200}`, borderBottom: `1px solid ${PLATINUM_200}` }}>
        <div className="container-x py-24 md:py-32">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
            <div>
              <div className="section-label">What we do</div>
              <h2
                id="services-heading"
                className="mt-4 font-display font-medium"
                style={{ fontSize: "clamp(2rem,4vw,3rem)", color: INK }}
              >
                Services
              </h2>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-sm font-medium transition-colors group"
              style={{ color: NAVY_800 }}
              onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
              onMouseLeave={e => (e.currentTarget.style.color = NAVY_800)}
            >
              All services <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: PLATINUM_200 }}>
            {services.map((s, i) => (
              <Reveal key={s.title} delay={(i % 3) as 0 | 1 | 2}>
                <Link
                  to={s.to}
                  className="group block h-full p-8 relative overflow-hidden transition-all duration-400"
                  style={{ background: "#fff" }}
                  onMouseEnter={e => { e.currentTarget.style.background = GOLD_LIGHT; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
                  aria-label={`${s.title}: ${s.desc}`}
                >
                  <div className="absolute top-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" style={{ background: `linear-gradient(90deg,${GOLD},${GOLD_LIGHT})` }} aria-hidden="true" />
                  <s.icon className="h-8 w-8 transition-colors duration-400" style={{ color: GOLD }} aria-hidden="true" />
                  <h3 className="mt-5 font-display text-xl font-medium transition-colors duration-400 group-hover:text-white" style={{ color: INK }}>{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed transition-colors duration-400" style={{ color: MUTED }}>{s.desc}</p>
                  <div className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-400 group-hover:text-[#E2C878]" style={{ color: GOLD }}>
                    Learn more <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Offerings ── */}
      <section aria-labelledby="offerings-heading" style={{ background: "#fff", borderBottom: `1px solid ${PLATINUM_200}` }}>
        <div className="container-x py-24 md:py-32">
          <div className="max-w-2xl mb-16">
            <div className="section-label">Offerings</div>
            <h2
              id="offerings-heading"
              className="mt-4 font-display font-medium leading-tight"
              style={{ fontSize: "clamp(2rem,4vw,3rem)", color: INK }}
            >
              What sets our delivery apart.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {offerings.map((o, i) => (
              <Reveal key={o.title} delay={(i % 3) as 0 | 1 | 2}>
                <div
                  className="p-8 h-full relative group transition-all duration-400"
                  style={{ border: `1px solid ${PLATINUM_200}`, background: PLATINUM_100 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = GOLD; (e.currentTarget as HTMLDivElement).style.background = "#fff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = PLATINUM_200; (e.currentTarget as HTMLDivElement).style.background = PLATINUM_100; }}
                >
                  <div className="absolute top-6 right-6 font-display text-6xl font-medium select-none transition-colors duration-400" style={{ color: "rgba(201,168,76,0.08)", lineHeight: 1 }} aria-hidden="true">0{i + 1}</div>
                  <div className="h-12 w-12 grid place-items-center" style={{ background: `linear-gradient(135deg,${NAVY_800},${NAVY})`, boxShadow: `0 4px 20px -4px rgba(4,13,26,0.4)` }}>
                    <o.icon className="h-5 w-5" style={{ color: GOLD }} aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-medium" style={{ color: INK }}>{o.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: MUTED }}>{o.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Training ── */}
      <section aria-labelledby="training-heading" style={{ background: PLATINUM_100, borderBottom: `1px solid ${PLATINUM_200}` }}>
        <div className="container-x py-24 md:py-32 grid lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <div className="relative">
              <img
                src={training}
                alt="Students working on live software projects during MellowMoon SoftTech internship training"
                width={1600}
                height={1000}
                loading="lazy"
                decoding="async"
                className="w-full aspect-[4/3] object-cover"
              />
              <div className="absolute -top-3 -left-3 h-16 w-16" style={{ border: `2px solid ${GOLD}`, borderRight: "none", borderBottom: "none", opacity: 0.5 }} aria-hidden="true" />
              <div className="absolute -bottom-3 -right-3 h-16 w-16" style={{ border: `2px solid ${GOLD}`, borderLeft: "none", borderTop: "none", opacity: 0.5 }} aria-hidden="true" />
              <div className="absolute -bottom-6 -right-6 p-6 hidden md:block" style={{ background: `linear-gradient(135deg,${GOLD},#A07C30)`, color: NAVY }}>
                <div className="font-display text-3xl font-medium">300+</div>
                <div className="text-xs uppercase tracking-wider mt-1">Students trained</div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div className="section-label">
              <GraduationCap className="h-3.5 w-3.5 mr-1.5" style={{ display: "inline" }} aria-hidden="true" />
              Training & Internship
            </div>
            <h2
              id="training-heading"
              className="mt-4 font-display font-medium leading-tight"
              style={{ fontSize: "clamp(1.75rem,3.5vw,2.75rem)", color: INK }}
            >
              Real engineering experience for BCA, MCA, Diploma & Engineering students.
            </h2>
            <p className="mt-5 text-sm leading-relaxed" style={{ color: MUTED }}>
              Our internship and training programme puts students inside live client projects —
              full-stack web, mobile, AI and DevOps — with mentorship from senior engineers.
              Graduates leave with a real portfolio, not a certificate of attendance.
            </p>
            <ul className="mt-6 grid sm:grid-cols-2 gap-3 text-sm">
              {["Full-stack web", "Hybrid mobile", "AI & automation", "Cloud & DevOps", "UI/UX foundations", "Live client work"].map((t) => (
                <li key={t} className="flex items-center gap-2.5" style={{ color: INK }}>
                  <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: GOLD }} aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <Link
                to="/training"
                className="inline-flex items-center gap-0 text-sm font-medium group overflow-hidden"
                style={{ background: `linear-gradient(135deg,${NAVY_800},${NAVY})`, color: "#fff" }}
                onMouseEnter={e => (e.currentTarget.style.background = `linear-gradient(135deg,${GOLD},#A07C30)`)}
                onMouseLeave={e => (e.currentTarget.style.background = `linear-gradient(135deg,${NAVY_800},${NAVY})`)}
              >
                <span className="px-7 py-4">Apply for internship</span>
                <span className="flex items-center justify-center w-12 h-full py-4 transition-all group-hover:bg-black/10" style={{ borderLeft: "1px solid rgba(255,255,255,0.15)" }} aria-hidden="true">
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Featured Projects ── */}
      <section aria-labelledby="projects-heading" style={{ background: "#fff", borderBottom: `1px solid ${PLATINUM_200}` }}>
        <div className="container-x py-24 md:py-32">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
            <div>
              <div className="section-label">Selected work</div>
              <h2
                id="projects-heading"
                className="mt-4 font-display font-medium"
                style={{ fontSize: "clamp(2rem,4vw,3rem)", color: INK }}
              >
                Featured projects
              </h2>
            </div>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 text-sm font-medium transition-colors group"
              style={{ color: NAVY_800 }}
              onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
              onMouseLeave={e => (e.currentTarget.style.color = NAVY_800)}
            >
              View all <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {cases.map((c, i) => (
              <Reveal key={c.title} delay={(i % 3) as 0 | 1 | 2}>
                <article className="group overflow-hidden h-full" style={{ border: `1px solid ${PLATINUM_200}` }}>
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img
                      src={c.img}
                      alt={`${c.title} — ${c.tag} project by MellowMoon SoftTech`}
                      width={1200}
                      height={800}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400" style={{ background: `linear-gradient(0deg,rgba(4,13,26,0.8) 0%,transparent 60%)` }} aria-hidden="true" />
                  </div>
                  <div className="p-7">
                    <div className="text-[10px] uppercase tracking-[0.25em] font-semibold" style={{ color: GOLD }}>{c.tag}</div>
                    <h3 className="mt-2 font-display text-xl font-medium" style={{ color: INK }}>{c.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: MUTED }}>{c.desc}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section aria-labelledby="why-heading" style={{ background: "#F8F9FB", borderBottom: `1px solid ${PLATINUM_200}` }}>
        <div className="container-x py-24 md:py-32">
          <div className="max-w-2xl mb-14">
            <div className="section-label">Why Choose MellowMoon</div>
            <h2
              id="why-heading"
              className="mt-4 font-display font-medium leading-tight"
              style={{ fontSize: "clamp(2rem,4vw,3rem)", color: INK }}
            >
              Engineered for outcomes, not just deliverables.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {whyUs.map((w, i) => (
              <Reveal key={w.title} delay={(i % 3) as 0 | 1 | 2}>
                <div
                  className="p-8 h-full group transition-all duration-400"
                  style={{ border: `1px solid ${PLATINUM_200}`, background: "#fff" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = GOLD; el.style.background = GOLD_LIGHT; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = PLATINUM_200; el.style.background = "#fff"; }}
                >
                  <div className="h-10 w-10 grid place-items-center transition-colors duration-400" style={{ border: `1px solid rgba(201,168,76,0.3)`, background: "rgba(201,168,76,0.06)" }}>
                    <w.icon className="h-5 w-5 transition-colors duration-400 group-hover:text-[#C9A84C]" style={{ color: GOLD }} aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-medium transition-colors duration-400 group-hover:text-white" style={{ color: INK }}>{w.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed transition-colors duration-400 group-hover:text-[rgba(250,251,252,0.7)]" style={{ color: MUTED }}>{w.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { i: Sparkles, t: "Custom by default", d: "Every build is shaped around your business, not a template." },
              { i: CheckCircle2, t: "100% satisfaction", d: "We iterate until you're genuinely happy with what we ship." },
              { i: Code2, t: "Fully responsive", d: "Polished experiences across mobile, tablet and desktop." },
              { i: Briefcase, t: "Post-launch support", d: "We stay with you after go-live — maintenance, monitoring, growth." },
            ].map((f) => (
              <div key={f.t} className="flex gap-4">
                <div className="shrink-0 h-10 w-10 grid place-items-center" style={{ background: `linear-gradient(135deg,${NAVY_800},${NAVY})` }} aria-hidden="true">
                  <f.i className="h-4 w-4" style={{ color: GOLD }} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-display text-base font-medium" style={{ color: INK }}>{f.t}</h3>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: MUTED }}>{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section aria-labelledby="cta-heading" className="relative overflow-hidden">
        <img
          src={ctaBand}
          alt=""
          role="presentation"
          width={1920}
          height={600}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: "brightness(0.25)" }}
        />
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg,${NAVY} 0%,rgba(12,30,61,0.92) 100%)` }} aria-hidden="true" />
        <div className="absolute right-0 top-0 h-full w-1/2 pointer-events-none" style={{ background: `linear-gradient(135deg,transparent 50%,rgba(201,168,76,0.04) 100%)` }} aria-hidden="true" />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${GOLD},transparent)` }} aria-hidden="true" />

        <div className="container-x py-24 relative grid md:grid-cols-[2fr_1fr] gap-12 items-center">
          <div>
            <div className="section-label" style={{ color: `rgba(201,168,76,0.8)` }}>Let's build together</div>
            <h2
              id="cta-heading"
              className="mt-5 font-display font-medium leading-tight"
              style={{ fontSize: "clamp(2rem,4vw,3.5rem)", color: "#fff" }}
            >
              Have a product to build, an idea to validate, or a team to train?
            </h2>
            <p className="mt-5 max-w-xl" style={{ color: "rgba(250,251,252,0.65)" }}>
              Tell us what you're trying to ship. We'll come back with a plan, a timeline and a number.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 text-sm font-medium tracking-wide transition-all duration-300"
              style={{ background: `linear-gradient(135deg,${GOLD},#A07C30)`, color: NAVY }}
              onMouseEnter={e => (e.currentTarget.style.background = `linear-gradient(135deg,${GOLD_LIGHT},${GOLD})`)}
              onMouseLeave={e => (e.currentTarget.style.background = `linear-gradient(135deg,${GOLD},#A07C30)`)}
            >
              Start a project <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href="tel:+917058123707"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 text-sm font-medium transition-all duration-300"
              style={{ border: "1px solid rgba(201,168,76,0.3)", color: "rgba(250,251,252,0.85)", background: "rgba(201,168,76,0.04)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.background = "rgba(201,168,76,0.1)"; e.currentTarget.style.color = GOLD; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)"; e.currentTarget.style.background = "rgba(201,168,76,0.04)"; e.currentTarget.style.color = "rgba(250,251,252,0.85)"; }}
            >
              <Phone className="h-4 w-4" aria-hidden="true" /> +91 7058123707
            </a>
            <a
              href="mailto:mellowmoonsofttech@gmail.com"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 text-sm font-medium transition-all duration-300"
              style={{ border: "1px solid rgba(201,168,76,0.3)", color: "rgba(250,251,252,0.85)", background: "rgba(201,168,76,0.04)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.background = "rgba(201,168,76,0.1)"; e.currentTarget.style.color = GOLD; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)"; e.currentTarget.style.background = "rgba(201,168,76,0.04)"; e.currentTarget.style.color = "rgba(250,251,252,0.85)"; }}
            >
              <Mail className="h-4 w-4" aria-hidden="true" /> mellowmoonsofttech@gmail.com
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
