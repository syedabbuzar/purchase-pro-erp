import { ServiceDetail } from "@/components/site/ServiceDetail";
import { SEOHead } from "@/components/site/SEOHead";
import { WebPageSchema, ServiceSchema } from "@/components/site/Schema";
import { PAGE_SEO } from "@/lib/seo";
import { sharedProcess, sharedWhy, sharedFaqs } from "@/lib/service-extras";
import img from "@/assets/service-crm.jpg";

const seo = PAGE_SEO.crmInventory;

export default function CrmInventoryPage() {
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
          { name: "CRM & Inventory", url: seo.canonical },
        ]}
      />
      <ServiceSchema
        name="CRM & Inventory Management Software"
        description="Sales pipelines, multi-warehouse inventory, GST-ready invoicing and ops dashboards built for Indian SMEs."
        url={seo.canonical}
        serviceType="CRM & Inventory Software"
      />
      <ServiceDetail
        eyebrow="Service"
        title="CRM, inventory & operations portals."
        subtitle="The backbone systems your team lives in every day — designed for clarity, speed and the way you actually run the business."
        intro="From lead capture and pipeline management to multi-warehouse inventory, purchase orders, GST-ready invoicing and reporting — we build the operational portals SMEs need. Role-based access, audit logs, integrations with WhatsApp, payments and accounting tools are standard."
        capabilities={[
          "Sales pipeline & CRM",
          "Multi-warehouse inventory",
          "Purchase orders & invoicing",
          "Role-based access & audit logs",
          "WhatsApp / Email / SMS",
          "Reports & dashboards",
        ]}
        outcomes={[
          { v: "1", l: "Source of truth" },
          { v: "30%", l: "Faster ops" },
          { v: "GST", l: "Compliant" },
        ]}
        image={img}
        imageAlt="CRM and inventory management portal for SMEs built by MellowMoon SoftTech"
        whyUs={sharedWhy}
        process={sharedProcess}
        tech={["React","Node.js","Postgres","Redis","WhatsApp API","Razorpay","Stripe","Tally Integration","GST APIs","Reporting"]}
        faqs={sharedFaqs}
      />
    </>
  );
}
