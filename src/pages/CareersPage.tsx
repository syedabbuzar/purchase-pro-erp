import { Link } from "react-router-dom";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { SEOHead } from "@/components/site/SEOHead";
import { WebPageSchema } from "@/components/site/Schema";
import { PAGE_SEO } from "@/lib/seo";
import { Briefcase, GraduationCap, ArrowRight } from "lucide-react";

const roles = [
  { t: "Intern — Full-Stack / Mobile / AI", l: "Remote / India", k: "BCA, MCA, Diploma, Engineering" },
  { t: "Senior Full-Stack Engineer", l: "Remote / India", k: "React, Node, Postgres" },
  { t: "Mobile Engineer (React Native)", l: "Remote / India", k: "Expo, RN, iOS, Android" },
  { t: "AI Engineer", l: "Remote / India", k: "LLMs, RAG, agents" },
  { t: "Product Designer", l: "Remote / India", k: "Figma, design systems" },
];

const seo = PAGE_SEO.careers;

export default function CareersPage() {
  return (
    <SiteLayout>
      <SEOHead {...seo} />
      <WebPageSchema
        name={seo.title}
        description={seo.description}
        url={seo.canonical}
        breadcrumbs={[
          { name: "Home", url: "https://www.mellowmoonsofttech.com" },
          { name: "Careers", url: seo.canonical },
        ]}
      />
      <PageHero
        eyebrow="Careers"
        title="Come build with us."
        subtitle="We hire people who care about craft, communicate clearly and want to ship work they're proud of."
      />
      <section aria-labelledby="open-roles-heading" className="container-x py-20">
        <h2 id="open-roles-heading" className="font-display text-3xl md:text-4xl">Open roles</h2>
        <div className="mt-10 divide-y divide-border border-y border-border" role="list">
          {roles.map((r) => (
            <div key={r.t} className="py-6 flex flex-wrap items-center justify-between gap-4" role="listitem">
              <div>
                <div className="flex items-center gap-2">
                  {r.t.startsWith("Intern") ? (
                    <GraduationCap className="h-4 w-4 text-maroon" aria-hidden="true" />
                  ) : (
                    <Briefcase className="h-4 w-4 text-maroon" aria-hidden="true" />
                  )}
                  <h3 className="font-display text-2xl">{r.t}</h3>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{r.l} · {r.k}</div>
              </div>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-maroon font-medium hover:text-maroon-light"
                aria-label={`Apply for ${r.t}`}
              >
                Apply <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
