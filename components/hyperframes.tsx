"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Film,
  Plus,
  Trash2,
  Copy,
  Undo2,
  Redo2,
  ArrowUp,
  ArrowDown,
  Upload,
  LoaderCircle,
  WandSparkles,
  Check,
  ChevronRight,
  ChevronDown,
  Music2,
  Layers,
  SlidersHorizontal,
  Type,
  Palette,
  Clock3,
} from "lucide-react";
import {
  planContextual,
  illustrationIds,
  illustrationLabels,
} from "@/lib/hyperframes/contextual";
import {
  transcriptionSchema,
  type Transcription,
} from "@/lib/schemas/transcription";
import { planFromSpeech } from "@/lib/hyperframes/speech-plan";
import {
  families,
  applyFamily,
  sceneVariants,
} from "@/lib/hyperframes/families";
import { replaceSceneTranscript } from "@/lib/hyperframes/transcript-edit";
import {
  sceneArtwork,
  sceneArtCss,
  artVariantCss,
} from "@/lib/hyperframes/scene-art";
import type { CSSProperties } from "react";
import {
  videoAccept,
  audioAccept,
  audioDemuxer,
  audioFormatLabel,
  videoDemuxer,
  videoFormatLabel,
} from "@/lib/video-formats";
import { visualAssetSchema } from "@/lib/schemas/visual-asset";
import { MotionTimeline, type Command } from "./motion-timeline";
import {
  toSrt,
  subtitleCues,
  cleanCaptionText,
} from "@/lib/hyperframes/captions";
import { Modal } from "./ui";
import { MotionGallery } from "./motion-gallery";
import type { Project } from "@/lib/schemas/project";
import {
  motionTemplates,
  findMotionTemplate,
  type MotionTemplateId,
} from "@/lib/hyperframes/templates";
import {
  motionEditSchema,
  newOverlay,
  sourceVideoSchema,
  type MotionEdit,
  type Overlay,
} from "@/lib/schemas/motion-edit";
import { overlayComposition } from "@/lib/hyperframes/overlay-composition";
import { hyperframesJob, type HyperframesJob } from "@/lib/schemas/hyperframes";
import { errorMessage } from "@/lib/heygen-client";
async function request(url: string, body?: unknown) {
  const response = await fetch(url, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      data.error?.message || "Le serveur local est indisponible.",
    );
  return hyperframesJob.parse(data);
}
const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));
export function HyperframesDialog({
  project,
  onChange,
  onClose,
}: {
  project: Project;
  onChange: (p: Project) => void;
  onClose: () => void;
}) {
  const [edit, setEdit] = useState<MotionEdit>(
    () =>
      project.motionEdit || {
        layers: project.motionTemplate
          ? [newOverlay(findMotionTemplate(project.motionTemplate).id)]
          : [],
        keepAudio: true,
        quality: "1080p",
      },
  );
  const [selected, setSelected] = useState(edit.layers[0]?.id || "");
  const [playhead, setPlayhead] = useState(0);
  const loopCommand = useRef<{ sourceId?: string; command: Command } | null>(
    null,
  );
  const previewRef = useRef<HTMLIFrameElement>(null);
  const [identityOpen, setIdentityOpen] = useState(false);
  const [storyboardOpen, setStoryboardOpen] = useState(false);
  const [variantsOpen, setVariantsOpen] = useState(false);
  const [variantRound, setVariantRound] = useState(0);
  const [picker, setPicker] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<
    "content" | "style" | "timing"
  >("content");
  const [speech, setSpeech] = useState<Transcription | null>(null);
  const [speechError, setSpeechError] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [transcriptDraft, setTranscriptDraft] = useState<
    Record<string, string>
  >({});
  const [captionsOpen, setCaptionsOpen] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [past, setPast] = useState<MotionEdit[]>([]);
  const [future, setFuture] = useState<MotionEdit[]>([]);
  const [job, setJob] = useState<HyperframesJob | null>(null);
  const [fingerprint, setFingerprint] = useState(
    project.motionExportFingerprint || "",
  );
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const latest = useRef({ project, onChange, edit });
  useEffect(() => {
    latest.current = { project, onChange, edit };
  }, [project, onChange, edit]);
  function persist(next: MotionEdit) {
    setEdit(next);
    latest.current.edit = next;
    const p = { ...latest.current.project, motionEdit: next };
    latest.current.project = p;
    latest.current.onChange(p);
  }
  function change(next: MotionEdit) {
    const previous = latest.current.edit;
    setPast((h) => [...h.slice(-39), previous]);
    setFuture([]);
    persist(next);
  }
  function contextualize() {
    if (!edit.source) return;
    try {
      const layers = planContextual(
        edit.transcript || project.script,
        edit.source.duration,
      );
      change({
        ...edit,
        transcript: edit.transcript || project.script,
        layers,
      });
      setSelected(layers[0].id);
      setError("");
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  function undo() {
    const next = past.at(-1);
    if (!next) return;
    setFuture((h) => [edit, ...h]);
    setPast((h) => h.slice(0, -1));
    persist(next);
  }
  function redo() {
    const next = future[0];
    if (!next) return;
    setPast((h) => [...h, edit]);
    setFuture((h) => h.slice(1));
    persist(next);
  }
  const source = edit.source;
  const sourceId = source?.id;
  const layer = edit.layers.find((l) => l.id === selected);
  const duration = source?.duration || 10;
  useEffect(() => {
    if (!sourceId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const response = await fetch(
          `/api/motion/media/${sourceId}/transcribe`,
          { cache: "no-store" },
        );
        if (!response.ok) return;
        const next = transcriptionSchema.parse(await response.json());
        if (cancelled) return;
        setSpeech(next);
        if (next.status === "loading" || next.status === "transcribing")
          timer = setTimeout(poll, 2000);
      } catch (e) {
        if (!cancelled) setSpeechError(errorMessage(e));
      }
    }
    void poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sourceId, speech?.status]);
  async function analyse(id = source?.id) {
    if (!id) return;
    setSpeechError("");
    try {
      const response = await fetch(`/api/motion/media/${id}/transcribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error?.message || "Analyse indisponible.");
      setSpeech(transcriptionSchema.parse(data));
    } catch (e) {
      setSpeechError(errorMessage(e));
    }
  }
  function applySpeech() {
    if (
      !source ||
      !speech ||
      speech.sourceId !== source.id ||
      speech.status !== "completed"
    )
      return;
    try {
      const layers = planFromSpeech(speech.segments, source.duration);
      change({
        ...edit,
        layers,
        captions: { enabled: speech.words.length > 0, words: speech.words },
        transcript: speech.segments.map((s) => s.text).join(" "),
      });
      setSelected(layers[0].id);
      setError("");
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  const savedId = project.hyperframesJobId;
  useEffect(() => {
    if (!savedId) return;
    let cancelled = false;
    request(`/api/hyperframes/${savedId}`)
      .then((next) => {
        if (!cancelled && next.kind === "overlay") setJob(next);
      })
      .catch((e) => {
        if (!cancelled) setError(errorMessage(e));
      });
    return () => {
      cancelled = true;
    };
  }, [savedId]);
  useEffect(() => {
    if (job?.status !== "rendering") return;
    let cancelled = false;
    const timer = setInterval(() => {
      void request(`/api/hyperframes/${job.id}`)
        .then((next) => {
          if (!cancelled) setJob(next);
        })
        .catch((e) => {
          if (!cancelled) setError(errorMessage(e));
        });
    }, 2500);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [job?.id, job?.status]);
  const initialTime = layer
    ? Math.min(duration - 0.01, layer.start + Math.min(0.6, layer.duration / 2))
    : 0;
  const preview = useMemo(
    () =>
      source
        ? overlayComposition(edit, source, {
            preview: true,
            initialTime,
            editable: true,
          }).html
        : "",
    [edit, source, initialTime],
  );
  useEffect(() => {
    function receive(event: MessageEvent) {
      if (
        event.source !== previewRef.current?.contentWindow ||
        event.origin !== window.location.origin
      )
        return;
      const data = event.data;
      if (
        data?.type === "motion-position" &&
        typeof data.time === "number" &&
        Number.isFinite(data.time)
      ) {
        setPlayhead(data.time);
        return;
      }
      if (
        data?.type !== "motion-title" ||
        typeof data.id !== "string" ||
        typeof data.text !== "string" ||
        data.text.length > 240
      )
        return;
      const current = latest.current.edit;
      if (!current.layers.some((l) => l.id === data.id)) return;
      change({
        ...current,
        layers: current.layers.map((l) =>
          l.id === data.id ? { ...l, text: data.text } : l,
        ),
      });
    }
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  });
  const stale = fingerprint !== JSON.stringify(edit);
  function patch(values: Partial<Overlay>) {
    if (!layer) return;
    const next = { ...layer, ...values };
    if (source) {
      next.start = clamp(next.start, 0, Math.max(0, duration - 0.2));
      next.duration = clamp(next.duration, 0.2, duration - next.start);
    }
    change({
      ...edit,
      layers: edit.layers.map((l) => (l.id === layer.id ? next : l)),
    });
  }
  function add(id: MotionTemplateId) {
    const next = newOverlay(id, duration);
    change({ ...edit, layers: [...edit.layers, next] });
    setSelected(next.id);
    setPicker(false);
  }
  function move(direction: number) {
    if (!layer) return;
    const layers = [...edit.layers],
      index = layers.findIndex((l) => l.id === layer.id),
      to = index + direction;
    if (to < 0 || to >= layers.length) return;
    [layers[index], layers[to]] = [layers[to], layers[index]];
    change({ ...edit, layers });
  }
  async function uploadVisual(file: File, layerId: string) {
    setBusy("Import du média visuel…");
    setError("");
    try {
      const response = await fetch("/api/motion/assets", {
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
      const media = visualAssetSchema.parse(data),
        current = latest.current.edit;
      const target = current.layers.find((l) => l.id === layerId);
      if (
        media.kind === "video" &&
        target &&
        target.duration / media.duration > 60
      )
        throw new Error("Choisissez un clip plus long pour cette scène.");
      change({
        ...current,
        layers: current.layers.map((l) =>
          l.id === layerId ? { ...l, media, contextual: true } : l,
        ),
      });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy("");
    }
  }
  async function upload(file: File) {
    setBusy(
      "Import et préparation du fichier… La conversion peut prendre quelques minutes.",
    );
    setError("");
    try {
      if (!videoDemuxer(file.name) && !audioDemuxer(file.name))
        throw new Error(
          `Audio : ${audioFormatLabel}. Vidéo : ${videoFormatLabel}.`,
        );
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
      const current = latest.current.edit;
      change({
        ...current,
        source,
        captions: undefined,
        transcript: undefined,
        keepAudio: true,
        layers: current.layers.map((l) => ({
          ...l,
          start: Math.min(l.start, source.duration - 0.2),
          duration: Math.max(
            0.2,
            Math.min(
              l.duration,
              source.duration - Math.min(l.start, source.duration - 0.2),
            ),
          ),
        })),
      });
      setSpeech(null);
      if (source.hasAudio) void analyse(source.id);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy("");
    }
  }
  async function exportVideo() {
    if (!source) return;
    setBusy("Préparation du montage…");
    setError("");
    const snapshot = edit;
    try {
      const next = await request("/api/motion/prepare", {
        projectId: project.id,
        name: project.name,
        edit: snapshot,
      });
      setJob(next);
      const signature = JSON.stringify(snapshot);
      setFingerprint(signature);
      const p = {
        ...latest.current.project,
        hyperframesJobId: next.id,
        motionExportFingerprint: signature,
        motionEdit: latest.current.edit,
      };
      latest.current.project = p;
      latest.current.onChange(p);
      setJob(await request(`/api/hyperframes/${next.id}/render`, {}));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy("");
    }
  }
  async function restoreSettings(file: File) {
    setError("");
    try {
      if (file.size > 2000000)
        throw new Error("Fichier de réglages trop volumineux.");
      const raw = JSON.parse(await file.text());
      const restored = motionEditSchema.parse(raw.edit);
      change(restored);
      setSelected(restored.layers[0]?.id || "");
    } catch {
      setError(
        "Fichier de réglages invalide. Choisissez un fichier motion-project.json sauvegardé dans le studio.",
      );
    }
  }
  function downloadProject() {
    const blob = new Blob(
      [
        JSON.stringify(
          { version: 1, projectId: project.id, name: project.name, edit },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "motion-project.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const rendering = job?.status === "rendering";
  const analysing =
    speech?.sourceId === source?.id &&
    (speech?.status === "loading" || speech?.status === "transcribing");
  const recognised =
    speech?.sourceId === source?.id && speech?.status === "completed";
  const selectedIndex = edit.layers.findIndex((l) => l.id === selected);
  const stylePresets = [
    { color: "#c8f36b", name: "Lime" },
    { color: "#b8a4ff", name: "Lavande" },
    { color: "#77dddb", name: "Lagoon" },
    { color: "#ffbb8b", name: "Pêche" },
    { color: "#f2e9d5", name: "Ivoire" },
  ];
  const uploadControl = (large = false) => (
    <label className={`button ${large ? "primary" : ""} ms-upload-button`}>
      <Upload size={16} />
      {source ? "Remplacer la source" : "Déposer le son"}
      <input
        aria-label="Importer le son ou une vidéo"
        type="file"
        accept={`${audioAccept},${videoAccept}`}
        disabled={Boolean(busy) || rendering || analysing}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />
    </label>
  );
  return (
    <Modal title="HyperFrames / Motion Studio" onClose={onClose}>
      <div className="ms-workspace">
        <style>{sceneArtCss + artVariantCss}</style>
        <header className="ms-topbar">
          <div className="ms-project">
            <span className="ms-project-icon">
              <Film size={18} />
            </span>
            <div>
              <strong>{project.name}</strong>
              <small>
                <i /> Modifications enregistrées sur cet ordinateur
              </small>
            </div>
          </div>
          <div className="ms-top-actions">
            <button className="button" onClick={() => setIdentityOpen(true)}>
              Identité visuelle
            </button>
            <button
              className="button"
              disabled={!edit.layers.length}
              onClick={() => setStoryboardOpen(true)}
            >
              Storyboard
            </button>
            <button
              className="button"
              disabled={!edit.layers.length}
              onClick={() => {
                setTranscriptDraft(
                  Object.fromEntries(
                    edit.layers.map((l) => [l.id, l.narration || ""]),
                  ),
                );
                setTranscriptOpen(true);
              }}
            >
              Modifier la transcription
            </button>
            <button
              className="icon-button"
              aria-label="Annuler la modification motion"
              disabled={!past.length}
              onClick={undo}
            >
              <Undo2 size={17} />
            </button>
            <button
              className="icon-button"
              aria-label="Rétablir la modification motion"
              disabled={!future.length}
              onClick={redo}
            >
              <Redo2 size={17} />
            </button>
            <span className="ms-divider" />
            {uploadControl()}
            <button
              className="button primary"
              disabled={!source}
              onClick={() => setExportOpen((v) => !v)}
            >
              <Download size={15} />
              {rendering ? "Export en cours" : "Exporter"}
              <ChevronDown size={13} />
            </button>
          </div>
        </header>
        {(error || speechError || speech?.status === "failed") && (
          <div className="ms-alert" role="alert">
            {error || speechError || speech?.error}
          </div>
        )}
        {busy && (
          <div className="ms-notice" role="status">
            <LoaderCircle className="spin" size={15} />
            {busy}
          </div>
        )}
        <div className="ms-body">
          <aside className="ms-scenes">
            <div className="ms-section-title">
              <span>
                <Layers size={15} /> Scènes
              </span>
              <b>{edit.layers.length.toString().padStart(2, "0")}</b>
            </div>
            <div className="ms-scene-list">
              {edit.layers.length ? (
                edit.layers.map((l, i) => (
                  <button
                    className={`ms-scene-card ${selected === l.id ? "selected" : ""}`}
                    key={l.id}
                    onClick={() => setSelected(l.id)}
                    aria-pressed={selected === l.id}
                  >
                    <div
                      className="ms-scene-thumb"
                      style={{ "--accent": l.color } as CSSProperties}
                    >
                      <div
                        aria-hidden="true"
                        className="ms-mini-art"
                        dangerouslySetInnerHTML={{
                          __html: sceneArtwork(l.illustration || "abstract", {
                            title: l.artTitle,
                            tagline: l.artTagline,
                            symbol: l.artSymbol,
                            variant:
                              l.artVariant ||
                              ["minimal", "orbit", "cards"][i % 3],
                          }),
                        }}
                      />
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      {!l.enabled && <b>Masquée</b>}
                    </div>
                    <div className="ms-scene-caption">
                      <strong>{l.text || "Sans titre"}</strong>
                      <small>
                        {l.start.toFixed(1)}s —{" "}
                        {(l.start + l.duration).toFixed(1)}s{" "}
                        <ChevronRight size={12} />
                      </small>
                    </div>
                  </button>
                ))
              ) : (
                <div className="ms-scenes-empty">
                  <Layers size={24} />
                  <p>
                    Votre récit prendra
                    <br />
                    forme ici.
                  </p>
                  <small>Importez votre son pour commencer.</small>
                </div>
              )}
            </div>
            <button
              className="ms-add-scene"
              disabled={edit.layers.length >= 30}
              onClick={() => setPicker(true)}
            >
              <Plus size={15} /> Ajouter une scène
            </button>
          </aside>
          <main className="ms-canvas-area">
            <div
              className="ms-canvas-heading"
              title="Double-cliquez sur un titre dans l’aperçu pour le modifier."
            >
              <span>APERÇU · DOUBLE-CLIC SUR UN TITRE POUR MODIFIER</span>
              <small>
                {source
                  ? `${source.width} × ${source.height} · ${source.duration.toFixed(1)} s`
                  : "Votre son, votre histoire"}
              </small>
            </div>
            <div className={`ms-stage ${source ? "has-video" : ""}`}>
              {source ? (
                <iframe
                  ref={previewRef}
                  onLoad={() => {
                    if (loopCommand.current?.sourceId === source?.id)
                      previewRef.current?.contentWindow?.postMessage(
                        loopCommand.current.command,
                        window.location.origin,
                      );
                  }}
                  title="Aperçu du montage modifiable"
                  srcDoc={preview}
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <div className="ms-welcome">
                  <div className="ms-welcome-copy">
                    <span className="ms-eyebrow">DU SON À L’IMAGE</span>
                    <h2>
                      Une histoire.
                      <br />
                      <em>Tout un univers.</em>
                    </h2>
                    <p>
                      Déposez votre son. Le studio écoute la voix, repère les
                      moments du récit et prépare les scènes animées.
                    </p>
                    {uploadControl(true)}
                    <small>
                      MP3, WAV, M4A, FLAC… · Vidéos acceptées · 500 Mo max
                    </small>
                  </div>
                  <div
                    className="ms-welcome-art"
                    style={{ "--accent": "#c8f36b" } as CSSProperties}
                    dangerouslySetInnerHTML={{ __html: sceneArtwork("idea") }}
                  />
                </div>
              )}
            </div>
            <section className="ms-assistant">
              <span className="ms-assistant-icon">
                <WandSparkles size={20} />
              </span>
              <div>
                <strong>
                  {analysing
                    ? "Le studio écoute votre son…"
                    : recognised
                      ? "Votre récit est prêt à être mis en scène"
                      : "L’animation commence par votre voix"}
                </strong>
                <p>
                  {analysing
                    ? speech?.status === "loading"
                      ? "Chargement du moteur local de reconnaissance vocale."
                      : `Repérage des paroles et de leurs horaires · ${speech?.progress}%`
                    : recognised
                      ? `${speech!.segments.length} passages reconnus. Les scènes suivront les horaires de la voix.`
                      : source?.hasAudio
                        ? "Analysez l’audio existant : aucun texte à recopier."
                        : "Déposez un son ou une vidéo avec une voix pour préparer vos scènes."}
                </p>
                {analysing && (
                  <div className="ms-analysis-progress">
                    <span
                      style={{
                        width: `${Math.max(4, speech?.progress || 0)}%`,
                      }}
                    />
                  </div>
                )}
              </div>
              <button
                className="button ms-ai-button"
                disabled={!source?.hasAudio || analysing}
                onClick={() => (recognised ? applySpeech() : void analyse())}
              >
                {analysing ? (
                  <LoaderCircle className="spin" size={15} />
                ) : (
                  <WandSparkles size={15} />
                )}{" "}
                {recognised ? "Créer la vidéo" : "Analyser"}
              </button>
            </section>
            {recognised && !speech!.words.length && (
              <button className="button" onClick={() => void analyse()}>
                Récupérer les timecodes des mots
              </button>
            )}
            {recognised && (
              <p className="ms-caption">
                Les visuels sont des suggestions thématiques. Vérifiez les
                paroles et ajustez chaque scène à votre récit. Illustrer toute
                la vidéo remplace les pistes actuelles ; vous pouvez annuler.
              </p>
            )}
            <div className="ms-audio-tools">
              <span>
                <Music2 size={13} />{" "}
                {source?.kind === "audio"
                  ? source.name
                  : "Déposer le son → Analyser → Créer la vidéo"}
              </span>
              {source?.kind === "audio" && (
                <label>
                  Format{" "}
                  <select
                    aria-label="Format de la vidéo"
                    value={edit.canvas || "16:9"}
                    onChange={(e) =>
                      change({
                        ...edit,
                        canvas: e.target.value as MotionEdit["canvas"],
                      })
                    }
                  >
                    <option value="16:9">Horizontal · 16:9</option>
                    <option value="9:16">Vertical · 9:16</option>
                    <option value="1:1">Carré · 1:1</option>
                  </select>
                </label>
              )}
              <button
                className="button"
                onClick={() => setCaptionsOpen(true)}
                disabled={!edit.captions?.words.length}
              >
                Sous-titres ·{" "}
                {edit.captions?.enabled ? "Activés" : "Désactivés"}
              </button>
            </div>
            <MotionTimeline
              key={source?.id || "empty"}
              edit={edit}
              selected={selected}
              onSelect={setSelected}
              onChange={change}
              time={playhead}
              send={(command) => {
                if (command.action === "loop")
                  loopCommand.current = { sourceId: source?.id, command };
                previewRef.current?.contentWindow?.postMessage(
                  command,
                  window.location.origin,
                );
              }}
            />
            <details
              className="ms-script-tools"
              open={showManual}
              onToggle={(e) => setShowManual(e.currentTarget.open)}
            >
              <summary>
                Corriger le texte ou utiliser un script{" "}
                <ChevronDown size={14} />
              </summary>
              <label>
                Script / transcription
                <textarea
                  aria-label="Transcription pour les illustrations"
                  maxLength={20000}
                  value={
                    edit.transcript ??
                    (recognised
                      ? speech!.segments.map((s) => s.text).join(" ")
                      : project.script)
                  }
                  onChange={(e) =>
                    change({ ...edit, transcript: e.target.value })
                  }
                />
              </label>
              <button
                className="button"
                disabled={
                  !source || !(edit.transcript ?? project.script).trim()
                }
                onClick={contextualize}
              >
                Utiliser ce texte
              </button>
              <small>
                Le découpage manuel estime les durées. L’analyse audio utilise
                les horaires reconnus.
              </small>
            </details>
          </main>
          <aside className="ms-inspector">
            <div className="ms-section-title">
              <span>
                <SlidersHorizontal size={15} /> Personnaliser
              </span>
              {layer && <b>{String(selectedIndex + 1).padStart(2, "0")}</b>}
            </div>
            {layer ? (
              <>
                <div className="ms-inspector-tabs">
                  {(
                    [
                      { id: "content", label: "Contenu", icon: Type },
                      { id: "style", label: "Style", icon: Palette },
                      { id: "timing", label: "Timing", icon: Clock3 },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      aria-pressed={inspectorTab === t.id}
                      onClick={() => setInspectorTab(t.id)}
                    >
                      <t.icon size={14} />
                      {t.label}
                    </button>
                  ))}
                </div>
                <div className="ms-inspector-scroll">
                  {inspectorTab === "content" && (
                    <>
                      <label className="ms-field">
                        Titre à l’écran
                        <textarea
                          aria-label="Texte de l’animation"
                          value={layer.text}
                          maxLength={240}
                          onChange={(e) => patch({ text: e.target.value })}
                          placeholder="Votre titre…"
                        />
                        <small>
                          Un titre court donne plus de force à l’image.
                        </small>
                      </label>
                      <div className="ms-field">
                        <span>Illustration</span>
                        <div className="ms-visual-picker">
                          {illustrationIds.map((id) => (
                            <button
                              key={id}
                              aria-label={`Illustration : ${illustrationLabels[id]}`}
                              aria-pressed={layer.illustration === id}
                              onClick={() =>
                                patch({
                                  illustration: id,
                                  contextual: true,
                                  media: undefined,
                                })
                              }
                            >
                              <span
                                className="ms-visual-icon"
                                style={
                                  { "--accent": layer.color } as CSSProperties
                                }
                                dangerouslySetInnerHTML={{
                                  __html: sceneArtwork(id),
                                }}
                              />
                              <small>{illustrationLabels[id]}</small>
                            </button>
                          ))}
                        </div>
                      </div>
                      <details className="ms-custom-labels">
                        <summary>Textes décoratifs et numérotation</summary>
                        <p>
                          Laissez un champ vide pour le masquer. Aucun texte
                          n’est imposé.
                        </p>
                        {(
                          [
                            ["brand", "Signature / marque"],
                            ["chapter", "Chapitre / sous-titre"],
                            ["counter", "Compteur libre (ex. 05 / 05)"],
                            ["artTitle", "Texte de la carte"],
                            ["artTagline", "Texte du cartouche"],
                            ["artSymbol", "Symbole de la carte"],
                          ] as const
                        ).map(([key, label]) => (
                          <label className="ms-field" key={key}>
                            {label}
                            <input
                              aria-label={label}
                              value={layer[key] || ""}
                              maxLength={
                                key === "artSymbol"
                                  ? 8
                                  : key === "counter"
                                    ? 40
                                    : key === "artTagline"
                                      ? 120
                                      : 100
                              }
                              onChange={(e) => patch({ [key]: e.target.value })}
                            />
                          </label>
                        ))}
                      </details>
                      <div className="ms-field">
                        <span>Votre image, clip ou logo</span>
                        <label className="button ms-upload-button">
                          <Upload size={14} />
                          {layer.media
                            ? "Remplacer le média"
                            : "Ajouter un média"}
                          <input
                            aria-label="Importer une image, un clip ou un logo"
                            type="file"
                            accept={`.png,.jpg,.jpeg,.webp,${videoAccept}`}
                            disabled={Boolean(busy)}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) void uploadVisual(file, layer.id);
                              e.target.value = "";
                            }}
                          />
                        </label>
                        {layer.media && (
                          <>
                            <small>
                              {layer.media.name}
                              {layer.media.kind === "video"
                                ? " · Son du clip désactivé · Bouclé sur la scène"
                                : ""}
                            </small>
                            <select
                              aria-label="Cadrage du média"
                              value={layer.mediaFit || "contain"}
                              onChange={(e) =>
                                patch({
                                  mediaFit: e.target.value as
                                    "cover" | "contain",
                                })
                              }
                            >
                              <option value="contain">
                                Afficher en entier
                              </option>
                              <option value="cover">Remplir le cadre</option>
                            </select>
                            <button
                              className="button"
                              onClick={() => patch({ media: undefined })}
                            >
                              Revenir à l’illustration
                            </button>
                          </>
                        )}
                        <small>
                          Images PNG, JPEG, WebP ; clips vidéo. Le son maître
                          reste inchangé.
                        </small>
                      </div>
                      {layer.contextual && (
                        <label className="ms-field">
                          Intention visuelle
                          <input
                            aria-label="Intention visuelle"
                            value={layer.intent || ""}
                            maxLength={240}
                            onChange={(e) => patch({ intent: e.target.value })}
                          />
                          <small>
                            Note de réalisation : choisissez ensuite
                            l’illustration qui exprime cette idée.
                          </small>
                        </label>
                      )}
                      {layer.narration && (
                        <div className="ms-narration">
                          <span>
                            <Music2 size={13} /> PASSAGE DE LA VOIX
                          </span>
                          <p>{layer.narration}</p>
                        </div>
                      )}
                    </>
                  )}
                  {inspectorTab === "style" && (
                    <>
                      <div className="ms-field">
                        <span>Direction artistique</span>
                        <div className="ms-family-grid">
                          {families.map((f) => (
                            <button
                              key={f.id}
                              aria-pressed={layer.family === f.id}
                              onClick={() => patch(applyFamily(layer, f.id))}
                            >
                              <span style={{ background: f.color }} />
                              <strong>{f.name}</strong>
                            </button>
                          ))}
                        </div>
                        <button
                          className="button primary"
                          disabled={!source}
                          onClick={() => setVariantsOpen(true)}
                        >
                          Proposer trois variantes
                        </button>
                      </div>

                      <div className="ms-field">
                        <span>Composition</span>
                        <div className="ms-layout-options">
                          {(
                            [
                              "split",
                              "poster",
                              "editorial",
                              "typography",
                              "cinema",
                            ] as const
                          ).map((layout, i) => (
                            <button
                              aria-pressed={
                                (layer.layout || "split") === layout
                              }
                              key={layout}
                              onClick={() =>
                                patch({ layout, contextual: true })
                              }
                            >
                              <span className={`ms-layout-demo demo-${layout}`}>
                                <i />
                                <b />
                              </span>
                              {
                                [
                                  "Duo",
                                  "Affiche",
                                  "Éditorial",
                                  "Typographie",
                                  "Cinéma",
                                ][i]
                              }
                            </button>
                          ))}
                        </div>
                      </div>
                      <label className="ms-field">
                        Univers graphique
                        <select
                          aria-label="Univers graphique"
                          value={
                            layer.artVariant ||
                            ["minimal", "orbit", "cards"][selectedIndex % 3]
                          }
                          onChange={(e) =>
                            patch({
                              artVariant: e.target
                                .value as Overlay["artVariant"],
                              contextual: true,
                            })
                          }
                        >
                          <option value="minimal">Illustration épurée</option>
                          <option value="orbit">Orbites</option>
                          <option value="cards">Cartes en volume</option>
                        </select>
                      </label>
                      <label className="ms-field">
                        Mouvement du visuel
                        <select
                          aria-label="Mouvement du visuel"
                          value={
                            layer.motion ||
                            ["slide", "zoom", "orbit", "float"][
                              selectedIndex % 4
                            ]
                          }
                          onChange={(e) =>
                            patch({
                              motion: e.target.value as Overlay["motion"],
                            })
                          }
                        >
                          <option value="slide">Glissement</option>
                          <option value="zoom">Zoom dynamique</option>
                          <option value="orbit">Rotation</option>
                          <option value="float">Flottement</option>
                          <option value="still">Fixe</option>
                        </select>
                      </label>
                      <div className="ms-field">
                        <span>Palette</span>
                        <div className="ms-swatches">
                          {stylePresets.map((c) => (
                            <button
                              key={c.color}
                              style={{ background: c.color }}
                              aria-label={c.name}
                              aria-pressed={layer.color === c.color}
                              onClick={() => patch({ color: c.color })}
                            >
                              {layer.color === c.color && <Check size={15} />}
                            </button>
                          ))}
                          <input
                            aria-label="Couleur personnalisée"
                            type="color"
                            value={layer.color}
                            onChange={(e) => patch({ color: e.target.value })}
                          />
                        </div>
                      </div>
                      <label className="ms-field">
                        Animation
                        <select
                          value={layer.templateId}
                          onChange={(e) =>
                            patch({
                              templateId: e.target.value as MotionTemplateId,
                            })
                          }
                        >
                          {motionTemplates.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      {(
                        [
                          {
                            key: "size",
                            label: "Taille du titre",
                            min: 16,
                            max: 160,
                            step: 1,
                          },
                          {
                            key: "opacity",
                            label: "Opacité",
                            min: 0.1,
                            max: 1,
                            step: 0.1,
                          },
                          {
                            key: "x",
                            label: "Position horizontale",
                            min: 5,
                            max: 95,
                            step: 1,
                          },
                          {
                            key: "y",
                            label: "Position verticale",
                            min: 5,
                            max: 95,
                            step: 1,
                          },
                        ] as const
                      ).map((f) => (
                        <label className="ms-field ms-slider-field" key={f.key}>
                          <span>
                            {f.label}
                            <b>{layer[f.key]}</b>
                          </span>
                          <input
                            type="range"
                            aria-label={f.label}
                            min={f.min}
                            max={f.max}
                            step={f.step}
                            value={layer[f.key]}
                            onChange={(e) =>
                              patch({ [f.key]: e.target.valueAsNumber })
                            }
                          />
                        </label>
                      ))}
                    </>
                  )}
                  {inspectorTab === "timing" && (
                    <>
                      <label className="ms-field">
                        Transition visuelle
                        <select
                          aria-label="Transition de scène"
                          value={layer.transition || "cut"}
                          onChange={(e) =>
                            patch({
                              transition: e.target
                                .value as Overlay["transition"],
                            })
                          }
                        >
                          <option value="cut">Coupe franche</option>
                          <option value="fade">Fondu au fond</option>
                        </select>
                      </label>
                      {layer.transition === "fade" && (
                        <label className="ms-field">
                          Durée du fondu (s)
                          <input
                            aria-label="Durée du fondu"
                            type="number"
                            min="0"
                            max={Math.min(2, layer.duration / 2)}
                            step="0.05"
                            value={Math.min(
                              layer.transitionDuration ?? 0.35,
                              layer.duration / 2,
                            )}
                            onChange={(e) => {
                              if (Number.isFinite(e.target.valueAsNumber))
                                patch({
                                  transitionDuration: clamp(
                                    e.target.valueAsNumber,
                                    0,
                                    Math.min(2, layer.duration / 2),
                                  ),
                                });
                            }}
                          />
                          <small>
                            Entrée et sortie visuelles ; le son ne change pas.
                          </small>
                        </label>
                      )}

                      <div className="ms-timing-card">
                        <Clock3 size={24} />
                        <strong>
                          {layer.duration.toFixed(1)}
                          <small> secondes</small>
                        </strong>
                        <p>
                          Choisissez le moment où cette scène apparaît dans la
                          vidéo.
                        </p>
                      </div>
                      <div className="ms-time-fields">
                        <label className="ms-field">
                          Début (s)
                          <input
                            type="number"
                            aria-label="Début (s)"
                            min={0}
                            max={duration - 0.2}
                            step={0.1}
                            value={layer.start}
                            onChange={(e) => {
                              if (Number.isFinite(e.target.valueAsNumber))
                                patch({ start: e.target.valueAsNumber });
                            }}
                          />
                        </label>
                        <label className="ms-field">
                          Durée (s)
                          <input
                            type="number"
                            aria-label="Durée (s)"
                            min={0.2}
                            max={duration - layer.start}
                            step={0.1}
                            value={layer.duration}
                            onChange={(e) => {
                              if (Number.isFinite(e.target.valueAsNumber))
                                patch({ duration: e.target.valueAsNumber });
                            }}
                          />
                        </label>
                      </div>
                      <p className="ms-caption">
                        Fin : {(layer.start + layer.duration).toFixed(1)} s. Une
                        modification des horaires peut créer un espace entre les
                        scènes.
                      </p>
                      <div className="ms-stack-controls">
                        <button
                          className="button"
                          disabled={selectedIndex === 0}
                          onClick={() => move(-1)}
                        >
                          <ArrowUp size={14} /> Arrière
                        </button>
                        <button
                          className="button"
                          disabled={selectedIndex === edit.layers.length - 1}
                          onClick={() => move(1)}
                        >
                          <ArrowDown size={14} /> Avant
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <div className="ms-inspector-footer">
                  <label>
                    <input
                      type="checkbox"
                      checked={layer.enabled}
                      onChange={(e) => patch({ enabled: e.target.checked })}
                    />{" "}
                    Scène visible
                  </label>
                  <div>
                    <button
                      className="icon-button"
                      aria-label="Dupliquer la scène"
                      disabled={edit.layers.length >= 30}
                      onClick={() => {
                        const copy = { ...layer, id: crypto.randomUUID() };
                        change({ ...edit, layers: [...edit.layers, copy] });
                        setSelected(copy.id);
                      }}
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label="Supprimer la scène"
                      onClick={() => {
                        const layers = edit.layers.filter(
                          (l) => l.id !== layer.id,
                        );
                        change({ ...edit, layers });
                        setSelected(layers[0]?.id || "");
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="ms-inspector-empty">
                <SlidersHorizontal size={28} />
                <h3>À vous de jouer</h3>
                <p>
                  Sélectionnez une scène pour modifier son texte, son univers
                  visuel et son animation.
                </p>
              </div>
            )}
          </aside>
        </div>
        <footer className="ms-statusbar">
          <span>
            <i /> Projet modifiable · Son original conservé
          </span>
          <div>
            <button onClick={downloadProject}>Sauvegarder le projet</button>
            <label>
              Ouvrir des réglages
              <input
                type="file"
                accept="application/json,.json"
                aria-label="Reprendre un projet motion"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void restoreSettings(file);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </footer>
        {identityOpen && (
          <div className="ms-drawer-backdrop">
            <section className="ms-export-drawer">
              <header>
                <h2>Identité du projet</h2>
                <button
                  className="button"
                  onClick={() => setIdentityOpen(false)}
                >
                  Fermer
                </button>
              </header>
              <p>
                Une palette et une police communes à toutes les scènes. Les
                réglages individuels restent conservés lorsque cette identité
                est désactivée.
              </p>
              {(() => {
                const identity = edit.identity || {
                  enabled: false,
                  accent: "#c8f36b",
                  background: "#101714",
                  text: "#f4f5ea",
                  font: "sans" as const,
                  signature: "",
                  captionStyle: "box" as const,
                };
                const update = (values: Partial<typeof identity>) =>
                  change({ ...edit, identity: { ...identity, ...values } });
                return (
                  <>
                    <label>
                      <input
                        type="checkbox"
                        checked={identity.enabled}
                        onChange={(e) => update({ enabled: e.target.checked })}
                      />{" "}
                      Appliquer à toute la vidéo
                    </label>
                    <div className="ms-brand-colors">
                      {(
                        [
                          ["accent", "Accent"],
                          ["background", "Fond"],
                          ["text", "Texte"],
                        ] as const
                      ).map(([key, label]) => (
                        <label key={key}>
                          {label}
                          <input
                            type="color"
                            aria-label={`Identité : ${label}`}
                            value={identity[key]}
                            onChange={(e) => update({ [key]: e.target.value })}
                          />
                        </label>
                      ))}
                    </div>
                    <label className="ms-field">
                      Police
                      <select
                        value={identity.font}
                        onChange={(e) =>
                          update({
                            font: e.target.value as typeof identity.font,
                          })
                        }
                      >
                        <option value="sans">Sans sérif · Moderne</option>
                        <option value="serif">Sérif · Éditorial</option>
                        <option value="mono">Monospace · Technique</option>
                      </select>
                    </label>
                    <label className="ms-field">
                      Signature de marque
                      <input
                        value={identity.signature}
                        maxLength={100}
                        onChange={(e) => update({ signature: e.target.value })}
                      />
                    </label>
                    <label className="ms-field">
                      Sous-titres
                      <select
                        value={identity.captionStyle}
                        onChange={(e) =>
                          update({
                            captionStyle: e.target
                              .value as typeof identity.captionStyle,
                          })
                        }
                      >
                        <option value="box">Cartouche sombre</option>
                        <option value="plain">Texte sans cartouche</option>
                        <option value="highlight">
                          Cartouche couleur de marque
                        </option>
                      </select>
                    </label>
                  </>
                );
              })()}
            </section>
          </div>
        )}
        {storyboardOpen && (
          <div className="ms-drawer-backdrop">
            <section className="ms-transcript-drawer">
              <header>
                <div>
                  <h2>Storyboard du récit</h2>
                  <p>
                    Vérifiez les paroles, l’intention et le style avant de
                    passer au montage détaillé.
                  </p>
                </div>
                <button
                  className="button"
                  onClick={() => setStoryboardOpen(false)}
                >
                  Fermer
                </button>
              </header>
              <div className="ms-storyboard-list">
                {edit.layers.map((l, i) => (
                  <article key={l.id}>
                    <header>
                      <strong>Scène {i + 1}</strong>
                      <span>
                        {l.start.toFixed(1)}–{(l.start + l.duration).toFixed(1)}{" "}
                        s
                      </span>
                    </header>
                    <p>{l.narration || "Aucune narration associée."}</p>
                    <label>
                      Titre à l’écran
                      <input
                        value={l.text}
                        maxLength={240}
                        onChange={(e) =>
                          change({
                            ...edit,
                            layers: edit.layers.map((x) =>
                              x.id === l.id
                                ? { ...x, text: e.target.value }
                                : x,
                            ),
                          })
                        }
                      />
                    </label>
                    <label>
                      Intention visuelle
                      <input
                        value={l.intent || ""}
                        maxLength={240}
                        onChange={(e) =>
                          change({
                            ...edit,
                            layers: edit.layers.map((x) =>
                              x.id === l.id
                                ? { ...x, intent: e.target.value }
                                : x,
                            ),
                          })
                        }
                      />
                    </label>
                    <small>
                      {l.media?.name ||
                        illustrationLabels[l.illustration || "abstract"]}{" "}
                      ·{" "}
                      {families.find((f) => f.id === l.family)?.name ||
                        "Style personnalisé"}
                    </small>
                    <div>
                      <button
                        className="button"
                        onClick={() => {
                          setSelected(l.id);
                          setStoryboardOpen(false);
                        }}
                      >
                        Modifier cette scène
                      </button>
                      <button
                        className="button"
                        disabled={!source}
                        onClick={() => {
                          setSelected(l.id);
                          setStoryboardOpen(false);
                          setVariantsOpen(true);
                        }}
                      >
                        Trois variantes
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
        {variantsOpen && layer && (
          <div className="ms-drawer-backdrop">
            <section className="ms-variants-drawer">
              <header>
                <div>
                  <h2>Trois mises en scène du même passage</h2>
                  <p>
                    Comparez les aperçus animés. Votre texte, votre son et vos
                    médias sont conservés.
                  </p>
                </div>
                <button
                  className="button"
                  onClick={() => setVariantsOpen(false)}
                >
                  Fermer
                </button>
              </header>
              <div className="ms-variants-grid">
                {sceneVariants(layer, variantRound).map((candidate) => {
                  const f = families.find((f) => f.id === candidate.family)!;
                  const demoSource = source || {
                    id: crypto.randomUUID(),
                    name: "Aperçu",
                    duration,
                    width: 1920,
                    height: 1080,
                    hasAudio: false,
                  };
                  return (
                    <article key={f.id}>
                      <iframe
                        title={`Variante ${f.name}`}
                        sandbox="allow-scripts allow-same-origin"
                        srcDoc={
                          overlayComposition(
                            {
                              ...edit,
                              layers: [candidate],
                              keepAudio: false,
                              captions: undefined,
                            },
                            demoSource,
                            {
                              preview: true,
                              silent: true,
                              initialTime: Math.min(
                                duration - 0.01,
                                candidate.start + 0.8,
                              ),
                            },
                          ).html
                        }
                      />
                      <div>
                        <h3>{f.name}</h3>
                        <p>{f.description}</p>
                        <button
                          className="button primary"
                          onClick={() => {
                            patch(candidate);
                            setVariantsOpen(false);
                          }}
                        >
                          Choisir cette variante
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
              <footer>
                <button
                  className="button"
                  onClick={() => setVariantRound((r) => r + 1)}
                >
                  Voir trois autres propositions
                </button>
                <small>
                  Les variantes typographiques masquent le média sans le
                  supprimer. Annuler restaure le style précédent.
                </small>
              </footer>
            </section>
          </div>
        )}
        {transcriptOpen && (
          <div className="ms-drawer-backdrop">
            <section className="ms-transcript-drawer">
              <header>
                <div>
                  <h2>Modifier la transcription</h2>
                  <p>
                    Corrigez les paroles scène par scène. Les titres à l’écran
                    restent indépendants.
                  </p>
                </div>
                <button
                  className="button"
                  onClick={() => setTranscriptOpen(false)}
                >
                  Fermer
                </button>
              </header>
              <p className="ms-caption">
                Si le nombre de mots change, leurs horaires sont répartis sur le
                passage existant : vérifiez ensuite la synchronisation dans «
                Sous-titres ».
              </p>
              <div className="ms-transcript-list">
                {edit.layers.map((l, i) => (
                  <label key={l.id}>
                    <span>
                      Scène {i + 1} · {l.start.toFixed(1)}–
                      {(l.start + l.duration).toFixed(1)} s
                    </span>
                    <textarea
                      aria-label={`Transcription scène ${i + 1}`}
                      maxLength={3000}
                      value={transcriptDraft[l.id] ?? l.narration ?? ""}
                      onChange={(e) =>
                        setTranscriptDraft((d) => ({
                          ...d,
                          [l.id]: e.target.value,
                        }))
                      }
                    />
                  </label>
                ))}
              </div>
              <footer>
                <button
                  className="button primary"
                  onClick={() => {
                    let next = edit;
                    for (const l of edit.layers) {
                      const value = transcriptDraft[l.id];
                      if (value !== undefined && value !== (l.narration || ""))
                        next = replaceSceneTranscript(next, l.id, value);
                    }
                    const valid = motionEditSchema.safeParse(next);
                    if (!valid.success) {
                      setError(
                        "Transcription trop longue : limitez le projet à 4 000 mots et 20 000 caractères.",
                      );
                      return;
                    }
                    change(valid.data);
                    setTranscriptOpen(false);
                  }}
                >
                  Appliquer aux sous-titres et enregistrer
                </button>
              </footer>
            </section>
          </div>
        )}
        {captionsOpen && (
          <div className="ms-drawer-backdrop">
            <section className="ms-export-drawer ms-captions-drawer">
              <header>
                <h2>Sous-titres synchronisés</h2>
                <button
                  className="button"
                  onClick={() => setCaptionsOpen(false)}
                >
                  Fermer
                </button>
              </header>
              <label>
                <input
                  type="checkbox"
                  checked={edit.captions?.enabled || false}
                  onChange={(e) =>
                    change({
                      ...edit,
                      captions: {
                        ...edit.captions,
                        words: edit.captions?.words || [],
                        enabled: e.target.checked,
                      },
                    })
                  }
                />{" "}
                Afficher les sous-titres
              </label>
              <p>
                Corrigez les mots et leurs horaires sans modifier le son.{" "}
                {layer
                  ? `Mots de la scène ${selectedIndex + 1}.`
                  : "Sélectionnez une scène pour afficher ses mots."}
              </p>
              {edit.captions && (
                <>
                  <div className="ms-subtitle-options">
                    <label>
                      Style
                      <select
                        aria-label="Style des sous-titres"
                        value={edit.captions.style || "box"}
                        onChange={(e) =>
                          change({
                            ...edit,
                            captions: {
                              ...edit.captions!,
                              style: e.target.value as NonNullable<
                                MotionEdit["captions"]
                              >["style"],
                            },
                          })
                        }
                      >
                        <option value="box">Cartouche classique</option>
                        <option value="outline">Contour / ombre</option>
                        <option value="editorial">Éditorial</option>
                        <option value="pill">Capsule</option>
                      </select>
                    </label>
                    <label>
                      Caractères / ligne
                      <input
                        type="number"
                        min="20"
                        max="48"
                        value={edit.captions.maxChars ?? 32}
                        onChange={(e) => {
                          if (Number.isFinite(e.target.valueAsNumber))
                            change({
                              ...edit,
                              captions: {
                                ...edit.captions!,
                                maxChars: clamp(
                                  Math.round(e.target.valueAsNumber),
                                  20,
                                  48,
                                ),
                              },
                            });
                        }}
                      />
                    </label>
                    <label>
                      Lignes
                      <select
                        value={edit.captions.maxLines ?? 2}
                        onChange={(e) =>
                          change({
                            ...edit,
                            captions: {
                              ...edit.captions!,
                              maxLines: +e.target.value as 1 | 2,
                            },
                          })
                        }
                      >
                        <option value="1">Une ligne</option>
                        <option value="2">Deux lignes</option>
                      </select>
                    </label>
                    <label>
                      Mots / passage
                      <input
                        type="number"
                        min="3"
                        max="12"
                        value={edit.captions.maxWords ?? 8}
                        onChange={(e) => {
                          if (Number.isFinite(e.target.valueAsNumber))
                            change({
                              ...edit,
                              captions: {
                                ...edit.captions!,
                                maxWords: clamp(
                                  Math.round(e.target.valueAsNumber),
                                  3,
                                  12,
                                ),
                              },
                            });
                        }}
                      />
                    </label>
                  </div>
                  <label>
                    <input
                      type="checkbox"
                      checked={edit.captions.activeWord !== false}
                      onChange={(e) =>
                        change({
                          ...edit,
                          captions: {
                            ...edit.captions!,
                            activeWord: e.target.checked,
                          },
                        })
                      }
                    />{" "}
                    Surligner le mot prononcé
                  </label>
                  <label className="ms-field">
                    Mots importants (séparés par des virgules)
                    <input
                      aria-label="Mots importants"
                      value={(edit.captions.keywords || []).join(",")}
                      maxLength={1000}
                      onChange={(e) =>
                        change({
                          ...edit,
                          captions: {
                            ...edit.captions!,
                            keywords: e.target.value
                              .split(",")
                              .map((k) => k.trim().slice(0, 40))
                              .slice(0, 40),
                          },
                        })
                      }
                    />
                  </label>
                  <div className="ms-subtitle-actions">
                    <button
                      className="button"
                      onClick={() =>
                        change({
                          ...edit,
                          captions: {
                            ...edit.captions!,
                            words: edit.captions!.words.map((w) => ({
                              ...w,
                              text: cleanCaptionText(w.text),
                            })),
                          },
                        })
                      }
                    >
                      Nettoyer les espaces
                    </button>
                    <button
                      className="button primary"
                      onClick={() => {
                        const blob = new Blob(
                          [toSrt(edit.captions!, duration)],
                          { type: "application/x-subrip;charset=utf-8" },
                        );
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "sous-titres.srt";
                        a.click();
                        setTimeout(() => URL.revokeObjectURL(url), 1000);
                      }}
                    >
                      Télécharger le SRT
                    </button>
                  </div>
                  <p>
                    La ponctuation reconnue est conservée et modifiable dans les
                    mots ci-dessous. Le SRT contient le texte et les horaires,
                    sans couleurs ni animation.
                  </p>
                  <details>
                    <summary>
                      Aperçu du découpage (
                      {subtitleCues(edit.captions, duration).length} passages)
                    </summary>
                    <div className="ms-cue-list">
                      {subtitleCues(edit.captions, duration).map((cue, i) => (
                        <div key={i}>
                          <small>
                            {cue.start.toFixed(2)} – {cue.end.toFixed(2)} s
                          </small>
                          <p>
                            {cue.lines
                              .map((line) => line.map((w) => w.text).join(" "))
                              .join("\n")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </details>
                </>
              )}
              <div className="ms-caption-rows">
                {edit.captions?.words
                  .map((word, index) => ({ word, index }))
                  .filter(
                    ({ word }) =>
                      layer &&
                      word.start >= layer.start &&
                      word.start < layer.start + layer.duration,
                  )
                  .map(({ word, index }) => (
                    <div key={index}>
                      <input
                        aria-label={`Mot ${index + 1}`}
                        value={word.text}
                        maxLength={160}
                        onChange={(e) =>
                          change({
                            ...edit,
                            captions: {
                              ...edit.captions!,
                              words: edit.captions!.words.map((w, i) =>
                                i === index
                                  ? { ...w, text: e.target.value }
                                  : w,
                              ),
                            },
                          })
                        }
                      />
                      <input
                        type="number"
                        aria-label={`Début du mot ${index + 1}`}
                        step="0.01"
                        min="0"
                        max={word.end - 0.01}
                        value={word.start}
                        onChange={(e) => {
                          const n = e.target.valueAsNumber;
                          if (Number.isFinite(n))
                            change({
                              ...edit,
                              captions: {
                                ...edit.captions!,
                                words: edit.captions!.words.map((w, i) =>
                                  i === index
                                    ? {
                                        ...w,
                                        start: clamp(n, 0, word.end - 0.01),
                                      }
                                    : w,
                                ),
                              },
                            });
                        }}
                      />
                      <input
                        type="number"
                        aria-label={`Fin du mot ${index + 1}`}
                        step="0.01"
                        min={word.start + 0.01}
                        max={duration}
                        value={word.end}
                        onChange={(e) => {
                          const n = e.target.valueAsNumber;
                          if (Number.isFinite(n))
                            change({
                              ...edit,
                              captions: {
                                ...edit.captions!,
                                words: edit.captions!.words.map((w, i) =>
                                  i === index
                                    ? {
                                        ...w,
                                        end: clamp(
                                          n,
                                          word.start + 0.01,
                                          duration,
                                        ),
                                      }
                                    : w,
                                ),
                              },
                            });
                        }}
                      />
                    </div>
                  ))}
              </div>
              <small>
                Colonnes : mot · début (s) · fin (s). Pour un autre passage,
                sélectionnez sa scène dans le montage.
              </small>
            </section>
          </div>
        )}
        {picker && (
          <div className="ms-drawer-backdrop">
            <section className="ms-template-drawer">
              <header>
                <h2>Ajouter une animation</h2>
                <button className="button" onClick={() => setPicker(false)}>
                  Fermer la collection
                </button>
              </header>
              <MotionGallery compact onSelect={add} />
            </section>
          </div>
        )}
        {exportOpen && (
          <div className="ms-drawer-backdrop">
            <section className="ms-export-drawer">
              <header>
                <h2>Votre vidéo, prête à partager</h2>
                <button className="button" onClick={() => setExportOpen(false)}>
                  Fermer
                </button>
              </header>
              <p>
                Le MP4 utilise un instantané du projet. Vous pourrez continuer à
                modifier les scènes après l’export.
              </p>
              <label className="ms-field">
                Résolution
                <select
                  value={edit.quality}
                  onChange={(e) =>
                    change({
                      ...edit,
                      quality: e.target.value as MotionEdit["quality"],
                    })
                  }
                >
                  <option>1080p</option>
                  <option>720p</option>
                </select>
              </label>
              <label className="ms-export-audio">
                <input
                  type="checkbox"
                  checked={edit.keepAudio}
                  disabled={!source?.hasAudio || source.kind === "audio"}
                  onChange={(e) =>
                    change({ ...edit, keepAudio: e.target.checked })
                  }
                />{" "}
                Conserver le son original
              </label>
              <button
                className="button primary"
                disabled={!source || Boolean(busy) || rendering}
                onClick={() => void exportVideo()}
              >
                {rendering ? (
                  <LoaderCircle className="spin" size={16} />
                ) : (
                  <Film size={16} />
                )}{" "}
                {rendering ? "Export en cours…" : "Exporter en MP4"}
              </button>
              {job && (
                <div className="ms-export-status">
                  {stale && (
                    <p>
                      Les dernières modifications apparaîtront dans le prochain
                      export.
                    </p>
                  )}
                  {job.status === "failed" && <p role="alert">{job.error}</p>}
                  {job.status === "completed" && (
                    <>
                      <video
                        controls
                        src={`/api/hyperframes/${job.id}/files/output.mp4`}
                      />
                      <a
                        className="button primary"
                        href={`/api/hyperframes/${job.id}/files/output.mp4?download=1`}
                      >
                        <Download size={16} /> Télécharger le MP4
                      </a>
                    </>
                  )}
                  {job.status === "rendering" && (
                    <p role="status">
                      Vous pouvez fermer cette fenêtre. Le rendu continue sur
                      cet ordinateur.
                    </p>
                  )}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </Modal>
  );
}
