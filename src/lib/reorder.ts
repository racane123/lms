/** Returns the new id order after moving one item up/down, or null if it can't move. */
export function moveItem(ids: string[], id: string, dir: "up" | "down"): string[] | null {
  const i = ids.indexOf(id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ids.length) return null;
  const copy = [...ids];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}
