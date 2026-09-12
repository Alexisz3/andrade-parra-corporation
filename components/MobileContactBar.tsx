"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { WHATSAPP_CONTACTS } from "@/lib/site";
import { pickContactIndex } from "@/lib/assignment";
import { track } from "@/lib/analytics";

/**
 * Barra de contacto fija en móvil.
 *
 * Para un contratista, la acción que importa es hablar con alguien, y en el
 * teléfono esa acción estaba a dos toques: abrir el menú y buscar el número.
 * Aquí queda a uno, en cualquier página y sin hacer scroll.
 *
 * Solo en móvil y tableta: en escritorio la cabecera ya lleva el botón de
 * WhatsApp y el de cotización siempre visibles, y una barra inferior ahí
 * robaría alto de contenido sin aportar nada.
 */

/**
 * A quién llama el botón de teléfono.
 *
 * Los dos contactos son igualmente principales — está declarado en
 * `lib/site.ts` — así que fijar el primero repetiría el defecto que la fase 4
 * corrigió en el formulario: todo el volumen a una sola persona.
 *
 * Aquí no hay solicitud de la que derivar una semilla, así que se genera un
 * identificador por sesión y se reparte con él. Dos propiedades importan:
 *
 *  · Es ESTABLE dentro de la sesión. Quien marca, no le contesta nadie y
 *    vuelve a marcar, llama al mismo. Alternar ahí sería desconcertante y
 *    haría que dos personas devolvieran la misma llamada.
 *  · Se reparte ~50/50 entre visitantes distintos, que es lo que se busca.
 *
 * `sessionStorage` y no `localStorage`: la preferencia no debe durar más que
 * la visita. Si el almacenamiento está bloqueado se cae al primer contacto,
 * que es peor reparto pero nunca un enlace roto.
 */
const SESSION_KEY = "apc-session-id";

function useAssignedContact() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let seed = "";
    try {
      seed = window.sessionStorage.getItem(SESSION_KEY) ?? "";
      if (!seed) {
        seed = `${Date.now()}-${Math.random()}`;
        window.sessionStorage.setItem(SESSION_KEY, seed);
      }
    } catch {
      /* almacenamiento bloqueado: se queda con el contacto 0 */
    }
    /*
     * setState dentro de un efecto, a propósito y una sola vez.
     *
     * `sessionStorage` no existe durante el render del servidor, así que el
     * reparto no se puede calcular en el inicializador de `useState` sin
     * provocar un desajuste de hidratación: el servidor pintaría un número y
     * el cliente otro. El primer render usa el contacto 0 y el efecto lo
     * corrige al montar; el enlace nunca queda vacío entretanto. Es el mismo
     * patrón —y el mismo motivo— que en components/quote/QuoteShell.tsx.
     */
    // eslint-disable-next-line react-hooks/set-state-in-effect -- ver comentario arriba
    if (seed) setIndex(pickContactIndex(seed, WHATSAPP_CONTACTS.length));
  }, []);

  return WHATSAPP_CONTACTS[index];
}

// Una sola superficie carbón translúcida para las tres acciones: icono fino +
// etiqueta en fila, sin paneles de color, altura contenida. El objetivo táctil
// es toda la celda (≥ 52 px de alto, ~⅓ del ancho), muy por encima de 44 px.
const ITEM =
  "relative flex min-h-[52px] flex-1 items-center justify-center gap-2 px-2 text-[0.8rem] font-medium tracking-wide text-bone/90 transition-colors hover:text-bone active:text-bone";

export default function MobileContactBar() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const contact = useAssignedContact();

  /*
   * En la propia cotización la barra sobra y estorba: la página ES el
   * formulario, y una barra fija abajo tapa el botón de envío justo cuando se
   * llega a él. El enlace a "Cotización" tampoco tendría a dónde llevar.
   */
  if (pathname === "/quote") return null;

  return (
    <>
      <a
        href={`https://wa.me/${contact.phone}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("whatsapp_clicked", { contact: contact.id, source: "desktop_fab" })}
        className="fixed bottom-7 right-7 z-40 hidden min-h-[52px] items-center gap-3 rounded-full bg-whatsapp px-5 font-semibold text-carbon shadow-xl transition-transform hover:-translate-y-1 lg:flex"
        aria-label={`WhatsApp — ${contact.name}, ${contact.phoneDisplay}`}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6" fill="currentColor">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.5 14.1c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .1-3.2-.8-2.7-1.1-4.4-3.9-4.5-4-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2 .2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.5-.3.3c-.1.1-.2.3 0 .5.2.3.7 1.2 1.6 2 1.1.9 1.5 1 1.7 1.1.2.1.4.1.5-.1l.7-.9c.2-.2.3-.2.5-.1l2 .9c.2.1.4.2.4.3.1.1.1.6-.1 1.2Z" />
        </svg>
        WhatsApp
      </a>

      {/*
        Hueco del mismo alto que la barra (contenido + safe-area). Sin él, la
        barra tapa el final del pie —enlaces legales y teléfonos— en todas las
        páginas.
      */}
      <div
        aria-hidden="true"
        className="h-[calc(52px+env(safe-area-inset-bottom))] lg:hidden"
      />

      <nav
        aria-label={t("contactBar")}
        className="fixed inset-x-0 bottom-0 z-40 flex divide-x divide-bone/10 border-t border-bone/12 bg-carbon/90 text-bone backdrop-blur-md supports-[backdrop-filter]:bg-carbon/72 lg:hidden"
        // Respeta la barra de gestos de iOS: sin esto, el último tramo de los
        // botones cae bajo el indicador del sistema y no se puede pulsar.
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <a
          href={`tel:+${contact.phone}`}
          onClick={() => track("phone_clicked", { contact: contact.id, source: "mobile_bar" })}
          className={ITEM}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2.2 2A16 16 0 0 1 3 6.2 2 2 0 0 1 5 4Z" strokeLinejoin="round" />
          </svg>
          {t("callShort")}
        </a>

        <a
          href={`https://wa.me/${contact.phone}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("whatsapp_clicked", { contact: contact.id, source: "mobile_bar" })}
          className={ITEM}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]" fill="currentColor">
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.5 14.1c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .1-3.2-.8-2.7-1.1-4.4-3.9-4.5-4-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2 .2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.5-.3.3c-.1.1-.2.3 0 .5.2.3.7 1.2 1.6 2 1.1.9 1.5 1 1.7 1.1.2.1.4.1.5-.1l.7-.9c.2-.2.3-.2.5-.1l2 .9c.2.1.4.2.4.3.1.1.1.6-.1 1.2Z" />
          </svg>
          WhatsApp
        </a>

        {/* Sin evento propio: el embudo ya registra `quote_started` al montar
            el formulario, y `lib/analytics.ts` mantiene a propósito una lista
            cerrada de eventos. Uno más aquí solo duplicaría la misma etapa. */}
        <Link href="/quote" className={ITEM}>
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M8 4h8l3 3v13H5V4h3Z" strokeLinejoin="round" />
            <path d="M9 11h6M9 15h4" strokeLinecap="round" />
          </svg>
          {t("quoteShort")}
          {/* Único acento de color: fino subrayado rojo APC bajo «Cotización». */}
          <span aria-hidden="true" className="absolute bottom-[7px] left-1/2 h-[2px] w-7 -translate-x-1/2 rounded-full bg-accent" />
        </Link>
      </nav>
    </>
  );
}
