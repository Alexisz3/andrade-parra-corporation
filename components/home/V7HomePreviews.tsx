import Image from "next/image";
import { Link } from "@/i18n/navigation";

interface PreviewCopy {
  eyebrow: string;
  title: string;
  body: string;
  action: string;
}

/**
 * El avance de Servicios vivía aquí y era lo único que necesitaba estado, así
 * que al mudarse a V7ServicesAccordion este archivo dejó de ser cliente: lo
 * que queda no tiene interacción y se resuelve en el servidor.
 */
export function V7AboutPreview({ copy }: { copy: PreviewCopy }) {
  return (
    <section className="v8-about-preview" aria-labelledby="about-preview-title">
      <Image src="/images/heroes/andrade-parra-hardhat-workbench.png" alt="" fill sizes="100vw" className="object-cover" />
      <div className="v8-about-overlay" aria-hidden="true" />
      <div className="v7-container v8-about-preview-grid">
        <div>
          <p className="v7-eyebrow v7-eyebrow-light">{copy.eyebrow}</p>
          <h2 id="about-preview-title" className="v7-preview-title">{copy.title}</h2>
          <p>{copy.body}</p>
          <Link href="/about" className="v7-text-link">{copy.action}<span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>
  );
}
