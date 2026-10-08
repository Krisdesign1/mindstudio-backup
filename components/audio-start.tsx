"use client";
import { useState } from "react";
import { Music2, ArrowRight, LoaderCircle, Film } from "lucide-react";
import {
  audioAccept,
  videoAccept,
  audioFormatLabel,
  videoFormatLabel,
} from "@/lib/video-formats";
import { sourceVideoSchema } from "@/lib/schemas/motion-edit";
import { newProject } from "@/lib/services/mock";
import type { Project } from "@/lib/schemas/project";
export function AudioStart({ create }: { create: (p: Project) => void }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [name, setName] = useState("Mon récit");
  async function upload(file: File) {
    setBusy(true);
    setError("");
    try {
      if (file.size > 500 * 1024 * 1024)
        throw new Error("Limite : 500 Mo par fichier.");
      const response = await fetch("/api/motion/media", {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "X-File-Name": encodeURIComponent(file.name),
        },
        body: file,
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error?.message || "Import impossible.");
      const source = sourceVideoSchema.parse(data);
      if (!source.hasAudio)
        throw new Error(
          "Cette vidéo ne contient pas de son. Commencez par votre narration, puis ajoutez ce clip dans une scène.",
        );
      const p = newProject(
        name.trim() || file.name.replace(/\.[^.]+$/, ""),
        "",
        "16:9",
        "manual",
        "MindShift Cinematic",
      );
      create({
        ...p,
        script: "",
        scenes: [],
        voice: "",
        motionTemplate: "cinematic",
        motionEdit: {
          source,
          layers: [],
          keepAudio: true,
          quality: "1080p",
          canvas: "16:9",
        },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import impossible.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="audio-start">
      <div className="audio-start-copy">
        <span className="motion-kicker">
          <Music2 size={16} /> AUDIO → MOTION
        </span>
        <h1>
          Votre son.
          <br />
          <em>Le début de l’histoire.</em>
        </h1>
        <p>
          Une narration déjà prête. Des scènes illustrées qui suivent vos idées.
          Un montage que vous gardez en main.
        </p>
        <div className="audio-start-steps">
          <b>01 Déposer le son</b>
          <ArrowRight size={14} />
          <span>02 Analyser</span>
          <ArrowRight size={14} />
          <span>03 Créer la vidéo</span>
        </div>
      </div>
      <div className="audio-start-card">
        <label>
          Nom du projet
          <input
            aria-label="Nom du projet audio"
            value={name}
            maxLength={120}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label
          className="audio-drop"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file && !busy) void upload(file);
          }}
        >
          <Music2 size={40} />
          <strong>
            {busy ? "Préparation du fichier…" : "Déposer votre son"}
          </strong>
          <span>{audioFormatLabel}</span>
          <small>Jusqu’à 10 minutes · 500 Mo · Traitement local</small>
          <input
            aria-label="Déposer votre fichier audio"
            type="file"
            accept={audioAccept}
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
              e.target.value = "";
            }}
          />
        </label>
        <label className="audio-video-option">
          <Film size={16} /> Mon son est dans une vidéo
          <input
            aria-label="Importer une vidéo contenant le son"
            type="file"
            accept={videoAccept}
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
              e.target.value = "";
            }}
          />
        </label>
        <small className="audio-formats">{videoFormatLabel}</small>
        {busy && (
          <p role="status">
            <LoaderCircle className="spin" size={15} /> Préparation locale. Cela
            peut prendre quelques minutes.
          </p>
        )}
        {error && <p role="alert">{error}</p>}
      </div>
      <p className="audio-start-note">
        Votre son reste la référence. Ajoutez ensuite vos images, clips et
        logos, corrigez les sous-titres et personnalisez les animations.
      </p>
    </section>
  );
}
