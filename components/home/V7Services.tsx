"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
  const list = useRef<HTMLOListElement>(null);
  const current = services[active];

  useEffect(() => {
    const element = list.current;
    if (!element) return;
    const mobile = matchMedia("(max-width: 820px)");
    let stop = () => {};
    const connect = () => {
      stop();
      if (!mobile.matches) return;
      const items = Array.from(element.children);
      const visible = new Set<Element>();
      let timer: ReturnType<typeof setTimeout>;
      const settle = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          const bounds = element.getBoundingClientRect();
          const center = bounds.left + bounds.width / 2;
          let closest = -1;
          let distance = Infinity;
          items.forEach((item, index) => {
            if (!visible.has(item)) return;
            const rect = item.getBoundingClientRect();
            const nextDistance = Math.abs(rect.left + rect.width / 2 - center);
            if (nextDistance < distance) { distance = nextDistance; closest = index; }
          });
          if (closest !== -1) setActive(closest);
        }, 140);
      };
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
        settle();
      }, { root: element, threshold: [0, .25, .5, .75, 1] });
      items.forEach((item) => observer.observe(item));
      element.addEventListener("scroll", settle, { passive: true });
      window.addEventListener("resize", settle);
      stop = () => {
        clearTimeout(timer);
        observer.disconnect();
        element.removeEventListener("scroll", settle);
        window.removeEventListener("resize", settle);
      };
    };
    connect();
    mobile.addEventListener("change", connect);
    return () => { stop(); mobile.removeEventListener("change", connect); };
  }, [services.length]);

  const select = (index: number) => {
    setActive(index);
    const element = list.current;
    if (!element || !matchMedia("(max-width: 820px)").matches) return;
    const item = element.children[index].getBoundingClientRect();
    const bounds = element.getBoundingClientRect();
    element.scrollTo({
      left: element.scrollLeft + item.left - bounds.left - (bounds.width - item.width) / 2,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

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
          <ol className="v7-service-list" ref={list}>
            {services.map((service, index) => (
              <li key={service.id}>
                <button
                  type="button"
                  aria-pressed={active === index}
                  aria-controls="service-feature"
                  onMouseEnter={() => { if (matchMedia("(hover: hover) and (min-width: 821px)").matches) setActive(index); }}
                  onClick={() => select(index)}
                  onFocus={() => select(index)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{service.title[locale]}</strong>
                  <i aria-hidden="true">↗</i>
                </button>
              </li>
            ))}
          </ol>

          <article id="service-feature" className="v7-service-feature" aria-live="polite">
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
