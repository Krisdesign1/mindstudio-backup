"use client";
import { useEffect, useRef, useState } from "react";
import { Scissors, Undo2, Play } from "lucide-react";
import s from "./voices.module.css";
import { trimVoiceWav } from "@/lib/voice-trim";
export function AudioTrimmer({
  file,
  onChange,
  disabled,
}: {
  file: File;
  onChange: (file: File) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [original, setOriginal] = useState<File | null>(null);
  const buffer = useRef<AudioBuffer | null>(null);
  const player = useRef<AudioBufferSourceNode | null>(null);
  const context = useRef<AudioContext | null>(null);
  useEffect(
    () => () => {
      player.current?.stop();
      void context.current?.close();
    },
    [],
  );
  useEffect(() => {
    player.current?.stop();
    const timer = setTimeout(() => setOpen(false), 0);
    return () => clearTimeout(timer);
  }, [file]);
  async function load() {
    setBusy(true);
    setError("");
    try {
      if (!context.current || context.current.state === "closed")
        context.current = new AudioContext();
      buffer.current = await context.current.decodeAudioData(
        await file.arrayBuffer(),
      );
      setDuration(buffer.current.duration);
      setStart(0);
      setEnd(Math.min(30, buffer.current.duration));
      setOpen(true);
    } catch {
      setError(
        "Ce format ne peut pas être rogné dans ce navigateur. Essaie un fichier WAV ou MP3.",
      );
    } finally {
      setBusy(false);
    }
  }
  const valid = end > start && start >= 0 && end <= duration;
  async function listen() {
    if (!valid || !context.current || !buffer.current) return;
    player.current?.stop();
    await context.current.resume();
    const source = context.current.createBufferSource();
    source.buffer = buffer.current;
    source.connect(context.current.destination);
    source.start(0, start, end - start);
    player.current = source;
  }
  function trim() {
    const audio = buffer.current;
    if (!audio || !valid) return;
    player.current?.stop();
    const bytes = trimVoiceWav(audio, start, end);
    setOriginal((previous) => previous || file);
    onChange(
      new File([bytes], file.name.replace(/\.[^.]+$/, "") + "-extrait.wav", {
        type: "audio/wav",
      }),
    );
    setOpen(false);
  }
  return (
    <div className={s.editTools}>
      <div className={s.buttons}>
        <button
          className={s.secondary}
          disabled={disabled || busy}
          onClick={load}
        >
          <Scissors size={15} />
          {busy ? "Ouverture…" : "Rogner l’audio"}
        </button>
        {original && (
          <button
            className={s.secondary}
            disabled={disabled}
            onClick={() => {
              player.current?.stop();
              onChange(original);
              setOriginal(null);
              setOpen(false);
            }}
          >
            <Undo2 size={15} /> Restaurer l’original
          </button>
        )}
      </div>
      {open && (
        <div>
          <p className={s.small}>
            Choisis le passage à conserver. Le fichier original sur ton Mac
            reste intact.
          </p>
          <div className={s.settingsGrid}>
            <label>
              Début · secondes
              <input
                type="number"
                min={0}
                max={duration}
                step={0.1}
                value={start}
                disabled={disabled}
                onChange={(e) => setStart(Number(e.target.value))}
              />
            </label>
            <label>
              Fin · secondes
              <input
                type="number"
                min={0}
                max={duration}
                step={0.1}
                value={end}
                disabled={disabled}
                onChange={(e) => setEnd(Number(e.target.value))}
              />
            </label>
          </div>
          <p className={s.small}>
            {valid
              ? `${(end - start).toFixed(1)} s sélectionnées sur ${duration.toFixed(1)} s`
              : "La fin doit être après le début."}
          </p>
          <div className={s.buttons}>
            <button
              className={s.secondary}
              disabled={!valid || disabled}
              onClick={listen}
            >
              <Play size={15} /> Écouter le passage
            </button>
            <button
              className={s.primary}
              disabled={!valid || disabled}
              onClick={trim}
            >
              Conserver ce passage
            </button>
            <button
              className={s.secondary}
              onClick={() => {
                player.current?.stop();
                setOpen(false);
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className={s.error}>
          {error}
        </p>
      )}
    </div>
  );
}
