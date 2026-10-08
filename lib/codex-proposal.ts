import { z } from "zod";
import { projectSchema, type Project } from "./schemas/project";

// Only editorial fields are writable. Audio, timings, files and IDs stay intact.
export const codexProposalSchema = z
  .object({
    message: z.string().max(50000),
    edits: z
      .array(
        z
          .object({
            path: z.string().max(120),
            value: z.string().max(20000),
            reason: z.string().max(500),
          })
          .strict(),
      )
      .max(60),
  })
  .strict();
export type CodexProposal = z.infer<typeof codexProposalSchema>;
export const codexOutputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["message", "edits"],
  properties: {
    message: { type: "string" },
    edits: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["path", "value", "reason"],
        properties: {
          path: { type: "string" },
          value: { type: "string" },
          reason: { type: "string" },
        },
      },
    },
  },
};
export function applyCodexProposal(
  project: Project,
  proposal: CodexProposal,
): Project {
  const next = structuredClone(projectSchema.parse(project));
  for (const edit of codexProposalSchema.parse(proposal).edits) {
    if (
      [
        "name",
        "script",
        "idea",
        "motionBrand",
        "motionAccent",
        "motionLogo",
      ].includes(edit.path)
    ) {
      Object.assign(next, { [edit.path]: edit.value });
    } else {
      const match = /^scenes\.(\d+)\.(text|prompt)$/.exec(edit.path);
      if (!match || !next.scenes[Number(match[1])])
        throw new Error("Modification non autorisée : " + edit.path);
      const scene = next.scenes[Number(match[1])];
      if (match[2] === "text") scene.text = edit.value;
      else scene.prompt = edit.value;
    }
  }
  return projectSchema.parse(next);
}
