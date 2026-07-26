import { ServiceDetail } from "@/components/site/ServiceDetail";
import { SEOHead } from "@/components/site/SEOHead";
import { WebPageSchema, ServiceSchema } from "@/components/site/Schema";
import { PAGE_SEO } from "@/lib/seo";
import { sharedProcess, sharedWhy, sharedFaqs } from "@/lib/service-extras";
import img from "@/assets/service-mobile.jpg";

const seo = PAGE_SEO.mobileApps;

export default function MobileAppsPage() {
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
          { name: "Hybrid Mobile Apps", url: seo.canonical },
        ]}
      />
      <ServiceSchema
        name="Hybrid Mobile App Development"
        description="Cross-platform iOS and Android apps built with React Native and Expo. One codebase, native-feeling speed, shipped fast."
        url={seo.canonical}
        serviceType="Mobile App Development"
      />
      <ServiceDetail
        eyebrow="Service"
        title="Hybrid mobile apps, native-feeling speed."
        subtitle="React Native and Expo apps that ship to iOS, Android and the web from one codebase — without the usual hybrid compromises."
        intro="We build cross-platform mobile apps for startups and SMEs that need to move fast without doubling engineering cost. From MVPs to production apps with offline support, push notifications, payments and native modules, we cover the full lifecycle including store submissions and OTA updates."
        capabilities={[
          "React Native / Expo",
          "Native modules where needed",
          "Offline-first architecture",
          "Payments & push notifications",
          "App Store & Play submissions",
          "OTA updates & monitoring",
        ]}
        outcomes={[
          { v: "1", l: "Codebase" },
          { v: "2x", l: "Faster ship" },
          { v: "60fps", l: "UI" },
        ]}
        image={img}
        imageAlt="Hybrid mobile app development with React Native and Expo by MellowMoon SoftTech"
        whyUs={sharedWhy}
        process={sharedProcess}
        tech={["React Native","Expo","TypeScript","Firebase","Supabase","Stripe","Push Notifications","OTA Updates","App Store","Play Store"]}
        faqs={sharedFaqs}
      />
    </>
  );
}
