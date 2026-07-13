const scrapStorageKey = "thepharmin:qna-scraps";

export function readQnaScraps() {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const value = window.localStorage.getItem(scrapStorageKey);
    const ids = value ? (JSON.parse(value) as string[]) : [];
    return new Set(ids);
  } catch {
    return new Set<string>();
  }
}

export function writeQnaScraps(ids: Set<string>) {
  window.localStorage.setItem(scrapStorageKey, JSON.stringify(Array.from(ids)));
}
