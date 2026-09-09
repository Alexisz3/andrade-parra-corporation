import { getTranslations } from "next-intl/server";
import { TRUST_SIGNALS } from "@/content/company";

const ICONS = {
  serviceArea: <path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Zm0-8a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />,
  residentialCommercial: <><path d="M4 21V8l8-5 8 5v13M9 21v-5h6v5M8 11h.01M16 11h.01" /></>,
  freeEstimates: <><path d="M7 3h8l3 3v15H7z" /><path d="M15 3v4h4M10 12h5M10 16h5" /></>,
  bilingual: <><path d="M4 5h10a4 4 0 0 1 4 4v3a4 4 0 0 1-4 4H9l-4 3v-4a4 4 0 0 1-3-3V9a4 4 0 0 1 2-4Z" /><path d="M7 10h.01M11 10h.01M15 10h.01" /></>,
} as const;

/**
 * Franja de confianza bajo el hero.
 *
 * Cada afirmación es verificable HOY, sin depender de datos que el cliente no
 * ha confirmado:
 *
 *   · zona de servicio  — declarada por el cliente en el formulario (Q4)
 *   · residencial y comercial — marcado por el cliente en Q15
 *   · presupuesto sin costo   — cierto: el formulario de cotización es gratuito
 *   · inglés y español        — comprobable en este mismo sitio
 *
 * Lo que NO aparece, y no debe aparecer sin documento firmado: años de
 * experiencia, número de obras, licencia, seguro, premios o garantías. Son
 * exactamente las cifras que un propietario podría verificar y que, si no
 * cuadran, destruyen la confianza que esta franja pretende construir.
 *
 * Los iconos son trazos propios, mínimos y semánticos: acompañan a la
 * información sin convertir la franja en una colección de tarjetas.
 */
export default async function TrustBar() {
  const t = await getTranslations("Home");

  const LABELS: Record<(typeof TRUST_SIGNALS)[number], string> = {
    serviceArea: t("trustServiceArea"),
    residentialCommercial: t("trustResidentialCommercial"),
    freeEstimates: t("trustFreeEstimates"),
    bilingual: t("trustBilingual"),
  };
  const DETAILS: Record<(typeof TRUST_SIGNALS)[number], string> = {
    serviceArea: t("trustServiceAreaDetail"),
    residentialCommercial: t("trustResidentialCommercialDetail"),
    freeEstimates: t("trustFreeEstimatesDetail"),
    bilingual: t("trustBilingualDetail"),
  };

  return (
    <section className="v8-trust-bar" aria-label={t("trustServiceArea")}>
      <div className="v7-container">
        <ul className="v8-trust-list">
          {TRUST_SIGNALS.map((signal, i) => (
            <li
              key={signal}
              className={i > 0 ? "has-divider" : undefined}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">{ICONS[signal]}</svg>
              <div>
                <strong>{LABELS[signal]}</strong>
                <span>{DETAILS[signal]}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
