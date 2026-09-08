import Image from "next/image";
import { BRAND } from "@/lib/site";

/**
 * Logotipos de Andrade Parra Corporation.
 *
 * Las variantes heredadas mantienen el símbolo como SVG en línea y el nombre
 * como texto HTML. `approved` es la excepción deliberada: usa el PNG
 * transparente exacto embebido en el HTML V7 aprobado para no reconstruir ni
 * reinterpretar la nueva firma gráfica.
 *
 *  · El texto real se lee, se selecciona, se traduce y lo anuncia un lector de
 *    pantalla; un nombre convertido en trazado es una imagen muda.
 *  · La tipografía usa la misma Space Grotesk ya cargada por la página, así
 *    que no hay una segunda descarga ni un salto de fuente.
 *  · Los colores salen de `currentColor`, de modo que una misma pieza sirve
 *    sobre fondo claro y sobre fondo oscuro sin duplicar archivos.
 *
 * Los SVG de `public/brand/` siguen existiendo para uso externo — papelería,
 * firma de correo, imprenta, Google Business Profile — donde sí hace falta el
 * archivo completo y autónomo.
 */

type Variant = "horizontal" | "compact" | "stacked" | "approved";

interface BrandLogoProps {
  /** `approved`: firma V7 oficial. Las demás variantes se conservan para piezas existentes. */
  variant?: Variant;
  /**
   * `true` cuando el logotipo es el único enlace al inicio y necesita nombre
   * accesible. `false` cuando ya hay texto contiguo que lo nombra, para no
   * duplicar el anuncio en el lector de pantalla.
   */
  decorative?: boolean;
  /** Alto del símbolo en px. El texto escala con él. */
  size?: number;
  className?: string;
  /** Versión cromática del archivo corporativo. */
  tone?: "light" | "dark";
}

/**
 * Isotipo. Sin `width`/`height` fijos: la altura la fija el contenedor y el
 * `viewBox` mantiene la proporción, así el símbolo nunca se deforma.
 *
 * La A y el cuenco heredan `currentColor`; solo el travesaño conserva el rojo
 * de marca, que es la única nota de color que sobrevive a la inversión sobre
 * fondo oscuro.
 *
 * Es TRAZO, no relleno: `fill="none"` con `strokeWidth` y remates redondos.
 * Quitar cualquiera de esos tres atributos no rompe nada visiblemente en el
 * navegador —el trazado sigue estando— pero devuelve el símbolo a la versión
 * anterior de esquinas vivas, que es un cambio de marca disfrazado de detalle.
 */
function Mark({ size, accent = true }: { size: number; accent?: boolean }) {
  return (
    <svg
      viewBox="0 0 80 64"
      height={size}
      width={(size * 80) / 64}
      fill="none"
      stroke="currentColor"
      strokeWidth={9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="flex-none"
    >
      {/*
        Geometría espejo de qa/build-brand.mjs, que es la fuente. Si se toca
        allí, se toca aquí — y al revés, esto no se toca sin tocar allí.

        El travesaño va PRIMERO: la riostra de la A pasa por encima y deja la
        diagonal continua, con el rojo visible solo en el vano.
      */}
      <path d="M20 42.5 H41.5" stroke={accent ? "#B8452F" : "currentColor"} />
      <path d="M11 54 L46 10 V54" />
      <path d="M46 15 H56 A11.5 11.5 0 0 1 56 38 H46" />
    </svg>
  );
}

export default function BrandLogo({
  variant = "horizontal",
  decorative = false,
  size = 28,
  className = "",
  tone = "light",
}: BrandLogoProps) {
  const accessibleName = `${BRAND.name} — ${BRAND.descriptor}`;

  if (variant === "approved") {
    return (
      <span className={`inline-flex items-center ${className}`}>
        <Image
          src="/brand/logo-v7-approved.png"
          width={429}
          height={60}
          sizes="(max-width: 560px) 174px, (max-width: 1180px) 250px, 345px"
          alt=""
          aria-hidden="true"
          className="h-auto w-full object-contain"
          preload={tone === "light"}
        />
        {decorative ? null : <span className="sr-only">{BRAND.name}</span>}
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <span className={`inline-flex items-center ${className}`}>
        <Mark size={size} />
        {decorative ? null : <span className="sr-only">{accessibleName}</span>}
      </span>
    );
  }

  if (variant === "stacked") {
    return (
      <span className={`inline-flex flex-col items-center gap-2 ${className}`}>
        <Mark size={size} />
        <span className="flex flex-col items-center leading-none">
          <span className="font-display font-bold tracking-tight" style={{ fontSize: size * 0.52 }}>
            ANDRADE PARRA
          </span>
          <span
            className="mt-1 font-display font-medium tracking-[0.16em]"
            style={{ fontSize: size * 0.3 }}
          >
            CORPORATION
          </span>
          <span
            className="mt-1.5 font-display font-medium tracking-[0.24em] opacity-70"
            style={{ fontSize: size * 0.22 }}
          >
            GENERAL REMODELING
          </span>
        </span>
        {decorative ? null : <span className="sr-only">{accessibleName}</span>}
      </span>
    );
  }

  /* La referencia V7 usa la firma gráfica completa, no una reconstrucción
   * tipográfica en HTML. El PNG preserva exactamente proporciones, pesos y
   * espaciado del nuevo logotipo en cualquier navegador. */
  const width = Math.round(size * (2048 / 312));
  return (
    <span className={`inline-flex items-center ${className}`}>
      <Image
        src={tone === "light" ? "/brand/png/logo-light-2048.png" : "/brand/png/logo-horizontal-2048.png"}
        width={width}
        height={size}
        alt=""
        aria-hidden="true"
        className="h-auto max-w-full object-contain"
        priority={tone === "light"}
      />
      {decorative ? null : <span className="sr-only">{accessibleName}</span>}
    </span>
  );
}
