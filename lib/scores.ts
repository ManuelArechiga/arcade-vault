export interface SavedScoreEntry {
  game: string;
  score: number;
  name: string;
  at: number;
}

export function saveScore(entry: SavedScoreEntry): void {
  try {
    const all: SavedScoreEntry[] = JSON.parse(localStorage.getItem("av_scores") || "[]");
    all.push(entry);
    localStorage.setItem("av_scores", JSON.stringify(all));
  } catch {}
}
