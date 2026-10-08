"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, LoaderCircle, RefreshCw } from "lucide-react";
import "./native-studio.css";
const projects: Record<string, string> = {
  mbappe: "mbappe-age-niveau",
  mourinho: "mourinho-arbitrage",
  reviens: "reviens-au-pere",
  moloto: "alain-moloto-heritage",
};
export function NativeStudio({
  film,
  name,
  delivered = false,
}: {
  film: string;
  name: string;
  delivered?: boolean;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    let active = true;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    fetch("/api/studio/open", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ film }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok)
          throw new Error(data.error?.message || "Ouverture impossible.");
        return data;
      })
      .then((data) => {
        if (active) setUrl(data.url);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => clearInterval(timer));
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [film, attempt]);
  return (
    <main className="native-studio">
      <header>
        <Link href="/studio" aria-label="Tous les projets Studio">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <span>MINDSTUDIO / STUDIO COMPLET</span>
          <h1>{name}</h1>
        </div>
        <p>Projet local · HyperFrames</p>
        {delivered && (
          <a href={`/api/studio/projects/${film}/download`} download>
            Télécharger le MP4 livré
          </a>
        )}
        {url && (
          <a href={url} target="_blank" rel="noreferrer">
            Ouvrir en plein onglet <ExternalLink size={15} />
          </a>
        )}
      </header>
      <div className="native-studio-note">
        {projects[film] ? (
          <>
            Ce montage conserve ses propres modifications. Pour télécharger
            cette version, utilise <strong>Export</strong> dans le Studio. Le
            montage guidé reste une version distincte.
          </>
        ) : (
          <>
            Ajoute tes médias dans <strong>Assets</strong>, explore{" "}
            <strong>Catalog</strong> et compose librement. Télécharge ton
            montage avec <strong>Export</strong>.
          </>
        )}
      </div>
      {url ? (
        <iframe
          src={url}
          title="Studio HyperFrames complet"
          allow="fullscreen; clipboard-write"
          allowFullScreen
        />
      ) : (
        <section className="native-studio-loading" aria-live="polite">
          {error ? (
            <>
              <h2>Le Studio attend une nouvelle tentative</h2>
              <p>{error}</p>
              <button
                onClick={() => {
                  setError("");
                  setUrl("");
                  setSeconds(0);
                  setAttempt((n) => n + 1);
                }}
              >
                <RefreshCw size={17} /> Réessayer
              </button>
            </>
          ) : (
            <>
              <LoaderCircle className="native-studio-spinner" size={36} />
              <h2>Ouverture de ton atelier</h2>
              <p>Chargement du projet, des médias et des outils HyperFrames…</p>
              <span>{seconds} s</span>
            </>
          )}
        </section>
      )}
    </main>
  );
}
