import { ServiceDetail } from "@/components/site/ServiceDetail";
import { SEOHead } from "@/components/site/SEOHead";
import { WebPageSchema, ServiceSchema } from "@/components/site/Schema";
import { PAGE_SEO } from "@/lib/seo";
import { sharedProcess, sharedWhy, sharedFaqs } from "@/lib/service-extras";
import img from "@/assets/case-realestate.jpg";

const seo = PAGE_SEO.businessSites;

export default function BusinessSitesPage() {
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
          { name: "Business Websites", url: seo.canonical },
        ]}
      />
      <ServiceSchema
        name="Business Website Design & Development"
        description="Custom responsive SEO-optimised business websites for real estate, education, beauty and retail. Conversion-focused design."
        url={seo.canonical}
        serviceType="Business Website Design"
      />
      <ServiceDetail
        eyebrow="Service"
        title="Business websites that win the click."
        subtitle="Real-estate portals, educational campuses, beauty studios, retailers, service providers — we build the website your business deserves."
        intro="Custom design, fully responsive, SEO-ready, and tuned for conversion. We've built sites for educational campuses, beauty parlours, real-estate developers and dozens of other SMEs — each shaped to match the brand, the audience and the goal."
        capabilities={[
          "Custom brand-led design",
          "Fully responsive across devices",
          "SEO & analytics from day one",
          "Booking, enquiry & lead capture",
          "CMS so you stay in control",
          "Hosting, maintenance & support",
        ]}
        outcomes={[
          { v: "100%", l: "Responsive" },
          { v: "SEO", l: "Optimised" },
          { v: "100%", l: "Satisfaction" },
        ]}
        image={img}
        imageAlt="Business website for real estate developer built by MellowMoon SoftTech"
        whyUs={sharedWhy}
        process={sharedProcess}
        tech={["React","TanStack Start","Next.js","Tailwind CSS","Sanity CMS","Strapi","Cloudflare","SEO Schema","Google Analytics","Cloudinary"]}
        faqs={sharedFaqs}
      />
    </>
  );
}
