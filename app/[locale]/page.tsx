import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { getFeaturedProjects, type ProjectCategory } from "@/content/projects";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StructuredData from "@/components/StructuredData";
import TrustBar from "@/components/home/TrustBar";
import V7HeroPremium from "@/components/home/V7HeroPremium";
import V7FeaturedProjects from "@/components/home/V7FeaturedProjects";
import V7ServicesTeaser from "@/components/home/V7ServicesTeaser";
import { V7AboutPreview } from "@/components/home/V7HomePreviews";
import GlobalCta from "@/components/GlobalCta";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale: rawLocale } = await params;
  if (!hasLocale(routing.locales, rawLocale)) notFound();
  const locale = rawLocale as AppLocale;
  setRequestLocale(locale);

  const [t, tn, tp, th] = await Promise.all([
    getTranslations("HomeV7"),
    getTranslations("Nav"),
    getTranslations("Projects"),
    getTranslations("Home"),
  ]);

  const category: Record<ProjectCategory, string> = {
    kitchens: tp("filterKitchens"),
    bathrooms: tp("filterBathrooms"),
    exteriors: tp("filterExteriors"),
    structures: tp("filterStructures"),
    interiors: tp("filterInteriors"),
  };

  return (
    <>
      <StructuredData />
      <Header />
      <main id="contenido" tabIndex={-1}>
        <V7HeroPremium
          copy={{
            eyebrow: t("heroEyebrow"),
            titleLead: t("heroTitleLead"),
            titleAccent: t("heroTitleAccent"),
            body: t("heroBody"),
            quote: tn("quote"),
            projects: tn("projects"),
            // Dato de lugar ya usado tal cual en content/projects.ts; alcance
            // tomado de la banda de confianza, no es copy nuevo.
            metaLocation: "Houston, TX",
            metaScope: th("trustResidentialCommercial"),
          }}
        />
        <TrustBar />
        <V7FeaturedProjects
          projects={getFeaturedProjects()}
          locale={locale}
          category={category}
          copy={{
            eyebrow: t("featuredPreviewEyebrow"),
            title: t("featuredPreviewTitle"),
            body: t("featuredPreviewBody"),
            action: t("featuredPreviewAction"),
            viewProject: t("viewProject"),
            footer: t("featuredPreviewFooter"),
          }}
        />
        <V7ServicesTeaser
          copy={{
            eyebrow: t("servicesPreviewEyebrow"),
            title: t("servicesPreviewTitle"),
            body: t("servicesPreviewBody"),
            action: t("servicesPreviewAction"),
            rows: [
              { title: t("servicesPreviewRow1Title"), body: t("servicesPreviewRow1Body") },
              { title: t("servicesPreviewRow2Title"), body: t("servicesPreviewRow2Body") },
              { title: t("servicesPreviewRow3Title"), body: t("servicesPreviewRow3Body") },
            ],
          }}
        />
        <V7AboutPreview
          copy={{
            eyebrow: t("aboutPreviewEyebrow"),
            title: t("aboutPreviewTitle"),
            body: t("aboutPreviewBody"),
            action: t("aboutPreviewAction"),
          }}
        />
        <GlobalCta />
      </main>
      <Footer />
    </>
  );
}
