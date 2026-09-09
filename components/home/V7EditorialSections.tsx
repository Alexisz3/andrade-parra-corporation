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

export function V7Faq({ copy, headingLevel: Heading = "h2" }: { copy: V7EditorialCopy; headingLevel?: "h1" | "h2" }) {
  return (
    <section id="faq" className="v7-section v7-faq" aria-labelledby="faq-title">
      <div className="v7-container v7-faq-grid">
        <div>
          <p className="v7-eyebrow">{copy.faqEyebrow}</p>
          <Heading id="faq-title" className="v7-section-title">{copy.faqTitle}</Heading>
          <p className="v7-faq-prompt">{copy.faqPrompt}</p>
        </div>
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

export function V7Contact({ copy, page = false }: { copy: V7EditorialCopy; page?: boolean }) {
  const TitleTag = page ? "h1" : "h2";
  return (
    <section id="contacto" className={`v7-contact ${page ? "v7-contact-page" : ""}`} aria-labelledby="contact-title">
      <div className="v7-contact-media" aria-hidden="true">
        <Image src="/images/proyectos/exterior-lujo-01.jpeg" alt="" fill sizes="100vw" className="object-cover" />
      </div>
      <div className="v7-contact-overlay" aria-hidden="true" />
      <div className="v7-container v7-contact-inner">
        <div>
          <p className="v7-eyebrow v7-eyebrow-light">{copy.contactEyebrow}</p>
          <TitleTag id="contact-title" className="v7-section-title v7-section-title-light">{copy.contactTitle}</TitleTag>
          <p>{copy.contactBody}</p>
          <Link href="/quote" className="v7-button v7-button-amber">{copy.quote}<span aria-hidden="true">→</span></Link>
        </div>
        <aside>
          <p>{copy.contactArea}</p>
          {WHATSAPP_CONTACTS.map((contact) => (
            <TrackedContactLink
              key={contact.id}
              href={`tel:+${contact.phone}`}
              event="phone_clicked"
                params={{ contact: contact.id, source: page ? "contact_page" : "home_contact" }}
            >
              <span>{contact.name}</span><strong>{contact.phoneDisplay}</strong>
            </TrackedContactLink>
          ))}
          {BUSINESS_EMAIL ? (
            <TrackedContactLink href={`mailto:${BUSINESS_EMAIL}`} event="email_clicked" params={{ source: page ? "contact_page" : "home_contact" }}>
              <span>Email</span><strong>{BUSINESS_EMAIL}</strong>
            </TrackedContactLink>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
