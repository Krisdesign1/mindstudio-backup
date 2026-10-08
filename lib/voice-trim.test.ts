import test from "node:test";
import assert from "node:assert/strict";
import { trimVoiceWav } from "./voice-trim";
const source = new Float32Array([0, 0, 1, -1, 0.5, -0.5, 0, 0]);
const audio = {
  sampleRate: 4,
  numberOfChannels: 1,
  duration: 2,
  getChannelData: () => source,
};
test("audio trim writes a valid WAV for the selected interval and keeps source intact", () => {
  const wav = trimVoiceWav(audio, 0.5, 1.5);
  const view = new DataView(wav);
  assert.equal(Buffer.from(wav).subarray(0, 4).toString(), "RIFF");
  assert.equal(view.getUint32(24, true), 4);
  assert.equal(view.getUint32(40, true), 8);
  assert.equal(view.getInt16(44, true), 32767);
  assert.equal(view.getInt16(46, true), -32768);
  assert.equal(source.length, 8);
  assert.equal(source[2], 1);
});
test("audio trim rejects reversed and out-of-range intervals", () => {
  for (const [start, end] of [
    [-1, 1],
    [1, 1],
    [1, 3],
    [NaN, 1],
  ])
    assert.throws(() => trimVoiceWav(audio, start, end));
});
