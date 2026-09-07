import { getTranslations } from "next-intl/server";

const STEPS = [1, 2, 3, 4, 5] as const;

/**
 * Proceso en cinco pasos.
 *
 * Los números 01–05 aquí sí son legítimos: el contenido ES una secuencia real
 * y ordenada, así que la numeración transmite información, no decora.
 *
 * Móvil: carril horizontal con snap, sin cinco bloques apilados.
 * Escritorio: tarjetas conectadas en una secuencia editorial V7.
 *
 * Sin JavaScript el carril sigue siendo desplazable y los cinco pasos siguen
 * presentes en el HTML: nada queda oculto tras interacción obligatoria.
 */
export default async function ProcessTimeline({ tone = "light" }: { tone?: "light" | "dark" }) {
  const t = await getTranslations("Process");
  const isDark = tone === "dark";

  return (
    <ol
      // Alcanzable por teclado para poder desplazar el carril con las flechas.
      tabIndex={0}
      className={`v7-process-timeline ${isDark ? "v7-process-timeline-dark" : ""}`}
    >
      {STEPS.map((n) => (
        <li key={n}>
          <span className="v7-process-number" aria-hidden="true">{String(n).padStart(2, "0")}</span>
          <div className="v7-process-card">
            <span className="v7-process-mark" aria-hidden="true" />
            <h3>{t(`step${n}Title`)}</h3>
            <p>{t(`step${n}Body`)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
