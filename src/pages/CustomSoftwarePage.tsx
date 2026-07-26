import { ServiceDetail } from "@/components/site/ServiceDetail";
import { SEOHead } from "@/components/site/SEOHead";
import { WebPageSchema, ServiceSchema } from "@/components/site/Schema";
import { PAGE_SEO } from "@/lib/seo";
import { sharedProcess, sharedWhy, sharedFaqs } from "@/lib/service-extras";
import img from "@/assets/service-web.jpg";

const seo = PAGE_SEO.customSoftware;

export default function CustomSoftwarePage() {
  return (
    <>
      <SEOHead {...seo} />
      <WebPageSchema
        name={seo.title}
        description={seo.description}
        url={seo.canonical}
        breadcrumbs={[
          { name: "Home", url: "https://www.mellowmoonsofttech.com" },
          { name: "Services", url: "https://www.mellowmoonsofttech.com/services" },
          { name: "Custom Software", url: seo.canonical },
        ]}
      />
      <ServiceSchema
        name="Custom Software Development"
        description="Bespoke business software shaped exactly around your operation — discovery, design, architecture, build, deployment and handover end-to-end."
        url={seo.canonical}
        serviceType="Custom Software Development"
      />
      <ServiceDetail
        eyebrow="Service"
        title="Custom software, built around your business."
        subtitle="When off-the-shelf tools force compromise, we build software that fits your operation exactly — and integrates cleanly with what you already use."
        intro="Discovery, product design, architecture, build, integration, deployment and operations — handled end-to-end. We work in small senior teams with weekly demos so you always see what's shipping. Codebases come with documentation, tests and a clean handover plan."
        capabilities={[
          "Discovery & product design",
          "Architecture & integrations",
          "End-to-end build",
          "QA, security & performance",
          "Cloud deployment & DevOps",
          "Documentation & handover",
        ]}
        outcomes={[
          { v: "8–16w", l: "Typical MVP" },
          { v: "Weekly", l: "Demos" },
          { v: "Yours", l: "Codebase" },
        ]}
        image={img}
        imageAlt="Custom software development and business platform engineering by MellowMoon SoftTech"
        whyUs={sharedWhy}
        process={sharedProcess}
        tech={["TypeScript","Python","Java","Node.js","Postgres","Docker","Kubernetes","AWS","Azure","CI/CD"]}
        faqs={sharedFaqs}
      />
    </>
  );
}
