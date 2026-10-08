export function trimVoiceWav(
  audio: {
    sampleRate: number;
    numberOfChannels: number;
    duration: number;
    getChannelData: (channel: number) => Float32Array;
  },
  start: number,
  end: number,
) {
  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    start < 0 ||
    end <= start ||
    end > audio.duration
  )
    throw new Error("Passage audio invalide.");
  const from = Math.floor(start * audio.sampleRate),
    count = Math.floor(end * audio.sampleRate) - from;
  const bytes = new ArrayBuffer(44 + count * 2),
    view = new DataView(bytes);
  const string = (offset: number, value: string) =>
    [...value].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
  string(0, "RIFF");
  view.setUint32(4, 36 + count * 2, true);
  string(8, "WAVE");
  string(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, audio.sampleRate, true);
  view.setUint32(28, audio.sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  string(36, "data");
  view.setUint32(40, count * 2, true);
  const channels = Array.from({ length: audio.numberOfChannels }, (_, i) =>
    audio.getChannelData(i),
  );
  for (let i = 0; i < count; i++) {
    const sample = Math.max(
      -1,
      Math.min(
        1,
        channels.reduce((sum, ch) => sum + ch[from + i], 0) / channels.length,
      ),
    );
    view.setInt16(44 + i * 2, sample * (sample < 0 ? 32768 : 32767), true);
  }

  return bytes;
}
