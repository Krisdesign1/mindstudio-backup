"use client";
import { useEffect, useState } from "react";
import { Download, Music2, Search } from "lucide-react";
import { AudioPreview } from "./audio-preview";
import type { SavedVoice, NarrationRecord } from "@/lib/voice-library";
import { voiceFilename } from "@/lib/voice-title";
import s from "./voices.module.css";
async function save(data: unknown) {
  const response = await fetch("/api/voice/library", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}
export function SaveVoice({
  jobId,
  disabled,
}: {
  jobId: string;
  disabled: boolean;
}) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className={s.editTools}>
      <label>
        Nom de cette voix
        <input
          value={name}
          maxLength={80}
          placeholder="Ex. Ma voix · récit posé"
          onChange={(e) => setName(e.target.value)}
          disabled={disabled || busy}
        />
      </label>
      <button
        className={s.secondary}
        disabled={!name.trim() || disabled || busy}
        onClick={async () => {
          setBusy(true);
          try {
            await save({ action: "save", jobId, name });
            setMessage("Voix enregistrée. Retrouve-la dans Mes voix.");
            setName("");
          } catch (e) {
            setMessage((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Enregistrement…" : "Enregistrer dans Mes voix"}
      </button>
      {message && <p role="status">{message}</p>}
    </div>
  );
}
function VoiceCard({
  voice,
  locked,
  onUse,
}: {
  voice: SavedVoice;
  locked: boolean;
  onUse: (voice: SavedVoice) => Promise<void>;
}) {
  const [name, setName] = useState(voice.name);
  const [title, setTitle] = useState(voice.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <article className={s.card}>
      <AudioPreview
        src={`/api/voice/library?audio=${voice.id}`}
        title={title}
      />
      <p>
        {voice.duration.toFixed(1)} s · Extrait préparé ·{" "}
        {new Date(voice.createdAt * 1000).toLocaleDateString("fr-FR")}
      </p>
      <label>
        Nom de la voix
        <input
          aria-label="Nom de la voix"
          value={name}
          maxLength={80}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <div className={s.buttons}>
        <button
          className={s.secondary}
          disabled={!name.trim() || name === title || busy}
          onClick={async () => {
            setBusy(true);
            try {
              const result = await save({
                action: "rename",
                id: voice.id,
                name,
              });
              setTitle(result.name);
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          Renommer
        </button>
        <button
          className={s.primary}
          disabled={locked || busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onUse({ ...voice, name: title });
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          Utiliser cette voix
        </button>
      </div>
      {error && (
        <p role="alert" className={s.error}>
          {error}
        </p>
      )}
    </article>
  );
}
export function VoiceCollection({
  view,
  locked,
  onUse,
  onRestore,
}: {
  view: "voices" | "history";
  locked: boolean;
  onUse: (voice: SavedVoice) => Promise<void>;
  onRestore: (record: NarrationRecord) => Promise<void>;
}) {
  const [voices, setVoices] = useState<SavedVoice[]>([]);
  const [history, setHistory] = useState<NarrationRecord[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState("");
  useEffect(() => {
    let alive = true;
    fetch(`/api/voice/library?view=${view}`, { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        if (alive) {
          if (view === "voices") setVoices(data);
          else setHistory(data);
        }
      })
      .catch((e) => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [view]);
  const matches = (text: string) =>
    text.toLocaleLowerCase("fr").includes(query.toLocaleLowerCase("fr"));
  return (
    <section>
      <div className={s.libraryHeading}>
        <div>
          <h2>
            {view === "voices"
              ? "Mes voix enregistrées"
              : "Historique des narrations"}
          </h2>
          <p>
            {view === "voices"
              ? "Tes extraits préparés, conservés sur ce Mac. Choisis une voix et écris ton prochain récit."
              : "Retrouve tes prises, écoute-les et reprends leur script et leurs réglages."}
          </p>
        </div>
        <label>
          <Search size={16} />
          <input
            aria-label="Rechercher dans la bibliothèque"
            placeholder="Rechercher…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      {error && (
        <p role="alert" className={s.error}>
          {error}
        </p>
      )}
      {loading ? (
        <p role="status">Chargement de la bibliothèque…</p>
      ) : (
        <>
          {view === "voices" ? (
            <div className={s.libraryGrid}>
              {voices
                .filter((v) => matches(v.name))
                .map((v) => (
                  <VoiceCard
                    key={v.id}
                    voice={v}
                    locked={locked}
                    onUse={onUse}
                  />
                ))}
            </div>
          ) : (
            <div className={s.libraryGrid}>
              {history
                .filter((v) => matches(v.title + " " + (v.text || "")))
                .map((record) => (
                  <article key={record.id} className={s.card}>
                    <div className={s.libraryMeta}>
                      {record.kind === "test" ? "ESSAI COURT" : "NARRATION"} ·{" "}
                      {new Date(record.startedAt * 1000).toLocaleString(
                        "fr-FR",
                      )}
                    </div>
                    <h3>{record.title}</h3>
                    {record.status === "completed" ? (
                      <AudioPreview
                        src={`/api/voice?id=${record.id}&audio=1`}
                        title={record.title}
                      />
                    ) : (
                      <p>
                        {record.status === "failed"
                          ? "Génération interrompue ou échouée"
                          : "Traitement en cours"}
                      </p>
                    )}
                    <p>
                      {record.voiceName || "Extrait vocal du projet"}
                      {record.duration
                        ? ` · ${record.duration.toFixed(1)} s`
                        : ""}
                    </p>
                    <details className={s.details}>
                      <summary>Script et réglages</summary>
                      <p className={s.libraryScript}>
                        {record.text ??
                          "Le script n’a pas été conservé pour cette ancienne prise."}
                      </p>
                      {record.settings ? (
                        <dl className={s.librarySettings}>
                          {Object.entries({
                            "Pause entre phrases": `${record.settings.pause} s`,
                            "Pauses naturelles": record.settings.naturalPauses
                              ? "Oui"
                              : "Non",
                            "Volume équilibré": record.settings.normalize
                              ? "Oui"
                              : "Non",
                            Expressivité: record.settings.exaggeration,
                            Fidélité: record.settings.cfg,
                            Température: record.settings.temperature,
                            Graine: record.settings.seed,
                            Nettoyage: record.settings.denoise
                              ? record.settings.strength
                              : "Désactivé",
                          }).map(([key, value]) => (
                            <div key={key}>
                              <dt>{key}</dt>
                              <dd>{value}</dd>
                            </div>
                          ))}
                        </dl>
                      ) : (
                        <p>Réglages indisponibles pour cette ancienne prise.</p>
                      )}
                    </details>
                    <div className={s.buttons}>
                      {record.status === "completed" && (
                        <a
                          className={s.secondary}
                          href={`/api/voice?id=${record.id}&audio=1`}
                          download={voiceFilename(record.title)}
                        >
                          <Download size={15} /> WAV
                        </a>
                      )}
                      <button
                        className={s.primary}
                        disabled={locked || !!pending || record.text === null}
                        onClick={async () => {
                          setPending(record.id);
                          try {
                            await onRestore(record);
                          } catch (e) {
                            setError((e as Error).message);
                          } finally {
                            setPending("");
                          }
                        }}
                      >
                        {pending === record.id
                          ? "Ouverture…"
                          : "Reprendre cette narration"}
                      </button>
                    </div>
                  </article>
                ))}
            </div>
          )}
          {!(view === "voices"
            ? voices.filter((v) => matches(v.name)).length
            : history.filter((v) => matches(v.title + " " + (v.text || "")))
                .length) && (
            <div className={s.libraryEmpty}>
              <Music2 size={30} />
              <h3>
                {query
                  ? "Aucun résultat"
                  : view === "voices"
                    ? "Ta bibliothèque de voix commence ici"
                    : "Aucune narration pour le moment"}
              </h3>
              <p>
                {view === "voices"
                  ? "Dans Créer une narration, importe ta voix, prépare-la, puis donne-lui un nom avec Enregistrer dans Mes voix."
                  : "Tes prochaines narrations et tes essais apparaîtront automatiquement ici."}
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
