import {
  readFile,
  writeFile,
  rename,
  open,
  unlink,
  stat,
} from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
const id = process.argv[2];
if (!/^[0-9a-f-]{36}$/.test(id || "")) process.exit(1);
const root = path.join(process.cwd(), ".mindstudio", "hyperframes");
const dir = path.join(root, id);
const file = path.join(dir, "job.json");
const job = JSON.parse(await readFile(file, "utf8"));
const globalLock = path.join(root, "active.lock");
async function update(patch) {
  const temp = path.join(dir, "job.tmp");
  await writeFile(temp, JSON.stringify({ ...job, ...patch }));
  await rename(temp, file);
}
let ownsLock = false;
try {
  try {
    const existing = JSON.parse(await readFile(globalLock, "utf8"));
    try {
      process.kill(existing.pid, 0);
      throw new Error(
        "Un autre export HyperFrames est déjà en cours. Attendez sa fin puis préparez un nouvel aperçu.",
      );
    } catch (error) {
      if (error.code !== "ESRCH") throw error;
      await unlink(globalLock);
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const handle = await open(globalLock, "wx", 0o600);
  await handle.writeFile(JSON.stringify({ pid: process.pid, id }));
  await handle.close();
  ownsLock = true;
  const cli = path.join(
    process.cwd(),
    "node_modules",
    "hyperframes",
    "bin",
    "hyperframes.mjs",
  );
  const child = spawn(
    process.execPath,
    [
      cli,
      "render",
      dir,
      "--output",
      path.join(dir, "output.mp4"),
      "--quality",
      "standard",
      "--fps",
      "24",
      "--workers",
      "1",
    ],
    { cwd: dir, env: process.env, stdio: ["ignore", "pipe", "pipe"] },
  );
  child.stdout.on("data", (data) => process.stdout.write(data));
  child.stderr.on("data", (data) => process.stderr.write(data));
  const timer = setTimeout(
    () => {
      child.kill("SIGTERM");
    },
    30 * 60 * 1000,
  );
  const code = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", resolve);
  });
  clearTimeout(timer);
  if (code !== 0)
    throw new Error(
      "Le moteur HyperFrames a échoué. Consultez worker.log dans le dossier de cette composition, puis préparez un nouvel aperçu.",
    );
  if ((await stat(path.join(dir, "output.mp4"))).size < 1000)
    throw new Error("Le moteur n’a pas produit de MP4 valide.");
  await update({ status: "completed" });
} catch (error) {
  await update({
    status: "failed",
    error: error.message || "Le rendu local a échoué.",
  });
  process.exitCode = 1;
} finally {
  if (ownsLock) await unlink(globalLock).catch(() => {});
}
