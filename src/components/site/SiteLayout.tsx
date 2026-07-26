import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function SiteLayout({
  children,
  transparentHeader = false,
}: {
  children: ReactNode;
  transparentHeader?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:font-medium focus:outline focus:outline-2 focus:outline-black"
      >
        Skip to main content
      </a>
      <Header transparent={transparentHeader} />
      <main id="main-content" className="flex-1" tabIndex={-1}>{children}</main>
      <Footer />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="bg-maroon text-cream relative overflow-hidden pt-32 md:pt-40">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 20% 30%, var(--gold) 0%, transparent 45%)" }}
        aria-hidden="true"
      />
      <div className="container-x py-20 md:py-24 relative">
        {eyebrow && (
          <div className="text-xs uppercase tracking-[0.25em] text-gold mb-4" aria-hidden="true">{eyebrow}</div>
        )}
        <h1 className="font-display text-4xl md:text-6xl font-medium max-w-4xl leading-[1.05]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-6 max-w-2xl text-cream/80 text-lg leading-relaxed">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
