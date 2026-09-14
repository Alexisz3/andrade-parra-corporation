"use client";

import { startTransition, useRef, useState, ViewTransition } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import Lightbox from "./Lightbox";

/**
 * Fotografía que se puede ver ampliada.
 *
 * La imagen va dentro de un `<button>`, no de un `<div onClick>`. Un botón
 * nativo ya responde a Enter y a Espacio, entra en el orden de tabulación y
 * se anuncia como control: replicar eso con ARIA sobre un div es más código
 * para llegar peor al mismo sitio.
 *
 * El foco vuelve al botón de origen al cerrar. Sin eso, quien navega con
 * teclado cierra el visor y aparece al principio del documento, teniendo que
 * recorrer la galería entera para volver a donde estaba.
 */
export default function ZoomableImage({
  src,
  alt,
  orientation,
  sizes,
  eager = false,
  preload = false,
  className = "",
  imageClassName = "object-cover",
  viewTransitionName,
}: {
  src: string;
  alt: string;
  orientation: "vertical" | "horizontal";
  sizes: string;
  eager?: boolean;
  /** Solo para el LCP de la ficha. Ver la nota de ProjectCard sobre `eager`. */
  preload?: boolean;
  /** Clases del contenedor: es quien fija la proporción del encuadre. */
  className?: string;
  imageClassName?: string;
  /**
   * Solo la foto de portada de una ficha de proyecto lo usa: hace que la
   * miniatura de la galería se "transforme" en esta foto grande en vez de
   * desaparecer y reaparecer. Ver PLAN_MICROANIMACIONES.md 1.3 —el mismo
   * nombre tiene que estar en el `<Image>` de origen (V7ProjectLibrary).
   */
  viewTransitionName?: string;
}) {
  const t = useTranslations("Projects");
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    // `startTransition` es lo que activa el morph al cerrar — un `setState`
    // normal no dispara `<ViewTransition>`. Ver PLAN_MICROANIMACIONES.md 1.3.
    startTransition(() => setOpen(false));
    triggerRef.current?.focus();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => startTransition(() => setOpen(true))}
        aria-label={`${t("openLightbox")}: ${alt}`}
        className={`group relative block w-full cursor-zoom-in overflow-hidden ${className}`}
      >
        {(() => {
          const image = (
            <Image
              src={src}
              alt={alt}
              fill
              loading={eager ? "eager" : "lazy"}
              preload={preload || undefined}
              sizes={sizes}
              className={`${imageClassName} transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100`}
            />
          );
          // Mientras el visor está abierto, el nombre se lo queda la foto
          // grande de ahí abajo — si lo llevaran los dos a la vez, ninguno
          // de los dos anima (nombre duplicado).
          return viewTransitionName && !open ? (
            <ViewTransition name={viewTransitionName}>{image}</ViewTransition>
          ) : (
            image
          );
        })()}
        {/*
          Señal de que la foto se puede ampliar.
          Va SIEMPRE visible y no solo al pasar el ratón: en móvil no existe el
          hover, y es justo donde la foto se ve más pequeña.
        */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-carbon/75 text-bone"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4.2-4.2M11 8v6M8 11h6" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      {open ? (
        <Lightbox
          src={src}
          alt={alt}
          orientation={orientation}
          onClose={close}
          viewTransitionName={viewTransitionName}
        />
      ) : null}
    </>
  );
}
