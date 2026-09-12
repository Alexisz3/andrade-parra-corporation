import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { BUSINESS_EMAIL, WHATSAPP_CONTACTS } from "@/lib/site";
import TrackedContactLink from "@/components/TrackedContactLink";

export interface V7EditorialCopy {
  craftEyebrow: string;
  craftTitle: string;
  craftBody: string;
  craftCallouts: string[];
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
  contactSign: string;
  quote: string;
  call: string;
}

export function V7Craft({ copy }: { copy: V7EditorialCopy }) {
  return (
    <section className="v7-section v7-craft" aria-labelledby="craft-title">
      <div className="v7-container v7-craft-grid">
        <div className="v7-craft-copy">
          <p className="v7-eyebrow">{copy.craftEyebrow}</p>
          <h2 id="craft-title" className="v7-section-title"><em>{copy.craftTitle}</em></h2>
          <p>{copy.craftBody}</p>
          <ol>
            {copy.craftCallouts.map((item, index) => (
              <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>
            ))}
          </ol>
        </div>
        <figure className="v7-craft-figure">
          <Image
            src="/images/proyectos/cocina-cuarzo-05.jpeg"
            alt=""
            fill
            sizes="(min-width: 900px) 55vw, 100vw"
            className="object-cover"
          />
          <figcaption>Andrade Parra Corporation · Houston, TX</figcaption>
        </figure>
      </div>
    </section>
  );
}

export function V7About({ copy }: { copy: V7EditorialCopy }) {
  return (
    <section id="nosotros" className="v7-section v7-about" aria-labelledby="about-title">
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
    <section className="v7-section v7-team" aria-labelledby="team-title">
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
                <div className="v7-person-photo" aria-label={`${copy.teamPhotoPending}: ${contact.name}`}>
                  <span aria-hidden="true">{initials}</span>
                  <small>{copy.teamPhotoPending}</small>
                  <i aria-hidden="true">0{index + 1}</i>
                </div>
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
                      {copy.teamCall}<span aria-hidden="true">↗</span>
                    </TrackedContactLink>
                    <TrackedContactLink
                      href={`https://wa.me/${contact.phone}`}
                      event="whatsapp_clicked"
                      params={{ contact: contact.id, source: "about_team" }}
                      external
                    >
                      {copy.teamWhatsapp}<span aria-hidden="true">↗</span>
                    </TrackedContactLink>
                  </div>
                </div>
              </article>
            );
          })}
          <aside className="v7-team-gallery">
            <div className="v7-team-gallery-title">
              <div><p className="v7-meta">{copy.teamGalleryTitle}</p><h3>{copy.teamGalleryBody}</h3></div>
            </div>
            <div className="v7-team-gallery-slots">
              {[1, 2, 3].map((slot) => (
                <div className="v7-team-gallery-slot" key={slot}>
                  <span>{copy.teamPhotoPending}</span>
                </div>
              ))}
            </div>
          </aside>
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

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z" />
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

          {WHATSAPP_CONTACTS.map((contact) => (
            <TrackedContactLink
              key={contact.id}
              href={`tel:+${contact.phone}`}
              event="phone_clicked"
              params={{ contact: contact.id, source: "contact_page" }}
              className="v7-contact-row"
            >
              <span className="v7-contact-who">
                <span className="v7-contact-icon" aria-hidden="true"><PersonIcon /></span>
                {contact.name}
              </span>
              <span className="v7-contact-value">
                <span className="v7-contact-icon" aria-hidden="true"><PhoneIcon /></span>
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
