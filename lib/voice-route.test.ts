import test from "node:test";
import assert from "node:assert/strict";
import { GET, POST } from "../app/api/voice/route";
import { voiceSettingsSchema } from "./voice-settings";

test("voice controls reject unsafe processing values", () => {
  for (const settings of [
    { strength: 10 },
    { pause: -1 },
    { seed: 1.2 },
    { temperature: Infinity },
  ]) {
    assert.equal(voiceSettingsSchema.safeParse(settings).success, false);
  }
  assert.equal(
    voiceSettingsSchema.parse({ normalize: false, denoise: false }).normalize,
    false,
  );
});

test("voice API refuses cross-origin reads", async () => {
  const response = await GET(
    new Request("http://localhost:3000/api/voice", {
      headers: { host: "localhost:3000", origin: "https://example.com" },
    }),
  );
  assert.notEqual(response.status, 200);
});
test("voice API rejects malformed result IDs", async () => {
  const response = await GET(
    new Request("http://localhost:3000/api/voice?id=../../secret", {
      headers: { host: "localhost:3000" },
    }),
  );
  assert.equal(response.status, 400);
});
test("voice API rejects external generation before reading audio", async () => {
  const response = await POST(
    new Request("http://localhost:3000/api/voice", {
      method: "POST",
      headers: {
        host: "localhost:3000",
        origin: "https://example.com",
        "content-type": "multipart/form-data; boundary=x",
      },
      body: "bad",
    }),
  );
  assert.notEqual(response.status, 200);
});
