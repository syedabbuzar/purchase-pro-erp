import { Link } from "react-router-dom";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { SEOHead } from "@/components/site/SEOHead";
import { WebPageSchema } from "@/components/site/Schema";
import { PAGE_SEO } from "@/lib/seo";
import { Bot, Globe2, Smartphone, Code2, Database, Building2, ArrowRight } from "lucide-react";

const items = [
  { icon: Bot, title: "Agentic AI", to: "/services/agentic-ai", desc: "Autonomous agents that reason, plan and operate across your tools and data." },
  { icon: Globe2, title: "Web Applications", to: "/services/web-apps", desc: "Production-grade web platforms — performant, accessible, built to scale." },
  { icon: Smartphone, title: "Hybrid Mobile Apps", to: "/services/mobile-apps", desc: "One codebase. iOS, Android and the web — shipped fast, kept native-feeling." },
  { icon: Code2, title: "Custom Software", to: "/services/custom-software", desc: "Bespoke business software, shaped exactly around how your operation actually works." },
  { icon: Database, title: "CRM & Inventory", to: "/services/crm-inventory", desc: "Sales pipelines, inventory portals and ops dashboards that grow with the team." },
  { icon: Building2, title: "Business Websites", to: "/services/business-sites", desc: "Real-estate, education, retail and service sites — fully responsive and conversion-led." },
];

const seo = PAGE_SEO.services;

export default function ServicesPage() {
  return (
    <SiteLayout>
      <SEOHead {...seo} />
      <WebPageSchema
        name={seo.title}
        description={seo.description}
        url={seo.canonical}
        breadcrumbs={[
          { name: "Home", url: "https://www.mellowmoonsofttech.com" },
          { name: "Services", url: seo.canonical },
        ]}
      />
      <PageHero
        eyebrow="Services"
        title="Engineered services for businesses that take software seriously."
        subtitle="From a single web app to a multi-product platform, we plan, design, build and operate software end-to-end."
      />
      <section aria-labelledby="services-list-heading" className="container-x py-20">
        <h2 id="services-list-heading" className="sr-only">Our service offerings</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {items.map((s) => (
            <Link key={s.title} to={s.to} className="group bg-card p-8 hover:bg-maroon hover:text-cream transition-colors" aria-label={`${s.title}: ${s.desc}`}>
              <s.icon className="h-8 w-8 text-maroon group-hover:text-gold" aria-hidden="true" />
              <h3 className="mt-5 font-display text-2xl">{s.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground group-hover:text-cream/80 leading-relaxed">{s.desc}</p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-maroon group-hover:text-gold">
                Read more <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
