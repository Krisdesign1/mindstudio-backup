export function voiceExcerpt(text: string, limit = 180) {
  const clean = text.trim();
  if (clean.length <= limit) return clean;
  const prefix = clean.slice(0, limit);
  const sentence = prefix.match(/^[\s\S]*[.!?](?=\s|$)/)?.[0];
  return (sentence || prefix.replace(/\s+\S*$/, "") || prefix).trim();
}
