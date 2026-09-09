import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

interface GlobalCtaProps {
  imageSrc?: string;
  variant?: "default" | "home";
}

export default async function GlobalCta({
  imageSrc = "/images/proyectos/exterior-lujo-01.jpeg",
  variant = "default",
}: GlobalCtaProps) {
  const t = await getTranslations("HomeV7");

  if (variant === "home") {
    return (
      <section className="v8-editorial-cta" aria-labelledby="global-cta-title">
        <div className="v8-editorial-cta-bg"></div>
        <div className="v7-container v8-editorial-cta-inner">
          <div className="v8-editorial-cta-left">
            <p className="v8-editorial-cta-eyebrow">
              SU PROYECTO PUEDE EMPEZAR AQUÍ
            </p>
            <h2 id="global-cta-title" className="v8-editorial-cta-title">
              Conversemos sobre su proyecto.
            </h2>
            <p className="v8-editorial-cta-body">
              Cuéntenos su idea y hagámosla realidad juntos.
            </p>
          </div>
          <div className="v8-editorial-cta-right">
            <Link href="/quote" className="v8-editorial-cta-button">
              Solicitar cotización
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="v7-home-cta" aria-labelledby="global-cta-title">
      <Image
        src={imageSrc}
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="v7-home-cta-overlay" aria-hidden="true" />
      <div className="v7-container v7-home-cta-inner">
        <p className="v7-eyebrow v7-eyebrow-light">{t("homeCtaEyebrow")}</p>
        <h2 id="global-cta-title">{t("homeCtaTitle")}</h2>
        <p>{t("homeCtaBody")}</p>
        <div>
          <Link href="/quote" className="v7-button v7-button-amber">
            {t("homeCtaAction")}
            <span aria-hidden="true">→</span>
          </Link>
          <Link href="/contact" className="v7-button v7-button-ghost-light">
            {t("homeCtaSecondary")}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
