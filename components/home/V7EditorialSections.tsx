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
  faqEyebrow: string;
  faqTitle: string;
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

export function V7Faq({ copy }: { copy: V7EditorialCopy }) {
  return (
    <section id="faq" className="v7-section v7-faq" aria-labelledby="faq-title">
      <div className="v7-container v7-faq-grid">
        <div>
          <p className="v7-eyebrow">{copy.faqEyebrow}</p>
          <h2 id="faq-title" className="v7-section-title">{copy.faqTitle}</h2>
        </div>
        <div className="v7-faq-list">
          {copy.faq.map((item, index) => (
            <details key={item.question}>
              <summary><span>{String(index + 1).padStart(2, "0")}</span>{item.question}<i aria-hidden="true">+</i></summary>
              <p>{item.answer}</p>
            </details>
          ))}
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
