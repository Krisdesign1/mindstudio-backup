"use client";
import { useEffect, useRef, useState } from "react";
import type { MotionEdit } from "@/lib/schemas/motion-edit";
import { moveBoundary } from "@/lib/hyperframes/timeline";
export type Command = {
  type: "motion-transport";
  action: "seek" | "play" | "pause" | "loop";
  time?: number;
  start?: number;
  end?: number;
  enabled?: boolean;
};
export function MotionTimeline({
  edit,
  selected,
  onSelect,
  onChange,
  send,
  time,
}: {
  edit: MotionEdit;
  selected: string;
  onSelect: (id: string) => void;
  onChange: (edit: MotionEdit) => void;
  send: (command: Command) => void;
  time: number;
}) {
  const duration = edit.source?.duration || 10,
    sourceId = edit.source?.id;
  const [zoom, setZoom] = useState(1),
    [peaks, setPeaks] = useState<number[]>([]),
    [error, setError] = useState(""),
    [loop, setLoop] = useState(false),
    [start, setStart] = useState(0),
    [end, setEnd] = useState(duration);
  const track = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ id: string; time: number } | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (!sourceId) return;
    fetch(`/api/motion/media/${sourceId}/waveform`)
      .then(async (r) => {
        if (!r.ok) throw new Error("Forme d’onde indisponible.");
        return r.json();
      })
      .then((data) => {
        if (!cancelled) {
          setPeaks(data.peaks);
          setError("");
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [sourceId]);
  const ordered = [...edit.layers].sort((a, b) => a.start - b.start);
  function at(clientX: number) {
    const rect = track.current!.getBoundingClientRect();
    return Math.max(
      0,
      Math.min(duration, ((clientX - rect.left) / rect.width) * duration),
    );
  }
  function updateLoop(a: number, b: number, enabled = loop) {
    setStart(a);
    setEnd(b);
    send({
      type: "motion-transport",
      action: "loop",
      start: a,
      end: b,
      enabled,
    });
  }
  return (
    <section className="mt-timeline">
      <header>
        <strong>Timeline · {time.toFixed(2)} s</strong>
        <button
          className="button"
          disabled={!sourceId}
          onClick={() => send({ type: "motion-transport", action: "play" })}
        >
          Lire
        </button>
        <button
          className="button"
          onClick={() => send({ type: "motion-transport", action: "pause" })}
        >
          Pause
        </button>
        <label>
          Zoom{" "}
          <input
            aria-label="Zoom timeline"
            type="range"
            min="1"
            max="12"
            step="1"
            value={zoom}
            onChange={(e) => setZoom(+e.target.value)}
          />
          {zoom}×
        </label>
      </header>
      <div className="mt-loop">
        <label>
          <input
            type="checkbox"
            checked={loop}
            onChange={(e) => {
              setLoop(e.target.checked);
              updateLoop(start, Math.min(end, duration), e.target.checked);
            }}
          />{" "}
          Écouter en boucle
        </label>
        <label>
          De{" "}
          <input
            aria-label="Début de boucle"
            type="number"
            min="0"
            max={Math.min(end, duration) - 0.05}
            step="0.01"
            value={start}
            onChange={(e) => {
              const n = +e.target.value;
              if (Number.isFinite(n))
                updateLoop(
                  Math.max(0, Math.min(n, end - 0.05)),
                  Math.min(end, duration),
                );
            }}
          />
        </label>
        <label>
          à{" "}
          <input
            aria-label="Fin de boucle"
            type="number"
            min={start + 0.05}
            max={duration}
            step="0.01"
            value={Math.min(end, duration)}
            onChange={(e) => {
              const n = +e.target.value;
              if (Number.isFinite(n))
                updateLoop(
                  start,
                  Math.min(duration, Math.max(start + 0.05, n)),
                );
            }}
          />
        </label>
        <button
          className="button"
          onClick={() => {
            const l = edit.layers.find((l) => l.id === selected);
            if (l) {
              updateLoop(l.start, l.start + l.duration, true);
              setLoop(true);
              send({ type: "motion-transport", action: "seek", time: l.start });
            }
          }}
        >
          Boucler la scène
        </button>
      </div>
      <div className="mt-scroll">
        <div
          className="mt-tracks"
          style={{ width: `${zoom * 100}%` }}
          ref={track}
        >
          <div
            className="mt-ruler"
            onClick={(e) =>
              send({
                type: "motion-transport",
                action: "seek",
                time: at(e.clientX),
              })
            }
          >
            {Array.from({ length: 11 }, (_, i) => (
              <span key={i}>{((duration * i) / 10).toFixed(1)}s</span>
            ))}
          </div>
          <div className="mt-clips">
            {ordered.map((l, i) => (
              <div
                key={l.id}
                className={`mt-clip ${selected === l.id ? "selected" : ""}`}
                style={{
                  left: `${(l.start / duration) * 100}%`,
                  width: `${(l.duration / duration) * 100}%`,
                  borderColor: l.color,
                }}
              >
                <button
                  onClick={() => {
                    onSelect(l.id);
                    send({
                      type: "motion-transport",
                      action: "seek",
                      time: l.start + 0.01,
                    });
                  }}
                >
                  {i + 1} · {l.text}
                </button>
                {ordered[i + 1] &&
                  Math.abs(l.start + l.duration - ordered[i + 1].start) <
                    0.03 && (
                    <button
                      className="mt-boundary"
                      aria-label={`Limite après la scène ${i + 1}`}
                      title="Glisser pour déplacer la limite ; flèches pour ajuster de 0,05 s"
                      onKeyDown={(e) => {
                        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                          e.preventDefault();
                          onChange({
                            ...edit,
                            layers: moveBoundary(
                              edit.layers,
                              l.id,
                              l.start +
                                l.duration +
                                (e.key === "ArrowRight" ? 0.05 : -0.05),
                            ),
                          });
                        }
                      }}
                      onPointerDown={(e) => {
                        e.currentTarget.setPointerCapture(e.pointerId);
                        setDrag({ id: l.id, time: l.start + l.duration });
                      }}
                      onPointerMove={(e) => {
                        if (e.currentTarget.hasPointerCapture(e.pointerId))
                          setDrag({ id: l.id, time: at(e.clientX) });
                      }}
                      onPointerUp={(e) => {
                        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                          onChange({
                            ...edit,
                            layers: moveBoundary(
                              edit.layers,
                              l.id,
                              at(e.clientX),
                            ),
                          });
                          setDrag(null);
                          e.currentTarget.releasePointerCapture(e.pointerId);
                        }
                      }}
                      onPointerCancel={() => setDrag(null)}
                    >
                      ⋮
                    </button>
                  )}
              </div>
            ))}
          </div>
          <div
            className="mt-wave"
            onClick={(e) =>
              send({
                type: "motion-transport",
                action: "seek",
                time: at(e.clientX),
              })
            }
          >
            <svg
              viewBox={`0 0 ${Math.max(1, peaks.length)} 80`}
              preserveAspectRatio="none"
              aria-label="Forme d’onde du son original"
            >
              {peaks.map((p, i) => (
                <line
                  key={i}
                  x1={i}
                  x2={i}
                  y1={40 - p * 38}
                  y2={40 + p * 38}
                  stroke="currentColor"
                  strokeWidth="0.8"
                />
              ))}
            </svg>
            {!peaks.length && (
              <span>{error || "Chargement de la forme d’onde…"}</span>
            )}
          </div>
          <div
            className="mt-playhead"
            style={{ left: `${(time / duration) * 100}%` }}
          />
          {drag && (
            <div
              className="mt-drag"
              style={{ left: `${(drag.time / duration) * 100}%` }}
            >
              <b>{drag.time.toFixed(2)} s</b>
            </div>
          )}
        </div>
      </div>
      <footer>
        🔒 Son original verrouillé · Cliquer sur l’onde pour écouter un instant.
        Les poignées déplacent les limites communes sans créer de vide.
      </footer>
    </section>
  );
}
