import { test } from "node:test";
import assert from "node:assert/strict";
import { videoDemuxer } from "./video-formats";
test("video imports select only known container demuxers", () => {
  assert.deepEqual(videoDemuxer("Film.MOV"), { ext: "mov", demuxer: "mov" });
  assert.equal(videoDemuxer("clip.webm")?.demuxer, "matroska");
  for (const name of [
    "playlist.m3u8",
    "file.mp4.exe",
    "https://example.com",
    "clip",
    "file.constructor",
  ])
    assert.equal(videoDemuxer(name), undefined);
});
