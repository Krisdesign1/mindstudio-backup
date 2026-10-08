"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Pause,
  Save,
  Download,
  Undo2,
  VolumeX,
  Volume2,
  Film,
  LoaderCircle,
  X,
} from "lucide-react";
import type { FootballFilm, FootballScene } from "@/lib/films/mbappe";
import { transcriptTokens } from "@/lib/films/align-transcript";
import { footballWords } from "@/lib/films/mbappe";
import { footballComposition } from "@/lib/films/football-composition";
import { toSrt } from "@/lib/hyperframes/captions";
import type { HyperframesJob } from "@/lib/schemas/hyperframes";
import "./football-editor.css";
const stamp = (n: number) =>
  `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, "0")}`;
async function request(url: string, data?: unknown) {
  const r = await fetch(
    url,
    data === undefined
      ? { cache: "no-store" }
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
  );
  const body = await r.json();
  if (!r.ok) throw new Error(body.error?.message || "Opération impossible.");
  return body;
}
export function FootballEditor({
  initial,
  initialJob,
  filmKey = "mbappe",
}: {
  initial: FootballFilm;
  initialJob?: HyperframesJob;
  filmKey?: "mbappe" | "mourinho" | "reviens" | "moloto";
}) {
  const [film, setFilm] = useState(initial),
    [selected, setSelected] = useState(0),
    [position, setPosition] = useState(0),
    [playing, setPlaying] = useState(false),
    [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(JSON.stringify(initial)),
    [job, setJob] = useState<HyperframesJob | undefined>(initialJob),
    [showVideo, setShowVideo] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const [history, setHistory] = useState<FootballFilm[]>([]);
  const scene = film.scenes[selected],
    duration = film.scenes.reduce((n, s) => n + s.duration, 0),
    start = film.scenes.slice(0, selected).reduce((n, s) => n + s.duration, 0);
  const html = useMemo(
    () => footballComposition(film, true, start + 0.1).html,
    [film, start],
  );
  const dirty = JSON.stringify(film) !== saved;
  function change(next: FootballFilm) {
    setHistory([...history.slice(-39), film]);
    setFilm(next);
    setJob(undefined);
    setPlaying(false);
  }
  function patch(value: Partial<FootballScene>) {
    if (value.narration !== undefined && scene.words?.length) {
      const tokens = transcriptTokens(value.narration);
      const a = scene.words[0].start,
        b = scene.words.at(-1)!.end;
      value = {
        ...value,
        words: tokens.map((text, i) =>
          tokens.length === scene.words!.length
            ? { ...scene.words![i], text }
            : {
                text,
                start: a + ((b - a) * i) / tokens.length,
                end: a + ((b - a) * (i + 1)) / tokens.length,
              },
        ),
      };
    }

    change({
      ...film,
      scenes: film.scenes.map((s, i) =>
        i === selected ? { ...s, ...value } : s,
      ),
    });
  }
  function transport(action: string, time?: number) {
    frame.current?.contentWindow?.postMessage(
      { type: "football-transport", action, time },
      location.origin,
    );
  }
  useEffect(() => {
    const receive = (e: MessageEvent) => {
      if (
        e.source !== frame.current?.contentWindow ||
        e.origin !== location.origin ||
        e.data?.type !== "football-position"
      )
        return;
      if (Number.isFinite(e.data.time)) setPosition(e.data.time);
      setPlaying(Boolean(e.data.playing));
    };
    addEventListener("message", receive);
    return () => removeEventListener("message", receive);
  }, []);
  useEffect(() => {
    if (job?.status !== "rendering") return;
    let active = true;
    const timer = setInterval(() => {
      request(`/api/hyperframes/${job.id}`)
        .then((j) => {
          if (active) setJob(j);
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    }, 2000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [job?.id, job?.status]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    addEventListener("beforeunload", warn);
    return () => removeEventListener("beforeunload", warn);
  }, [dirty]);
  async function save() {
    setBusy("save");
    setError("");
    try {
      await request(`/api/films/${filmKey}`, film);
      setSaved(JSON.stringify(film));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  async function render() {
    setBusy("render");
    setError("");
    try {
      await request(`/api/films/${filmKey}`, film);
      setSaved(JSON.stringify(film));
      const prepared = await request(`/api/films/${filmKey}/prepare`, film);
      setJob(await request(`/api/hyperframes/${prepared.id}/render`, {}));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  function srt() {
    const url = URL.createObjectURL(
      new Blob(
        [
          toSrt(
            {
              enabled: true,
              words: footballWords(film),
              maxChars: 48,
              maxLines: 2,
              maxWords: 12,
            },
            duration,
          ),
        ],
        { type: "application/x-subrip;charset=utf-8" },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filmKey}${film.source ? "" : "-timing-indicatif"}.srt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const locked = Boolean(busy) || job?.status === "rendering";
  return (
    <main className="football-editor">
      <header className="fe-header">
        <Link href="/projects" aria-label="Retour aux projets">
          <ArrowLeft size={19} />
        </Link>
        <div>
          <span className="fe-eyebrow">MINDSTUDIO / FILM ÉDITORIAL</span>
          <h1>{film.name}</h1>
        </div>
        <span className="fe-save-state">
          {dirty ? "Modifications non enregistrées" : "Projet enregistré"}
        </span>
        <button
          disabled={!history.length || locked}
          onClick={() => {
            const previous = history.at(-1);
            setHistory(history.slice(0, -1));
            if (previous) {
              setFilm(previous);
              setJob(undefined);
            }
          }}
        >
          <Undo2 size={16} />
          Annuler
        </button>
        <button disabled={locked} onClick={save}>
          <Save size={16} />
          {busy === "save" ? "Enregistrement…" : "Enregistrer"}
        </button>
        <button
          disabled={locked}
          onClick={async () => {
            setBusy("studio");
            setError("");
            try {
              await request(`/api/films/${filmKey}`, film);
              setSaved(JSON.stringify(film));
              window.location.assign(`/studio/${filmKey}`);
            } catch (e) {
              setError((e as Error).message);
              setBusy("");
            }
          }}
        >
          <Film size={16} /> Studio complet
        </button>
        <button className="fe-primary" disabled={locked} onClick={render}>
          {locked && busy !== "save" ? (
            <LoaderCircle size={16} />
          ) : (
            <Download size={16} />
          )}{" "}
          {job?.status === "rendering"
            ? "Rendu en cours…"
            : film.source
              ? "Exporter MP4 avec audio"
              : "Exporter MP4 muet"}
        </button>
      </header>
      <div className="fe-note">
        {film.source ? <Volume2 size={15} /> : <VolumeX size={15} />}
        <span>
          {film.source
            ? "Votre audio original · scènes calées sur la parole · son verrouillé"
            : "Créé à partir de la transcription · sans voix · durées et sous-titres indicatifs"}
        </span>
        <span>
          {film.scenes.length} scènes illustrées · 16:9 · {stamp(duration)}
        </span>
      </div>
      {error && (
        <div role="alert" className="fe-error">
          {error}
        </div>
      )}
      {job?.status === "failed" && (
        <div role="alert" className="fe-error">
          {job.error || "Le rendu a échoué."}
        </div>
      )}
      <div className="fe-workspace">
        <aside className="fe-scenes">
          <div className="fe-panel-title">
            LE RÉCIT <span>{film.scenes.length} scènes</span>
          </div>
          {film.scenes.map((s, i) => (
            <button
              key={s.id}
              className={`fe-scene ${selected === i ? "is-active" : ""}`}
              onClick={() => {
                setSelected(i);
                setPlaying(false);
              }}
            >
              <span className="fe-scene-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <strong>{s.title}</strong>
                <small>{s.intent}</small>
                <em>{s.duration.toFixed(1)} s</em>
              </div>
            </button>
          ))}
        </aside>
        <section className="fe-center">
          <div className="fe-preview">
            <iframe
              ref={frame}
              title={`Aperçu du film ${film.name}`}
              srcDoc={html}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
          <div className="fe-transport">
            <button
              aria-label={playing ? "Mettre en pause" : "Lire la vidéo"}
              onClick={() => transport(playing ? "pause" : "play")}
            >
              {playing ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <span>
              {stamp(position)} / {stamp(duration)}
            </span>
            <input
              aria-label="Position dans la vidéo"
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={position}
              onChange={(e) => transport("seek", Number(e.target.value))}
            />
            <button
              onClick={() => {
                transport("seek", start);
                transport("play");
              }}
            >
              Lire cette scène
            </button>
          </div>
          <div className="fe-strip">
            {film.scenes.map((s, i) => (
              <button
                key={s.id}
                className={selected === i ? "active" : ""}
                style={{ flex: s.duration }}
                onClick={() => setSelected(i)}
                title={s.title}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="fe-scene-description">
            <span className="fe-eyebrow">INTENTION VISUELLE</span>
            <p>{scene.intent}</p>
          </div>
          {job?.status === "completed" && (
            <div className="fe-completed">
              <Film size={21} />
              <div>
                <strong>Le MP4 est prêt</strong>
                <p>
                  {film.source ? "Avec votre audio" : "Version muette"} ·{" "}
                  {stamp(job.duration)} · 720p
                </p>
              </div>
              <button onClick={() => setShowVideo(true)}>Voir le rendu</button>
              <a
                href={`/api/hyperframes/${job.id}/files/output.mp4?download=1`}
              >
                Télécharger
              </a>
            </div>
          )}
        </section>
        <aside className="fe-inspector">
          <div className="fe-panel-title">
            MODIFIER LA SCÈNE{" "}
            <span>
              {selected + 1} / {film.scenes.length}
            </span>
          </div>
          <fieldset disabled={locked}>
            <label>
              Titre à l’écran
              <input
                value={scene.title}
                maxLength={100}
                onChange={(e) => patch({ title: e.target.value })}
              />
            </label>
            <label>
              Transcription
              <textarea
                rows={9}
                value={scene.narration}
                maxLength={4000}
                onChange={(e) => patch({ narration: e.target.value })}
              />
            </label>
            <p className="fe-help">
              {film.source
                ? "Les sous-titres suivent les repères du son. Ajouter ou retirer des mots répartit leur durée dans le passage : vérifiez ensuite à l’écoute."
                : "Les sous-titres suivent ce texte. Les horaires sont estimés pour la lecture, sans alignement audio."}
            </p>
            <label>
              Durée de la scène (secondes)
              <input
                type="number"
                disabled={Boolean(film.source)}
                min={0.2}
                max={120}
                step={0.1}
                value={scene.duration}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v >= 2 && v <= 120) patch({ duration: v });
                }}
              />
            </label>
            <details open>
              <summary>Textes dans l’illustration</summary>
              {scene.labels.map((label, i) => (
                <label key={i}>
                  Texte {i + 1}
                  <input
                    maxLength={65}
                    value={label}
                    onChange={(e) =>
                      patch({
                        labels: scene.labels.map((x, j) =>
                          j === i ? e.target.value : x,
                        ),
                      })
                    }
                  />
                </label>
              ))}
            </details>
            {filmKey === "moloto" && (
              <details open>
                <summary>Direction et rythme</summary>
                {(["kicker", "statement", "support"] as const).map((key, i) => (
                  <label key={key}>
                    {
                      [
                        "Repère du récit",
                        "Texte principal animé",
                        "Texte complémentaire",
                      ][i]
                    }
                    <input
                      value={scene[key] || ""}
                      maxLength={
                        key === "support" ? 150 : key === "kicker" ? 70 : 100
                      }
                      onChange={(e) => patch({ [key]: e.target.value })}
                    />
                  </label>
                ))}
                <label>
                  Transition
                  <select
                    value={scene.transitionStyle || "fade"}
                    onChange={(e) =>
                      patch({
                        transitionStyle: e.target.value as "fade" | "wipe",
                      })
                    }
                  >
                    <option value="fade">Fondu</option>
                    <option value="wipe">Balayage doré</option>
                  </select>
                </label>
                {film.soundtrack &&
                  (["music", "effects"] as const).map((key, i) => (
                    <label key={key}>
                      {["Ambiance musicale", "Effets sonores"][i]} ·{" "}
                      {Math.round(film.soundtrack![key] * 100)} %
                      <input
                        type="range"
                        min="0"
                        max="0.5"
                        step="0.01"
                        value={film.soundtrack![key]}
                        onChange={(e) =>
                          change({
                            ...film,
                            soundtrack: {
                              ...film.soundtrack!,
                              [key]: Number(e.target.value),
                            },
                          })
                        }
                      />
                    </label>
                  ))}
                <p className="fe-help">
                  Mets le volume à zéro pour couper une piste. La narration
                  originale reste intacte.
                </p>
              </details>
            )}
            <label>
              Couleur d’accent
              <input
                type="color"
                value={film.accent}
                onChange={(e) => change({ ...film, accent: e.target.value })}
              />
            </label>
            <label className="fe-checkbox">
              <input
                type="checkbox"
                checked={film.captions}
                onChange={(e) =>
                  change({ ...film, captions: e.target.checked })
                }
              />
              Afficher les sous-titres
            </label>
          </fieldset>
          <button onClick={srt}>
            Télécharger le SRT{film.source ? "" : " indicatif"}
          </button>
          <p className="fe-help">
            {filmKey === "reviens"
              ? "Une parabole illustrée : les personnages représentent le père et le fils du récit. Votre narration est conservée."
              : "Illustrations originales stylisées. Aucune image d’archive ni citation authentifiée n’est présentée."}
          </p>
        </aside>
      </div>
      {showVideo && job && (
        <div
          className="fe-video-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Vidéo exportée"
        >
          <button
            autoFocus
            aria-label="Fermer le rendu"
            onClick={() => setShowVideo(false)}
          >
            <X />
          </button>
          <video
            controls
            autoPlay
            src={`/api/hyperframes/${job.id}/files/output.mp4`}
          />
        </div>
      )}
    </main>
  );
}
