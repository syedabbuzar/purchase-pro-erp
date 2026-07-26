import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import hero1 from "@/assets/hero.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

type Slide = {
  img: string;
  eyebrow: string;
  title: string;
  accent: string;
  desc: string;
  cta: { label: string; to: string };
  tag: string;
};

const slides: Slide[] = [
  {
    img: hero1,
    eyebrow: "MellowMoon SoftTech Pvt Ltd",
    title: "Engineering Software.",
    accent: "Empowering Business.",
    desc: "AI-powered software, web and mobile platforms, and business systems engineered for measurable outcomes.",
    cta: { label: "Explore Services", to: "/services" },
    tag: "01 / Software",
  },
  {
    img: hero2,
    eyebrow: "Agentic AI",
    title: "Intelligence that ships.",
    accent: "Agents that act.",
    desc: "Autonomous AI agents that reason, plan and execute inside your real workflows — not demos.",
    cta: { label: "Discover AI", to: "/services/agentic-ai" },
    tag: "02 / Artificial Intelligence",
  },
  {
    img: hero3,
    eyebrow: "Training & Internships",
    title: "Building the next generation",
    accent: "of engineers.",
    desc: "Live client projects, senior mentorship and a real portfolio for BCA, MCA, Diploma and Engineering students.",
    cta: { label: "Apply for Internship", to: "/training" },
    tag: "03 / Education",
  },
];

export function HeroCarousel() {
  const [idx, setIdx] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);

  const go = useCallback((n: number) => {
    setPrev(idx);
    setIdx((p) => (p + n + slides.length) % slides.length);
  }, [idx]);

  useEffect(() => {
    const id = setInterval(() => {
      setPrev(idx);
      setIdx((p) => (p + 1) % slides.length);
    }, 7000);
    return () => clearInterval(id);
  }, [idx]);

  const s = slides[idx];

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: "#040D1A", minHeight: "100vh" }}
      aria-label="Hero carousel"
    >
      {/* Fullscreen background images — decorative */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === idx ? 1 : 0, zIndex: 1 }}
          aria-hidden="true"
        >
          <img
            src={slide.img}
            alt=""
            role="presentation"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: "brightness(0.35)" }}
            {...(i === 0 ? { fetchPriority: "high" } as Record<string, string> : { loading: "lazy" })}
          />
        </div>
      ))}

      {/* Gradient overlays */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(90deg,rgba(4,13,26,0.95) 0%,rgba(4,13,26,0.55) 60%,rgba(4,13,26,0.2) 100%)", zIndex: 2 }} aria-hidden="true" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(0deg,rgba(4,13,26,0.9) 0%,transparent 40%)", zIndex: 2 }} aria-hidden="true" />

      {/* Gold line top left */}
      <div className="absolute" style={{ top: 0, left: 0, width: "30%", height: 3, background: "linear-gradient(90deg,#C9A84C,transparent)", zIndex: 10 }} aria-hidden="true" />

      {/* Geometric diamond accents */}
      <div className="absolute hidden md:block" style={{ right: "4rem", top: "50%", transform: "translateY(-50%)", width: 480, height: 480, border: "1px solid rgba(201,168,76,0.12)", rotate: "45deg", zIndex: 3 }} aria-hidden="true" />
      <div className="absolute hidden md:block" style={{ right: "5.5rem", top: "50%", transform: "translateY(-50%)", width: 380, height: 380, border: "1px solid rgba(201,168,76,0.06)", rotate: "45deg", zIndex: 3 }} aria-hidden="true" />

      {/* Slide dot indicators */}
      <div className="absolute top-40 right-10 hidden xl:flex flex-col items-center gap-2" style={{ zIndex: 10 }} role="tablist" aria-label="Slide indicators">
        {slides.map((sl, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === idx}
            aria-label={`Go to slide ${i + 1}: ${sl.title} ${sl.accent}`}
            onClick={() => { setPrev(idx); setIdx(i); }}
            className="transition-all duration-400"
            style={{ height: i === idx ? 36 : 20, width: 2, background: i === idx ? "linear-gradient(180deg,#E2C878,#C9A84C)" : "rgba(250,251,252,0.2)" }}
          />
        ))}
        <span className="font-mono text-[10px] mt-1 tracking-widest" style={{ color: "rgba(250,251,252,0.35)" }} aria-hidden="true">0{idx + 1}</span>
      </div>

      {/* Live region for screen reader slide changes */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Slide {idx + 1} of {slides.length}: {s.title} {s.accent}
      </div>

      {/* Content */}
      <div className="container-x relative flex items-center" style={{ minHeight: "100vh", zIndex: 5 }}>
        <div className="max-w-2xl w-full pt-32 pb-24">
          <div key={`tag-${idx}`} className="opacity-0 animate-[fadeIn_0.6s_ease-out_0.2s_forwards] mb-8 inline-flex items-center gap-3" aria-hidden="true">
            <span className="h-px w-10" style={{ background: "linear-gradient(90deg,#C9A84C,#E2C878)" }} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.35em]" style={{ color: "#C9A84C" }}>{s.eyebrow}</span>
          </div>

          <div key={`h-${idx}`} className="opacity-0 animate-[fadeUp_0.9s_ease-out_0.3s_forwards]">
            <h1 className="font-display font-medium leading-[1.02]" style={{ fontSize: "clamp(2.5rem,6vw,5rem)", color: "#FAFBFC" }}>
              {s.title}<br />
              <span style={{ color: "#C9A84C" }}>{s.accent}</span>
            </h1>
          </div>

          <div key={`d-${idx}`} className="opacity-0 animate-[fadeUp_0.9s_ease-out_0.45s_forwards]">
            <p className="mt-7 text-base md:text-lg leading-relaxed max-w-lg" style={{ color: "rgba(250,251,252,0.68)" }}>{s.desc}</p>
          </div>

          <div key={`c-${idx}`} className="opacity-0 animate-[fadeUp_0.9s_ease-out_0.6s_forwards] mt-10 flex flex-wrap gap-4">
            <Link
              to={s.cta.to}
              className="group inline-flex items-center gap-0 overflow-hidden text-sm font-medium tracking-wide"
              style={{ background: "linear-gradient(135deg,#C9A84C,#A07C30)", color: "#040D1A" }}
            >
              <span className="px-7 py-4">{s.cta.label}</span>
              <span className="flex items-center justify-center h-full w-12 transition-all duration-300 group-hover:w-14" style={{ background: "rgba(4,13,26,0.25)" }} aria-hidden="true">
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-7 py-4 text-sm font-medium transition-all duration-300"
              style={{ border: "1px solid rgba(201,168,76,0.35)", color: "rgba(250,251,252,0.85)", background: "rgba(201,168,76,0.04)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#C9A84C"; e.currentTarget.style.background = "rgba(201,168,76,0.1)"; e.currentTarget.style.color = "#C9A84C"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)"; e.currentTarget.style.background = "rgba(201,168,76,0.04)"; e.currentTarget.style.color = "rgba(250,251,252,0.85)"; }}
            >
              Talk to us
            </Link>
          </div>

          <div key={`tg-${idx}`} className="opacity-0 animate-[fadeIn_0.6s_ease-out_0.8s_forwards] mt-16 text-[10px] uppercase tracking-[0.3em]" style={{ color: "rgba(250,251,252,0.3)" }} aria-hidden="true">{s.tag}</div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => go(-1)}
        aria-label="Previous slide"
        className="absolute bottom-12 right-24 z-10 h-12 w-12 grid place-items-center transition-all duration-300"
        style={{ border: "1px solid rgba(201,168,76,0.3)", color: "rgba(250,251,252,0.7)", background: "rgba(4,13,26,0.5)" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#C9A84C"; e.currentTarget.style.color = "#C9A84C"; e.currentTarget.style.background = "rgba(201,168,76,0.1)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)"; e.currentTarget.style.color = "rgba(250,251,252,0.7)"; e.currentTarget.style.background = "rgba(4,13,26,0.5)"; }}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Next slide"
        className="absolute bottom-12 right-10 z-10 h-12 w-12 grid place-items-center transition-all duration-300"
        style={{ background: "linear-gradient(135deg,#C9A84C,#A07C30)", color: "#040D1A" }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg,#E2C878,#C9A84C)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg,#C9A84C,#A07C30)"; }}
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: 2, background: "rgba(255,255,255,0.05)", zIndex: 10 }} aria-hidden="true">
        <div key={idx} className="h-full" style={{ background: "linear-gradient(90deg,#C9A84C,#E2C878)", animation: "progressBar 7s linear forwards" }} />
      </div>

      <style>{`
        @keyframes progressBar {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </section>
  );
}
