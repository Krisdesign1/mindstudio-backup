"use client";
import Link from "next/link";
import { SaveVoice, VoiceCollection } from "./library";
import type { SavedVoice, NarrationRecord } from "@/lib/voice-library";
import { AudioTrimmer } from "./audio-trimmer";
import { voiceExcerpt } from "@/lib/voice-excerpt";
import { useEffect, useRef, useState } from "react";
import {
  Aperture,
  Upload,
  Mic,
  Square,
  Play,
  Download,
  ArrowRight,
  Check,
  Music2,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import { defaultVoiceSettings, type VoiceSettings } from "@/lib/voice-settings";
import s from "./voices.module.css";
import { voiceFilename } from "@/lib/voice-title";
import {
  AudioPreview,
  AudioLoading,
  clock,
  type AudioJob as Job,
} from "./audio-preview";
const audioUrl = (id: string) => `/api/voice?id=${id}&audio=1`;
function Range({
  label,
  value,
  min,
  max,
  step = 0.05,
  onChange,
  hint,
  disabled = false,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <label className={s.range}>
      <span>
        <b>{label}</b>
        <output>{value.toLocaleString("fr-FR")}</output>
      </span>
      {hint && <small>{hint}</small>}
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className={s.bounds}>
        <small>{min}</small>
        <small>{max}</small>
      </span>
    </label>
  );
}
function AudioInput({
  file,
  onChange,
  disabled,
  maxSeconds = 30,
}: {
  file: File | null;
  onChange: (f: File) => void;
  disabled: boolean;
  maxSeconds?: number;
}) {
  const input = useRef<HTMLInputElement>(null),
    recorder = useRef<MediaRecorder | null>(null),
    stream = useRef<MediaStream | null>(null),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [recording, setRecording] = useState(false),
    [error, setError] = useState(""),
    [preview, setPreview] = useState("");
  useEffect(() => {
    let active = true;
    const url = file ? URL.createObjectURL(file) : "";
    queueMicrotask(() => {
      if (active) setPreview(url);
    });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [file]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      if (recorder.current?.state === "recording") {
        recorder.current.onstop = null;
        recorder.current.stop();
      }
      stream.current?.getTracks().forEach((t) => t.stop());
    },
    [],
  );
  async function record() {
    setError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia)
        throw new Error(
          "Ce navigateur ne permet pas l’enregistrement. Importe un fichier audio.",
        );
      stream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const r = new MediaRecorder(stream.current);
      recorder.current = r;
      const chunks: BlobPart[] = [];
      r.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      r.onstop = () => {
        if (timer.current) clearTimeout(timer.current);
        stream.current?.getTracks().forEach((t) => t.stop());
        setRecording(false);
        const type = r.mimeType || "audio/webm";
        onChange(
          new File(chunks, `ma-voix.${type.includes("mp4") ? "m4a" : "webm"}`, {
            type,
          }),
        );
      };
      r.start();
      setRecording(true);
      timer.current = setTimeout(() => {
        if (r.state === "recording") r.stop();
      }, maxSeconds * 1000);
    } catch (e) {
      stream.current?.getTracks().forEach((t) => t.stop());
      setError(e instanceof Error ? e.message : "Accès au microphone refusé.");
    }
  }
  return (
    <div>
      <div
        className={s.drop}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!disabled && !recording && e.dataTransfer.files[0])
            onChange(e.dataTransfer.files[0]);
        }}
      >
        <span className={s.dropLabel}>♫ Importer ou enregistrer</span>
        <input
          ref={input}
          className={s.hiddenInput}
          type="file"
          accept="audio/*,.wav,.mp3,.m4a,.aac,.ogg,.flac,.webm"
          aria-label="Importer un audio"
          disabled={disabled || recording}
          onChange={(e) => {
            if (e.target.files?.[0]) onChange(e.target.files[0]);
            e.target.value = "";
          }}
        />
        <button
          className={s.dropButton}
          disabled={disabled || recording}
          onClick={() => input.current?.click()}
        >
          <Upload size={30} />
          <strong>{file ? file.name : "Dépose ton audio ici"}</strong>
          <span>
            {file
              ? "Clique pour changer de fichier"
              : "ou clique pour choisir un fichier"}
          </span>
        </button>
        <div className={s.dropActions}>
          <button
            title="Importer un fichier"
            aria-label="Choisir un fichier audio"
            disabled={disabled || recording}
            onClick={() => input.current?.click()}
          >
            <Upload size={19} />
          </button>
          <button
            title={recording ? "Arrêter" : "Enregistrer au microphone"}
            aria-label={
              recording
                ? "Arrêter l’enregistrement"
                : "Enregistrer au microphone"
            }
            disabled={disabled}
            onClick={() => (recording ? recorder.current?.stop() : record())}
          >
            {recording ? <Square size={19} /> : <Mic size={19} />}
          </button>
          {recording && (
            <span className={s.recording}>
              Enregistrement… {maxSeconds} s maximum
            </span>
          )}
        </div>
      </div>
      {preview && (
        <AudioPreview
          key={preview}
          src={preview}
          title="Ton extrait original"
        />
      )}
      {file && (
        <AudioTrimmer file={file} onChange={onChange} disabled={disabled} />
      )}
      {error && (
        <p className={s.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
function Result({
  job,
  title = "Ta narration",
  number = "03",
  onCancel,
}: {
  job: Job | null;
  title?: string;
  number?: string;
  onCancel?: () => void;
}) {
  const [audioTitle, setAudioTitle] = useState(job?.title || "Ma narration");
  const [savedTitle, setSavedTitle] = useState(job?.title || "Ma narration");
  const [titleMessage, setTitleMessage] = useState("");
  async function rename() {
    if (!job) return;
    try {
      const r = await fetch("/api/voice", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: job.id, title: audioTitle }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setSavedTitle(d.title);
      setAudioTitle(d.title);
      setTitleMessage("Titre enregistré.");
    } catch (e) {
      setTitleMessage(
        e instanceof Error ? e.message : "Enregistrement impossible.",
      );
    }
  }
  const working = job && ["loading", "generating"].includes(job.status);
  return (
    <section id="voice-result" className={`${s.card} ${s.result}`}>
      <h2>
        <span>{number}</span>
        {title}
      </h2>
      <p>Écoute le résultat, puis télécharge-le.</p>
      {job?.status === "completed" ? (
        <>
          <div className={s.rename}>
            <label>
              Titre de cet audio
              <input
                aria-label="Titre de cet audio"
                value={audioTitle}
                maxLength={120}
                onChange={(e) => {
                  setAudioTitle(e.target.value);
                  setTitleMessage("");
                }}
              />
            </label>
            <button
              className={s.secondary}
              disabled={!audioTitle.trim() || audioTitle.trim() === savedTitle}
              onClick={rename}
            >
              Enregistrer
            </button>
          </div>
          {titleMessage && (
            <p role="status" className={s.status}>
              {titleMessage}
            </p>
          )}
          <AudioPreview
            key={job.id}
            src={audioUrl(job.id)}
            title={savedTitle}
          />
        </>
      ) : working ? (
        <AudioLoading key={job.id || "pending"} job={job} />
      ) : (
        <div className={s.emptyAudio}>
          <Music2 size={25} />
          <span>
            {working ? "Création de ton audio…" : "Ton audio apparaîtra ici"}
          </span>
        </div>
      )}
      <div className={s.resultFoot}>
        <span role="status" aria-live="polite">
          {working
            ? job.status === "loading"
              ? "Chargement et préparation de la voix…"
              : `Passage ${(job.completed || 0) + 1} sur ${job.total || 1}`
            : job?.status === "completed"
              ? `${job.kind === "test" ? "Essai court · " : ""}${job.duration?.toFixed(1) || ""} secondes · WAV${job.elapsedSeconds ? ` · Créé en ${clock(job.elapsedSeconds)}` : ""}`
              : ["failed", "canceled"].includes(job?.status || "")
                ? job?.status === "canceled"
                  ? "Traitement arrêté."
                  : "La génération a été interrompue."
                : "Aucune prise pour le moment."}
        </span>
        {working && job.id ? (
          <button className={s.secondary} onClick={onCancel}>
            <Square size={14} /> Arrêter le traitement
          </button>
        ) : job?.status === "completed" ? (
          <a
            className={s.secondary}
            href={audioUrl(job.id)}
            download={voiceFilename(savedTitle)}
          >
            <Download size={16} /> Télécharger le WAV
          </a>
        ) : (
          <button className={s.secondary} disabled>
            <Download size={16} /> Télécharger le WAV
          </button>
        )}
      </div>
      {job?.error && (
        <p className={s.error} role="alert">
          {job.error}
        </p>
      )}
    </section>
  );
}
export default function Voices() {
  const [tab, setTab] = useState<"narration" | "clean" | "voices" | "history">(
      "narration",
    ),
    [ready, setReady] = useState(false),
    [serverBusy, setServerBusy] = useState(false),
    [file, setFile] = useState<File | null>(null),
    [cleanFile, setCleanFile] = useState<File | null>(null),
    [text, setText] = useState(""),
    [audioTitle, setAudioTitle] = useState(""),
    [consent, setConsent] = useState(false),
    [settings, setSettings] = useState<VoiceSettings>(defaultVoiceSettings),
    [preset, setPreset] = useState("natural"),
    [cleanStrength, setCleanStrength] = useState(0.45),
    [prepared, setPrepared] = useState<Job | null>(null),
    [job, setJob] = useState<Job | null>(null),
    [cleanJob, setCleanJob] = useState<Job | null>(null),
    [pending, setPending] = useState(""),
    [error, setError] = useState("");
  const [voiceName, setVoiceName] = useState("");
  const [libraryNotice, setLibraryNotice] = useState("");
  const scriptRef = useRef<HTMLTextAreaElement>(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [previousText, setPreviousText] = useState<string | null>(null);
  const [testLimit, setTestLimit] = useState(180);
  function editText(next: string) {
    setPreviousText(text);
    setText(next);
    setSelection({ start: 0, end: 0 });
  }
  const busy =
    !!pending || !!(job && ["loading", "generating"].includes(job.status));
  useEffect(() => {
    let alive = true;
    const refresh = () =>
      fetch("/api/voice")
        .then((r) => r.json())
        .then((d) => {
          if (alive) {
            setReady(!!d.ready);
            setServerBusy(!!d.busy);
          }
        })
        .catch(() => {});
    refresh();
    const timer = setInterval(refresh, 5000);
    queueMicrotask(() => {
      if (!alive) return;
      try {
        const draft = JSON.parse(
          localStorage.getItem("mindstudio.voice.draft") || "null",
        );
        if (draft) {
          setText(String(draft.text || ""));
          setAudioTitle(String(draft.audioTitle || ""));
          setSettings({ ...defaultVoiceSettings, ...draft.settings });
          setPreset(draft.preset || "natural");
        }
      } catch {}
    });
    for (const [key, setter] of [
      ["mindstudio.voice.last-job", setJob],
      ["mindstudio.voice.clean-job", setCleanJob],
    ] as const) {
      const id =
        (key === "mindstudio.voice.last-job"
          ? new URLSearchParams(window.location.search).get("job")
          : null) || localStorage.getItem(key);
      if (id && /^[0-9a-f-]{36}$/.test(id))
        fetch(`/api/voice?id=${id}`)
          .then((r) => r.json())
          .then((d) => {
            if (alive && d.status) setter({ id, ...d });
          })
          .catch(() => {});
    }
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);
  useEffect(() => {
    const timer = setTimeout(
      () =>
        localStorage.setItem(
          "mindstudio.voice.draft",
          JSON.stringify({ text, settings, preset, audioTitle }),
        ),
      500,
    );
    return () => clearTimeout(timer);
  }, [text, settings, preset, audioTitle]);
  useEffect(() => {
    if (!job?.id || !["loading", "generating"].includes(job.status)) return;
    const timer = setInterval(
      () =>
        fetch(`/api/voice?id=${job.id}`)
          .then((r) => {
            if (!r.ok)
              throw new Error(
                "Connexion interrompue. Le calcul continue sur le Mac.",
              );
            return r.json();
          })
          .then((d) => {
            setJob({ id: job.id, ...d });
            setError("");
          })
          .catch((e) => setError(e.message)),
      2000,
    );
    return () => clearInterval(timer);
  }, [job]);
  function update<K extends keyof VoiceSettings>(
    key: K,
    value: VoiceSettings[K],
  ) {
    setSettings((v) => ({ ...v, [key]: value }));
    if (key === "denoise" || key === "strength") setPrepared(null);
  }
  async function submit(action: "generate" | "test" | "prepare" | "clean") {
    const reference = action === "clean" ? cleanFile : file;
    if (!reference) return;
    const starting: Job = {
      id: "",
      status: "loading",
      startedAt: Date.now() / 1000,
      kind: action,
      stage:
        action === "clean" || action === "prepare" ? "preparing" : "loading",
    };
    if (action === "generate" || action === "test") setJob(starting);
    if (action === "clean") setCleanJob(starting);
    if (action === "prepare") setPrepared(starting);
    setPending(action);
    if (action !== "prepare")
      requestAnimationFrame(() =>
        document.getElementById("voice-result")?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
          block: "center",
        }),
      );
    setError("");
    try {
      const body = new FormData();
      body.set("reference", reference);
      body.set("voiceName", voiceName || reference.name);
      body.set("text", text);
      body.set("testLimit", String(testLimit));
      body.set(
        "title",
        action === "clean"
          ? (cleanFile?.name.replace(/\.[^.]+$/, "") || "Audio nettoyé").slice(
              0,
              110,
            ) + " nettoyé"
          : audioTitle.trim() || "Ma narration",
      );
      body.set("consent", consent ? "yes" : "no");
      body.set("action", action);
      body.set(
        "settings",
        JSON.stringify(
          action === "clean"
            ? { ...settings, denoise: true, strength: cleanStrength }
            : settings,
        ),
      );
      const response = await fetch("/api/voice", { method: "POST", body });
      const d = await response.json();
      if (!response.ok) throw new Error(d.error || "Traitement impossible.");
      const result = await fetch(`/api/voice?id=${d.id}`).then((r) => r.json());
      const j = { id: d.id, ...result };
      if (action === "prepare") setPrepared(j);
      else if (action === "clean") {
        setCleanJob(j);
        localStorage.setItem("mindstudio.voice.clean-job", d.id);
      } else {
        setJob(j);
        localStorage.setItem("mindstudio.voice.last-job", d.id);
      }
    } catch (e) {
      const failed: Job = {
        ...starting,
        status: "failed",
        error: e instanceof Error ? e.message : "Traitement impossible.",
      };
      if (action === "clean") setCleanJob(failed);
      else if (action === "prepare") setPrepared(failed);
      else setJob(failed);
      setError(failed.error || "Traitement impossible.");
    } finally {
      setPending("");
    }
  }
  async function cancelJob(target: Job | null, clean = false) {
    if (!target?.id) return;
    try {
      const response = await fetch(`/api/voice?id=${target.id}`, {
        method: "DELETE",
      });
      const state = await response.json();
      if (!response.ok) throw new Error(state.error);
      const canceled = { id: target.id, ...state };
      if (clean) setCleanJob(canceled);
      else setJob(canceled);
      setServerBusy(false);
      setPending("");
      setError("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Impossible d’arrêter le traitement.",
      );
    }
  }
  const [resetVersion, setResetVersion] = useState(0);
  const [resetBackup, setResetBackup] = useState<null | {
    text: string;
    audioTitle: string;
    file: File | null;
    cleanFile: File | null;
    consent: boolean;
    settings: VoiceSettings;
    preset: string;
    cleanStrength: number;
    testLimit: number;
    prepared: Job | null;
  }>(null);
  function resetForm() {
    if (busy || serverBusy) return;
    setResetBackup({
      text,
      audioTitle,
      file,
      cleanFile,
      consent,
      settings,
      preset,
      cleanStrength,
      testLimit,
      prepared,
    });
    setText("");
    setAudioTitle("");
    setFile(null);
    setVoiceName("");
    setLibraryNotice("");
    setCleanFile(null);
    setConsent(false);
    setSettings({ ...defaultVoiceSettings });
    setPreset("natural");
    setCleanStrength(0.45);
    setTestLimit(180);
    setPrepared(null);
    setPreviousText(null);
    setSelection({ start: 0, end: 0 });
    setError("");
    setResetVersion((v) => v + 1);
    localStorage.removeItem("mindstudio.voice.draft");
  }
  function undoReset() {
    if (!resetBackup || busy || serverBusy) return;
    setText(resetBackup.text);
    setAudioTitle(resetBackup.audioTitle);
    setFile(resetBackup.file);
    setCleanFile(resetBackup.cleanFile);
    setConsent(resetBackup.consent);
    setSettings(resetBackup.settings);
    setPreset(resetBackup.preset);
    setCleanStrength(resetBackup.cleanStrength);
    setTestLimit(resetBackup.testLimit);
    setPrepared(resetBackup.prepared);
    setResetBackup(null);
    setResetVersion((v) => v + 1);
  }
  async function referenceFile(url: string, name: string) {
    const response = await fetch(url);
    if (!response.ok) throw new Error("L’extrait vocal est indisponible.");
    return new File([await response.blob()], name + ".wav", {
      type: "audio/wav",
    });
  }
  async function useSavedVoice(voice: SavedVoice) {
    const reference = await referenceFile(
      `/api/voice/library?audio=${voice.id}`,
      voice.name,
    );
    setFile(reference);
    setVoiceName(voice.name);
    setConsent(true);
    setPrepared(null);
    setSettings((v) => ({ ...v, denoise: false }));
    setResetVersion((v) => v + 1);
    setLibraryNotice(
      `Voix « ${voice.name} » chargée. L’extrait est déjà nettoyé, il peut être utilisé directement.`,
    );
    setError("");
    setTab("narration");
  }
  async function restoreNarration(record: NarrationRecord) {
    if (record.text === null) return;
    const reference = record.hasReference
      ? await referenceFile(
          `/api/voice/library?reference=${record.id}`,
          record.voiceName || "Voix de la narration",
        )
      : null;
    setText(record.text);
    setAudioTitle(record.title);
    setSettings({
      ...(record.settings || defaultVoiceSettings),
      denoise: false,
    });
    setPreset("custom");
    setFile(reference);
    setVoiceName(record.voiceName || "");
    setConsent(!!reference);
    setPrepared(null);
    setPreviousText(null);
    setSelection({ start: 0, end: 0 });
    setResetVersion((v) => v + 1);
    setLibraryNotice(
      reference
        ? "Script, voix et réglages repris. L’extrait est déjà préparé : le nettoyage est désactivé pour éviter de le traiter deux fois."
        : "Script et réglages repris. Ajoute un extrait vocal pour générer une nouvelle prise.",
    );
    if (!record.settings)
      setLibraryNotice(
        "Script et voix repris. Les anciens réglages n’avaient pas été conservés : les réglages par défaut sont utilisés, sans nouveau nettoyage de l’extrait.",
      );
    setError("");
    setTab("narration");
  }
  const locked = busy || serverBusy;
  return (
    <main className={s.page}>
      <div className={s.container}>
        <header className={s.header}>
          <Link href="/dashboard" className={s.brand}>
            <span className={s.logo}>
              <Aperture size={29} />
            </span>
            <strong>MindStudio</strong>
            <span className={s.studio}>STUDIO VOCAL</span>
          </Link>
          <span className={s.badge}>Français · Export WAV</span>
        </header>
        <section className={s.hero}>
          <Link href="/dashboard" className={s.back}>
            <ArrowLeft size={14} /> MindStudio
          </Link>
          <h1>Donne vie à tes mots.</h1>
          <p>Ta voix, un texte, une narration qui te ressemble.</p>
        </section>
        <div className={s.engine}>
          <span className={ready ? s.green : s.dot} />
          {ready
            ? "Chatterbox Multilingual V3 prêt · français · sur ton Mac"
            : "Le moteur local se prépare…"}
          {serverBusy && !busy && <span> · Un traitement est en cours</span>}
        </div>
        <nav className={s.tabs} aria-label="Outils audio">
          <button
            aria-pressed={tab === "narration"}
            onClick={() => setTab("narration")}
          >
            Créer une narration
          </button>
          <button
            aria-pressed={tab === "clean"}
            onClick={() => setTab("clean")}
          >
            Nettoyer un audio
          </button>
          <button
            aria-pressed={tab === "voices"}
            onClick={() => setTab("voices")}
          >
            Mes voix
          </button>
          <button
            aria-pressed={tab === "history"}
            onClick={() => setTab("history")}
          >
            Historique des narrations
          </button>
        </nav>
        <div className={s.resetBar}>
          <span>
            Repartir avec un formulaire vide · Les audios générés sont
            conservés.
          </span>
          <button className={s.secondary} disabled={locked} onClick={resetForm}>
            <RotateCcw size={15} /> Réinitialiser
          </button>
        </div>
        {resetBackup && (
          <div className={s.resetNotice} role="status">
            <span>
              Formulaire réinitialisé. Les fichiers audio sont conservés.
            </span>
            <button
              className={s.secondary}
              disabled={locked}
              onClick={undoReset}
            >
              Annuler la réinitialisation
            </button>
          </div>
        )}
        {error && (
          <p role="alert" className={s.error}>
            {error}
          </p>
        )}
        {libraryNotice && tab === "narration" && (
          <p className={s.actionHint} role="status">
            {libraryNotice}
          </p>
        )}
        {tab === "voices" || tab === "history" ? (
          <VoiceCollection
            key={tab}
            view={tab}
            locked={locked}
            onUse={useSavedVoice}
            onRestore={restoreNarration}
          />
        ) : tab === "narration" ? (
          <div className={s.grid}>
            <section className={s.card}>
              <h2>
                <span>01</span>Ta voix
              </h2>
              <p>Ajoute un extrait clair de 10 à 20 secondes.</p>
              <AudioInput
                key={resetVersion}
                file={file}
                disabled={locked}
                onChange={(f) => {
                  setFile(f);
                  setVoiceName("");
                  setLibraryNotice("");
                  setPrepared(null);
                }}
              />
              <label className={s.check}>
                <input
                  type="checkbox"
                  checked={consent}
                  disabled={locked}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                C’est ma voix, ou j’ai l’autorisation de la personne.
              </label>
              <label className={s.check}>
                <input
                  type="checkbox"
                  checked={settings.denoise}
                  disabled={locked}
                  onChange={(e) => update("denoise", e.target.checked)}
                />
                Atténuer le bruit de fond
              </label>
              <Range
                label="Intensité du nettoyage"
                value={settings.strength}
                min={0}
                max={0.85}
                hint="Doux · réglage conseillé : 0,45"
                disabled={locked || !settings.denoise}
                onChange={(v) => update("strength", v)}
              />
              {!consent && file && (
                <p className={s.actionHint}>
                  Coche la confirmation de voix ci-dessus pour activer les
                  boutons.
                </p>
              )}
              <button
                className={s.soft}
                disabled={!ready || !file || !consent || locked}
                onClick={() => submit("prepare")}
              >
                {pending === "prepare"
                  ? "Préparation en cours…"
                  : "Préparer et écouter ma voix"}
              </button>
              <p className={s.status}>
                {prepared
                  ? "✓ Ta voix est préparée avec ces réglages."
                  : "Prépare ton extrait pour comparer le résultat."}
              </p>
              {prepared?.status === "completed" && prepared.id && (
                <SaveVoice
                  key={prepared.id}
                  jobId={prepared.id}
                  disabled={locked}
                />
              )}
              <details className={s.details} open={!!prepared}>
                <summary>Écouter la voix préparée</summary>
                {prepared ? (
                  prepared.status === "loading" ? (
                    <AudioLoading job={prepared} />
                  ) : prepared.status === "completed" ? (
                    <AudioPreview
                      key={prepared.id}
                      src={audioUrl(prepared.id)}
                      title="Ta voix préparée"
                    />
                  ) : (
                    <p>{prepared.error}</p>
                  )
                ) : (
                  <p>Aucun extrait préparé pour le moment.</p>
                )}
              </details>
              <aside className={s.tip}>
                <strong>Une bonne prise change tout.</strong>
                <br />
                Parle à ton rythme, dans une pièce calme. Un nettoyage fort peut
                altérer le timbre. Maximum 25 Mo ; les 30 premières secondes
                sont utilisées.
              </aside>
            </section>
            <div className={s.right}>
              <section className={s.card}>
                <h2>
                  <span>02</span>Ton texte
                </h2>
                <p>
                  Des phrases courtes. Une ligne vide entre les paragraphes.
                </p>
                <label className={s.select}>
                  Titre de la narration
                  <input
                    aria-label="Titre de la narration"
                    placeholder="Ex. Reviens au Père — narration"
                    value={audioTitle}
                    maxLength={120}
                    disabled={locked}
                    onChange={(e) => setAudioTitle(e.target.value)}
                  />
                </label>
                <label className={s.script}>
                  Script à prononcer
                  <textarea
                    ref={scriptRef}
                    onSelect={(e) =>
                      setSelection({
                        start: e.currentTarget.selectionStart,
                        end: e.currentTarget.selectionEnd,
                      })
                    }
                    value={text}
                    maxLength={6000}
                    disabled={locked}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={
                      "Bonjour et bienvenue.\n\nAujourd’hui, j’aimerais vous raconter une histoire…"
                    }
                  />
                </label>
                <div className={s.editTools}>
                  <div className={s.buttons}>
                    <button
                      className={s.secondary}
                      disabled={locked || selection.end <= selection.start}
                      onClick={() =>
                        editText(text.slice(selection.start, selection.end))
                      }
                    >
                      Rogner : garder la sélection
                    </button>
                    <button
                      className={s.secondary}
                      disabled={locked || selection.end <= selection.start}
                      onClick={() =>
                        editText(
                          text.slice(0, selection.start) +
                            text.slice(selection.end),
                        )
                      }
                    >
                      Supprimer la sélection
                    </button>
                    <button
                      className={s.secondary}
                      disabled={locked || !text}
                      onClick={() =>
                        editText(
                          text
                            .replace(/[ \t]+/g, " ")
                            .replace(/ *\n */g, "\n")
                            .replace(/\n{3,}/g, "\n\n")
                            .trim(),
                        )
                      }
                    >
                      Nettoyer les espaces
                    </button>
                    <button
                      className={s.secondary}
                      disabled={locked || previousText === null}
                      onClick={() => {
                        if (previousText !== null) {
                          setText(previousText);
                          setPreviousText(null);
                        }
                      }}
                    >
                      Annuler la modification
                    </button>
                  </div>
                  <p className={s.small}>
                    Sélectionne un passage dans le texte pour le conserver ou le
                    supprimer. Le nettoyage ne change pas les mots.
                  </p>
                </div>
                <div className={s.count}>
                  {text.length.toLocaleString("fr-FR")} / 6 000 caractères ·
                  brouillon conservé
                </div>
                <div className={s.settingsGrid}>
                  <label className={s.select}>
                    Interprétation
                    <select
                      value={preset}
                      disabled={locked}
                      onChange={(e) => {
                        setPreset(e.target.value);
                        const values: Record<string, number[]> = {
                          natural: [0.4, 0.5, 0.75],
                          calm: [0.25, 0.6, 0.65],
                          story: [0.65, 0.5, 0.8],
                          dynamic: [0.8, 0.4, 0.85],
                        };
                        if (!values[e.target.value]) return;
                        const [exaggeration, cfg, temperature] =
                          values[e.target.value];
                        setSettings((v) => ({
                          ...v,
                          exaggeration,
                          cfg,
                          temperature,
                        }));
                      }}
                    >
                      <option value="custom">Réglages personnalisés</option>
                      <option value="natural">Naturel — conversation</option>
                      <option value="calm">Posé — lecture douce</option>
                      <option value="story">Expressif — récit</option>
                      <option value="dynamic">Dynamique — présentation</option>
                    </select>
                  </label>
                  <Range
                    label="Pause entre phrases · s"
                    value={settings.pause}
                    min={0.15}
                    max={0.7}
                    disabled={locked}
                    onChange={(v) => update("pause", v)}
                  />
                </div>
                <div className={s.settingsGrid}>
                  <label className={s.check}>
                    <input
                      type="checkbox"
                      checked={settings.naturalPauses}
                      disabled={locked}
                      onChange={(e) =>
                        update("naturalPauses", e.target.checked)
                      }
                    />
                    Pauses naturelles
                  </label>
                  <label className={s.check}>
                    <input
                      type="checkbox"
                      checked={settings.normalize}
                      disabled={locked}
                      onChange={(e) => update("normalize", e.target.checked)}
                    />
                    Volume équilibré
                  </label>
                </div>
                <details className={s.details}>
                  <summary>Réglages avancés</summary>
                  <div className={s.advanced}>
                    <Range
                      label="Expressivité"
                      value={settings.exaggeration}
                      min={0}
                      max={1}
                      disabled={locked}
                      onChange={(v) => update("exaggeration", v)}
                    />
                    <Range
                      label="Fidélité au texte"
                      value={settings.cfg}
                      min={0.1}
                      max={1}
                      disabled={locked}
                      onChange={(v) => update("cfg", v)}
                    />
                    <Range
                      label="Variation de la voix"
                      value={settings.temperature}
                      min={0.1}
                      max={1.2}
                      disabled={locked}
                      onChange={(v) => update("temperature", v)}
                    />
                    <label className={s.select}>
                      Graine de variation
                      <input
                        type="number"
                        min={0}
                        max={2147483647}
                        value={settings.seed}
                        disabled={locked}
                        onChange={(e) =>
                          update(
                            "seed",
                            Math.max(
                              0,
                              Math.min(
                                2147483647,
                                Math.floor(Number(e.target.value)),
                              ),
                            ),
                          )
                        }
                      />
                    </label>
                  </div>
                  <p>
                    Les pauses naturelles allongent les fins de paragraphes.
                    L’interprétation propose des réglages de départ ; le rendu
                    dépend de ton extrait.
                  </p>
                  <button
                    className={s.reset}
                    disabled={locked}
                    onClick={() => {
                      setSettings(defaultVoiceSettings);
                      setPreset("natural");
                      setPrepared(null);
                    }}
                  >
                    <RotateCcw size={14} />
                    Réinitialiser les réglages
                  </button>
                </details>
                <details className={s.details}>
                  <summary>Passage utilisé pour l’essai court</summary>
                  <label>
                    Longueur maximale de l’essai
                    <select
                      value={testLimit}
                      disabled={locked}
                      onChange={(e) => setTestLimit(Number(e.target.value))}
                    >
                      <option value={180}>180 caractères · rapide</option>
                      <option value={350}>350 caractères</option>
                      <option value={600}>600 caractères · plus long</option>
                    </select>
                  </label>
                  <p className={s.small}>
                    {voiceExcerpt(text, testLimit) ||
                      "Ajoute ton script pour voir le passage qui sera lu."}
                  </p>
                </details>
                {(!ready || !file || !consent || !text.trim() || locked) && (
                  <p className={s.actionHint} role="status">
                    {locked
                      ? "Un traitement est en cours. Les boutons seront disponibles à la fin."
                      : !ready
                        ? "Le moteur vocal n’est pas encore prêt."
                        : !file
                          ? "Ajoute un extrait vocal pour activer la génération."
                          : !consent
                            ? "Pour activer les boutons, coche « C’est ma voix, ou j’ai l’autorisation de la personne » dans la colonne Ta voix."
                            : "Ajoute le texte à prononcer."}
                  </p>
                )}
                <div className={s.buttons}>
                  <button
                    className={s.secondary}
                    disabled={
                      !ready || !file || !consent || !text.trim() || locked
                    }
                    onClick={() => submit("test")}
                  >
                    <Play size={16} /> Essai court
                  </button>
                  <button
                    className={s.primary}
                    disabled={
                      !ready || !file || !consent || !text.trim() || locked
                    }
                    onClick={() => submit("generate")}
                  >
                    {busy ? "Traitement en cours…" : "Générer la narration"}
                    <ArrowRight size={17} />
                  </button>
                </div>
                <p className={s.small}>
                  « Essai court » lit seulement le passage affiché ci-dessus,
                  sans couper ton script. « Générer la narration » lit tout le
                  texte (jusqu’à 6 000 caractères). Le calcul local peut être
                  plus lent que la durée audio.
                </p>
              </section>
              <Result
                key={job?.id || "idle"}
                job={job}
                onCancel={() => cancelJob(job)}
              />
              {job?.status === "completed" && (
                <Link className={s.videoLink} href="/projects/new">
                  Importer ce WAV dans une vidéo <ArrowRight size={15} />
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className={s.cleanGrid}>
            <section className={s.card}>
              <h2>
                <span>01</span>Ton enregistrement
              </h2>
              <p>Réduis le bruit d’un audio de 10 minutes maximum.</p>
              <AudioInput
                key={resetVersion}
                file={cleanFile}
                disabled={locked}
                maxSeconds={600}
                onChange={setCleanFile}
              />
              <Range
                label="Intensité du nettoyage"
                value={cleanStrength}
                min={0}
                max={0.85}
                disabled={locked}
                hint="Commence doucement et compare les deux écoutes."
                onChange={setCleanStrength}
              />
              <button
                className={s.primary}
                disabled={!ready || !cleanFile || locked}
                onClick={() => submit("clean")}
              >
                {pending === "clean"
                  ? "Nettoyage en cours…"
                  : "Nettoyer cet audio"}
                <ArrowRight size={17} />
              </button>
              <p className={s.small}>
                100 Mo maximum. Ton fichier original est conservé.
              </p>
            </section>
            <Result
              key={cleanJob?.id || "clean-idle"}
              job={cleanJob}
              title="Le résultat"
              number="02"
              onCancel={() => cancelJob(cleanJob, true)}
            />
          </div>
        )}
        <footer className={s.footer}>
          <span>
            <Check size={14} /> MindStudio · Chatterbox Multilingual V3
          </span>
          <span>Traitement local · Tes fichiers restent sur ton Mac.</span>
        </footer>
      </div>
    </main>
  );
}
