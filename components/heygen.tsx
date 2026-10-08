"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Check,
  ExternalLink,
  LoaderCircle,
  Mic,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type { Project } from "@/lib/schemas/project";
import {
  connectionSchema,
  voicePageSchema,
  speechOutput,
  renderSchema,
  videoInput,
  type HeyGenVoice,
  type HeyGenConnection,
} from "@/lib/schemas/heygen";
import {
  heygenRequest,
  HeyGenClientError,
  errorMessage,
} from "@/lib/heygen-client";
import { Modal } from "./ui";

export function useHeyGenConnection() {
  const [connection, setConnection] = useState<HeyGenConnection | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const refresh = useCallback(async (verify = false) => {
    setLoading(true);
    setError("");
    try {
      setConnection(
        await heygenRequest(
          `/api/heygen/connection${verify ? "?verify=1" : ""}`,
          connectionSchema,
        ),
      );
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void heygenRequest("/api/heygen/connection", connectionSchema, {
      signal: controller.signal,
    })
      .then(setConnection)
      .catch((error) => {
        if (!controller.signal.aborted) setError(errorMessage(error));
      });
    return () => controller.abort();
  }, []);
  return { connection, error, loading, refresh };
}
export function HeyGenBadge() {
  const { connection } = useHeyGenConnection();
  return (
    <Link href="/settings" className="demo-tag">
      <i />
      {connection?.configured
        ? "HeyGen · clé configurée"
        : "HeyGen · à connecter"}
    </Link>
  );
}
export function HeyGenSettings() {
  const { connection, error, loading, refresh } = useHeyGenConnection();
  return (
    <section className="panel heygen-settings">
      <div className="panel-title">
        <h2>
          <Sparkles size={18} /> Connexion HeyGen
        </h2>
        <span className="pill">API v3</span>
      </div>
      <p>
        {connection?.verified
          ? "Connexion vérifiée : HeyGen a accepté votre clé."
          : connection?.configured
            ? "Une clé est configurée sur le serveur. Testez la connexion pour vérifier ses droits."
            : "Connectez votre compte pour générer de vraies voix et vidéos."}
      </p>
      {!connection?.configured && (
        <ol className="setup-steps">
          <li>
            Créez votre clé dans le{" "}
            <a
              href="https://app.heygen.com/developers"
              target="_blank"
              rel="noreferrer"
            >
              compte HeyGen <ExternalLink size={12} />
            </a>
            .
          </li>
          <li>
            Renseignez <code>HEYGEN_API_KEY</code> dans le fichier{" "}
            <code>.env.local</code> du projet.
          </li>
          <li>
            Redémarrez le studio avec <code>npm run dev</code>, puis testez la
            connexion.
          </li>
        </ol>
      )}
      <div className="heygen-actions">
        <button
          className="button primary"
          disabled={loading}
          onClick={() => void refresh(true)}
        >
          {loading ? (
            <LoaderCircle className="spin" size={15} />
          ) : (
            <Check size={15} />
          )}{" "}
          Tester la connexion
        </button>
        <button
          className="button"
          disabled={loading}
          onClick={() => void refresh()}
        >
          <RefreshCw size={15} /> Actualiser
        </button>
      </div>
      {error && (
        <p className="api-error" role="alert">
          {error}
        </p>
      )}
      <p className="helper">
        La clé reste sur le serveur. Les générations utilisent les crédits API
        de votre compte. Le studio connecté est actuellement réservé à une
        utilisation locale.
      </p>
    </section>
  );
}

export function HeyGenVoices({
  project,
  onChange,
}: {
  project: Project;
  onChange: (patch: Partial<Project>) => void;
}) {
  const { connection, error: connectionError } = useHeyGenConnection();
  const [type, setType] = useState<"public" | "private">("public");
  const [voices, setVoices] = useState<HeyGenVoice[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!connection?.configured) return;
    const controller = new AbortController();
    const start = setTimeout(() => {
      setLoading(true);
      setError("");
      setVoices([]);
      setToken(null);
      void heygenRequest(`/api/heygen/voices?type=${type}`, voicePageSchema, {
        signal: controller.signal,
      })
        .then((result) => {
          setVoices(result.data);
          setToken(result.has_more ? result.next_token || null : null);
        })
        .catch((error) => {
          if (!controller.signal.aborted) setError(errorMessage(error));
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 0);
    return () => {
      clearTimeout(start);
      controller.abort();
    };
  }, [connection?.configured, type, retry]);
  async function loadMore() {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const result = await heygenRequest(
        `/api/heygen/voices?type=${type}&token=${encodeURIComponent(token)}`,
        voicePageSchema,
      );
      setVoices((list) => [
        ...list,
        ...result.data.filter(
          (v) => !list.some((x) => x.voice_id === v.voice_id),
        ),
      ]);
      setToken(result.has_more ? result.next_token || null : null);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }
  async function generate() {
    if (!project.heygenVoiceId || generating) return;
    setGenerating(true);
    setError("");
    try {
      const result = await heygenRequest("/api/heygen/speech", speechOutput, {
        method: "POST",
        body: JSON.stringify({
          text: project.script,
          voiceId: project.heygenVoiceId,
          speed: project.speed,
        }),
      });
      onChange({
        heygenSpeech: {
          ...result,
          text: project.script,
          voiceId: project.heygenVoiceId,
          speed: project.speed,
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setGenerating(false);
    }
  }
  const selected = voices.find((v) => v.voice_id === project.heygenVoiceId);
  const speech = project.heygenSpeech;
  const stale =
    speech &&
    (speech.text !== project.script ||
      speech.voiceId !== project.heygenVoiceId ||
      speech.speed !== project.speed);
  return (
    <div className="heygen-voices">
      <div className="panel-title">
        <h2>Voix HeyGen</h2>
        <span className="pill">VOIX RÉELLES</span>
      </div>
      <p className="muted">
        Catalogue français et voix privées compatibles avec la génération audio
        Starfish.
      </p>
      {!connection?.configured ? (
        <div className="connection-empty">
          <Mic size={24} />
          <h3>Connectez votre voix à votre studio</h3>
          <p>
            {connectionError ||
              "Ajoutez votre clé API pour accéder à vos voix HeyGen."}
          </p>
          <Link className="button primary" href="/settings">
            Configurer HeyGen
          </Link>
        </div>
      ) : (
        <>
          <div className="provider-tabs">
            <button
              className={type === "public" ? "chosen" : ""}
              aria-pressed={type === "public"}
              onClick={() => setType("public")}
            >
              Catalogue français
            </button>
            <button
              className={type === "private" ? "chosen" : ""}
              aria-pressed={type === "private"}
              onClick={() => setType("private")}
            >
              Mes voix privées
            </button>
          </div>
          <label>
            Voix sélectionnée
            <select
              value={selected?.voice_id || ""}
              onChange={(e) => {
                const voice = voices.find((v) => v.voice_id === e.target.value);
                if (voice)
                  onChange({
                    heygenVoiceId: voice.voice_id,
                    heygenVoiceName: voice.name,
                  });
              }}
            >
              <option value="" disabled>
                {project.heygenVoiceName
                  ? `Sélection actuelle : ${project.heygenVoiceName}`
                  : "Choisissez une voix"}
              </option>
              {voices.map((v) => (
                <option value={v.voice_id} key={v.voice_id}>
                  {v.name}
                  {v.language ? ` · ${v.language}` : ""}
                </option>
              ))}
            </select>
          </label>
          {selected?.preview_audio_url && (
            <audio
              className="heygen-audio"
              controls
              src={selected.preview_audio_url}
              preload="none"
              aria-label={`Extrait de ${selected.name}`}
            />
          )}
          <div className="heygen-actions">
            {token && (
              <button
                className="chip"
                disabled={loading}
                onClick={() => void loadMore()}
              >
                Charger plus de voix
              </button>
            )}
            <button
              className="chip"
              disabled={loading}
              onClick={() => setRetry((v) => v + 1)}
            >
              <RefreshCw size={13} />
              Actualiser les voix
            </button>
            {loading && <LoaderCircle className="spin" size={16} />}
          </div>
          {!loading && !voices.length && !error && (
            <p className="muted">Aucune voix disponible pour ce filtre.</p>
          )}
          <label className="range-label">
            Vitesse <span>{project.speed.toFixed(1)}×</span>
            <input
              aria-label="Vitesse HeyGen"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={project.speed}
              onChange={(e) => onChange({ speed: Number(e.target.value) })}
            />
          </label>
          <button
            className="button primary wide"
            disabled={
              generating ||
              !project.heygenVoiceId ||
              !project.script.trim() ||
              project.script.length > 5000
            }
            onClick={() => void generate()}
          >
            {generating ? (
              <LoaderCircle size={16} className="spin" />
            ) : (
              <Mic size={16} />
            )}{" "}
            {generating
              ? "Génération de la voix…"
              : "Générer la voix avec HeyGen"}
          </button>
          <p className="helper">
            Utilise le texte de l’onglet Script · {project.script.length}/5 000
            caractères · Consomme des crédits HeyGen.
          </p>
        </>
      )}
      {error && (
        <p className="api-error" role="alert">
          {error}
        </p>
      )}
      {speech && (
        <div className="speech-result">
          <strong>Voix off générée · {Math.round(speech.duration)} s</strong>
          {stale && (
            <p className="api-notice">
              Le script ou la voix a changé depuis cet audio.
            </p>
          )}
          <audio
            controls
            className="heygen-audio"
            src={speech.audioUrl}
            preload="none"
            aria-label="Voix off générée par HeyGen"
          />
          <a
            className="text-link"
            href={speech.audioUrl}
            target="_blank"
            rel="noreferrer"
          >
            Ouvrir l’audio <ExternalLink size={13} />
          </a>
        </div>
      )}
    </div>
  );
}

export function useHeyGenRender(
  project: Project,
  onChange: (project: Project) => void,
) {
  const latest = useRef(project);
  useEffect(() => {
    latest.current = project;
  }, [project]);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const id = project.heygenRender?.sessionId;
  const status = project.heygenRender?.status;
  useEffect(() => {
    if (!id) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const controller = new AbortController();
    const poll = async () => {
      try {
        const result = await heygenRequest(
          `/api/heygen/videos/${encodeURIComponent(id)}`,
          renderSchema,
          { signal: controller.signal },
        );
        if (stopped) return;
        setError("");
        const current = latest.current;
        if (current.heygenRender?.sessionId !== id) return;
        const didComplete =
          result.status === "completed" &&
          current.heygenRender.status !== "completed";
        onChange({
          ...current,
          heygenRender: result,
          status:
            result.status === "failed"
              ? "Erreur"
              : result.status === "completed"
                ? "Terminé"
                : "Génération",
          renders: current.renders + (didComplete ? 1 : 0),
        });
        if (result.status === "pending" || result.status === "processing")
          timer = setTimeout(poll, 15000);
      } catch (error) {
        if (stopped) return;
        setError(errorMessage(error));
        if (
          error instanceof HeyGenClientError &&
          [400, 401, 403, 404, 503].includes(error.status)
        )
          return;
        if (status === "pending" || status === "processing")
          timer = setTimeout(poll, 30000);
      }
    };
    void poll();
    return () => {
      stopped = true;
      controller.abort();
      if (timer) clearTimeout(timer);
    };
    // Terminal results are refreshed once on mount/retry so signed download links stay fresh.
  }, [id, status, retry, onChange]);
  return { error, refresh: () => setRetry((v) => v + 1) };
}
export function HeyGenResult({
  project,
  error,
  refresh,
}: {
  project: Project;
  error: string;
  refresh: () => void;
}) {
  const result = project.heygenRender;
  if (!result) return null;
  const working = ["pending", "processing"].includes(result.status);
  return (
    <section className="heygen-result">
      <div className="panel-title">
        <h2>
          {working ? (
            <LoaderCircle className="spin" size={17} />
          ) : (
            <Sparkles size={17} />
          )}{" "}
          {working
            ? "HeyGen prépare votre vidéo"
            : result.status === "completed"
              ? "Votre vidéo HeyGen"
              : "Génération HeyGen interrompue"}
        </h2>
        <button className="chip" onClick={refresh}>
          <RefreshCw size={13} />
          Actualiser
        </button>
      </div>
      {working && (
        <p>
          Suivi automatique toutes les 15 secondes. Vous pouvez fermer ce
          panneau ou revenir plus tard : la génération continue chez HeyGen.
        </p>
      )}
      {result.status === "failed" && (
        <p className="api-error">{result.error}</p>
      )}
      {error && (
        <p role="alert" className="api-error">
          {error}
        </p>
      )}
      {result.videoUrl && (
        <>
          <video
            controls
            playsInline
            preload="metadata"
            src={result.videoUrl}
            className="heygen-video"
            aria-label="Vidéo finale HeyGen"
          />
          <div className="heygen-actions">
            <a
              className="button primary"
              href={result.videoUrl}
              target="_blank"
              rel="noreferrer"
            >
              Ouvrir / télécharger la vidéo <ExternalLink size={14} />
            </a>
            <small>Le lien peut expirer. Actualisez pour le renouveler.</small>
          </div>
        </>
      )}
      <small className="render-id">Session : {result.sessionId}</small>
    </section>
  );
}

export function HeyGenRenderDialog({
  project,
  onChange,
  onClose,
  onDemo,
}: {
  project: Project;
  onChange: (p: Project) => void;
  onClose: () => void;
  onDemo: () => void;
}) {
  const { connection, error: connectionError } = useHeyGenConnection();
  const [source, setSource] = useState(
    project.scenes.length ? "scenes" : "script",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [uncertain, setUncertain] = useState(false);
  const requestId = useRef(crypto.randomUUID());
  const narration =
    source === "scenes"
      ? project.scenes.map((s) => s.text).join("\n")
      : project.script;
  const supported = project.format === "16:9" || project.format === "9:16";
  const active =
    project.heygenRender &&
    ["pending", "processing"].includes(project.heygenRender.status);
  async function submit() {
    if (submitting) return;
    setError("");
    const input = videoInput.safeParse({
      requestId: requestId.current,
      name: project.name,
      script: narration,
      format: project.format,
      template: project.template,
      subtitle: project.subtitle,
      speed: project.speed,
      voiceId: project.heygenVoiceId,
      scenes: source === "scenes" ? project.scenes : [],
    });
    if (!input.success) {
      setError(
        "Vérifiez le format, le script (8 000 caractères maximum) et le nombre de scènes (50 maximum).",
      );
      return;
    }
    setSubmitting(true);
    try {
      const result = await heygenRequest("/api/heygen/videos", renderSchema, {
        method: "POST",
        body: JSON.stringify(input.data),
      });
      onChange({ ...project, status: "Génération", heygenRender: result });
      onClose();
    } catch (error) {
      setError(errorMessage(error));
      if (
        error instanceof HeyGenClientError &&
        [
          "network_error",
          "connection_uncertain",
          "invalid_response",
          "request_pending",
        ].includes(error.code)
      )
        setUncertain(true);
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <Modal
      title="Générer avec HeyGen"
      onClose={() => {
        if (!submitting) onClose();
      }}
    >
      <p className="muted">
        Votre narration et les indications visuelles seront envoyées à HeyGen
        Video Agent. La génération utilise les crédits de votre compte.
      </p>
      <div className="render-summary">
        <span>
          Format <strong>{project.format}</strong>
        </span>
        <span>
          Voix{" "}
          <strong>
            {project.heygenVoiceName || "Choix automatique HeyGen"}
          </strong>
        </span>
        <span>
          Style <strong>{project.template}</strong>
        </span>
      </div>
      <label>
        Narration à envoyer
        <select
          value={source}
          disabled={submitting || uncertain}
          onChange={(e) => setSource(e.target.value)}
        >
          <option value="script">Texte de l’onglet Script</option>
          {project.scenes.length > 0 && (
            <option value="scenes">
              Textes des scènes, dans l’ordre du montage
            </option>
          )}
        </select>
      </label>
      <textarea
        className="render-script"
        readOnly
        rows={5}
        value={narration}
        aria-label="Narration envoyée à HeyGen"
      />
      <p className="helper">
        Les visuels locaux ne sont pas transférés. HeyGen crée son montage à
        partir de vos indications ; le résultat peut différer du storyboard.
      </p>
      {!supported && (
        <p className="api-notice">
          Choisissez 16:9 ou 9:16 dans les réglages. Les formats 1:1 et 4:5
          restent disponibles en démonstration.
        </p>
      )}
      {!connection?.configured && (
        <p className="api-notice">
          {connectionError || "HeyGen n’est pas encore connecté."}{" "}
          <Link href="/settings">Configurer la clé API →</Link>
        </p>
      )}
      {active && (
        <p className="api-notice">
          Une vidéo est déjà en cours pour ce projet. Son suivi reste disponible
          dans l’éditeur.
        </p>
      )}
      {error && (
        <p className="api-error" role="alert">
          {error}
        </p>
      )}
      {uncertain && (
        <a
          className="button wide"
          href="https://app.heygen.com"
          target="_blank"
          rel="noreferrer"
        >
          Vérifier mes générations dans HeyGen <ExternalLink size={14} />
        </a>
      )}
      <button
        className="button primary wide"
        disabled={
          !connection?.configured ||
          !supported ||
          submitting ||
          Boolean(active) ||
          !narration.trim() ||
          uncertain
        }
        onClick={() => void submit()}
      >
        {submitting ? (
          <LoaderCircle className="spin" size={16} />
        ) : (
          <Sparkles size={16} />
        )}{" "}
        {submitting ? "Envoi à HeyGen…" : "Lancer la génération réelle"}
      </button>
      <button
        className="button wide"
        disabled={submitting || Boolean(active)}
        onClick={onDemo}
      >
        Utiliser la simulation gratuite
      </button>
    </Modal>
  );
}
