import { useState } from "react";
import { SiteLayout, PageHero } from "@/components/site/SiteLayout";
import { SEOHead } from "@/components/site/SEOHead";
import { WebPageSchema } from "@/components/site/Schema";
import { PAGE_SEO } from "@/lib/seo";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import { createContact } from "@/lib/api";
import { addEnquiry } from "@/lib/adminStore";

const seo = PAGE_SEO.contact;

export default function ContactPage() {
  const [sending, setSending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const payload = {
      name:     (fd.get("name")     as string).trim(),
      company:  (fd.get("company")  as string).trim() || undefined,
      email:    (fd.get("email")    as string).trim(),
      phone:    (fd.get("phone")    as string).trim() || undefined,
      interest: fd.get("interest")  as string,
      message:  (fd.get("message")  as string).trim(),
    };
    try {
      await createContact(payload);
      addEnquiry({
        name: payload.name,
        company: payload.company ?? "",
        email: payload.email,
        phone: payload.phone ?? "",
        service: payload.interest,
        message: payload.message,
      });
      toast.success("Thanks — we'll be in touch within 1 business day.");
      form.reset();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  }

  return (
    <SiteLayout>
      <SEOHead {...seo} />
      <WebPageSchema
        name={seo.title}
        description={seo.description}
        url={seo.canonical}
        breadcrumbs={[
          { name: "Home", url: "https://www.mellowmoonsofttech.com" },
          { name: "Contact", url: seo.canonical },
        ]}
      />
      <PageHero
        eyebrow="Contact"
        title="Tell us what you want to build."
        subtitle="A project, an internship application, a partnership — we'll come back within one business day."
      />

      <section className="container-x py-20 grid lg:grid-cols-[1fr_1.4fr] gap-12">
        <div>
          <h2 className="font-display text-3xl">Get in touch</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Prefer email or a call? We're easy to reach. Otherwise drop the form on the right
            and we'll route it to the right person.
          </p>
          <ul className="mt-8 space-y-5 text-sm">
            <li className="flex gap-3"><Phone className="h-5 w-5 text-maroon mt-0.5" /><div><div className="font-medium">Phone</div><a href="tel:+917058123707" className="text-muted-foreground hover:text-maroon">+91 7058123707</a></div></li>
            <li className="flex gap-3"><Mail className="h-5 w-5 text-maroon mt-0.5" /><div><div className="font-medium">Email</div><a href="mailto:mellowmoonsofttech@gmail.com" className="text-muted-foreground hover:text-maroon break-all">mellowmoonsofttech@gmail.com</a></div></li>
            <li className="flex gap-3"><MapPin className="h-5 w-5 text-maroon mt-0.5" /><div><div className="font-medium">Office</div><div className="text-muted-foreground">Nanded, Maharashtra, India</div></div></li>
          </ul>

          <div className="mt-10 border border-border overflow-hidden">
  <iframe
    title="MellowMoon SoftTech location"
    src="https://www.google.com/maps?q=Anand+Nagar,+Nanded,+Maharashtra&output=embed"
    width="100%"
    height="280"
    style={{ border: 0 }}
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
  />
</div>
        </div>

        <form onSubmit={onSubmit} className="bg-card border border-border p-8 grid gap-5">
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Full name"><input required name="name" className="input" placeholder="Your name" /></Field>
            <Field label="Company"><input name="company" className="input" placeholder="Optional" /></Field>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Email"><input required type="email" name="email" className="input" placeholder="you@company.com" /></Field>
            <Field label="Phone"><input name="phone" className="input" placeholder="+91…" /></Field>
          </div>
          <Field label="What can we help with?">
            <select name="interest" className="input">
              <option>New project</option>
              <option>Agentic AI</option>
              <option>Web application</option>
              <option>Mobile app</option>
              <option>CRM / Inventory</option>
              <option>Business website</option>
              <option>Internship / Training</option>
              <option>Partnership</option>
            </select>
          </Field>
          <Field label="Message">
            <textarea required name="message" rows={5} className="input resize-none" placeholder="Tell us a bit about what you're trying to do." />
          </Field>
          <button disabled={sending} className="mt-2 inline-flex items-center justify-center gap-2 bg-maroon text-cream px-6 py-3.5 font-medium hover:bg-maroon-light disabled:opacity-60 transition-colors">
            {sending ? "Sending…" : <>Send message <Send className="h-4 w-4" /></>}
          </button>
          <p className="text-xs text-muted-foreground">By submitting you agree to be contacted about your enquiry.</p>
        </form>
      </section>

      <style>{`
        .input {
          width: 100%;
          background: var(--background);
          border: 1px solid var(--border);
          padding: 0.7rem 0.85rem;
          font-size: 0.9rem;
          outline: none;
          transition: border-color .15s;
        }
        .input:focus { border-color: var(--maroon); }
      `}</style>
    </SiteLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
