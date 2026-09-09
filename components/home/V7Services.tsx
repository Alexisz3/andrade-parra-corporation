"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import type { Service } from "@/content/services";

export interface V7ServicesCopy {
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  intro: string;
  detail: string;
  quote: string;
}

export default function V7Services({ services, copy }: { services: Service[]; copy: V7ServicesCopy }) {
  const locale = useLocale() as AppLocale;
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);
  const current = services[active];

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    // Use IntersectionObserver to spy on the scroll position
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = Number(entry.target.getAttribute("data-index"));
          setActive(idx);
        }
      });
    }, {
      root: list,
      threshold: 0.6, // Update when 60% of the card is visible
    });

    const items = list.querySelectorAll("li");
    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  if (!current) return null;

  return (
    <section id="servicios" className="v7-section v7-services" aria-labelledby="home-services-title">
      <div className="v7-container">
        <div className="v7-services-heading">
          <div>
            <p className="v7-eyebrow v7-eyebrow-light">{copy.eyebrow}</p>
            <h2 id="home-services-title" className="v7-section-title v7-section-title-light">
              {copy.titleLead}<br /><em>{copy.titleAccent}</em>
            </h2>
          </div>
          <p>{copy.intro}</p>
        </div>

        <div className="v7-services-grid">
          <ol className="v7-service-list" ref={listRef}>
            {services.map((service, index) => (
              <li key={service.id} data-index={index}>
                <Link
                  href={{ pathname: "/services/[slug]", params: { slug: service.slugs[locale] } }}
                  aria-current={active === index ? "true" : undefined}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{service.title[locale]}</strong>
                  <i aria-hidden="true">↗</i>
                </Link>
              </li>
            ))}
          </ol>

          <article className="v7-service-feature" aria-live="polite">
            <div className="v7-service-image">
              <Image
                key={current.id}
                src={`/images/proyectos/${current.heroImage}`}
                alt=""
                fill
                sizes="(min-width: 900px) 52vw, 100vw"
                className="object-cover"
              />
              <span aria-hidden="true">APC · {String(active + 1).padStart(2, "0")}</span>
            </div>
            <div className="v7-service-copy">
              <p className="v7-meta">{current.title[locale]}</p>
              <h3>{current.shortDescription[locale]}</h3>
              <p>{current.introduction[locale]}</p>
              <div>
                <Link href={{ pathname: "/services/[slug]", params: { slug: current.slugs[locale] } }}>
                  {copy.detail} <span aria-hidden="true">↗</span>
                </Link>
                <Link href={{ pathname: "/quote", query: { servicio: current.id } }}>
                  {copy.quote} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
