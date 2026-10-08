import "server-only";
import { getVisualAsset, visualAssetFile } from "./visual-assets";
import path from "node:path";
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { overlayRequestSchema } from "../schemas/motion-edit";
import { overlayComposition } from "../hyperframes/overlay-composition";
import { getSourceVideo, mediaDirectory } from "./motion-media";
import { jobDirectory } from "./hyperframes";
import type { HyperframesJob } from "../schemas/hyperframes";
import { ServiceError } from "../server/errors";
import { z } from "zod";
export async function prepareOverlay(
  input: z.infer<typeof overlayRequestSchema>,
) {
  if (!input.edit.source)
    throw new ServiceError("source_missing", "Importez votre vidéo.", 400);
  const source = await getSourceVideo(input.edit.source.id);
  const edit = {
    ...input.edit,
    source,
    keepAudio: source.kind === "audio" ? true : input.edit.keepAudio,
  };
  if (
    edit.layers.some(
      (l) => l.enabled && l.start + l.duration > source.duration + 0.01,
    )
  )
    throw new ServiceError(
      "timing",
      "Un élément dépasse la fin de votre vidéo.",
      400,
    );
  if (edit.captions?.words.some((w) => w.end > source.duration + 0.01))
    throw new ServiceError(
      "timing",
      "Un sous-titre dépasse la durée du son.",
      400,
    );
  const id = crypto.randomUUID(),
    dir = jobDirectory(id);
  await mkdir(dir, { recursive: true, mode: 0o700 });
  await copyFile(
    path.join(
      mediaDirectory(source.id),
      source.kind === "audio" ? "source.wav" : "source.mp4",
    ),
    path.join(dir, source.kind === "audio" ? "source.wav" : "source.mp4"),
  );
  for (const layer of edit.layers) {
    if (!layer.media) continue;
    const media = await getVisualAsset(layer.media.id, layer.media.kind);
    layer.media = media;
    if (media.kind === "video" && layer.duration / media.duration > 60)
      throw new ServiceError(
        "clip_short",
        "Ce clip est trop court pour cette scène. Choisissez un clip plus long.",
        400,
      );
    await copyFile(
      visualAssetFile(media),
      path.join(
        dir,
        `asset-${media.id}.${media.kind === "image" ? "png" : "mp4"}`,
      ),
    );
  }
  await copyFile(
    path.join(process.cwd(), "node_modules/gsap/dist/gsap.min.js"),
    path.join(dir, "gsap.min.js"),
  );
  const composition = overlayComposition(edit, source);
  await writeFile(path.join(dir, "index.html"), composition.html);
  // Store the editable recipe separately from the flattened video.
  await writeFile(
    path.join(dir, "edit.json"),
    JSON.stringify({ ...input, edit }, null, 2),
    { mode: 0o600 },
  );
  const job: HyperframesJob = {
    id,
    projectId: input.projectId,
    name: input.name,
    status: "ready",
    duration: source.duration,
    width: composition.width,
    height: composition.height,
    hasAudio: source.hasAudio && edit.keepAudio,
    createdAt: new Date().toISOString(),
    kind: "overlay",
  };
  await writeFile(path.join(dir, "job.json"), JSON.stringify(job), {
    mode: 0o600,
  });
  return job;
}
