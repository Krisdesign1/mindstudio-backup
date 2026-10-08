"use client";
import { useState, type CSSProperties } from "react";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import {
  motionTemplates,
  type MotionTemplateId,
} from "@/lib/hyperframes/templates";
export function MotionGallery({
  selected,
  onSelect,
  compact = false,
}: {
  selected?: string;
  onSelect: (id: MotionTemplateId) => void;
  compact?: boolean;
}) {
  const [category, setCategory] = useState("Tous");
  return (
    <section
      className={`motion-gallery ${compact ? "compact" : ""}`}
      aria-label="Templates motion design HyperFrames"
    >
      {!compact && (
        <div className="motion-hero">
          <div>
            <span className="motion-kicker">
              <Sparkles size={15} /> HYPERFRAMES BY HEYGEN
            </span>
            <h1>
              Vos vidéos.
              <br />
              <em>En mouvement.</em>
            </h1>
            <p>
              Le texte devient rythme. Le logo entre en scène.
              <br />
              12 animations à superposer à vos vidéos, toujours modifiables.
            </p>
            <div className="motion-badges">
              <span>Texte animé</span>
              <span>Logo typographique</span>
              <span>Intros & habillages</span>
            </div>
          </div>
          <div className="motion-hero-art" aria-hidden="true">
            <span>DESIGN</span>
            <strong>
              IN MOTION<span>↗</span>
            </strong>
            <small>PLAY. CREATE. REPEAT.</small>
            <i />
            <b>Hf</b>
          </div>
        </div>
      )}
      <div className="motion-gallery-heading">
        <div>
          <span className="motion-kicker">LA COLLECTION MOTION</span>
          <h2>
            {compact
              ? "Choisissez votre animation"
              : "Un style pour chaque idée"}
          </h2>
        </div>
        <span>{motionTemplates.length} templates · sur vos vidéos</span>
      </div>
      <div className="motion-filters" aria-label="Catégories">
        {["Tous", "Texte animé", "Logo", "Intros", "Habillages"].map((c) => (
          <button
            key={c}
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="motion-grid">
        {motionTemplates
          .filter((t) => category === "Tous" || t.category === category)
          .map((t, index) => (
            <button
              key={t.id}
              className={`motion-card ${selected === t.id ? "selected" : ""}`}
              aria-pressed={selected === t.id}
              onClick={() => onSelect(t.id)}
              style={{ "--motion-accent": t.color } as CSSProperties}
            >
              <div className={`motion-art motion-${t.effect}`}>
                <span className="motion-card-category">{t.category}</span>
                <i className="motion-orbit" />
                <strong>{t.label}</strong>
                <span className="motion-mini-brand">
                  HYPERFRAMES / {String(index + 1).padStart(2, "0")}
                </span>
                <span className="motion-select">
                  {selected === t.id ? (
                    <Check size={16} />
                  ) : (
                    <ArrowUpRight size={16} />
                  )}
                </span>
              </div>
              <div className="motion-card-copy">
                <h3>{t.name}</h3>
                <p>{t.description}</p>
                <span>
                  {selected === t.id
                    ? "Style sélectionné"
                    : compact
                      ? "Ajouter cette animation"
                      : "Habiller ma vidéo"}{" "}
                  →
                </span>
              </div>
            </button>
          ))}
      </div>
      <p className="motion-gallery-note">
        Vignettes stylisées · L’aperçu du projet montre le rendu exact avec
        votre texte. Les templates Logo utilisent des initiales
        personnalisables.
      </p>
    </section>
  );
}
