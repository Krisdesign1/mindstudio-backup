export const videoFormats = {
  mp4: "mov",
  m4v: "mov",
  mov: "mov",
  webm: "matroska",
  mkv: "matroska",
  avi: "avi",
  mpg: "mpeg",
  mpeg: "mpeg",
  wmv: "asf",
} as const;
export const videoAccept = Object.keys(videoFormats)
  .map((ext) => `.${ext}`)
  .join(",");
export const videoFormatLabel = "MP4, MOV, M4V, WebM, MKV, AVI, MPEG, WMV";
export function videoDemuxer(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return Object.hasOwn(videoFormats, ext)
    ? { ext, demuxer: videoFormats[ext as keyof typeof videoFormats] }
    : undefined;
}

export const audioFormats = {
  mp3: "mp3",
  wav: "wav",
  m4a: "mov",
  aac: "aac",
  flac: "flac",
  ogg: "ogg",
  opus: "ogg",
  aiff: "aiff",
  aif: "aiff",
} as const;
export const audioAccept = Object.keys(audioFormats)
  .map((ext) => `.${ext}`)
  .join(",");
export const audioFormatLabel = "MP3, WAV, M4A, AAC, FLAC, OGG, Opus, AIFF";
export function audioDemuxer(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return Object.hasOwn(audioFormats, ext)
    ? { ext, demuxer: audioFormats[ext as keyof typeof audioFormats] }
    : undefined;
}
