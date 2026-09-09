"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { Project } from "@/content/projects";
import type { V7HeroCopy } from "./V7Hero";

const ROTATION_MS = 8000;

export default function V7HeroPremium({ projects, copy }: { projects: Project[]; copy: V7HeroCopy }) {
  const [active, setActive] = useState(0);
  const [userPaused] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const total = projects.length;

  useEffect(() => {
    if (userPaused || total <= 1) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % total);
    }, ROTATION_MS);
    return () => clearInterval(interval);
  }, [userPaused, total]);

  return (
    <section className="v7-hero-premium" aria-label={copy.titleLead}>
      <div className="v7-hero-premium-bg">
        {projects.map((proj, idx) => (
          <Image
            key={proj.slugs["en-US"]}
            src={`/images/proyectos/${proj.coverPhoto.file}`}
            alt=""
            fill
            priority={idx === 0}
            sizes="100vw"
            style={{
              opacity: active === idx ? 1 : 0,
              transition: "opacity 1s ease-in-out",
            }}
          />
        ))}
      </div>
      <div className="v7-hero-premium-overlay" />
      
      <div className="v7-hero-premium-content">
        <p className="v7-hero-premium-eyebrow">{copy.eyebrow}</p>
        <h1 className="v7-hero-premium-title">
          {copy.titleLead} {copy.titleAccent}
        </h1>
        <p className="v7-hero-premium-meta">
          {copy.body}
        </p>
        
        <div className="v7-hero-premium-actions">
          <Link href="/quote" className="v7-pill-button">
            {copy.quote}
          </Link>
          <Link href="/projects" className="v7-pill-button v7-pill-button-ghost">
            {copy.projects}
          </Link>
        </div>
      </div>
    </section>
  );
}
