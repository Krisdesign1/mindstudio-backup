import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { HeyGenService, buildVideoPrompt } from "./services/heygen";
import { videoInput, speechInput } from "./schemas/heygen";
import { assertLocalRequest, readBody } from "./server/heygen-http";
import { createRenderOnce } from "./server/render-requests";
import { ServiceError } from "./server/errors";
const input = () =>
  videoInput.parse({
    requestId: crypto.randomUUID(),
    name: "Test",
    script: "Bonjour.",
    format: "16:9",
    template: "Cinematic",
    subtitle: "Minimal",
    speed: 1,
    scenes: [],
  });
function fake(
  responses: unknown[],
  calls: { url: string; init?: RequestInit }[],
): typeof fetch {
  return (async (url, init) => {
    calls.push({ url: String(url), init });
    const next = responses.shift();
    return next instanceof Response ? next : Response.json(next);
  }) as typeof fetch;
}
test("HeyGen integration: v3 requests, secrets, parsing and failures", async () => {
  const original = process.env.HEYGEN_API_KEY;
  try {
    delete process.env.HEYGEN_API_KEY;
    await assert.rejects(() => new HeyGenService().verifyConnection(), {
      code: "not_configured",
    });
    process.env.HEYGEN_API_KEY = "test-secret";
    const calls: { url: string; init?: RequestInit }[] = [];
    const service = new HeyGenService(
      fake(
        [
          {
            data: [
              {
                voice_id: "voice_1",
                name: "Alice",
                language: "French",
                type: "private",
                preview_audio_url: null,
              },
            ],
            has_more: true,
            next_token: "cursor",
          },
          {
            data: {
              audio_url: "https://files.heygen.ai/audio.mp3",
              duration: 3,
            },
          },
          { data: { session_id: "sess_1" } },
          {
            data: {
              session_id: "sess_1",
              status: "generating",
              video_id: "vid_1",
            },
          },
          {
            data: {
              status: "completed",
              video_url: "https://files.heygen.ai/final.mp4",
              duration: 12,
            },
          },
        ],
        calls,
      ),
    );
    assert.equal((await service.listVoices("private")).data[0].name, "Alice");
    assert.match(calls[0].url, /type=private/);
    assert.match(calls[0].url, /engine=starfish/);
    assert.equal(
      new Headers(calls[0].init?.headers).get("X-Api-Key"),
      "test-secret",
    );
    assert.equal(
      (
        await service.generateSpeech({
          text: "Bonjour",
          voiceId: "voice_1",
          speed: 1,
        })
      ).duration,
      3,
    );
    assert.equal((await service.createVideo(input())).sessionId, "sess_1");
    assert.equal(
      JSON.parse(String(calls[2].init?.body)).orientation,
      "landscape",
    );
    assert.equal((await service.getRender("sess_1")).status, "completed");
    assert.equal(calls.length, 5);
    for (const status of [401, 402, 429])
      await assert.rejects(
        () =>
          new HeyGenService(
            fake([new Response("secret upstream error", { status })], []),
          ).verifyConnection(),
        (error: unknown) =>
          error instanceof ServiceError &&
          error.status === status &&
          !error.message.includes("secret"),
      );
    await assert.rejects(
      () => new HeyGenService(fake([{ data: {} }], [])).createVideo(input()),
      { code: "invalid_response" },
    );
  } finally {
    if (original === undefined) delete process.env.HEYGEN_API_KEY;
    else process.env.HEYGEN_API_KEY = original;
  }
});
test("validation rejects unsupported formats, oversized speech and non-HTTPS output", () => {
  assert.equal(
    videoInput.safeParse({ ...input(), format: "4:5" }).success,
    false,
  );
  assert.equal(
    speechInput.safeParse({ text: "x".repeat(5001), voiceId: "v", speed: 1 })
      .success,
    false,
  );
  assert.throws(
    () => buildVideoPrompt({ ...input(), script: "a".repeat(10000) }),
    { code: "prompt_too_long" },
  );
  assert.match(buildVideoPrompt(input()), /Bonjour/);
});
test("local API rejects external origins and public hosts", async () => {
  assert.doesNotThrow(() =>
    assertLocalRequest(
      new Request("http://127.0.0.1:3000/api/heygen/connection", {
        headers: { host: "127.0.0.1:3000" },
      }),
    ),
  );
  for (const [url, headers] of [
    ["https://public.example/api", { host: "public.example" }],
    [
      "http://localhost:3000/api",
      { host: "localhost:3000", origin: "https://evil.example" },
    ],
    ["http://localhost:3000/api", { host: "evil.example" }],
  ] as const)
    assert.throws(() => assertLocalRequest(new Request(url, { headers })), {
      status: 403,
    });
  assert.throws(
    () =>
      assertLocalRequest(
        new Request("http://localhost:3000/api", {
          method: "POST",
          headers: {
            host: "localhost:3000",
            "Content-Type": "application/json",
          },
          body: "{}",
        }),
      ),
    { status: 403 },
  );
  await assert.rejects(
    () =>
      readBody(
        new Request("http://localhost/api", {
          method: "POST",
          body: "x".repeat(100001),
        }),
        speechInput,
      ),
    { status: 413 },
  );
});
test("video submissions are persisted and not charged twice on retry", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "mindstudio-test-"));
  try {
    const request = input();
    let calls = 0;
    const create = async () => {
      calls++;
      return { sessionId: "sess_1", status: "pending" as const };
    };
    await createRenderOnce(request, create, dir);
    await createRenderOnce(request, create, dir);
    assert.equal(calls, 1);
    await assert.rejects(
      () => createRenderOnce({ ...request, script: "changed" }, create, dir),
      { code: "request_conflict" },
    );
    const uncertain = input();
    await assert.rejects(() =>
      createRenderOnce(
        uncertain,
        async () => {
          throw new ServiceError("connection_uncertain", "timeout", 504);
        },
        dir,
      ),
    );
    await assert.rejects(() => createRenderOnce(uncertain, create, dir), {
      code: "request_pending",
    });
    assert.equal(calls, 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
