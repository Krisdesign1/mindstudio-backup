"use client";
import { AudioStart } from "./audio-start";
import { newOverlay } from "@/lib/schemas/motion-edit";
import { MotionGallery } from "./motion-gallery";
import { findMotionTemplate } from "@/lib/hyperframes/templates";
import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { readPreference } from "@/lib/preferences";
import {
  Aperture,
  Music2,
  LayoutDashboard,
  Plus,
  Film,
  FileText,
  Images,
  Layers,
  History,
  Settings,
  ArrowUpRight,
  ArrowRight,
  Search,
  Bell,
  ChevronDown,
  Sparkles,
  Play,
  Clock3,
  Check,
  FolderOpen,
  MoreHorizontal,
  Copy,
  Trash2,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import type { Project } from "@/lib/schemas/project";
import { projectsSchema } from "@/lib/schemas/project";
import {
  demoProjects,
  duration,
  time,
  templates,
  newProject,
  images,
} from "@/lib/services/mock";
import { Modal, Status, Loading } from "./ui";
import { Editor, VoiceSelector } from "./editor";
import { HeyGenSettings } from "./heygen";
const nav = [
  { href: "/studio", label: "Studio HyperFrames", icon: Film },
  {
    href: "/projects/alain-moloto-heritage",
    label: "Alain Moloto · Héritage",
    icon: Film,
  },
  { href: "/assistant", label: "Assistant Codex", icon: Sparkles },
  { href: "/voices", label: "Ma voix · Chatterbox", icon: Music2 },
  { href: "/local-ai", label: "Essais IA locale", icon: Sparkles },
  { href: "/projects/reviens-au-pere", label: "Reviens au Père", icon: Film },
  { href: "/projects/mourinho-arbitrage", label: "Film Mourinho", icon: Film },
  { href: "/projects/mbappe-age-niveau", label: "Film Mbappé", icon: Film },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects/new", label: "Nouveau projet", icon: Plus },
  { href: "/projects", label: "Mes vidéos", icon: Film },
  { href: "/scripts", label: "Scripts", icon: FileText },
  { href: "/media", label: "Médias", icon: Images },
  { href: "/templates", label: "Motion design", icon: Layers },
  { href: "/history", label: "Historique", icon: History },
  { href: "/settings", label: "Paramètres", icon: Settings },
];
const STORAGE = "mindstudio.projects.v1";
export default function Studio() {
  const path = usePathname();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [mobile, setMobile] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [creator, setCreator] = useState("Christenvie");
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE);
        setProjects(
          raw
            ? projectsSchema
                .parse(JSON.parse(raw))
                .map((p) =>
                  p.status === "Génération" && !p.heygenRender
                    ? { ...p, status: "Brouillon" }
                    : p,
                )
            : demoProjects(),
        );
      } catch {
        setProjects(demoProjects());
        setToast(
          "La sauvegarde locale est illisible. Les projets de démonstration ont été restaurés.",
        );
      }
      try {
        setCreator(readPreference("mindstudio.name", "Christenvie"));
      } catch {
        setSaveError(true);
      }
      setReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE, JSON.stringify(projects));
    } catch {
      const t = setTimeout(() => setSaveError(true), 0);
      return () => clearTimeout(t);
    }
  }, [projects, ready]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== "n" ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      )
        return;
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(
          (event.target as HTMLElement).tagName,
        ) ||
        document.querySelector("dialog[open]")
      )
        return;
      event.preventDefault();
      router.push("/projects/new");
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [router]);
  const update = useCallback(
    (project: Project) =>
      setProjects((all) =>
        all.map((p) =>
          p.id === project.id
            ? { ...project, updatedAt: new Date().toISOString() }
            : p,
        ),
      ),
    [],
  );
  const create = (p: Project) => {
    setProjects((all) => [p, ...all]);
    router.push(`/projects/${p.id}`);
    setToast("Projet créé. Votre studio est prêt.");
  };
  const duplicate = (p: Project) => {
    setProjects((all) => [
      {
        ...p,
        id: crypto.randomUUID(),
        name: p.name + " — copie",
        heygenRender: undefined,
        status: "Brouillon",
        renders: 0,
        updatedAt: new Date().toISOString(),
      },
      ...all,
    ]);
    setToast("Projet dupliqué");
  };
  const remove = (p: Project) => {
    if (
      window.confirm(`Supprimer « ${p.name} » ? Cette action est définitive.`)
    ) {
      setProjects((all) => all.filter((x) => x.id !== p.id));
      setToast("Projet supprimé");
    }
  };
  const editorId =
    path.startsWith("/projects/") && path !== "/projects/new"
      ? path.split("/")[2]
      : null;
  const current = projects.find((p) => p.id === editorId);
  const isDashboard = path === "/" || path === "/dashboard";
  const visible = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="app-shell">
      <button
        className="mobile-toggle icon-button"
        aria-label="Ouvrir le menu"
        onClick={() => setMobile(!mobile)}
      >
        {mobile ? <X /> : <Menu />}
      </button>
      <aside className={`sidebar ${mobile ? "mobile-open" : ""}`}>
        <Link href="/dashboard" className="brand">
          <span className="brand-icon">
            <Aperture size={27} />
          </span>
          <span>
            MindStudio<small>VIDEO STUDIO</small>
          </span>
        </Link>
        <div className="workspace">
          <span className="avatar small">M</span>
          <span>
            Espace personnel<small>Votre espace de création</small>
          </span>
          <ChevronDown size={15} />
        </div>
        <p className="nav-caption">WORKSPACE</p>
        <nav>
          {nav.map(({ href, label, icon: Icon }, i) => (
            <Link
              key={href}
              onClick={() => setMobile(false)}
              href={href}
              className={`nav-item ${(isDashboard && i === 0) || path === href || (editorId && href === "/projects") ? "selected" : ""} ${i === 1 ? "new-nav" : ""}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {i === 1 && <span className="keycap">N</span>}
              {i === 2 && <span className="nav-count">{projects.length}</span>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="plan-box">
            <div>
              <Sparkles size={15} /> Studio local <span>DEMO</span>
            </div>
            <p>Votre créativité, sans limites.</p>
            <small>Projets stockés sur cet appareil</small>
          </div>
          <div className="profile">
            <span className="avatar">C</span>
            <div>
              {creator}
              <small>Espace personnel</small>
            </div>
            <button
              className="icon-button"
              aria-label="Informations de session"
              onClick={() =>
                setToast(
                  "Mode local : aucun compte connecté. L’authentification arrive en Phase 2.",
                )
              }
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            Espace personnel <span>/</span>
            <strong>
              {editorId
                ? "Éditeur vidéo"
                : nav.find((n) => n.href === path)?.label || "Dashboard"}
            </strong>
          </div>
          <div className="top-actions">
            <span className="pill">Audio → Motion</span>
            <button
              className="icon-button"
              aria-label="Notifications"
              onClick={() =>
                setToast("Tout est à jour. Aucun nouveau message.")
              }
            >
              <Bell size={18} />
            </button>
            <span className="avatar small">C</span>
          </div>
        </header>
        {saveError && (
          <div className="warning">
            Sauvegarde indisponible : le stockage du navigateur est plein ou
            bloqué. Conservez cet onglet ouvert.
          </div>
        )}
        {!ready ? (
          <Loading />
        ) : current ? (
          <Editor
            key={current.id}
            project={current}
            onChange={update}
            notify={setToast}
          />
        ) : editorId ? (
          <main className="content">
            <h1>Projet introuvable</h1>
            <Link className="button primary" href="/projects">
              Revenir aux projets
            </Link>
          </main>
        ) : (
          <main className="content">
            {isDashboard ? (
              <>
                <div className="page-heading">
                  <div>
                    <div className="eyebrow">VOTRE ESPACE CRÉATIF</div>
                    <h1>
                      Bonjour, {creator} <span className="wave">✦</span>
                    </h1>
                    <p>Vos idées méritent d’être vues. Donnons-leur vie.</p>
                  </div>
                  <Link href="/projects/new" className="button primary">
                    <Plus size={18} /> Nouveau projet
                  </Link>
                </div>
                <section className="hero">
                  <div className="hero-shade" />
                  <div className="hero-copy">
                    <span className="hero-label">
                      <Sparkles size={14} /> DE L’IDÉE À L’ÉMOTION
                    </span>
                    <h2>
                      Votre prochain grand récit
                      <br />
                      commence ici.
                    </h2>
                    <p>
                      Votre son, vos images, votre vision.
                      <br />
                      Créez des vidéos qui laissent une empreinte.
                    </p>
                    <Link className="button light" href="/projects/new">
                      Créer à partir de mon son <ArrowRight size={17} />
                    </Link>
                    <span className="hero-foot">
                      Pensé pour les créateurs. Inspiré par vous.
                    </span>
                  </div>
                  <div className="hero-mark">
                    <Aperture size={20} /> MINDSTUDIO ORIGINALS
                  </div>
                  <div className="hero-caption">
                    <span>01 / 04</span> UNE NOUVELLE PERSPECTIVE
                  </div>
                </section>
                <div className="stats">
                  {[
                    {
                      label: "Projets créés",
                      value: projects.length,
                      icon: Film,
                      note: "Toutes vos idées, au même endroit",
                    },
                    {
                      label: "Minutes de storyboard",
                      value: Math.round(
                        projects.reduce(
                          (s, p) =>
                            s +
                            (p.motionEdit?.source?.duration ??
                              duration(p.scenes)),
                          0,
                        ) / 60,
                      ),
                      icon: Clock3,
                      note: "Durée estimée des scènes",
                    },
                    {
                      label: "Projets en cours",
                      value: projects.filter((p) => p.status !== "Terminé")
                        .length,
                      icon: FolderOpen,
                      note: "La suite de votre histoire",
                    },
                    {
                      label: "Projets terminés",
                      value: projects.filter((p) => p.status === "Terminé")
                        .length,
                      icon: Check,
                      note: "Démonstrations et simulations",
                    },
                  ].map(({ label, value, icon: Icon, note }) => (
                    <div className="stat" key={label}>
                      <div>
                        {label}
                        <Icon size={17} />
                      </div>
                      <strong>{value.toString().padStart(2, "0")}</strong>
                      <small>{note}</small>
                    </div>
                  ))}
                </div>
                <div className="section-heading">
                  <div>
                    <h2>
                      Vos derniers projets <span>{projects.length}</span>
                    </h2>
                    <p>Reprenez là où l’inspiration vous a laissé.</p>
                  </div>
                  <Link className="text-link" href="/projects">
                    Tous les projets <ArrowRight size={16} />
                  </Link>
                </div>
                <div className="project-grid">
                  {projects.slice(0, 4).map((p) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      duplicate={duplicate}
                      remove={remove}
                    />
                  ))}
                </div>
                <Link href="/templates" className="motion-dashboard-banner">
                  <div>
                    <span className="motion-kicker">
                      HYPERFRAMES · MOTION DESIGN
                    </span>
                    <h2>Donnez du mouvement à votre signature.</h2>
                    <p>12 templates pour vos textes, logos et intros.</p>
                    <span className="button primary">
                      Explorer la collection <ArrowRight size={16} />
                    </span>
                  </div>
                  <strong aria-hidden="true">
                    Aa<span>↗</span>
                  </strong>
                </Link>
                <div className="section-heading">
                  <div>
                    <h2>Une longueur d’avance, avec les templates</h2>
                    <p>Un univers visuel pour chaque histoire.</p>
                  </div>
                  <Link href="/templates" className="text-link">
                    Explorer <ArrowRight size={16} />
                  </Link>
                </div>
                <div className="template-strip">
                  {templates.map((t) => (
                    <button
                      key={t.name}
                      className="mini-template"
                      onClick={() => setPreviewTemplate(t.name)}
                    >
                      <div style={{ backgroundImage: `url(${t.image})` }} />
                      <span>
                        <strong>{t.name}</strong>
                        <small>{t.tag}</small>
                      </span>
                      <ArrowUpRight size={18} />
                    </button>
                  ))}
                </div>
              </>
            ) : path === "/projects/new" ? (
              <AudioStart create={create} />
            ) : path === "/projects" ? (
              <>
                <PageHeading
                  title="Mes vidéos"
                  description="Chaque projet, une nouvelle histoire."
                />
                <div className="toolbar">
                  <label className="search">
                    <Search size={17} />
                    <input
                      aria-label="Rechercher un projet"
                      placeholder="Rechercher un projet…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </label>
                  <Link className="button primary" href="/projects/new">
                    <Plus size={17} /> Nouveau projet
                  </Link>
                </div>
                <div className="project-grid">
                  {visible.map((p) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      duplicate={duplicate}
                      remove={remove}
                    />
                  ))}
                </div>
                {!visible.length && (
                  <div className="empty">
                    Aucun projet trouvé. Créez une nouvelle histoire.
                  </div>
                )}
              </>
            ) : path === "/templates" ? (
              <>
                <MotionGallery
                  onSelect={(id) => {
                    const t = findMotionTemplate(id);
                    const p = newProject(
                      t.label,
                      "Une nouvelle idée en mouvement",
                      "16:9",
                      "manual",
                      "MindShift Cinematic",
                    );
                    create({
                      ...p,
                      motionTemplate: id,
                      motionEdit: {
                        layers: [newOverlay(id)],
                        keepAudio: true,
                        quality: "1080p",
                      },
                      motionAccent: t.color,
                    });
                  }}
                />

                <PageHeading
                  title="Univers narratifs"
                  description="Quatre univers pour donner du caractère à vos histoires."
                />
                <div className="template-grid">
                  {templates.map((t) => (
                    <button
                      className="template-card"
                      key={t.name}
                      onClick={() => setPreviewTemplate(t.name)}
                    >
                      <div style={{ backgroundImage: `url(${t.image})` }}>
                        <span className="pill">{t.tag}</span>
                        <Play size={28} />
                      </div>
                      <h3>{t.name}</h3>
                      <p>{t.description}</p>
                      <span className="text-link">
                        Découvrir le template <ArrowRight size={15} />
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : path === "/scripts" ? (
              <>
                <PageHeading
                  title="Vos scripts"
                  description="Les mots qui donnent vie à vos vidéos."
                />
                <div className="list-panel">
                  {projects.map((p) => (
                    <Link
                      className="script-row"
                      key={p.id}
                      href={`/projects/${p.id}`}
                    >
                      <FileText />
                      <div>
                        <h3>{p.name}</h3>
                        <p>
                          {p.script.slice(0, 140) ||
                            "Commencez à écrire votre histoire…"}
                        </p>
                      </div>
                      <ArrowUpRight />
                    </Link>
                  ))}
                </div>
              </>
            ) : path === "/voices" ? (
              <>
                <PageHeading
                  title="Une voix pour votre récit"
                  description="Sélectionnez vos voix HeyGen dans l’onglet Voix de chaque projet. Les exemples ci-dessous utilisent le navigateur."
                />
                <VoiceDemo />
              </>
            ) : path === "/media" ? (
              <>
                <PageHeading
                  title="Bibliothèque de médias"
                  description="Les visuels de démonstration disponibles dans vos scènes."
                />
                <div className="media-grid">
                  {images.map((src, i) => (
                    <div className="media-card" key={src}>
                      <div style={{ backgroundImage: `url(${src})` }} />
                      <h3>
                        {
                          [
                            "Horizon alpin",
                            "Forêt de lumière",
                            "Dunes silencieuses",
                            "Océan paisible",
                          ][i]
                        }
                      </h3>
                      <p>Image · JPEG · Démonstration</p>
                    </div>
                  ))}
                </div>
                <p className="muted">
                  L’import de médias et le stockage partagé seront disponibles
                  en Phase 2.
                </p>
              </>
            ) : path === "/history" ? (
              <>
                <PageHeading
                  title="Historique"
                  description="Les dernières activités de votre espace local."
                />
                <div className="list-panel">
                  {[...projects]
                    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
                    .map((p) => (
                      <Link
                        key={p.id}
                        className="script-row"
                        href={`/projects/${p.id}`}
                      >
                        <History />
                        <div>
                          <h3>{p.name}</h3>
                          <p>
                            Mis à jour le{" "}
                            {new Date(p.updatedAt).toLocaleString("fr-FR")} ·{" "}
                            {p.renders} rendu(s) simulé(s)
                          </p>
                        </div>
                        <Status status={p.status} />
                      </Link>
                    ))}
                </div>
              </>
            ) : path === "/settings" ? (
              <SettingsPanel notify={setToast} onNameChange={setCreator} />
            ) : (
              <>
                <PageHeading
                  title="Page introuvable"
                  description="Cette page n’existe pas dans votre studio."
                />
                <Link href="/dashboard" className="button primary">
                  Retour au dashboard
                </Link>
              </>
            )}
          </main>
        )}
        <footer className="app-footer">
          MindStudio Video <span>Créez avec intention.</span>
          <span>Studio local · HyperFrames</span>
        </footer>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
      {previewTemplate && (
        <Modal title={previewTemplate} onClose={() => setPreviewTemplate(null)}>
          <div
            className="template-preview"
            style={{
              backgroundImage: `url(${templates.find((t) => t.name === previewTemplate)?.image})`,
            }}
          >
            <span>Chaque histoire commence par une vision.</span>
          </div>
          <p className="muted">
            {templates.find((t) => t.name === previewTemplate)?.description}{" "}
            Transitions douces, composition immersive et sous-titres élégants.
          </p>
          <button
            className="button primary wide"
            onClick={() => {
              const selected = previewTemplate;
              setPreviewTemplate(null);
              router.push(
                `/projects/new?template=${encodeURIComponent(selected)}`,
              );
            }}
          >
            Utiliser ce template <ArrowRight size={17} />
          </button>
        </Modal>
      )}
    </div>
  );
}
function PageHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">MINDSTUDIO VIDEO</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </div>
  );
}
function ProjectCard({
  project: p,
  duplicate,
  remove,
}: {
  project: Project;
  duplicate: (p: Project) => void;
  remove: (p: Project) => void;
}) {
  const [menu, setMenu] = useState(false);
  return (
    <article className="project-card">
      <Link
        href={`/projects/${p.id}`}
        className="project-image"
        style={{ backgroundImage: `url(${p.image})` }}
        aria-label={`Ouvrir ${p.name}`}
      >
        <span className="format-tag">{p.format}</span>
        <span className="play-overlay">
          <Play size={20} fill="currentColor" />
        </span>
        <span className="duration">
          {time(p.motionEdit?.source?.duration ?? duration(p.scenes))}
        </span>
      </Link>
      <div className="project-body">
        <div className="project-title">
          <Link href={`/projects/${p.id}`}>
            <h3>{p.name}</h3>
          </Link>
          <div className="menu-wrap">
            <button
              className="icon-button"
              aria-label={`Actions pour ${p.name}`}
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              <MoreHorizontal size={18} />
            </button>
            {menu && (
              <div className="dropdown">
                <button
                  onClick={() => {
                    duplicate(p);
                    setMenu(false);
                  }}
                >
                  <Copy size={14} />
                  Dupliquer
                </button>
                <button
                  className="danger"
                  onClick={() => {
                    remove(p);
                    setMenu(false);
                  }}
                >
                  <Trash2 size={14} />
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="project-meta">
          <Status status={p.status} />
          <span>
            {new Date(p.updatedAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>
      </div>
    </article>
  );
}
function VoiceDemo() {
  const [voice, setVoice] = useState("Christenvie Voice");
  const [speed, setSpeed] = useState(1);
  return (
    <div className="panel voice-demo">
      <VoiceSelector
        voice={voice}
        speed={speed}
        setVoice={setVoice}
        setSpeed={setSpeed}
      />
    </div>
  );
}
function SettingsPanel({
  notify,
  onNameChange,
}: {
  notify: (s: string) => void;
  onNameChange: (s: string) => void;
}) {
  const [name, setName] = useState(() =>
    readPreference("mindstudio.name", "Christenvie"),
  );
  const [quality, setQuality] = useState(() =>
    readPreference("mindstudio.quality", "1080p"),
  );
  return (
    <>
      <PageHeading title="Paramètres" description="Un studio à votre image." />
      <form
        className="panel settings-panel"
        onSubmit={(e) => {
          e.preventDefault();
          try {
            localStorage.setItem("mindstudio.name", name);
            localStorage.setItem("mindstudio.quality", quality);
            onNameChange(name);
            notify("Préférences enregistrées sur cet appareil");
          } catch {
            notify("Impossible d’enregistrer les préférences");
          }
        }}
      >
        <h2>Préférences du studio</h2>
        <label>
          Nom du créateur
          <input
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          Qualité de prévisualisation
          <select value={quality} onChange={(e) => setQuality(e.target.value)}>
            <option>1080p</option>
            <option>720p</option>
          </select>
        </label>
        <p className="muted">
          Les préférences restent sur cet appareil. La connexion HeyGen se
          configure ci-dessous.
        </p>
        <button className="button primary">Enregistrer les préférences</button>
      </form>
      <HeyGenSettings />
    </>
  );
}
