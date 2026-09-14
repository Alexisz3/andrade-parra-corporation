import { MISSION_VISION } from "@/content/company";
import type { AppLocale } from "@/i18n/routing";

export interface MissionVisionCopy {
  eyebrow: string;
  missionLabel: string;
  visionLabel: string;
}

/**
 * Misión y visión — visible justo al entrar al Home, como se pidió.
 *
 * El texto de misión/visión NO viene por `copy` (esas son solo las
 * etiquetas de interfaz): se lee directamente de `MISSION_VISION` en
 * `content/company.ts`, que vale `null` hasta que el cliente confirme la
 * declaración real (ver el comentario ahí). Mientras tanto este componente
 * no renderiza nada — nunca un placeholder ni un texto de relleno. Sin
 * estado ni efectos, es un componente de servidor: `locale` llega por prop
 * igual que en el resto de secciones del Home.
 */
export default function V7MissionVision({ copy, locale }: { copy: MissionVisionCopy; locale: AppLocale }) {
  if (!MISSION_VISION) return null;

  return (
    <section className="v8-mission v7-scroll-reveal" aria-labelledby="mission-vision-title">
      <div className="v7-container">
        <p className="v8-mission-eyebrow" id="mission-vision-title">
          {copy.eyebrow}
        </p>
        <div className="v8-mission-grid">
          <div>
            <p className="v8-mission-label">{copy.missionLabel}</p>
            <p className="v8-mission-text">{MISSION_VISION.mission[locale]}</p>
          </div>
          <div>
            <p className="v8-mission-label">{copy.visionLabel}</p>
            <p className="v8-mission-text">{MISSION_VISION.vision[locale]}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
