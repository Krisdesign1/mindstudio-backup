import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import styles from "./results.module.css";
import { LocalModelPreview } from "@/components/local-model-preview";

export const dynamic = "force-dynamic";
type Scene = { passage?: string; visuel?: string; animation: string; personnages?: string; decor?: string; action?: string };
const experiments = [
  { file: "scenes/honte.json", name: "Llama · La honte", mode: "Un passage guidé" },
  { file: "scenes/retour.json", name: "Llama · Le retour", mode: "Un passage guidé" },
  { file: "llama3.2-latest.json", name: "Llama · Récit complet", mode: "Cinq scènes proposées" },
  { file: "qwen2.5-1.5b.json", name: "Qwen · Récit complet", mode: "Cinq scènes proposées" },
];
async function load(file: string) {
  try {
    const record = JSON.parse(await readFile(path.join(process.cwd(), ".mindstudio/local-ai", file), "utf8"));
    const raw = record.content ?? record.response.message.content;
    const parsed = JSON.parse(raw);
    return { seconds: record.elapsed_seconds as number, direction: parsed.direction as string | undefined,
      scenes: (parsed.scenes ?? [{ ...parsed, passage: record.case.passage }]) as Scene[], raw };
  } catch { return null; }
}
export default async function LocalAiResults() {
  const illustrations = await Promise.all(["qwen2.5", "llama3.2"].map(async model => {
    try {
      const directory = path.join(process.cwd(), ".mindstudio/local-ai/illustrations");
      const html = await readFile(path.join(directory, `${model}.html`), "utf8");
      const record = JSON.parse(await readFile(path.join(directory, `${model}.json`), "utf8"));
      return { model, html, seconds: record.elapsed_seconds, truncated: record.response.done_reason === "length" };
    } catch { return { model, html: null, seconds: 0, truncated: false }; }
  }));
  const results = await Promise.all(experiments.map(async (item) => ({ ...item, result: await load(item.file) })));
  return <main className={styles.page}>
    <header className={styles.header}><Link href="/dashboard">← MindStudio</Link><Link href="/projects/reviens-au-pere">Ouvrir le film Reviens au Père ↗</Link></header>
    <div className={styles.intro}><span className={styles.eyebrow}>ATELIER LOCAL · REVIENS AU PÈRE</span><h1>Les illustrations des modèles locaux</h1><p>« Il est retourné chez son père pour retrouver une nouvelle vie. »</p><div className={styles.notice}>Dessins et animations codés par les modèles locaux, sans retouche. Le lecteur affiche leur résultat original, y compris ses éventuels défauts.</div></div>
    <div className={styles.grid}>{illustrations.map(item => <section key={item.model} className={styles.card}>
      <div className={styles.heading}><h2>{item.model}</h2>{item.html && <span className={styles.time}>{Math.round(item.seconds)} s</span>}</div>
      {item.html ? <><LocalModelPreview html={item.html} model={item.model} />{item.truncated && <p>Le modèle a atteint sa limite de sortie : son code peut être incomplet.</p>}</> : <p>Pas encore de résultat enregistré. Actualise la page après la génération.</p>}
    </section>)}</div>
    <h2 style={{ marginTop: 64 }}>Premiers essais : descriptions des scènes</h2>
    <nav className={styles.tabs} aria-label="Choisir un essai">{results.map((item, index) => <a key={item.file} href={`#essai-${index}`}>{item.name}</a>)}</nav>
    {results.map(({ file, name, mode, result }, index) => <section id={`essai-${index}`} key={file} className={styles.experiment}>
      <div className={styles.heading}><div><span className={styles.eyebrow}>{mode}</span><h2>{name}</h2></div>{result && <span className={styles.time}>{Math.round(result.seconds)} s de calcul</span>}</div>
      {!result ? <p>Le résultat enregistré de cet essai est indisponible.</p> : <>
        {result.direction && <div className={styles.direction}><strong>Direction proposée</strong><p>{result.direction}</p></div>}
        <div className={styles.grid}>{result.scenes.map((scene, sceneIndex) => <article className={styles.card} key={sceneIndex}>
          <span className={styles.number}>PROPOSITION {String(sceneIndex + 1).padStart(2, "0")}</span>
          <h3>« {scene.passage} »</h3><dl>
            {[["Personnages", scene.personnages], ["Décor", scene.decor], ["Illustration", scene.visuel ?? scene.action], ["Animation proposée", scene.animation]].map(([label, value]) => value ? <div key={label}><dt>{label}</dt><dd>{value}</dd></div> : null)}
          </dl></article>)}</div>
        <details className={styles.raw}><summary>Voir la réponse brute du modèle</summary><pre>{result.raw}</pre></details>
      </>}
    </section>)}
  </main>;
}
