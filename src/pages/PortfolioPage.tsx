import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { SEOHead } from "@/components/site/SEOHead";
import { WebPageSchema } from "@/components/site/Schema";
import { PAGE_SEO } from "@/lib/seo";
import caseRE from "@/assets/case-realestate.jpg";
import caseBeauty from "@/assets/case-beauty.jpg";
import caseEdu from "@/assets/case-education.jpg";
import caseCRM from "@/assets/service-crm.jpg";
import caseWeb from "@/assets/service-web.jpg";
import caseAI from "@/assets/service-ai.jpg";

const work = [
  { img: caseEdu, tag: "Education", title: "Scholar Educational Campus", desc: "Institutional website covering admissions, programmes, faculty and student services. Built to rank, built to convert." },
  { img: caseBeauty, tag: "Beauty & Wellness", title: "Muskan Beauty Parlour", desc: "Premium service catalogue, gallery and online booking funnel for a beauty studio brand." },
  { img: caseRE, tag: "Real Estate", title: "Developers Portal", desc: "Project listings, floor plans, virtual walkthroughs and a CRM-connected lead pipeline." },
  { img: caseCRM, tag: "CRM & Inventory", title: "Retail Operations Portal", desc: "Multi-warehouse inventory, GST-ready invoicing and a sales pipeline for a growing retailer." },
  { img: caseAI, tag: "Agentic AI", title: "Support Copilot", desc: "An LLM-powered customer-support copilot integrated into an SME's existing helpdesk." },
  { img: caseWeb, tag: "SaaS", title: "Internal Ops Dashboard", desc: "A multi-tenant ops dashboard with role-based access, reports and a clean audit trail." },
];

const seo = PAGE_SEO.portfolio;

export default function PortfolioPage() {
  return (
    <SiteLayout>
      <SEOHead {...seo} />
      <WebPageSchema
        name={seo.title}
        description={seo.description}
        url={seo.canonical}
        breadcrumbs={[
          { name: "Home", url: "https://www.mellowmoonsofttech.com" },
          { name: "Portfolio", url: seo.canonical },
        ]}
      />
      <PageHero
        eyebrow="Portfolio"
        title="Work we've shipped."
        subtitle="A selection of recent projects. Every brief is different — the discipline behind it isn't."
      />
      <section aria-labelledby="portfolio-heading" className="container-x py-20">
        <h2 id="portfolio-heading" className="sr-only">Portfolio of delivered projects</h2>
        <div className="grid md:grid-cols-2 gap-x-6 gap-y-14">
          {work.map((c, i) => (
            <article key={c.title} className={`group ${i % 2 === 1 ? "md:mt-16" : ""}`}>
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={c.img}
                  alt={`${c.title} — ${c.tag} project delivered by MellowMoon SoftTech`}
                  width={1200}
                  height={800}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="mt-5">
                <div className="text-[10px] uppercase tracking-[0.2em] text-gold-dark font-semibold">{c.tag}</div>
                <h3 className="mt-2 font-display text-3xl">{c.title}</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">{c.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
