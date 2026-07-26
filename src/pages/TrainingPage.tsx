import { Link } from "react-router-dom";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { SEOHead } from "@/components/site/SEOHead";
import { WebPageSchema } from "@/components/site/Schema";
import { PAGE_SEO } from "@/lib/seo";
import { CheckCircle2, ArrowRight, GraduationCap, Briefcase, Award, Users } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import imgMern from "@/assets/train-mern.jpg";
import imgPyAI from "@/assets/train-python-ai.jpg";
import imgPyFS from "@/assets/train-python-fs.jpg";
import imgJavaFS from "@/assets/train-java-fs.jpg";
import imgLinux from "@/assets/train-linux.jpg";
import imgIntern from "@/assets/train-internship.jpg";

const programs = [
  { img: imgMern, title: "MERN Full Stack", desc: "Master the modern JavaScript stack — MongoDB, Express.js, React and Node.js. Build production-grade single-page applications with REST/GraphQL APIs, JWT authentication, deployment on cloud, CI/CD and real-world projects you can showcase." },
  { img: imgPyAI, title: "Python and Agentic AI", desc: "Master Python from fundamentals to advanced, then build production-ready AI agents using LLMs, LangChain, RAG pipelines, vector databases and function calling. Ideal for students aiming for AI/ML engineering roles." },
  { img: imgPyFS, title: "Python Full Stack", desc: "End-to-end web development with Python — Django, Flask, FastAPI on the backend with React on the frontend, PostgreSQL, REST APIs, authentication and deployment. Build and ship real-world full-stack applications." },
  { img: imgJavaFS, title: "Java Full Stack", desc: "Industry-standard Java stack — Core Java, Spring Boot, Hibernate, REST APIs, React/Angular frontend, MySQL and microservices architecture. The classic enterprise path with modern tooling." },
  { img: imgLinux, title: "Linux and Shell Scripting", desc: "Become comfortable on the command line — Linux fundamentals, file systems, process control, networking, bash scripting, automation, cron jobs and server administration. Essential for DevOps and backend engineers." },
];

const offerings = [
  { icon: GraduationCap, t: "Certified Training", d: "Industry-recognised certificate on successful completion of every program." },
  { icon: Briefcase, t: "Live Projects", d: "Work on real client projects, not toy assignments — code that actually ships." },
  { icon: Users, t: "1:1 Mentorship", d: "Senior engineers review your code weekly and guide your career path." },
  { icon: Award, t: "Placement Support", d: "Resume building, GitHub portfolio, mock interviews and recommendation letters." },
];

const seo = PAGE_SEO.training;

export default function TrainingPage() {
  return (
    <SiteLayout>
      <SEOHead {...seo} />
      <WebPageSchema
        name={seo.title}
        description={seo.description}
        url={seo.canonical}
        breadcrumbs={[
          { name: "Home", url: "https://www.mellowmoonsofttech.com" },
          { name: "Training & Internship", url: seo.canonical },
        ]}
      />
      <PageHero
        eyebrow="Internship & Training"
        title="Explore Our Training Programs"
        subtitle="Discover popular topics and enhance your skills with our expert-led training programs designed for BCA, BSc, MCA, Diploma and B.Tech students."
      />

      <section aria-labelledby="programs-heading" className="container-x py-20">
        <h2 id="programs-heading" className="sr-only">Training programs</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {programs.map((p, i) => (
            <Reveal key={p.title} delay={(i % 3) as 0 | 1 | 2}>
              <article>
                <div className="overflow-hidden bg-secondary/40">
                  <img
                    src={p.img}
                    alt={`${p.title} training program at MellowMoon SoftTech`}
                    width={1280}
                    height={768}
                    loading="lazy"
                    decoding="async"
                    className="w-full aspect-[16/10] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-6 font-display text-2xl">{p.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{p.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section aria-labelledby="internship-heading" className="bg-secondary/40 py-20 border-y border-border">
        <div className="container-x grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <img
              src={imgIntern}
              alt="Students working on live client projects during MellowMoon SoftTech internship program"
              width={1280}
              height={768}
              loading="lazy"
              decoding="async"
              className="w-full aspect-[16/10] object-cover"
            />
          </Reveal>
          <Reveal delay={1}>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-maroon font-medium">Internship Program</div>
              <h2 id="internship-heading" className="font-display text-3xl md:text-4xl mt-3">Internships for BCA, BSc, MCA, Diploma and B.Tech students</h2>
              <p className="mt-5 text-muted-foreground leading-relaxed">
                We run a structured internship program (8–24 weeks) for students from BCA, BSc Computer Science, MCA, Diploma in Computer/IT and B.Tech (CSE/IT/ECE) streams. You join a real engineering team, ship code that goes to production, and graduate with a portfolio that actually means something in interviews.
              </p>
              <ul className="mt-6 grid sm:grid-cols-2 gap-3 text-sm" aria-label="Internship benefits">
                {["Live client projects", "1:1 senior mentor", "Weekly code review", "Portfolio & GitHub", "Interview preparation", "Letter of recommendation", "Stipend for top performers", "Offer of employment available"].map((c) => (
                  <li key={c} className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-maroon shrink-0" aria-hidden="true" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="why-train-heading" className="container-x py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 id="why-train-heading" className="font-display text-3xl md:text-4xl">Why train with MellowMoon</h2>
          <p className="mt-4 text-muted-foreground">A working software company that teaches the way we actually build.</p>
        </div>
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {offerings.map((o, i) => (
            <Reveal key={o.t} delay={(i % 4) as 0 | 1 | 2 | 3}>
              <div className="bg-card border border-border p-8 h-full">
                <o.icon className="h-8 w-8 text-maroon" aria-hidden="true" />
                <h3 className="mt-5 font-display text-xl">{o.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{o.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section aria-labelledby="apply-heading" className="container-x py-20 text-center">
        <h2 id="apply-heading" className="font-display text-3xl md:text-4xl">Ready to apply?</h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Send us your CV and a short note about what you want to build. We'll get back within a week.
        </p>
        <div className="mt-8">
          <Link to="/internship/login" className="inline-flex items-center gap-2 bg-maroon text-cream px-7 py-3.5 font-medium hover:bg-maroon-light">
            Apply now <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
