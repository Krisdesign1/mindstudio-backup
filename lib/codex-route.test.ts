import test from "node:test";
import assert from "node:assert/strict";
import { GET, POST } from "../app/api/codex/route";
test("Codex rejects cross-origin account and conversation access", async () => {
  const response = await GET(
    new Request("http://127.0.0.1:3000/api/codex", {
      headers: { host: "127.0.0.1:3000", origin: "https://external.example" },
    }),
  );
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /externe/);
});
test("Codex rejects external prompts before account access", async () => {
  const response = await POST(
    new Request("http://127.0.0.1:3000/api/codex", {
      method: "POST",
      headers: {
        host: "127.0.0.1:3000",
        "Content-Type": "application/json",
        origin: "https://external.example",
      },
      body: JSON.stringify({ action: "ask", text: "Test" }),
    }),
  );
  assert.equal(response.status, 400);
});
test("Codex rejects invalid input without starting a turn", async () => {
  const response = await POST(
    new Request("http://127.0.0.1:3000/api/codex", {
      method: "POST",
      headers: {
        host: "127.0.0.1:3000",
        "Content-Type": "application/json",
        origin: "http://127.0.0.1:3000",
      },
      body: JSON.stringify({ action: "ask", text: "" }),
    }),
  );
  assert.equal(response.status, 400);
});
