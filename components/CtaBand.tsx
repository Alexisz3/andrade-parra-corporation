import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { WHATSAPP_CONTACTS, BUSINESS_EMAIL } from "@/lib/site";
import ArrowRight from "./icons/ArrowRight";

/**
 * Banda oscura de cierre, presente en todas las páginas.
 *
 * Compactada respecto a la versión anterior: en móvil los teléfonos van en
 * una fila de dos, no apilados con etiquetas repetidas.
 *
 * Sólo datos confirmados. El correo empresarial NO existe todavía y la fila
 * de correo simplemente NO se renderiza: antes se publicaba "Email is being
 * set up — use WhatsApp for now", que es el estado interno de configuración
 * del proyecto asomando en producción. Un sitio terminado no le cuenta al
 * visitante lo que a su dueño le falta por hacer; sencillamente ofrece los
 * canales que sí funcionan. Cuando exista correo real, `BUSINESS_EMAIL` deja
 * de ser `null` y la fila aparece sola.
 */
export default async function CtaBand() {
  const t = await getTranslations("Home");
  const tc = await getTranslations("Contact");

  return (
    <section className="bg-carbon text-bone">
      <div className="mx-auto grid max-w-[1400px] gap-8 px-6 py-14 lg:grid-cols-2 lg:gap-12 lg:px-10 lg:py-24">
        <div>
          <span className="eyebrow text-accent-ink">{t("ctaBandEyebrow")}</span>
          <h2 className="mt-4 max-w-lg text-balance font-display font-semibold leading-tight [font-size:clamp(1.625rem,3.4vw,2.75rem)]">
            {t("ctaBandHeading")}
          </h2>
          <p className="mt-3 max-w-md leading-relaxed text-bone/75">{t("ctaBandBody")}</p>
          <Link
            href="/quote"
            className="mt-6 inline-flex min-h-[48px] w-fit items-center gap-2 bg-accent px-6 text-sm font-medium text-bone transition-colors hover:bg-accent-hover"
          >
            {t("heroCtaPrimary")}
            <ArrowRight />
          </Link>
        </div>

        <div className="self-center">
          <p className="font-mono text-xs uppercase tracking-wider text-bone/55">
            {tc("callLabel")}
          </p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {WHATSAPP_CONTACTS.map((c) => (
              <li key={c.phone}>
                <a
                  href={`tel:+${c.phone}`}
                  className="flex min-h-[48px] flex-col justify-center transition-colors hover:text-accent-ink"
                >
                  <span className="font-mono text-lg">{c.phoneDisplay}</span>
                  <span className="text-xs text-bone/55">{c.name}</span>
                </a>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-3 border-t border-bone/15 pt-5 text-sm">
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-bone/55">{tc("addressLabel")}:</dt>
              <dd>{tc("address")}</dd>
            </div>
            {BUSINESS_EMAIL ? (
              <div className="flex flex-wrap gap-x-2">
                <dt className="text-bone/55">{tc("emailLabel")}:</dt>
                <dd>
                  <a
                    href={`mailto:${BUSINESS_EMAIL}`}
                    className="inline-flex min-h-[44px] items-center hover:text-accent-ink"
                  >
                    {BUSINESS_EMAIL}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>
    </section>
  );
}
