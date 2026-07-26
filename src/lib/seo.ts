export const SITE_URL = "https://www.mellowmoonsofttech.com";
export const SITE_NAME = "MellowMoon SoftTech Pvt Ltd";
export const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

export interface SEOMeta {
  title: string;
  description: string;
  canonical: string;
  ogType?: "website" | "article";
  ogImage?: string;
  noindex?: boolean;
}

export function buildTitle(pageTitle: string) {
  return `${pageTitle} | ${SITE_NAME}`;
}

export const PAGE_SEO: Record<string, SEOMeta> = {
  home: {
    title: "MellowMoon SoftTech Pvt Ltd — Engineering Software. Empowering Business.",
    description:
      "Professional Software Development Company — MellowMoon SoftTech builds AI-powered software, web & mobile apps, CRM, inventory and business platforms for SMEs, and trains the next generation of engineers in Nanded, Maharashtra.",
    canonical: SITE_URL,
    ogType: "website",
    ogImage: `${SITE_URL}/og-image.png`,
  },
  about: {
    title: buildTitle("About Us — Software Company in Nanded, Maharashtra"),
    description:
      "Learn about MellowMoon SoftTech Pvt Ltd — a full-stack software studio in Nanded, Maharashtra that partners with founders, SMEs and institutions to ship real software and train engineers.",
    canonical: `${SITE_URL}/about`,
  },
  services: {
    title: buildTitle("Software Development Services — Web, Mobile, AI & CRM"),
    description:
      "Explore MellowMoon SoftTech's full range of services: Agentic AI, web applications, hybrid mobile apps, custom software, CRM & inventory portals, and business websites.",
    canonical: `${SITE_URL}/services`,
  },
  agenticAi: {
    title: buildTitle("Agentic AI Development Services — Autonomous AI Agents"),
    description:
      "Build production-ready AI agents that reason, plan and act inside your workflows. MellowMoon SoftTech delivers LLM-powered systems with RAG, function calling and real guardrails.",
    canonical: `${SITE_URL}/services/agentic-ai`,
  },
  webApps: {
    title: buildTitle("Web Application Development — React, Node.js, TypeScript"),
    description:
      "Production-grade web applications built with React, Next.js, TypeScript and Node.js. Performant, accessible, and engineered for scale by MellowMoon SoftTech.",
    canonical: `${SITE_URL}/services/web-apps`,
  },
  mobileApps: {
    title: buildTitle("Hybrid Mobile App Development — React Native & Expo"),
    description:
      "Cross-platform iOS and Android apps built with React Native and Expo. One codebase, native-feeling speed, shipped fast by MellowMoon SoftTech.",
    canonical: `${SITE_URL}/services/mobile-apps`,
  },
  customSoftware: {
    title: buildTitle("Custom Software Development — End-to-End Build & Delivery"),
    description:
      "Bespoke business software shaped exactly around your operation. MellowMoon SoftTech handles discovery, design, architecture, build, deployment and handover end-to-end.",
    canonical: `${SITE_URL}/services/custom-software`,
  },
  crmInventory: {
    title: buildTitle("CRM & Inventory Management Software for SMEs"),
    description:
      "Sales pipelines, multi-warehouse inventory, GST-ready invoicing and ops dashboards built for Indian SMEs. Role-based access, audit logs and integrations included.",
    canonical: `${SITE_URL}/services/crm-inventory`,
  },
  businessSites: {
    title: buildTitle("Business Website Design — Real Estate, Education & Retail"),
    description:
      "Custom, responsive, SEO-optimised business websites for real estate, educational campuses, beauty studios and retailers. Conversion-focused design by MellowMoon SoftTech.",
    canonical: `${SITE_URL}/services/business-sites`,
  },
  industries: {
    title: buildTitle("Industries We Serve — EdTech, Real Estate, Healthcare & More"),
    description:
      "MellowMoon SoftTech builds software for Education, Beauty & Wellness, Real Estate, Retail, Healthcare and Startups. Domain expertise meets engineering discipline.",
    canonical: `${SITE_URL}/industries`,
  },
  training: {
    title: buildTitle("IT Training & Internship Programs — MERN, Python, Java, AI"),
    description:
      "Structured internship and training programmes for BCA, MCA, Diploma and B.Tech students. Live client projects, 1:1 mentorship and real portfolio work at MellowMoon SoftTech.",
    canonical: `${SITE_URL}/training`,
  },
  portfolio: {
    title: buildTitle("Portfolio — Software Projects Delivered Across Industries"),
    description:
      "Browse MellowMoon SoftTech's portfolio of delivered projects spanning education portals, beauty booking platforms, real estate CRMs, AI copilots and SaaS dashboards.",
    canonical: `${SITE_URL}/portfolio`,
  },
  careers: {
    title: buildTitle("Careers — Join MellowMoon SoftTech's Engineering Team"),
    description:
      "Open roles at MellowMoon SoftTech for Full-Stack Engineers, Mobile Developers, AI Engineers, Product Designers and Interns. Remote-friendly positions based in India.",
    canonical: `${SITE_URL}/careers`,
  },
  contact: {
    title: buildTitle("Contact Us — Start a Project or Apply for Internship"),
    description:
      "Get in touch with MellowMoon SoftTech. Call +91 7058123707 or email mellowmoonsofttech@gmail.com. Start a software project, apply for internship, or discuss a partnership.",
    canonical: `${SITE_URL}/contact`,
  },
};
