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
      <section className="v8-home-cta" aria-labelledby="global-cta-title">
        <div className="v7-container v8-home-cta-inner">
          <div>
            <p className="v7-eyebrow">{t("homeCtaEyebrow")}</p>
            <h2 id="global-cta-title">{t("homeCtaTitle")}</h2>
          </div>
          <Link href="/quote" className="v7-button v7-button-amber">
            {t("homeCtaAction")} <span aria-hidden="true">→</span>
          </Link>
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
