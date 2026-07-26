import { ServiceDetail } from "@/components/site/ServiceDetail";
import { SEOHead } from "@/components/site/SEOHead";
import { WebPageSchema, ServiceSchema } from "@/components/site/Schema";
import { PAGE_SEO } from "@/lib/seo";
import { sharedProcess, sharedWhy, sharedFaqs } from "@/lib/service-extras";
import img from "@/assets/service-ai.jpg";

const seo = PAGE_SEO.agenticAi;

export default function AgenticAiPage() {
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
          { name: "Agentic AI", url: seo.canonical },
        ]}
      />
      <ServiceSchema
        name="Agentic AI Development"
        description="Build production-ready autonomous AI agents that reason, plan and act inside your workflows using LLMs, RAG pipelines and function calling."
        url={seo.canonical}
        serviceType="AI Development"
      />
      <ServiceDetail
        eyebrow="Service"
        title="Agentic AI that gets work done."
        subtitle="We design and ship AI agents that operate inside your data and tools — not chat toys, but production systems."
        intro="From document automation to customer support copilots to internal ops agents, we build LLM-powered systems that reason, plan, call APIs and act with the right guardrails. Built on modern stacks (TypeScript, Python, vector stores, function calling) and integrated cleanly with your existing software."
        capabilities={[
          "Customer support & sales copilots",
          "Document understanding & RAG pipelines",
          "Internal ops & workflow automation",
          "Voice & multimodal agents",
          "Tool / API orchestration",
          "Evaluation, monitoring & guardrails",
        ]}
        outcomes={[
          { v: "10x", l: "Faster ops" },
          { v: "70%", l: "Lower support load" },
          { v: "24/7", l: "Coverage" },
        ]}
        image={img}
        imageAlt="Agentic AI systems and autonomous workflow automation by MellowMoon SoftTech"
        whyUs={sharedWhy}
        process={sharedProcess}
        tech={["Python","TypeScript","LangChain","OpenAI","Anthropic","Pinecone","pgvector","FastAPI","Node.js","Redis"]}
        faqs={sharedFaqs}
      />
    </>
  );
}
