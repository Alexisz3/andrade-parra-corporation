"use client";

import Image from "next/image";
import { useId, useState, type KeyboardEvent } from "react";
import type { BeforeAfterPair } from "@/content/before-after";

interface BeforeAfterProps {
  pair: BeforeAfterPair;
  beforeLabel: string;
  afterLabel: string;
  sliderLabel: string;
}

const KEYBOARD_STEP = 5;

/**
 * Comparador antes/después.
 *
 * El control es un `input[type=range]` real estirado sobre toda la foto
 * (pista y manija propias ocultas vía CSS, no `opacity:0` — así conserva su
 * anillo de foco nativo): arrastrar en cualquier punto de la imagen mueve el
 * divisor, con ratón, dedo o teclado de fábrica. El círculo central y la
 * línea divisoria son puramente decorativos, sincronizados con `position`
 * pero con `pointer-events:none` — nunca interceptan el gesto.
 */
export default function BeforeAfter({
  pair,
  beforeLabel,
  afterLabel,
  sliderLabel,
}: BeforeAfterProps) {
  const [position, setPosition] = useState(pair.initialPosition);
  const sliderId = useId();

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setPosition((current) => Math.max(0, current - KEYBOARD_STEP));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setPosition((current) => Math.min(100, current + KEYBOARD_STEP));
    }
  };

  return (
    <div className="v7-compare">
      <Image
        src={`/images/proyectos/${pair.afterFile}`}
        alt={pair.afterAlt}
        fill
        priority
        className="v7-compare-image"
        sizes="(min-width: 1024px) 62vw, 100vw"
      />

      {/* La foto «antes» se recorta según la posición del divisor. */}
      <div
        className="v7-compare-before"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          src={`/images/proyectos/${pair.beforeFile}`}
          alt={pair.beforeAlt}
          fill
          priority
          className="v7-compare-image"
          sizes="(min-width: 1024px) 62vw, 100vw"
        />
      </div>

      <div className="v7-compare-divider" style={{ left: `${position}%` }} aria-hidden="true" />
      <div className="v7-compare-handle" style={{ left: `${position}%` }} aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" /></svg>
        <svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></svg>
      </div>

      <span className="v7-compare-tag is-before">{beforeLabel}</span>
      <span className="v7-compare-tag is-after">{afterLabel}</span>

      <label htmlFor={sliderId} className="sr-only">
        {sliderLabel}
      </label>
      <input
        id={sliderId}
        type="range"
        min={0}
        max={100}
        step={1}
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        onKeyDown={handleKeyDown}
        className="v7-compare-input"
        aria-valuetext={`${position}%`}
      />
    </div>
  );
}
