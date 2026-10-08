export function readPreference(key: string, fallback: string): string {
  try {
    return typeof window === "undefined"
      ? fallback
      : localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}
