"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Aperture,
  ArrowLeft,
  ArrowUp,
  Check,
  Copy,
  LoaderCircle,
  Plus,
  Sparkles,
  Square,
  Undo2,
} from "lucide-react";
import { projectsSchema, type Project } from "@/lib/schemas/project";
import { applyCodexProposal, type CodexProposal } from "@/lib/codex-proposal";
import s from "./assistant.module.css";

type Conversation = {
  id: string;
  running: boolean;
  startedAt: number;
  messages: { role: "user" | "assistant"; text: string }[];
  draft: string;
  error?: string;
  proposal?: CodexProposal;
  project?: Project;
};
const STORAGE = "mindstudio.projects.v1";
async function api(data?: unknown, id?: string) {
  const res = await fetch(
    "/api/codex" + (id ? "?id=" + id : ""),
    data
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      : { cache: "no-store" },
  );
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Connexion impossible.");
  return result;
}
function streamingMessage(raw: string) {
  const match = /"message"\s*:\s*"((?:\\.|[^"\\])*)/.exec(raw);
  if (!match) return "";
  try {
    return JSON.parse('"' + match[1].replace(/\\$/, "") + '"') as string;
  } catch {
    return "";
  }
}
function label(path: string) {
  return (
    (
      {
        name: "Titre",
        script: "Script",
        idea: "Intention",
        motionBrand: "Signature",
        motionAccent: "Couleur",
        motionLogo: "Logo",
      } as Record<string, string>
    )[path] ||
    path
      .replace(
        /scenes\.(\d+)\.text/,
        (_, n) => `Texte · scène ${Number(n) + 1}`,
      )
      .replace(
        /scenes\.(\d+)\.prompt/,
        (_, n) => `Illustration · scène ${Number(n) + 1}`,
      )
  );
}
function previous(project: Project | undefined, path: string) {
  if (!project) return "";
  const scene = /^scenes\.(\d+)\.(text|prompt)$/.exec(path);
  return scene
    ? project.scenes[Number(scene[1])]?.[scene[2] as "text" | "prompt"] || ""
    : String(project[path as keyof Project] || "");
}
export default function AssistantPage() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loginUrl, setLoginUrl] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [applied, setApplied] = useState(false);
  const [undo, setUndo] = useState<{ before: Project; after: Project } | null>(
    null,
  );
  const bottom = useRef<HTMLDivElement>(null);
  const running = !!conversation?.running;
  useEffect(() => {
    api()
      .then((r) => setConnected(r.connected))
      .catch((e) => {
        setConnected(false);
        setError(e.message);
      });
    const load = setTimeout(() => {
      try {
        setProjects(
          projectsSchema.parse(
            JSON.parse(localStorage.getItem(STORAGE) || "[]"),
          ),
        );
      } catch {
        setError("La liste des projets n’a pas pu être chargée.");
      }
    }, 0);
    const id = localStorage.getItem("mindstudio.codex.conversation");
    if (id)
      api(undefined, id)
        .then((c) => {
          setConversation(c);
          setProjectId(c.project?.id || "");
        })
        .catch(() => localStorage.removeItem("mindstudio.codex.conversation"));
    return () => clearTimeout(load);
  }, []);
  useEffect(() => {
    if (!conversation?.running) return;
    const id = conversation.id;
    const poll = setInterval(() => {
      api(undefined, id)
        .then(setConversation)
        .catch((e) => setError(e.message));
    }, 1200);
    const clock = setInterval(
      () =>
        setElapsed(Math.floor((Date.now() - conversation.startedAt) / 1000)),
      1000,
    );
    return () => {
      clearInterval(poll);
      clearInterval(clock);
    };
  }, [conversation?.id, conversation?.running, conversation?.startedAt]);
  useEffect(() => {
    if (!loginUrl) return;
    const timer = setInterval(
      () =>
        api()
          .then((r) => {
            setConnected(r.connected);
            if (r.connected) setLoginUrl("");
          })
          .catch(() => {}),
      3000,
    );
    return () => clearInterval(timer);
  }, [loginUrl]);
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [conversation?.messages.length, running]);
  async function send() {
    if (!text.trim() || busy || running) return;
    setBusy(true);
    setError("");
    setNotice("");
    setElapsed(0);
    setApplied(false);
    setUndo(null);
    try {
      const current = projectsSchema.parse(
        JSON.parse(localStorage.getItem(STORAGE) || "[]"),
      );
      const project = current.find((p) => p.id === projectId);
      if (projectId && !project)
        throw new Error(
          "Ce projet n’est plus disponible. Sélectionnez-en un autre.",
        );
      const c = await api({
        action: "ask",
        text,
        id: conversation?.id,
        project,
      });
      setConversation(c);
      localStorage.setItem("mindstudio.codex.conversation", c.id);
      setText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Demande impossible.");
    } finally {
      setBusy(false);
    }
  }
  async function login() {
    setBusy(true);
    setError("");
    try {
      const r = await api({ action: "login" });
      setLoginUrl(r.url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function apply(revert = false) {
    try {
      const base = revert ? undo?.after : conversation?.project;
      if (!base || !conversation?.proposal) return;
      const all = projectsSchema.parse(
        JSON.parse(localStorage.getItem(STORAGE) || "[]"),
      );
      const index = all.findIndex((p) => p.id === base.id);
      if (index < 0 || JSON.stringify(all[index]) !== JSON.stringify(base))
        throw new Error(
          "Ce projet a changé depuis la proposition. Envoyez une nouvelle demande pour éviter d’écraser vos modifications.",
        );
      const next = revert
        ? undo!.before
        : applyCodexProposal(base, conversation.proposal);
      all[index] = next;
      localStorage.setItem(STORAGE, JSON.stringify(all));
      setProjects(all);
      if (revert) {
        setUndo(null);
        setApplied(false);
        setNotice("Modifications annulées.");
      } else {
        setUndo({ before: base, after: next });
        setApplied(true);
        setNotice("Modifications enregistrées dans le projet.");
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }
  const draft = streamingMessage(conversation?.draft || "");
  return (
    <main className={s.page}>
      <header className={s.header}>
        <Link href="/dashboard" className={s.brand}>
          <Aperture size={26} /> MindStudio <span>ASSISTANT</span>
        </Link>
        <Link href="/dashboard" className={s.back}>
          <ArrowLeft size={15} /> Retour au studio
        </Link>
      </header>
      <div className={s.layout}>
        <aside className={s.sidebar}>
          <div className={s.eyebrow}>VOTRE PARTENAIRE CRÉATIF</div>
          <h1>
            Une idée.
            <br />
            <em>Une direction.</em>
          </h1>
          <p>
            Travaillez vos scripts et concevez des illustrations qui racontent
            vraiment votre histoire.
          </p>
          <div className={s.connection}>
            <span className={connected ? s.online : s.offline} />
            {connected === null
              ? "Connexion à Codex…"
              : connected
                ? "Codex connecté · ChatGPT"
                : "Compte à connecter"}
          </div>
          {!connected && (
            <button className={s.primary} onClick={login} disabled={busy}>
              {busy ? "Connexion…" : "Connecter ChatGPT"}
            </button>
          )}
          {loginUrl && (
            <a
              className={s.login}
              href={loginUrl}
              target="_blank"
              rel="noreferrer"
            >
              Ouvrir la connexion sécurisée ↗
            </a>
          )}
          <label htmlFor="project">Contexte de travail</label>
          <select
            id="project"
            value={projectId}
            disabled={running || busy}
            onChange={(e) => {
              setProjectId(e.target.value);
              setConversation(null);
              setApplied(false);
              setUndo(null);
              localStorage.removeItem("mindstudio.codex.conversation");
            }}
          >
            <option value="">Conversation libre</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <p className={s.hint}>
            Le texte et les données du projet sélectionné sont transmis à OpenAI
            lors de l’envoi. Les fichiers audio et vidéo ne sont pas joints.
          </p>
          <button
            className={s.secondary}
            disabled={running || busy}
            onClick={() => {
              setConversation(null);
              setApplied(false);
              setUndo(null);
              setError("");
              setNotice("");
              localStorage.removeItem("mindstudio.codex.conversation");
            }}
          >
            <Plus size={16} /> Nouvelle conversation
          </button>
          <div className={s.note}>
            <Sparkles size={18} />
            <p>
              Vous gardez la main.
              <br />
              <span>
                Les changements sont proposés avant leur application. Le son et
                les durées sont conservés.
              </span>
            </p>
          </div>
          <p className={s.hint}>
            Utilise votre accès Codex et ses limites. Aucune clé API payante
            n’est ajoutée.
          </p>
        </aside>
        <section className={s.workspace} aria-label="Conversation avec Codex">
          <div className={s.chat}>
            {!conversation?.messages.length && (
              <div className={s.welcome}>
                <div className={s.orb}>
                  <Sparkles size={29} />
                </div>
                <div className={s.eyebrow}>DE L’INTENTION À L’IMAGE</div>
                <h2>Que créons-nous aujourd’hui ?</h2>
                <p>
                  Collez une transcription ou sélectionnez un projet.
                  <br />
                  Construisons ensemble une narration visuelle précise.
                </p>
                <div className={s.suggestions}>
                  {[
                    "Propose des illustrations réalistes pour chaque idée de mon script.",
                    "Améliore l’accroche de mon script sans changer son sens.",
                    "Propose un rythme et des animations variées pour cette vidéo.",
                  ].map((t) => (
                    <button key={t} onClick={() => setText(t)}>
                      {t}
                      <ArrowUp size={17} />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {conversation?.messages.map((m, i) => (
              <article
                key={i}
                className={m.role === "user" ? s.user : s.answer}
              >
                <div className={s.messageLabel}>
                  {m.role === "user" ? (
                    "VOUS"
                  ) : (
                    <>
                      <Sparkles size={14} /> CODEX
                    </>
                  )}
                  {m.role === "assistant" && (
                    <button
                      aria-label="Copier la réponse"
                      onClick={() =>
                        navigator.clipboard
                          .writeText(m.text)
                          .then(() => setNotice("Réponse copiée."))
                          .catch(() =>
                            setError("La copie n’est pas disponible."),
                          )
                      }
                    >
                      <Copy size={14} />
                    </button>
                  )}
                </div>
                <div className={s.messageText}>{m.text}</div>
              </article>
            ))}
            {(running || (busy && connected)) && (
              <div className={s.answer} aria-live="polite">
                <div className={s.progress}>
                  <LoaderCircle className={s.spin} size={17} />
                  <strong>
                    {draft
                      ? "Codex rédige la réponse"
                      : "Codex prépare votre réponse"}
                  </strong>
                  <span>
                    {Math.floor(elapsed / 60)}:
                    {String(elapsed % 60).padStart(2, "0")}
                  </span>
                </div>
                <div className={s.shimmer} />
                {draft && <div className={s.messageText}>{draft}</div>}
              </div>
            )}
            {conversation?.proposal?.edits.length ? (
              <section className={s.proposal}>
                <div className={s.eyebrow}>
                  PROPOSITION · {conversation.proposal.edits.length}{" "}
                  MODIFICATIONS
                </div>
                <h3>Relisez avant d’appliquer</h3>
                {conversation.proposal.edits.map((edit, i) => (
                  <details key={i}>
                    <summary>{label(edit.path)}</summary>
                    <p>{edit.reason}</p>
                    <div className={s.diff}>
                      <div>
                        <small>AVANT</small>
                        <p>
                          {previous(conversation.project, edit.path) || "Vide"}
                        </p>
                      </div>
                      <div>
                        <small>APRÈS</small>
                        <p>{edit.value}</p>
                      </div>
                    </div>
                  </details>
                ))}
                <div className={s.actions}>
                  <button
                    className={s.primary}
                    disabled={applied || running}
                    onClick={() => apply()}
                  >
                    <Check size={16} />
                    {applied
                      ? "Modifications appliquées"
                      : "Appliquer au projet"}
                  </button>
                  {undo && (
                    <button className={s.secondary} onClick={() => apply(true)}>
                      <Undo2 size={16} /> Annuler
                    </button>
                  )}
                  {applied && (
                    <Link href={`/projects/${conversation.project?.id}`}>
                      Ouvrir le montage ↗
                    </Link>
                  )}
                </div>
              </section>
            ) : null}
            {(error || conversation?.error) && (
              <div role="alert" className={s.error}>
                {error || conversation?.error}
              </div>
            )}
            {notice && (
              <div role="status" className={s.notice}>
                {notice}
              </div>
            )}
            <div ref={bottom} />
          </div>
          <form
            className={s.composer}
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <label className={s.srOnly} htmlFor="request">
              Votre demande à Codex
            </label>
            <textarea
              id="request"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Décrivez votre idée, collez votre script ou demandez une modification…"
              maxLength={20000}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  void send();
                }
              }}
            />
            <div className={s.composerBottom}>
              <span>
                {projectId
                  ? "Projet sélectionné joint à l’envoi"
                  : "Conversation libre"}{" "}
                · ⌘ / Ctrl + Entrée
              </span>
              {running ? (
                <button
                  type="button"
                  className={s.secondary}
                  onClick={() =>
                    api({ action: "stop", id: conversation.id })
                      .then(setConversation)
                      .catch((e) => setError(e.message))
                  }
                >
                  <Square size={13} /> Arrêter
                </button>
              ) : (
                <button
                  className={s.send}
                  type="submit"
                  disabled={!connected || busy || !text.trim()}
                  aria-label="Envoyer à Codex"
                >
                  <ArrowUp size={20} />
                </button>
              )}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
