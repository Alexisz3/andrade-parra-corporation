import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type AppLocale } from "@/i18n/routing";
import { TERMS_OF_SERVICE } from "@/content/legal";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Términos del servicio.
 *
 * Devuelve 404 mientras `TERMS_OF_SERVICE` sea `null`, que es hoy.
 *
 * Antes esta página SÍ se servía, y su único contenido era un aviso que decía
 * "no debe publicarse sin aprobación" — sobre una página publicada y accesible
 * para cualquiera que tuviera la URL. El aviso estaba además escrito en
 * español dentro del código, de modo que aparecía en español también en la
 * versión inglesa.
 *
 * Un texto legal a medias es peor que ninguno: en una disputa, ese borrador es
 * lo que se le opone a la empresa. La página aparece sola cuando exista el
 * documento revisado.
 */
export const metadata = { robots: { index: false, follow: false } };

export default async function Page({ params }: PageProps<"/[locale]/terms">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  if (!TERMS_OF_SERVICE) notFound();

  const loc = locale as AppLocale;
  const t = await getTranslations("Footer");

  return (
    <PageTransition>
      <Header />
      <main id="contenido" tabIndex={-1} className="bg-paper">
        <div className="mx-auto max-w-3xl px-6 pb-24 pt-36 lg:pt-44">
          <h1 className="font-display text-3xl font-semibold text-ink">
            {TERMS_OF_SERVICE.title[loc] || t("terms")}
          </h1>
          <div className="mt-8 space-y-4">
            {TERMS_OF_SERVICE.body[loc].map((p) => (
              <p key={p} className="text-pretty leading-relaxed text-ink">
                {p}
              </p>
            ))}
          </div>
          <p className="mt-10 border-t border-line pt-6 font-mono text-xs text-muted">
            {TERMS_OF_SERVICE.updated}
          </p>
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
}
