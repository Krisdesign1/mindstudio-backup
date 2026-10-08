"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { readPreference } from "@/lib/preferences";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  FileText,
  GripVertical,
  Layers,
  Maximize2,
  Mic,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Scissors,
  Settings2,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  WandSparkles,
  X,
} from "lucide-react";
import type { Project, Scene } from "@/lib/schemas/project";
import {
  duration,
  generateScript,
  images,
  splitIntoScenes,
  templates,
  time,
  words,
} from "@/lib/services/mock";
import { Modal, Status } from "./ui";
import { HyperframesDialog } from "./hyperframes";
import {
  HeyGenVoices,
  HeyGenRenderDialog,
  HeyGenResult,
  useHeyGenRender,
} from "./heygen";
export function Editor({
  project: p,
  onChange,
  notify,
}: {
  project: Project;
  onChange: (p: Project) => void;
  notify: (s: string) => void;
}) {
  const [tab, setTab] = useState("Script");
  const [motionDialog, setMotionDialog] = useState(
    Boolean(p.motionEdit || (p.motionTemplate && !p.hyperframesJobId)),
  );
  const [renderDialog, setRenderDialog] = useState(false);
  const heygenStatus = useHeyGenRender(p, onChange);
  const [selected, setSelected] = useState(p.scenes[0]?.id || "");
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [progress, setProgress] = useState<number | null>(null);
  const [settings, setSettings] = useState(false);
  const [previous, setPrevious] = useState<Project[]>([]);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const total = duration(p.scenes);
  const pRef = useRef(p);
  useEffect(() => {
    pRef.current = p;
  }, [p]);
  const change = useCallback(
    (patch: Partial<Project>) => {
      setPrevious((h) => [...h.slice(-19), pRef.current]);
      onChange({ ...pRef.current, ...patch, status: "Brouillon" });
    },
    [onChange],
  );
  const undo = useCallback(() => {
    const last = previous.at(-1);
    if (!last) return;
    onChange(last);
    setPrevious((history) => history.slice(0, -1));
  }, [onChange, previous]);
  const effectivePlaying = playing && position < total;
  const togglePlayback = useCallback(() => {
    if (position >= total) setPosition(0);
    setPlaying((value) => (position >= total ? true : !value));
  }, [position, total]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(tag);
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        notify("Sauvegarde automatique locale active");
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !typing) {
        e.preventDefault();
        undo();
      }
      if (
        e.code === "Space" &&
        !typing &&
        !document.querySelector("dialog[open]")
      ) {
        e.preventDefault();
        togglePlayback();
      }
    };
    window.addEventListener("keydown", key);

    return () => window.removeEventListener("keydown", key);
  }, [notify, undo, togglePlayback]);
  useEffect(() => {
    if (!effectivePlaying || !total) return;
    const timer = setInterval(
      () => setPosition((t) => Math.min(total, t + 0.1)),
      100,
    );
    return () => clearInterval(timer);
  }, [effectivePlaying, total]);
  useEffect(() => {
    if (progress === null || progress >= 100) return;
    const t = setTimeout(() => {
      const next = Math.min(100, progress + 5);
      setProgress(next);
      if (next === 100) {
        const current = pRef.current;
        onChange({
          ...current,
          status: "Terminé",
          renders: current.renders + 1,
        });
        notify("Simulation terminée. Aucun fichier vidéo réel n’a été généré.");
      }
    }, 180);
    return () => clearTimeout(t);
  }, [progress, onChange, notify]);
  useEffect(
    () => () => {
      if (pRef.current.status === "Génération" && !pRef.current.heygenRender)
        onChange({ ...pRef.current, status: "Brouillon" });
    },
    [onChange],
  );
  const pick = (scene: Scene) => {
    setSelected(scene.id);
    const index = p.scenes.findIndex((s) => s.id === scene.id);
    setPosition(duration(p.scenes.slice(0, index)));
  };
  const active =
    p.scenes.find(
      (_, index) => position < duration(p.scenes.slice(0, index + 1)),
    ) || p.scenes.at(-1);
  const split = () => {
    const scenes = splitIntoScenes(p.script);
    change({ scenes });
    setSelected(scenes[0]?.id || "");
    setPosition(0);
    setTab("Scènes");
    notify(`${scenes.length} scènes préparées à partir du script`);
  };
  const startRender = () => {
    if (!p.scenes.length) {
      notify(
        "Ajoutez un script et découpez-le en scènes avant de lancer le rendu.",
      );
      return;
    }
    onChange({ ...p, status: "Génération" });
    setProgress(0);
    setPlaying(false);
  };
  if (p.motionEdit)
    return (
      <main className="content">
        <div className="page-heading">
          <div>
            <div className="eyebrow">AUDIO → MOTION</div>
            <h1>{p.name}</h1>
            <p>
              {p.motionEdit.source?.name ||
                "Votre narration, vos scènes, votre montage."}
            </p>
          </div>
          <button
            className="button primary"
            onClick={() => setMotionDialog(true)}
          >
            Ouvrir le montage
          </button>
        </div>
        <p>
          Le son original reste la référence. Vos scènes, sous-titres et médias
          sont conservés dans le projet.
        </p>
        {motionDialog && (
          <HyperframesDialog
            project={p}
            onChange={onChange}
            onClose={() => setMotionDialog(false)}
          />
        )}
      </main>
    );
  return (
    <div className="editor">
      {motionDialog && (
        <HyperframesDialog
          project={p}
          onChange={onChange}
          onClose={() => setMotionDialog(false)}
        />
      )}
      <div className="editor-heading">
        <div className="editor-title">
          <Link
            href="/projects"
            className="icon-button"
            aria-label="Retour aux projets"
          >
            <ArrowLeft size={19} />
          </Link>
          <div>
            <input
              aria-label="Nom du projet"
              className="title-input"
              maxLength={120}
              value={p.name}
              onChange={(e) => {
                if (e.target.value.trim()) change({ name: e.target.value });
              }}
            />
            <span className="saved">
              <Check size={12} /> Sauvegarde locale automatique
            </span>
          </div>
          <Status status={p.status} />
        </div>
        <div className="editor-actions">
          <button
            className="button primary"
            onClick={() => setMotionDialog(true)}
          >
            <Layers size={16} /> HyperFrames
          </button>
          <button
            className="icon-button"
            onClick={undo}
            disabled={!previous.length}
            aria-label="Annuler la dernière modification"
          >
            <RotateCcw size={18} />
          </button>
          <button className="button" onClick={() => setSettings(!settings)}>
            <Settings2 size={16} /> Réglages
          </button>
          <button
            className="button primary"
            onClick={() => setRenderDialog(true)}
            disabled={progress !== null && progress < 100}
          >
            <Sparkles size={16} /> Générer la vidéo
          </button>
        </div>
      </div>
      <div className="editor-body">
        <section className="editing-panel">
          <div className="editor-tabs">
            {[
              { label: "Script", icon: FileText },
              { label: "Voix", icon: Mic },
              { label: "Scènes", icon: Layers },
            ].map(({ label, icon: Icon }) => (
              <button
                className={tab === label ? "active" : ""}
                key={label}
                onClick={() => setTab(label)}
              >
                <Icon size={16} />
                {label}
                {label === "Scènes" && <small>{p.scenes.length}</small>}
              </button>
            ))}
          </div>
          {tab === "Script" ? (
            <ScriptEditor
              project={p}
              onChange={change}
              onSuggestion={setSuggestion}
              onSplit={split}
            />
          ) : tab === "Voix" ? (
            <div className="voice-editor">
              <HeyGenVoices project={p} onChange={change} />
              <details className="mock-voice-details">
                <summary>Voix de démonstration du navigateur</summary>
                <VoiceSelector
                  voice={p.voice}
                  speed={p.speed}
                  setVoice={(voice) => change({ voice })}
                  setSpeed={(speed) => change({ speed })}
                />
              </details>
            </div>
          ) : (
            <SceneList
              scenes={p.scenes}
              selected={selected}
              select={pick}
              onChange={(scenes) => {
                change({ scenes });
                setPosition(0);
              }}
            />
          )}
        </section>
        <section className="preview-panel">
          <div className="preview-heading">
            <h2>
              Aperçu vidéo <span className="pill">STORYBOARD</span>
            </h2>
            <span>
              {p.format} <ChevronDown size={13} />
            </span>
          </div>
          <VideoPreview
            project={p}
            scene={active}
            playing={effectivePlaying}
            position={Math.min(position, total)}
            total={total}
            toggle={() => {
              if (position >= total) setPosition(0);
              setPlaying((v) => (position >= total ? true : !v));
            }}
            seek={setPosition}
          />
          <div className="preview-details">
            <span>
              <Layers size={15} />
              {p.template}
            </span>
            <span>{p.scenes.length} scènes</span>
          </div>
          <div className="preview-note">
            <Sparkles size={17} />
            <div>
              <strong>Votre vision prend forme.</strong>
              <p>
                Le storyboard reste un aperçu local. Utilisez HyperFrames pour
                exporter le montage animé ou HeyGen pour générer une vidéo avec
                l’IA.
              </p>
            </div>
          </div>
          {settings && (
            <div className="preview-settings">
              <div className="panel-title">
                <h2>Réglages du projet</h2>
                <button
                  className="icon-button"
                  aria-label="Fermer les réglages"
                  onClick={() => setSettings(false)}
                >
                  <X size={17} />
                </button>
              </div>
              <label>
                Format
                <select
                  value={p.format}
                  onChange={(e) =>
                    change({ format: e.target.value as Project["format"] })
                  }
                >
                  {["16:9", "9:16", "1:1", "4:5"].map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </label>
              <label>
                Template
                <select
                  value={p.template}
                  onChange={(e) => change({ template: e.target.value })}
                >
                  {templates.map((t) => (
                    <option key={t.name}>{t.name}</option>
                  ))}
                </select>
              </label>
              <SubtitleStyleSelector
                value={p.subtitle}
                onChange={(subtitle) => change({ subtitle })}
              />
            </div>
          )}
        </section>
      </div>
      <HeyGenResult
        project={p}
        error={heygenStatus.error}
        refresh={heygenStatus.refresh}
      />
      <Timeline
        scenes={p.scenes}
        selected={active?.id || selected}
        position={Math.min(position, total)}
        select={pick}
        seek={setPosition}
        playing={effectivePlaying}
        toggle={() => {
          if (position >= total) setPosition(0);
          setPlaying((v) => (position >= total ? true : !v));
        }}
      />
      {suggestion !== null && (
        <Modal
          title="Suggestion du script · Simulation"
          onClose={() => setSuggestion(null)}
        >
          <p className="muted">
            Transformation locale de démonstration, sans modèle IA.
          </p>
          <textarea
            aria-label="Suggestion de script"
            rows={12}
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
          />
          <button
            className="button primary wide"
            onClick={() => {
              change({ script: suggestion });
              setSuggestion(null);
              notify("Suggestion appliquée au script");
            }}
          >
            Appliquer au script <Check size={16} />
          </button>
        </Modal>
      )}
      {renderDialog && (
        <HeyGenRenderDialog
          project={p}
          onChange={onChange}
          onClose={() => setRenderDialog(false)}
          onDemo={() => {
            setRenderDialog(false);
            startRender();
          }}
        />
      )}
      {progress !== null && (
        <RenderProgress
          progress={progress}
          onClose={() => {
            if (progress < 100)
              onChange({ ...pRef.current, status: "Brouillon" });
            setProgress(null);
          }}
        />
      )}
    </div>
  );
}
export function VoiceSelector({
  voice,
  speed,
  setVoice,
  setSpeed,
}: {
  voice: string;
  speed: number;
  setVoice: (s: string) => void;
  setSpeed: (n: number) => void;
}) {
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState("");
  useEffect(
    () => () => {
      window.speechSynthesis?.cancel();
    },
    [],
  );
  const listen = () => {
    if (!("speechSynthesis" in window)) {
      setError("L’aperçu vocal n’est pas disponible dans ce navigateur.");
      return;
    }
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(
      "Chaque histoire commence par une idée. Donnons vie à la vôtre, avec MindStudio.",
    );
    utterance.lang = "fr-FR";
    utterance.rate = speed;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => {
      setSpeaking(false);
      setError("La synthèse vocale du navigateur est indisponible.");
    };
    setSpeaking(true);
    speechSynthesis.speak(utterance);
  };
  return (
    <>
      <div className="panel-title">
        <h2>La voix de votre histoire</h2>
        <span className="pill">DÉMO</span>
      </div>
      <p className="muted">Une présence qui donne du sens à vos mots.</p>
      <div className="voice-options">
        {["Christenvie Voice", "Gabriel · Narration", "Emma · Inspiration"].map(
          (v, i) => (
            <button
              key={v}
              className={`voice-option ${voice === v ? "chosen" : ""}`}
              onClick={() => setVoice(v)}
            >
              <span className={`voice-avatar voice-${i}`}>
                <Mic size={21} />
              </span>
              <span>
                <strong>{v}</strong>
                <small>
                  Français ·{" "}
                  {i === 0
                    ? "Voix personnelle simulée"
                    : i === 1
                      ? "Chaleureuse et profonde"
                      : "Douce et naturelle"}
                </small>
              </span>
              <span className="radio">
                {voice === v && <Check size={12} />}
              </span>
            </button>
          ),
        )}
      </div>
      <button className="button wide" onClick={listen}>
        {speaking ? <Pause size={16} /> : <Play size={16} />}{" "}
        {speaking ? "Arrêter" : "Écouter un exemple navigateur"}
      </button>
      <p className="helper">
        L’exemple utilise la voix de votre navigateur, pas une voix clonée.
      </p>
      {error && (
        <p role="alert" className="warning">
          {error}
        </p>
      )}
      <label className="range-label">
        Vitesse <span>{speed.toFixed(1)}×</span>
        <input
          aria-label="Vitesse de narration"
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
        />
      </label>
      <div className="voice-specs">
        <span>
          Ton <strong>Narratif</strong>
        </span>
        <span>
          Émotion <strong>Naturelle</strong>
        </span>
        <span>
          Intensité <strong>Moyenne</strong>
        </span>
      </div>
    </>
  );
}
function SceneList({
  scenes,
  selected,
  select,
  onChange,
}: {
  scenes: Scene[];
  selected: string;
  select: (s: Scene) => void;
  onChange: (s: Scene[]) => void;
}) {
  const drag = useRef<string | null>(null);
  const update = (id: string, patch: Partial<Scene>) =>
    onChange(scenes.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= scenes.length) return;
    const result = [...scenes];
    const [item] = result.splice(from, 1);
    result.splice(to, 0, item);
    onChange(result);
  };
  return (
    <div className="scene-list">
      <div className="panel-title">
        <h2>Votre storyboard</h2>
        <button
          className="chip"
          onClick={() =>
            onChange([
              ...scenes,
              {
                id: crypto.randomUUID(),
                text: "Nouvelle scène",
                prompt: "Plan cinématique, lumière naturelle",
                duration: 6,
                image: images[0],
                transition: "Fondu",
              },
            ])
          }
        >
          <Plus size={14} /> Ajouter
        </button>
      </div>
      <p className="muted">Glissez les scènes pour rythmer votre récit.</p>
      {!scenes.length && (
        <div className="empty">Découpez votre script ou ajoutez une scène.</div>
      )}
      {scenes.map((s, i) => (
        <article
          key={s.id}
          className={`scene-card ${s.id === selected ? "scene-selected" : ""}`}
          draggable
          onDragStart={() => {
            drag.current = s.id;
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const from = scenes.findIndex((x) => x.id === drag.current);
            if (from >= 0) move(from, i);
            drag.current = null;
          }}
        >
          <div className="scene-head">
            <GripVertical size={15} />
            <button onClick={() => select(s)}>
              SCÈNE {String(i + 1).padStart(2, "0")}
            </button>
            <span>
              {time(duration(scenes.slice(0, i)))} —{" "}
              {time(duration(scenes.slice(0, i + 1)))}
            </span>
            <button
              className="icon-button"
              aria-label={`Dupliquer la scène ${i + 1}`}
              onClick={() => {
                const copy = [...scenes];
                copy.splice(i + 1, 0, { ...s, id: crypto.randomUUID() });
                onChange(copy);
              }}
            >
              <Copy size={13} />
            </button>
            <button
              className="icon-button"
              aria-label={`Supprimer la scène ${i + 1}`}
              onClick={() => {
                if (confirm("Supprimer cette scène ?"))
                  onChange(scenes.filter((x) => x.id !== s.id));
              }}
            >
              <Trash2 size={13} />
            </button>
          </div>
          <div className="scene-content">
            <button
              className="scene-image"
              style={{ backgroundImage: `url(${s.image})` }}
              onClick={() => select(s)}
              aria-label={`Prévisualiser la scène ${i + 1}`}
            />
            <textarea
              aria-label={`Texte scène ${i + 1}`}
              value={s.text}
              onChange={(e) => update(s.id, { text: e.target.value })}
            />
          </div>
          <details>
            <summary>Prompt et réglages de la scène</summary>
            <label>
              Prompt visuel
              <textarea
                value={s.prompt}
                onChange={(e) => update(s.id, { prompt: e.target.value })}
              />
            </label>
            <div className="scene-fields">
              <label>
                Durée (s)
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={s.duration}
                  onChange={(e) =>
                    update(s.id, {
                      duration: Math.max(
                        1,
                        Math.min(120, Number(e.target.value) || 1),
                      ),
                    })
                  }
                />
              </label>
              <label>
                Transition
                <select
                  value={s.transition}
                  onChange={(e) =>
                    update(s.id, {
                      transition: e.target.value as Scene["transition"],
                    })
                  }
                >
                  <option>Fondu</option>
                  <option>Coupe</option>
                  <option>Zoom</option>
                </select>
              </label>
            </div>
            <div className="scene-media">
              {images.map((image, j) => (
                <button
                  className={image === s.image ? "chosen" : ""}
                  aria-label={`Choisir le visuel ${j + 1}`}
                  key={image}
                  style={{ backgroundImage: `url(${image})` }}
                  onClick={() => update(s.id, { image })}
                />
              ))}
            </div>
            <div className="scene-fields">
              <button
                className="chip"
                disabled={i === 0}
                onClick={() => move(i, i - 1)}
              >
                ↑ Monter
              </button>
              <button
                className="chip"
                disabled={i === scenes.length - 1}
                onClick={() => move(i, i + 1)}
              >
                ↓ Descendre
              </button>
            </div>
          </details>
        </article>
      ))}
    </div>
  );
}
function VideoPreview({
  project,
  scene,
  playing,
  position,
  total,
  toggle,
  seek,
}: {
  project: Project;
  scene: Scene | undefined;
  playing: boolean;
  position: number;
  total: number;
  toggle: () => void;
  seek: (v: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [quality] = useState(() =>
    readPreference("mindstudio.quality", "1080p"),
  );
  return (
    <>
      <div className="preview-stage" ref={ref}>
        <div
          className={`video-canvas ${playing ? "is-playing" : ""}`}
          style={{ aspectRatio: project.format.replace(":", " / ") }}
        >
          <div
            className="video-image"
            key={scene?.id}
            style={{
              backgroundImage: `url(${scene?.image || project.image})`,
              animationPlayState: playing ? "running" : "paused",
            }}
          />
          <div className="video-vignette" />
          <span className="video-brand">
            <ApertureMark /> MINDSTUDIO
          </span>
          <div
            className={`video-subtitle subtitle-${project.subtitle.toLowerCase()}`}
          >
            {scene?.text || "Votre histoire commence ici."}
          </div>
          <span className="video-demo">APERÇU SIMULÉ</span>
        </div>
      </div>
      <div className="player-controls">
        <button
          className="icon-button"
          aria-label={playing ? "Mettre en pause" : "Lire l’aperçu"}
          disabled={!total}
          onClick={toggle}
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <span>
          {time(position)} <span className="muted">/ {time(total)}</span>
        </span>
        <input
          aria-label="Position de lecture"
          type="range"
          min={0}
          max={total || 1}
          step={0.1}
          value={position}
          onChange={(e) => seek(Number(e.target.value))}
        />
        <span className="resolution">{quality}</span>
        <button
          className="icon-button"
          aria-label="Plein écran"
          onClick={() => {
            if (document.fullscreenElement) void document.exitFullscreen();
            else void ref.current?.requestFullscreen?.();
          }}
        >
          <Maximize2 size={16} />
        </button>
      </div>
    </>
  );
}
function ApertureMark() {
  return <span className="aperture-mark">◉</span>;
}
function SubtitleStyleSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (s: string) => void;
}) {
  return (
    <fieldset className="subtitle-fieldset">
      <legend>Style de sous-titres</legend>
      <div className="subtitle-options">
        {["Minimal", "Bold", "Documentary", "Viral", "Clean"].map((s) => (
          <button
            className={`chip ${value === s ? "chosen" : ""}`}
            key={s}
            aria-pressed={value === s}
            onClick={() => onChange(s)}
          >
            {s}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
function Timeline({
  scenes,
  selected,
  position,
  select,
  seek,
  playing,
  toggle,
}: {
  scenes: Scene[];
  selected: string;
  position: number;
  select: (s: Scene) => void;
  seek: (n: number) => void;
  playing: boolean;
  toggle: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [muted, setMuted] = useState<string[]>([]);
  const total = duration(scenes);
  return (
    <section className="timeline">
      <div className="timeline-toolbar">
        <div>
          <Layers size={16} />
          <strong>Timeline</strong>
          <span className="pill">STORYBOARD</span>
        </div>
        <div>
          <button
            className="icon-button"
            disabled={!total}
            onClick={toggle}
            aria-label={playing ? "Pause timeline" : "Lire la timeline"}
          >
            {playing ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <span className="timeline-time">
            {time(position)} <span>/ {time(total)}</span>
          </span>
        </div>
        <div>
          <button
            className="icon-button"
            aria-label="Réduire le zoom"
            onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
          >
            <Minus size={15} />
          </button>
          <span>{zoom * 100}%</span>
          <button
            className="icon-button"
            aria-label="Augmenter le zoom"
            onClick={() => setZoom((z) => Math.min(4, z + 0.5))}
          >
            <Plus size={15} />
          </button>
        </div>
      </div>
      <div className="timeline-main">
        <div className="track-labels">
          <div />
          <div>
            <FilmIcon /> VIDÉO
          </div>
          {["VOIX", "TEXTE", "MUSIQUE"].map((track) => (
            <div key={track}>
              {track}
              <button
                className="icon-button"
                aria-label={`${muted.includes(track) ? "Activer" : "Désactiver"} piste ${track}`}
                onClick={() =>
                  setMuted((m) =>
                    m.includes(track)
                      ? m.filter((x) => x !== track)
                      : [...m, track],
                  )
                }
              >
                {muted.includes(track) ? (
                  <VolumeX size={12} />
                ) : (
                  <Volume2 size={12} />
                )}
              </button>
            </div>
          ))}
        </div>
        <div className="timeline-scroll">
          <div className="track-content" style={{ width: `${zoom * 100}%` }}>
            <div
              className="ruler"
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                seek(((e.clientX - r.left) / r.width) * total);
              }}
            >
              {Array.from({ length: 9 }, (_, i) => (
                <span key={i}>{time((total * i) / 8)}</span>
              ))}
            </div>
            <div className="video-track">
              {scenes.map((s, i) => (
                <button
                  title={`Scène ${i + 1} · ${s.duration}s`}
                  key={s.id}
                  onClick={() => select(s)}
                  className={s.id === selected ? "active" : ""}
                  style={{
                    flex: s.duration,
                    backgroundImage: `linear-gradient(0deg,#0009,#0002),url(${s.image})`,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </button>
              ))}
            </div>
            <div
              className={`audio-track ${muted.includes("VOIX") ? "track-muted" : ""}`}
            >
              {Array.from({ length: 100 }, (_, i) => (
                <i key={i} style={{ height: `${20 + ((i * 37) % 75)}%` }} />
              ))}
            </div>
            <div
              className={`text-track ${muted.includes("TEXTE") ? "track-muted" : ""}`}
            >
              {scenes.map((s) => (
                <div key={s.id} style={{ flex: s.duration }}>
                  {s.text}
                </div>
              ))}
            </div>
            <div
              className={`music-track ${muted.includes("MUSIQUE") ? "track-muted" : ""}`}
            >
              ＋ Piste musicale · disponible en Phase 4
            </div>
            <div
              className="playhead"
              style={{ left: `${total ? (position / total) * 100 : 0}%` }}
            >
              <span />
            </div>
          </div>
        </div>
      </div>
      <div className="timeline-footer">
        <span>
          Les pistes audio représentent le montage prévu · Aperçu silencieux
        </span>
        <span>
          Espace : lire / pause <span>⌘ S : sauvegarder</span>
        </span>
      </div>
    </section>
  );
}
function FilmIcon() {
  return <Layers size={13} />;
}
function RenderProgress({
  progress,
  onClose,
}: {
  progress: number;
  onClose: () => void;
}) {
  return (
    <Modal
      title={
        progress === 100
          ? "Votre simulation est prête"
          : "Préparation de votre vidéo"
      }
      onClose={onClose}
    >
      <div className="render-orb">
        <Sparkles size={32} />
      </div>
      <div className="render-percent">
        {progress}
        <span>%</span>
      </div>
      <p className="render-description">
        {progress === 100
          ? "Le workflow de génération a été simulé avec succès."
          : "Votre histoire prend vie, une étape après l’autre."}
      </p>
      <div className="progress-bar">
        <div style={{ width: `${progress}%` }} />
      </div>
      <div className="render-steps">
        {[
          "Préparation du script",
          "Génération de la voix",
          "Création des scènes",
          "Traitement des médias",
          "Rendu vidéo",
        ].map((step, i) => (
          <div key={step}>
            <span>{step}</span>
            {progress >= (i + 1) * 20 ? (
              <Check size={16} />
            ) : (
              <span>{progress >= i * 20 ? "En cours…" : "En attente"}</span>
            )}
          </div>
        ))}
      </div>
      <p className="helper">
        Mode démo : aucune API appelée, aucun fichier MP4 généré.
      </p>
      <button className="button primary wide" onClick={onClose}>
        {progress === 100 ? "Revenir au studio" : "Annuler la simulation"}
      </button>
    </Modal>
  );
}

export function ScriptEditor({
  project: p,
  onChange,
  onSuggestion,
  onSplit,
}: {
  project: Project;
  onChange: (patch: Partial<Project>) => void;
  onSuggestion: (text: string) => void;
  onSplit: () => void;
}) {
  return (
    <div className="script-editor">
      <div className="panel-title">
        <h2>Les mots de votre histoire</h2>
        <span className="pill">FR</span>
      </div>
      <p className="muted">Écrivez avec intention. Chaque mot compte.</p>
      <textarea
        className="script-text"
        aria-label="Script du projet"
        placeholder="Commencez votre récit ici…"
        value={p.script}
        onChange={(e) => onChange({ script: e.target.value })}
      />
      <div className="script-count">
        <span>{words(p.script)} mots</span>
        <span>
          ≈ {time(Math.ceil(words(p.script) / 2.5 / p.speed))} de narration
        </span>
      </div>
      <div className="ai-tools">
        <span>
          <Sparkles size={14} /> ASSISTANT SCRIPT <small>SIMULATION</small>
        </span>
        <div>
          {[
            "Améliorer",
            "Raccourcir",
            "Allonger",
            "Rendre plus viral",
            "Ajouter un hook",
            "Ajouter un CTA",
            "Corriger",
          ].map((action) => (
            <button
              className="chip"
              key={action}
              disabled={!p.script.trim()}
              onClick={() => {
                const text = p.script;
                onSuggestion(
                  action === "Raccourcir"
                    ? text
                        .split(/(?<=[.!?])\s+/)
                        .slice(
                          0,
                          Math.max(
                            1,
                            Math.ceil(text.split(/(?<=[.!?])\s+/).length / 2),
                          ),
                        )
                        .join(" ")
                    : action === "Ajouter un hook" ||
                        action === "Rendre plus viral"
                      ? `Et si cette histoire changeait votre regard ?\n\n${text}`
                      : action === "Ajouter un CTA"
                        ? `${text}\n\nPartagez cette vidéo avec quelqu’un qui a besoin de l’entendre.`
                        : action === "Allonger"
                          ? `${text}\n\nPrenez le temps de réfléchir à votre prochain pas. Une petite action peut ouvrir une nouvelle perspective.`
                          : text.replace(/\s+/g, " ").trim(),
                );
              }}
            >
              {action}
            </button>
          ))}
        </div>
      </div>
      {!p.script && (
        <button
          className="button"
          onClick={() => onChange({ script: generateScript(p.idea) })}
        >
          <WandSparkles size={16} /> Insérer un exemple de script
        </button>
      )}
      <button
        className="button primary wide"
        disabled={!p.script.trim()}
        onClick={onSplit}
      >
        <Scissors size={16} /> Découper en scènes <ArrowRight size={16} />
      </button>
      <small className="helper">
        Le découpage remplace les scènes existantes. Vous pouvez annuler.
      </small>
    </div>
  );
}
