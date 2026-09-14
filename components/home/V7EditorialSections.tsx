import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { BUSINESS_EMAIL, BUSINESS_FACEBOOK, WHATSAPP_CONTACTS } from "@/lib/site";
import TrackedContactLink from "@/components/TrackedContactLink";

export interface V7EditorialCopy {
  craftEyebrow: string;
  /** Puede llevar un `\n` para forzar el corte de línea del titular, igual
   *  que en el resto de titulares editoriales del sitio (GlobalCta,
   *  V7FeaturedProjects). */
  craftTitle: string;
  craftBody: string;
  craftCallouts: string[];
  /** Refuerzo corto de tres puntos, justo antes de las tarjetas. */
  craftBullets: string[];
  /** Tarjetitas comerciales — entre 4 y 5; el layout da a la última todo el
   *  ancho cuando el total es impar, a modo de cierre. */
  craftCards: { title: string; body: string }[];
  craftCtaLabel: string;
  aboutEyebrow: string;
  aboutTitle: string;
  aboutBody: string;
  aboutPrinciples: string[];
  teamEyebrow: string;
  teamTitle: string;
  teamBody: string;
  teamContact: string;
  teamPhotoPending: string;
  teamGalleryTitle: string;
  teamGalleryBody: string;
  teamCall: string;
  teamWhatsapp: string;
  teamFacebook: string;
  faqEyebrow: string;
  faqTitle: string;
  faqPrompt: string;
  faqStillQuestion: string;
  faqAsk: string;
  faq: { question: string; answer: string }[];
  contactEyebrow: string;
  contactTitle: string;
  contactBody: string;
  contactArea: string;
  contactEmailLabel: string;
  contactFacebookLabel: string;
  contactSign: string;
  quote: string;
  call: string;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

/**
 * Bloque comercial de detalle — la idea es que el visitante entienda, en el
 * orden en que lee, que el cuidado en lo pequeño (encuentros, materiales,
 * revisión final) es lo que separa un trabajo bien hecho de uno improvisado.
 *
 * El orden del marcado es también el orden en móvil (cabecera → argumentos
 * → bullets → tarjetas → CTA → foto): en escritorio, `grid-template-areas`
 * reubica la foto a la derecha sin tocar ese orden, así que el foco (tab)
 * sigue el mismo recorrido que la lectura en ambos casos salvo por la foto,
 * que no lleva nada enfocable.
 */
export function V7Craft({ copy }: { copy: V7EditorialCopy }) {
  const titleLines = copy.craftTitle.split("\n");
  const cards = copy.craftCards;
  const lastCardSpansFull = cards.length % 2 === 1;

  return (
    <section className="v7-section v7-craft v7-scroll-reveal" aria-labelledby="craft-title">
      <div className="v7-container v7-craft-grid">
        <div className="v7-craft-head">
          <p className="v7-eyebrow">{copy.craftEyebrow}</p>
          <h2 id="craft-title" className="v7-section-title">
            {titleLines.flatMap((line, index) => (index === 0 ? [line] : [<br key={index} />, line]))}
          </h2>
          <p className="v7-craft-lead">{copy.craftBody}</p>
        </div>

        <ol className="v7-craft-args">
          {copy.craftCallouts.map((item, index) => (
            <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>
          ))}
        </ol>

        <ul className="v7-craft-bullets">
          {copy.craftBullets.map((item) => (
            <li key={item}><CheckIcon />{item}</li>
          ))}
        </ul>

        <ul className="v7-craft-cards">
          {cards.map((card, index) => (
            <li
              key={card.title}
              className={lastCardSpansFull && index === cards.length - 1 ? "v7-craft-card is-full" : "v7-craft-card"}
            >
              <p className="v7-craft-card-title">{card.title}</p>
              <p className="v7-craft-card-body">{card.body}</p>
            </li>
          ))}
        </ul>

        {/* La foto va antes que el CTA en el marcado a propósito: en móvil
            el orden pedido es tarjetas → foto → CTA, y así coincide con el
            recorrido de foco además del visual (`grid-template-areas` sólo
            reordena la pintura, no el tabulador). En escritorio no cambia
            nada — la foto sigue siendo la columna aparte de la derecha. */}
        {/* Foto de la EMPRESA, no de una obra — esta sección vive en
            Nosotros, y una foto de cocina aquí se leía como "otro proyecto
            más" en vez de reforzar de quién se está hablando. Es la misma
            imagen que ya usa V7AboutPreview (portada) para presentar a
            Andrade Parra Corporation, así que la marca ya es coherente en
            las dos apariciones en vez de introducir un tercer archivo. */}
        <figure className="v7-craft-figure">
          <Image
            src="/images/heroes/andrade-parra-hardhat-workbench.png"
            alt=""
            fill
            sizes="(min-width: 901px) 46vw, 100vw"
            className="object-cover"
          />
          <figcaption>Andrade Parra Corporation · Houston, TX</figcaption>
        </figure>

        <Link href="/quote" className="v7-text-link v7-craft-cta">
          {copy.craftCtaLabel}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}

export function V7About({ copy }: { copy: V7EditorialCopy }) {
  return (
    <section id="nosotros" className="v7-section v7-about v7-scroll-reveal" aria-labelledby="about-title">
      <div className="v7-container v7-about-grid">
        <div>
          <p className="v7-eyebrow v7-eyebrow-light">{copy.aboutEyebrow}</p>
          <h2 id="about-title" className="v7-section-title v7-section-title-light">{copy.aboutTitle}</h2>
        </div>
        <div className="v7-about-story">
          <p>{copy.aboutBody}</p>
          <ul>
            {copy.aboutPrinciples.map((item, index) => (
              <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>
            ))}
          </ul>
          <div className="v7-about-contacts">
            {WHATSAPP_CONTACTS.map((contact) => (
              <TrackedContactLink
                key={contact.id}
                href={`tel:+${contact.phone}`}
                event="phone_clicked"
                params={{ contact: contact.id, source: "home_about" }}
              >
                <span>{contact.name}</span><strong>{contact.phoneDisplay}</strong>
              </TrackedContactLink>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function V7Team({ copy }: { copy: V7EditorialCopy }) {
  return (
    <section className="v7-section v7-team v7-scroll-reveal" aria-labelledby="team-title">
      <div className="v7-container">
        <div className="v7-team-head">
          <div>
            <p className="v7-eyebrow">{copy.teamEyebrow}</p>
            <h2 id="team-title" className="v7-section-title">{copy.teamTitle}</h2>
          </div>
          <p>{copy.teamBody}</p>
        </div>

        <div className="v7-team-grid">
          {WHATSAPP_CONTACTS.map((contact, index) => {
            const initials = contact.name.split(" ").map((part) => part[0]).join("");
            return (
              <article className="v7-person-card" key={contact.id}>
                {/* `Boolean(...)`, no el valor crudo: con los dos contactos
                    ya teniendo foto, TypeScript infiere `photo` como un
                    literal siempre verdadero y da por "never" (inalcanzable)
                    la rama sin foto — con `Boolean` deja de estrechar el
                    tipo y las dos ramas quedan escribibles, lista para si
                    algún día se agrega un contacto sin foto todavía. */}
                {Boolean(contact.photo) ? (
                  <div className="v7-person-photo has-image">
                    <Image
                      src={contact.photo}
                      alt={contact.name}
                      fill
                      sizes="(min-width: 1024px) 22vw, 45vw"
                      // `object-top`: el recorte por defecto (centrado) parte
                      // por la cabeza en estas fotos de cuerpo entero, porque
                      // sobra piso debajo y falta margen arriba. Recortando
                      // desde abajo la cara queda siempre completa.
                      className="object-cover object-top"
                    />
                    <i aria-hidden="true">0{index + 1}</i>
                  </div>
                ) : (
                  <div className="v7-person-photo" aria-label={`${copy.teamPhotoPending}: ${contact.name}`}>
                    <span aria-hidden="true">{initials}</span>
                    <small>{copy.teamPhotoPending}</small>
                    <i aria-hidden="true">0{index + 1}</i>
                  </div>
                )}
                <div className="v7-person-info">
                  <p className="v7-meta">{copy.teamContact}</p>
                  <h3>{contact.name}</h3>
                  <strong>{contact.phoneDisplay}</strong>
                  <div>
                    <TrackedContactLink
                      href={`tel:+${contact.phone}`}
                      event="phone_clicked"
                      params={{ contact: contact.id, source: "about_team" }}
                    >
                      {copy.teamCall}
                    </TrackedContactLink>
                    <TrackedContactLink
                      href={`https://wa.me/${contact.phone}`}
                      event="whatsapp_clicked"
                      params={{ contact: contact.id, source: "about_team" }}
                      external
                    >
                      {copy.teamWhatsapp}
                    </TrackedContactLink>
                    {contact.facebook ? (
                      <TrackedContactLink
                        href={contact.facebook}
                        event="facebook_clicked"
                        params={{ contact: contact.id, source: "about_team" }}
                        external
                      >
                        {copy.teamFacebook}
                      </TrackedContactLink>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
          {/* Galería "equipo en obra" retirada a propósito: todavía no hay
              fotografías reales del equipo trabajando, y los recuadros
              vacíos ("espacio reservado para fotografía") se veían como un
              hueco en la página en vez de una promesa. Vuelve a aparecer en
              cuanto haya material real que mostrar — ver V7EditorialCopy
              (teamGalleryTitle/teamGalleryBody) y las clases
              .v7-team-gallery* en globals.css, que se conservan. */}
        </div>
      </div>
    </section>
  );
}

/**
 * Lista de preguntas. El encabezado (eyebrow + titular + frase de
 * instrucción) vive en la portada de la página —V7EditorialCover, el único
 * sitio donde se usa esta sección—, así que aquí no se repite: la sección
 * toma su nombre accesible del propio eyebrow en vez de un `aria-labelledby`
 * a un título que ya no existe.
 */
export function V7Faq({ copy }: { copy: V7EditorialCopy }) {
  return (
    <section id="faq" className="v7-section v7-faq is-headless" aria-label={copy.faqEyebrow}>
      <div className="v7-container v7-faq-grid">
        <div className="v7-faq-list">
          {copy.faq.map((item, index) => (
            <details key={item.question}>
              <summary><span>{String(index + 1).padStart(2, "0")}</span>{item.question}<i aria-hidden="true">+</i></summary>
              <p>{item.answer}</p>
            </details>
          ))}
          <div className="v7-faq-contact">
            <span>{copy.faqStillQuestion}</span>
            <Link href="/contact">{copy.faqAsk}<i aria-hidden="true">→</i></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c.9-3.6 3.9-5.5 7.5-5.5s6.6 1.9 7.5 5.5" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20.5 5.2 16A8 8 0 1 1 8.5 19l-4.5 1.5Z" />
      <path d="M9 10.2c0 2.8 2 4.8 4.8 4.8" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m3.8 7 8.2 6 8.2-6" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.5 8.5h-2a1.5 1.5 0 0 0-1.5 1.5v2h3.3l-.4 3H12v7.5H9V15H7v-3h2v-2.3C9 7.5 10.5 6 13 6h2.5v2.5Z" />
    </svg>
  );
}

/**
 * Portada de Contacto. Comparte lenguaje con las otras portadas —foto a
 * sangre, scrim a la izquierda, kicker con filete rojo, titular serif— pero
 * su composición es de DOS ZONAS: el texto y su CTA a la izquierda, y a la
 * derecha una hoja de contacto, no una tarjeta de panel.
 *
 * Lo que no se toca: los teléfonos y el correo salen de `lib/site.ts`, y
 * cada uno sigue pasando por TrackedContactLink con su mismo evento y sus
 * mismos parámetros — la medición de `phone_clicked` y `email_clicked` no
 * cambia con el rediseño.
 */
export function V7Contact({ copy, microcopy }: { copy: V7EditorialCopy; microcopy: string }) {
  return (
    // `v7-contact-page` ya no cambia estilos —esta sección sólo existe como
    // página—, pero es el marcador con el que qa/functional.mjs comprueba que
    // /contacto sigue montando su experiencia V7. Se conserva a propósito.
    <section id="contacto" className="v7-contact v7-contact-page" aria-labelledby="contact-title">
      <div className="v7-contact-media" aria-hidden="true">
        <Image
          src="/images/heroes/hero-contacto-terraza.jpg"
          alt=""
          fill
          preload
          loading="eager"
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="v7-contact-overlay" aria-hidden="true" />

      <div className="v7-container v7-contact-inner">
        <div className="v7-contact-copy">
          <p className="v7-cover-kicker">{copy.contactEyebrow}</p>
          <h1 id="contact-title" className="v7-contact-title">{copy.contactTitle}</h1>
          <p className="v7-contact-lead">{copy.contactBody}</p>
          <Link href="/quote" className="v7-button v7-button-amber v7-contact-cta">
            {copy.quote}<span aria-hidden="true">→</span>
          </Link>
        </div>

        <aside className="v7-contact-sheet">
          <p className="v7-contact-sheet-area">{copy.contactArea}</p>

          {/* WhatsApp, no llamada: es el canal que el cliente pidió aquí —
              el mismo contacto sigue disponible por teléfono desde la barra
              inferior móvil y desde la ficha de equipo en Nosotros. */}
          {WHATSAPP_CONTACTS.map((contact) => (
            <TrackedContactLink
              key={contact.id}
              href={`https://wa.me/${contact.phone}`}
              event="whatsapp_clicked"
              params={{ contact: contact.id, source: "contact_page" }}
              external
              className="v7-contact-row"
            >
              <span className="v7-contact-who">
                <span className="v7-contact-icon" aria-hidden="true"><PersonIcon /></span>
                {contact.name}
              </span>
              <span className="v7-contact-value">
                <span className="v7-contact-icon" aria-hidden="true"><WhatsAppIcon /></span>
                {contact.phoneDisplay}
              </span>
            </TrackedContactLink>
          ))}

          {BUSINESS_EMAIL ? (
            <TrackedContactLink
              href={`mailto:${BUSINESS_EMAIL}`}
              event="email_clicked"
              params={{ source: "contact_page" }}
              className="v7-contact-row"
            >
              <span className="v7-contact-who">
                <span className="v7-contact-icon" aria-hidden="true"><MailIcon /></span>
                {copy.contactEmailLabel}
              </span>
              <span className="v7-contact-value">{BUSINESS_EMAIL}</span>
            </TrackedContactLink>
          ) : null}

          {BUSINESS_FACEBOOK ? (
            <TrackedContactLink
              href={BUSINESS_FACEBOOK}
              event="facebook_clicked"
              params={{ source: "contact_page" }}
              external
              className="v7-contact-row"
            >
              <span className="v7-contact-who">
                <span className="v7-contact-icon" aria-hidden="true"><FacebookIcon /></span>
                {copy.contactFacebookLabel}
              </span>
            </TrackedContactLink>
          ) : null}

          <p className="v7-contact-sign">
            <span className="v7-contact-sign-rule" aria-hidden="true" />
            {copy.contactSign}
          </p>
        </aside>

        <p className="v7-contact-microcopy">{microcopy}</p>
      </div>
    </section>
  );
}
