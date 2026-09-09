import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { getFeaturedProjects, type ProjectCategory } from "@/content/projects";
import { getPublishedServices } from "@/content/services";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StructuredData from "@/components/StructuredData";
import TrustBar from "@/components/home/TrustBar";
import V7HeroPremium from "@/components/home/V7HeroPremium";
import {
  V7AboutPreview,
  V7FeaturedProjects,
  V7ServicesPreview,
} from "@/components/home/V7HomePreviews";
import GlobalCta from "@/components/GlobalCta";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale: rawLocale } = await params;
  if (!hasLocale(routing.locales, rawLocale)) notFound();
  const locale = rawLocale as AppLocale;
  setRequestLocale(locale);

  const [t, tn, tp] = await Promise.all([
    getTranslations("HomeV7"),
    getTranslations("Nav"),
    getTranslations("Projects"),
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
          projects={getFeaturedProjects()}
          copy={{
            eyebrow: t("heroEyebrow"),
            titleLead: t("heroTitleLead"),
            titleAccent: t("heroTitleAccent"),
            body: t("heroBody"),
            quote: tn("quote"),
            projects: tn("projects"),
            currentProject: t("currentProject"),
            viewProject: t("viewProject"),
            similar: t("similar"),
            directContact: t("directContact"),
            previous: t("previous"),
            next: t("next"),
            pause: t("pause"),
            resume: t("resume"),
            category,
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
          }}
        />
        <V7ServicesPreview
          services={getPublishedServices()}
          locale={locale}
          copy={{
            eyebrow: t("servicesPreviewEyebrow"),
            title: t("servicesPreviewTitle"),
            body: t("servicesPreviewBody"),
            action: t("servicesPreviewAction"),
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
        <GlobalCta variant="home" />
      </main>
      <Footer />
    </>
  );
}
