import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { StorageService } from "./types";

const root = path.resolve(process.env.UPLOAD_DIR ?? "./uploads");

function safePath(key: string) {
  const full = path.resolve(root, key);
  if (!full.startsWith(root + path.sep)) throw new Error("Invalid storage key");
  return full;
}

export const localStorageService: StorageService = {
  async upload({ key, data }) {
    const full = safePath(key);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, data);
    return { key, url: this.getUrl(key) };
  },
  async delete(key) {
    await fs.rm(safePath(key), { force: true });
  },
  // The file-serving route (with auth checks) is added in Phase 4.
  getUrl(key) {
    return `/api/files/${key}`;
  },
};
