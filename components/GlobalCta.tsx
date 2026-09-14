import type { ComponentProps } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

interface GlobalCtaProps {
  variant?: "default" | "home";
  /** Sólo `variant="default"`: copy propio por página. Sin ellos cae en el
   *  contenido de Proyectos (`ctaEyebrow`/`ctaTitle`), que es el genérico. */
  eyebrow?: string;
  /** Puede llevar un `\n` para forzar el corte de línea del titular serif,
   *  igual que en el resto de portadas (V7EditorialCover, Featured Projects). */
  title?: string;
  body?: string;
  secondaryLabel?: string;
  secondaryHref?: ComponentProps<typeof Link>["href"];
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5.5h16v11H9l-4.5 3.5v-3.5H4z" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5.5" y="4.5" width="13" height="16" rx="1.5" />
      <path d="M9 4.5V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v.5M8.5 10.5h7M8.5 14h7M8.5 17.5h4.5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3.5 5 6v6c0 4.5 3 7.5 7 8.5 4-1 7-4 7-8.5V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function renderTitle(title: string) {
  const lines = title.split("\n");
  return lines.flatMap((line, index) => (index === 0 ? [line] : [<br key={index} />, line]));
}

/**
 * CTA de cierre compartido — Proyectos, Servicios, Nosotros, Preguntas y las
 * páginas de detalle de proyecto/servicio/proceso. Composición fija (foto
 * arquitectónica a sangre + texto sobre la zona clara de la izquierda); lo
 * único que cambia por página es el copy, vía props. `variant="home"` es una
 * sección aparte —el cierre del home— y no se toca aquí.
 */
export default async function GlobalCta({
  variant = "default",
  eyebrow,
  title,
  body,
  secondaryLabel,
  secondaryHref = "/contact",
}: GlobalCtaProps) {
  const t = await getTranslations("HomeV7");

  if (variant === "home") {
    return (
      <section className="v8-editorial-cta" aria-labelledby="global-cta-title">
        <div className="v8-editorial-cta-bg"></div>
        <div className="v7-container v8-editorial-cta-inner">
          <div className="v8-editorial-cta-left">
            <p className="v8-editorial-cta-eyebrow">
              {t("homeCtaEyebrow")}
            </p>
            <h2 id="global-cta-title" className="v8-editorial-cta-title">
              {t("homeCtaTitle")}
            </h2>
            <p className="v8-editorial-cta-body">
              {t("homeCtaHomeBody")}
            </p>
          </div>
          <div className="v8-editorial-cta-right">
            <Link href="/quote" className="v8-editorial-cta-button">
              {t("homeCtaAction")}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="v7-cta2" aria-labelledby="global-cta-title">
      <div className="v7-cta2-media" aria-hidden="true">
        {/* `250vw` en móvil: mismo motivo que el resto de fondos a sangre del
            sitio — con `object-cover` en una franja que en celular queda más
            alta que ancha, "100vw" describe solo el ancho y se queda corto,
            así que Next servía una variante que el navegador terminaba
            estirando. Ver V7Hero.tsx para el detalle completo. */}
        <Image
          src="/images/heroes/cta-arquitectura-patio.jpg"
          alt=""
          fill
          sizes="(min-width: 768px) 100vw, 250vw"
          className="object-cover"
        />
        <div className="v7-cta2-wash" />
      </div>

      <div className="v7-container v7-cta2-inner">
        <div className="v7-cta2-copy">
          <p className="v7-cta2-eyebrow">
            <span className="v7-cta2-eyebrow-rule" aria-hidden="true" />
            {eyebrow ?? t("ctaEyebrow")}
          </p>
          <h2 id="global-cta-title" className="v7-cta2-title">
            {renderTitle(title ?? t("ctaTitle"))}
          </h2>
          <p className="v7-cta2-body">{body ?? t("ctaBody")}</p>

          <div className="v7-cta2-actions">
            <Link href="/quote" className="v7-cta2-btn v7-cta2-btn-primary">
              {t("ctaAction")}
              <span aria-hidden="true">→</span>
            </Link>
            <Link href={secondaryHref} className="v7-cta2-btn v7-cta2-btn-secondary">
              {secondaryLabel ?? t("ctaSecondary")}
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <ul className="v7-cta2-benefits">
            <li><ChatIcon />{t("ctaBenefitAttention")}</li>
            <li><ClipboardIcon />{t("ctaBenefitProcess")}</li>
            <li><ShieldIcon />{t("ctaBenefitCommitment")}</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
