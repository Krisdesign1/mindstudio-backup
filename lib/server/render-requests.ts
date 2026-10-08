import "server-only";
import { mkdir, open, readFile, writeFile, rename } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { z } from "zod";
import {
  renderSchema,
  type HeyGenRender,
  type VideoInput,
} from "../schemas/heygen";
import { ServiceError } from "./errors";
const recordSchema = z.object({
  hash: z.string(),
  state: z.enum(["pending", "done", "failed"]),
  result: renderSchema.optional(),
  error: z
    .object({ code: z.string(), message: z.string(), status: z.number() })
    .optional(),
});
export async function createRenderOnce(
  input: VideoInput,
  create: () => Promise<HeyGenRender>,
  directory = path.join(process.cwd(), ".mindstudio", "requests"),
) {
  z.string().uuid().parse(input.requestId);
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const file = path.join(directory, `${input.requestId}.json`);
  const hash = createHash("sha256").update(JSON.stringify(input)).digest("hex");
  try {
    const handle = await open(file, "wx", 0o600);
    try {
      await handle.writeFile(JSON.stringify({ hash, state: "pending" }));
    } finally {
      await handle.close();
    }
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "EEXIST"))
      throw error;
    const saved = recordSchema.safeParse(
      JSON.parse(await readFile(file, "utf8")),
    );
    if (!saved.success || saved.data.hash !== hash)
      throw new ServiceError(
        "request_conflict",
        "Cette demande a déjà été utilisée avec un autre scénario.",
        409,
      );
    if (saved.data.result) return saved.data.result;
    if (saved.data.error)
      throw new ServiceError(
        saved.data.error.code,
        saved.data.error.message,
        saved.data.error.status,
      );
    throw new ServiceError(
      "request_pending",
      "Une demande identique est déjà en cours ou son résultat est incertain. Vérifiez HeyGen avant de lancer une nouvelle génération.",
      409,
    );
  }
  async function save(record: z.infer<typeof recordSchema>) {
    const temporary = `${file}.tmp`;
    await writeFile(temporary, JSON.stringify(record), { mode: 0o600 });
    await rename(temporary, file);
  }
  try {
    const result = await create();
    await save({ hash, state: "done", result });
    return result;
  } catch (error) {
    if (
      error instanceof ServiceError &&
      !["connection_uncertain", "invalid_response"].includes(error.code)
    )
      await save({
        hash,
        state: "failed",
        error: {
          code: error.code,
          message: error.message,
          status: error.status,
        },
      });
    throw error;
  }
}
