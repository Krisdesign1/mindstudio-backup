"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Film,
  ArrowUpRight,
  LoaderCircle,
} from "lucide-react";
import "./studio-library.css";
export function StudioLibrary({
  projects,
}: {
  projects: { id: string; name: string; createdAt: string }[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <main className="studio-library">
      <Link className="sl-back" href="/dashboard">
        <ArrowLeft size={16} /> MindStudio
      </Link>
      <header>
        <span>TON ATELIER DE CRÉATION</span>
        <h1>Studio HyperFrames</h1>
        <p>
          Une idée suffit. Commence sur une toile vide, ajoute tes médias et
          crée ton montage librement.
        </p>
      </header>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            const r = await fetch("/api/studio/projects", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name }),
            });
            const data = await r.json();
            if (!r.ok)
              throw new Error(data.error?.message || "Création impossible.");
            router.push(`/studio/${data.id}`);
          } catch (e) {
            setError((e as Error).message);
            setBusy(false);
          }
        }}
      >
        <div className="sl-icon">
          <Plus size={28} />
        </div>
        <div>
          <h2>Nouveau projet libre</h2>
          <p>Aucune vidéo ni narration requise. Toile 16:9 · 1080p.</p>
          <label htmlFor="studio-name">Nom du projet</label>
          <input
            id="studio-name"
            placeholder="Mon prochain montage"
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button disabled={busy}>
          {busy ? <LoaderCircle size={18} /> : <Plus size={18} />}{" "}
          {busy ? "Création…" : "Ouvrir le Studio"}
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
      <h2>Tes projets libres</h2>
      {!projects.length ? (
        <p className="sl-empty">
          Tes projets apparaîtront ici pour reprendre ton travail à tout moment.
        </p>
      ) : (
        <div className="sl-grid">
          {projects.map((p) => (
            <Link key={p.id} href={`/studio/${p.id}`}>
              <Film size={22} />
              <h3>{p.name}</h3>
              <span>
                Reprendre le montage <ArrowUpRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      )}
      <h2>Films éditoriaux</h2>
      <div className="sl-grid">
        {[
          ["moloto", "Alain Moloto · Héritage"],
          ["mbappe", "Mbappé · Le niveau"],
          ["mourinho", "Mourinho · Arbitrage"],
          ["reviens", "Reviens au Père"],
        ].map(([id, title]) => (
          <Link key={id} href={`/studio/${id}`}>
            <Film size={22} />
            <h3>{title}</h3>
            <span>
              Ouvrir dans le Studio <ArrowUpRight size={16} />
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
