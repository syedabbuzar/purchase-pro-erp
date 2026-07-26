import { ServiceDetail } from "@/components/site/ServiceDetail";
import { SEOHead } from "@/components/site/SEOHead";
import { WebPageSchema, ServiceSchema } from "@/components/site/Schema";
import { PAGE_SEO } from "@/lib/seo";
import { sharedProcess, sharedWhy, sharedFaqs } from "@/lib/service-extras";
import img from "@/assets/service-web.jpg";

const seo = PAGE_SEO.webApps;

export default function WebAppsPage() {
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
          { name: "Web Applications", url: seo.canonical },
        ]}
      />
      <ServiceSchema
        name="Web Application Development"
        description="Production-grade web applications built with React, Next.js, TypeScript and Node.js — performant, accessible and engineered to scale."
        url={seo.canonical}
        serviceType="Web Development"
      />
      <ServiceDetail
        eyebrow="Service"
        title="Web applications, engineered to last."
        subtitle="From SaaS platforms to internal tools to high-traffic portals — built on modern stacks with engineering you can audit."
        intro="We build full-stack web applications using React, Next.js / TanStack, TypeScript, Node and Postgres. Every project is designed for accessibility, performance and a clean operational story — so you can grow the team and the product without rebuilding from scratch in two years."
        capabilities={[
          "Multi-tenant SaaS platforms",
          "Customer & admin portals",
          "Internal tools & dashboards",
          "Headless commerce",
          "Auth, billing & integrations",
          "SEO & Core Web Vitals",
        ]}
        outcomes={[
          { v: "99.9%", l: "Uptime" },
          { v: "<1s", l: "P75 load" },
          { v: "A11y", l: "WCAG ready" },
        ]}
        image={img}
        imageAlt="Modern web application development with React and TypeScript by MellowMoon SoftTech"
        whyUs={sharedWhy}
        process={sharedProcess}
        tech={["React","Next.js","TanStack","TypeScript","Node.js","Postgres","Prisma","Tailwind CSS","AWS","Cloudflare"]}
        faqs={sharedFaqs}
      />
    </>
  );
}
