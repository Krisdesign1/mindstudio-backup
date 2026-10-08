"use client";
import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  AudioLines,
  Clock3,
  Check,
  LoaderCircle,
} from "lucide-react";
import s from "./voices.module.css";
export const clock = (value: number) => {
  const t = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
  const hours = Math.floor(t / 3600);
  const minutes = Math.floor(t / 60) % 60;
  const seconds = t % 60;
  return hours
    ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    : `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};
export type AudioJob = {
  title?: string;
  id: string;
  status: string;
  completed?: number;
  total?: number;
  duration?: number;
  error?: string;
  kind?: string;
  startedAt?: number;
  elapsedSeconds?: number;
  stage?: string;
  estimatedRemaining?: number;
};
export function AudioPreview({
  src,
  title = "Écouter la narration",
}: {
  src: string;
  title?: string;
}) {
  const audio = useRef<HTMLAudioElement>(null),
    [playing, setPlaying] = useState(false),
    [duration, setDuration] = useState(0),
    [time, setTime] = useState(0),
    [volume, setVolume] = useState(1),
    [rate, setRate] = useState(1),
    [peaks, setPeaks] = useState<number[]>([]),
    [error, setError] = useState(""),
    [buffering, setBuffering] = useState(false);
  useEffect(() => {
    const abort = new AbortController();
    let context: AudioContext | undefined;
    let active = true;
    async function waveform() {
      try {
        const response = await fetch(src, { signal: abort.signal });
        if (!response.ok) throw new Error();
        const bytes = await response.arrayBuffer();
        if (!active) return;
        context = new AudioContext();
        const decoded = await context.decodeAudioData(bytes);
        const data = decoded.getChannelData(0);
        const count = 96;
        const values = Array.from({ length: count }, (_, i) => {
          let peak = 0;
          const start = Math.floor((i * data.length) / count),
            end = Math.floor(((i + 1) * data.length) / count);
          for (let j = start; j < end; j++)
            peak = Math.max(peak, Math.abs(data[j]));
          return peak;
        });
        const max = Math.max(...values, 0.001);
        if (active) {
          setPeaks(values.map((v) => v / max));
          setDuration(decoded.duration);
        }
      } catch {
        /* Playback remains available if waveform decoding fails. */
      } finally {
        if (context && context.state !== "closed") void context.close();
      }
    }
    void waveform();
    return () => {
      active = false;
      abort.abort();
      if (context && context.state !== "closed") void context.close();
    };
  }, [src]);
  async function toggle() {
    if (!audio.current) return;
    try {
      if (audio.current.paused) await audio.current.play();
      else audio.current.pause();
    } catch {
      setError("La lecture n’a pas démarré. Réessaie ou télécharge le WAV.");
    }
  }
  const progress = duration ? time / duration : 0;
  return (
    <div className={s.player}>
      <audio
        ref={audio}
        src={src}
        preload="metadata"
        onLoadedMetadata={() => {
          if (Number.isFinite(audio.current?.duration))
            setDuration(audio.current?.duration || 0);
          if (audio.current) {
            audio.current.volume = volume;
            audio.current.playbackRate = rate;
          }
        }}
        onTimeUpdate={() => setTime(audio.current?.currentTime || 0)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onWaiting={() => setBuffering(true)}
        onCanPlay={() => setBuffering(false)}
        onError={() =>
          setError(
            "Cet audio ne peut pas être lu. Essaie de télécharger le WAV.",
          )
        }
      />
      <div className={s.playerTop}>
        <span>
          <AudioLines size={16} />
          {title}
        </span>
        <span>WAV · AUDIO LOCAL</span>
      </div>
      <div className={s.waveRow}>
        <button
          className={s.playButton}
          onClick={toggle}
          aria-label={playing ? "Mettre en pause" : "Lire la narration"}
          disabled={!!error}
        >
          {buffering ? (
            <LoaderCircle className={s.spin} size={22} />
          ) : playing ? (
            <Pause size={22} />
          ) : (
            <Play size={22} />
          )}
        </button>
        <div className={s.waveSeek}>
          <div className={s.waveBars} aria-hidden="true">
            {peaks.length ? (
              peaks.map((p, i) => (
                <i
                  key={i}
                  style={{
                    height: `${Math.max(5, p * 100)}%`,
                    background:
                      i / peaks.length <= progress ? "#b5a4ff" : "#454052",
                  }}
                />
              ))
            ) : (
              <div className={s.waveBaseline}>
                Préparation de la forme d’onde…
              </div>
            )}
          </div>
          <input
            type="range"
            aria-label="Position de lecture"
            min={0}
            max={duration || 1}
            step={0.01}
            value={time}
            disabled={!duration}
            onChange={(e) => {
              const t = Number(e.target.value);
              if (audio.current) audio.current.currentTime = t;
              setTime(t);
            }}
          />
        </div>
      </div>
      <div className={s.transport}>
        <span className={s.timecode}>
          {clock(time)} <span>/ {clock(duration)}</span>
        </span>
        <div>
          <button
            title="Revenir au début"
            aria-label="Revenir au début"
            onClick={() => {
              if (audio.current) audio.current.currentTime = 0;
              setTime(0);
            }}
          >
            <RotateCcw size={16} />
          </button>
          <select
            aria-label="Vitesse de lecture"
            value={rate}
            onChange={(e) => {
              const v = Number(e.target.value);
              setRate(v);
              if (audio.current) audio.current.playbackRate = v;
            }}
          >
            {[0.75, 1, 1.25, 1.5, 2].map((v) => (
              <option key={v} value={v}>
                {v}×
              </option>
            ))}
          </select>
          <Volume2 size={16} />
          <input
            aria-label="Volume de lecture"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => {
              const v = Number(e.target.value);
              setVolume(v);
              if (audio.current) audio.current.volume = v;
            }}
          />
        </div>
      </div>
      {error && (
        <p role="alert" className={s.error}>
          {error}
        </p>
      )}
    </div>
  );
}
export function AudioLoading({ job }: { job: AudioJob }) {
  const [now, setNow] = useState(() => Date.now() / 1000);
  const [fallback] = useState(() => Date.now() / 1000);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now() / 1000), 1000);
    return () => clearInterval(timer);
  }, []);
  const elapsed = Math.max(0, now - (job.startedAt || fallback));
  const stage =
    job.stage || (job.status === "generating" ? "synthesis" : "loading");
  const index =
    stage === "finalizing"
      ? 3
      : stage === "synthesis"
        ? 2
        : stage === "preparing"
          ? 1
          : 0;
  const done = job.completed || 0,
    total = job.total || 0;
  const remaining = job.estimatedRemaining;
  const countdown =
    remaining === undefined
      ? undefined
      : remaining - Math.max(0, elapsed - (job.elapsedSeconds || 0));
  return (
    <div className={s.loadingPanel}>
      <div className={s.loadingHead}>
        <div className={s.pulseIcon}>
          <AudioLines size={26} />
        </div>
        <div>
          <strong>
            {job.kind === "clean"
              ? "Nettoyage de ton audio"
              : job.kind === "prepare"
                ? "Préparation de ta voix"
                : "Ta narration prend vie"}
          </strong>
          <p>
            {
              [
                "Chargement du moteur local",
                "Analyse et préparation de la voix",
                `Synthèse · passage ${Math.min(done + 1, total || 1)} sur ${total || 1}`,
                "Assemblage et équilibre du volume",
              ][index]
            }
          </p>
        </div>
        <LoaderCircle size={20} className={s.spin} />
      </div>
      <div className={s.loadingStats}>
        <div>
          <span>
            <Clock3 size={13} />
            Temps écoulé
          </span>
          <strong>{clock(elapsed)}</strong>
        </div>
        <div>
          <span>Temps restant estimé</span>
          <strong className={s.eta}>
            {countdown !== undefined
              ? countdown > 0
                ? `≈ ${clock(countdown)}`
                : "Encore en cours"
              : "Calcul en cours"}
          </strong>
        </div>
      </div>
      <div
        className={s.progressTrack}
        role="progressbar"
        aria-label="Passages terminés"
        aria-valuemin={0}
        aria-valuemax={total || 1}
        {...(total ? { "aria-valuenow": done } : {})}
      >
        {total ? <span style={{ width: `${(done / total) * 100}%` }} /> : <i />}
      </div>
      <div className={s.progressCaption}>
        <span>
          {total
            ? `${done} / ${total} passages terminés`
            : "Initialisation sur ton Mac"}
        </span>
        <span>{total ? `${Math.floor((done / total) * 100)} %` : ""}</span>
      </div>
      <ol className={s.stages}>
        {["Moteur", "Ta voix", "Narration", "Finition"].map((label, i) => (
          <li
            key={label}
            data-state={i < index ? "done" : i === index ? "active" : "waiting"}
          >
            <span>{i < index ? <Check size={12} /> : i + 1}</span>
            {label}
          </li>
        ))}
      </ol>
      <p className={s.loadingNote}>
        Tu peux laisser le studio ouvert. Le temps restant se précise après le
        premier passage ; il dépend de la longueur du texte.
      </p>
    </div>
  );
}
