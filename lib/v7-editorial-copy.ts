import "server-only";

import { getTranslations } from "next-intl/server";
import type { V7EditorialCopy } from "@/components/home/V7EditorialSections";

/**
 * Mantiene una sola fuente para los textos editoriales V7 aunque las
 * secciones vivan en páginas distintas. Así la arquitectura multipágina no
 * duplica ni desincroniza traducciones.
 */
export async function getV7EditorialCopy(): Promise<V7EditorialCopy> {
  const [t, tn] = await Promise.all([
    getTranslations("HomeV7"),
    getTranslations("Nav"),
  ]);

  return {
    craftEyebrow: t("craftEyebrow"),
    craftTitle: t("craftTitle"),
    craftBody: t("craftBody"),
    craftCallouts: [t("craftCallout1"), t("craftCallout2"), t("craftCallout3")],
    aboutEyebrow: t("aboutEyebrow"),
    aboutTitle: t("aboutTitle"),
    aboutBody: t("aboutBody"),
    aboutPrinciples: [t("aboutPrinciple1"), t("aboutPrinciple2"), t("aboutPrinciple3")],
    faqEyebrow: t("faqEyebrow"),
    faqTitle: t("faqTitle"),
    faq: [1, 2, 3, 4].map((number) => ({
      question: t(`faqQ${number}`),
      answer: t(`faqA${number}`),
    })),
    contactEyebrow: t("contactEyebrow"),
    contactTitle: t("contactTitle"),
    contactBody: t("contactBody"),
    contactArea: t("contactArea"),
    quote: tn("quote"),
    call: tn("callShort"),
  };
}
