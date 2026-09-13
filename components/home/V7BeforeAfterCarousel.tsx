"use client";

import { useState } from "react";
import BeforeAfter from "@/components/BeforeAfter";
import type { BeforeAfterPair } from "@/content/before-after";

/**
 * Recorrido entre varios pares antes/después. `BeforeAfterSection` sigue
 * siendo servidor (solo trae el copy); el estado de "cuál par se ve" vive
 * aquí, en el único trozo que de verdad lo necesita.
 *
 * Con un solo par confirmado, la navegación no se monta — no tiene sentido
 * un contador "01/01" ni una flecha "siguiente" que vuelve al mismo sitio.
 *
 * El `key={pair.id}` en el contenedor fuerza un remonte al cambiar de par:
 * reinicia el slider al 50% (estado inicial de `BeforeAfter`) y reproduce
 * la animación de entrada de `.v7-transform-pane` en globals.css.
 */
export default function V7BeforeAfterCarousel({
  pairs,
  beforeLabel,
  afterLabel,
  sliderLabel,
  previousLabel,
  nextLabel,
  counterLabel,
}: {
  pairs: BeforeAfterPair[];
  beforeLabel: string;
  afterLabel: string;
  sliderLabel: string;
  previousLabel: string;
  nextLabel: string;
  /** Plantilla "Proyecto {n} de {total}" — se sustituye aquí, no en el copy. */
  counterLabel: string;
}) {
  const [index, setIndex] = useState(0);
  const pair = pairs[index];
  const hasMultiple = pairs.length > 1;

  const go = (delta: number) => {
    setIndex((current) => (current + delta + pairs.length) % pairs.length);
  };

  const counterText = counterLabel
    .replace("{n}", String(index + 1).padStart(2, "0"))
    .replace("{total}", String(pairs.length).padStart(2, "0"));

  return (
    <div className="v7-transform-pane" key={pair.id}>
      <BeforeAfter
        pair={pair}
        beforeLabel={beforeLabel}
        afterLabel={afterLabel}
        sliderLabel={sliderLabel}
      />

      <div className="v7-transform-foot">
        <p className="v7-transform-project">{pair.project}</p>

        {hasMultiple ? (
          <div className="v7-transform-navrow">
            <span className="v7-transform-counter">{counterText}</span>
            <button type="button" className="v7-transform-navbtn" onClick={() => go(-1)} aria-label={previousLabel}>
              <span aria-hidden="true">←</span>
            </button>
            <button type="button" className="v7-transform-navbtn" onClick={() => go(1)} aria-label={nextLabel}>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
