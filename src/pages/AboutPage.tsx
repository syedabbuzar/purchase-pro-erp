import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { SEOHead } from "@/components/site/SEOHead";
import { WebPageSchema } from "@/components/site/Schema";
import { PAGE_SEO } from "@/lib/seo";
import { Target, Eye, Heart, Award } from "lucide-react";

const seo = PAGE_SEO.about;

export default function AboutPage() {
  return (
    <SiteLayout>
      <SEOHead {...seo} />
      <WebPageSchema
        name={seo.title}
        description={seo.description}
        url={seo.canonical}
        breadcrumbs={[
          { name: "Home", url: "https://www.mellowmoonsofttech.com" },
          { name: "About Us", url: seo.canonical },
        ]}
      />
      <PageHero
        eyebrow="About us"
        title="A modern software company built on craft, discipline and trust."
        subtitle="MellowMoon SoftTech Pvt Ltd partners with founders, SMEs and institutions to ship real software — and trains the engineers who help us do it."
      />

      <section aria-labelledby="who-we-are-heading" className="container-x py-20 grid md:grid-cols-2 gap-12">
        <div>
          <h2 id="who-we-are-heading" className="font-display text-3xl md:text-4xl">Who we are</h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            We are a full-stack software studio with deep experience in agentic AI, web and
            mobile engineering, and business platforms — CRMs, inventory portals, education
            sites, real-estate portals and beyond. Our work spans early-stage startups,
            established SMEs and institutions.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Alongside client work we run a structured internship and training programme for
            students from BCA, MCA, Diploma and Engineering streams. The result: a pipeline
            of capable engineers and a culture of teaching that keeps us sharp.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            { i: Target, t: "Mission", d: "Build durable, beautiful software for the businesses that power the real economy." },
            { i: Eye, t: "Vision", d: "An India where ambitious SMEs ship world-class software, on their terms." },
            { i: Heart, t: "Values", d: "Craft. Honesty. Long-term thinking. Respect for the people we build with." },
            { i: Award, t: "Promise", d: "100% satisfaction. We iterate until what we ship makes your business better." },
          ].map((v) => (
            <div key={v.t} className="border-l-2 border-gold pl-5">
              <v.i className="h-5 w-5 text-maroon" aria-hidden="true" />
              <h3 className="mt-3 font-display text-xl">{v.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Company milestones" className="bg-secondary/40 py-20 border-y border-border">
        <div className="container-x grid md:grid-cols-3 gap-10">
          {[
            { v: "2026", l: "Founded" },
            { v: "100%", l: "Client retention" },
            { v: "6+", l: "Industries served" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="font-display text-5xl md:text-6xl text-maroon font-medium">{s.v}</div>
              <div className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
