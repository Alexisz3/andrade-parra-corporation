import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { StaticPathname, AppLocale } from "@/i18n/routing";
import { SERVICES } from "@/content/services";
import { SERVICE_AREA } from "@/content/company";
import { WHATSAPP_CONTACTS, BUSINESS_EMAIL, BUSINESS, BRAND } from "@/lib/site";
import BrandLogo from "./BrandLogo";

const COMPANY_LINKS: {
  href: StaticPathname;
  key: "about" | "projects" | "process" | "faq" | "contact";
}[] = [
  { href: "/about", key: "about" },
  { href: "/projects", key: "projects" },
  { href: "/process", key: "process" },
  { href: "/faq", key: "faq" },
  { href: "/contact", key: "contact" },
];

/**
 * Pie corporativo.
 *
 * Antes era una sola fila de cinco enlaces. Ahora agrupa por intención —
 * servicios, empresa, contacto — que es como un visitante busca al final de
 * la página: o quiere un servicio concreto, o quiere saber quién es la
 * empresa, o quiere llamar.
 *
 * El correo solo aparece si existe de verdad. El año es dinámico: un pie con
 * el año congelado es la señal más barata de que un sitio está abandonado.
 */
export default async function Footer() {
  const t = await getTranslations("Footer");
  const tn = await getTranslations("Nav");
  const tc = await getTranslations("Contact");
  const locale = (await getLocale()) as AppLocale;
  const year = new Date().getFullYear();

  const services = SERVICES.filter((s) => s.published);

  return (
    <footer className="bg-carbon-raised text-bone">
      <div className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10 lg:py-14">
        <div className="grid gap-10 border-b border-bone/15 pb-8 sm:grid-cols-2 lg:grid-cols-4 lg:pb-12">
          {/* ── Marca ── */}
          <div>
            <BrandLogo variant="horizontal" size={34} tone="light" className="text-bone" />
            <p className="mt-3 max-w-xs text-pretty text-sm leading-relaxed text-bone/60">
              {t("tagline")}
            </p>
          </div>

          {/* ── Servicios ── */}
          <nav aria-label={t("servicesHeading")}>
            <h2 className="font-mono text-xs uppercase tracking-wider text-bone/50">
              {t("servicesHeading")}
            </h2>
            <ul className="mt-3">
              {services.map((s) => (
                <li key={s.id}>
                  <Link
                    href={{ pathname: "/services/[slug]", params: { slug: s.slugs[locale] } }}
                    className="flex min-h-[44px] items-center text-sm text-bone/85 decoration-brand underline-offset-4 transition-colors hover:text-bone hover:underline"
                  >
                    {s.title[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Empresa ── */}
          <nav aria-label={t("companyHeading")}>
            <h2 className="font-mono text-xs uppercase tracking-wider text-bone/50">
              {t("companyHeading")}
            </h2>
            <ul className="mt-3">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="flex min-h-[44px] items-center text-sm text-bone/85 decoration-brand underline-offset-4 transition-colors hover:text-bone hover:underline"
                  >
                    {tn(l.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Contacto ── */}
          <div>
            <h2 className="font-mono text-xs uppercase tracking-wider text-bone/50">
              {t("contactHeading")}
            </h2>
            <ul className="mt-3">
              {WHATSAPP_CONTACTS.map((c) => (
                <li key={c.phone}>
                  <a
                    href={`tel:+${c.phone}`}
                    className="flex min-h-[44px] items-center font-mono text-sm text-bone/85 decoration-brand underline-offset-4 transition-colors hover:text-bone hover:underline"
                  >
                    {c.phoneDisplay}
                  </a>
                </li>
              ))}
              {BUSINESS_EMAIL ? (
                <li>
                  <a
                    href={`mailto:${BUSINESS_EMAIL}`}
                    className="flex min-h-[44px] items-center text-sm text-bone/85 decoration-brand underline-offset-4 transition-colors hover:text-bone hover:underline"
                  >
                    {BUSINESS_EMAIL}
                  </a>
                </li>
              ) : null}
            </ul>
            {/* Con oficina que recibe clientes se publica la dirección: es un
                factor fuerte de SEO local y un dato que el visitante busca en
                el pie. Sin local visitable se afirma solo la zona. */}
            {SERVICE_AREA.hasPublicOffice ? (
              <address className="mt-2 not-italic text-sm leading-relaxed text-bone/60">
                {BUSINESS.streetAddress}
                <br />
                {BUSINESS.city}, {BUSINESS.region} {BUSINESS.postalCode}
              </address>
            ) : (
              <p className="mt-2 text-sm text-bone/60">{tc("address")}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-6">
          <p className="font-mono text-xs text-bone/50">
            &copy; {year} {BRAND.name}. {t("rights")}
          </p>
          {/*
            Los enlaces legales existen como rutas pero permanecen fuera de la
            navegación pública hasta que el contenido sea revisado por el
            cliente. Ver AUDITORIA_Y_PLAN_AMPARGO.md §13.
          */}
        </div>
      </div>
    </footer>
  );
}
