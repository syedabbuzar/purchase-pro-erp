import { Link } from "react-router-dom";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { SEOHead } from "@/components/site/SEOHead";
import { WebPageSchema } from "@/components/site/Schema";
import { PAGE_SEO } from "@/lib/seo";
import { GraduationCap, Building2, Sparkles, ShoppingBag, Stethoscope, Rocket, ArrowRight } from "lucide-react";

const industries = [
  { i: GraduationCap, t: "Education", d: "Institutional websites, admissions portals, learning platforms and student management systems." },
  { i: Sparkles, t: "Beauty & Wellness", d: "Booking systems, service catalogues and brand sites for salons, parlours and spas." },
  { i: Building2, t: "Real Estate", d: "Project listings, floor-plan viewers, lead-capture and developer portals." },
  { i: ShoppingBag, t: "Retail & Inventory", d: "POS, multi-warehouse inventory, GST-ready billing and e-commerce." },
  { i: Stethoscope, t: "Healthcare", d: "Appointment systems, clinic management and patient-facing portals." },
  { i: Rocket, t: "Startups", d: "MVPs, product launches and the engineering capacity to scale them once they hit." },
];

const seo = PAGE_SEO.industries;

export default function IndustriesPage() {
  return (
    <SiteLayout>
      <SEOHead {...seo} />
      <WebPageSchema
        name={seo.title}
        description={seo.description}
        url={seo.canonical}
        breadcrumbs={[
          { name: "Home", url: "https://www.mellowmoonsofttech.com" },
          { name: "Industries", url: seo.canonical },
        ]}
      />
      <PageHero
        eyebrow="Industries"
        title="The industries we build for."
        subtitle="We bring domain context with us. These are the sectors where we've shipped real work — and the patterns we know cold."
      />
      <section aria-labelledby="industries-heading" className="container-x py-20">
        <h2 id="industries-heading" className="sr-only">Industries served by MellowMoon SoftTech</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {industries.map((s) => (
            <div key={s.t} className="bg-card p-8">
              <s.i className="h-8 w-8 text-maroon" aria-hidden="true" />
              <h3 className="mt-5 font-display text-2xl">{s.t}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <Link to="/contact" className="inline-flex items-center gap-2 bg-maroon text-cream px-7 py-3.5 font-medium hover:bg-maroon-light">
            Don't see your industry? Talk to us <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
