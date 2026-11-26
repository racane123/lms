import "server-only";
import { localStorageService } from "./local";
import type { StorageService } from "./types";

export function getStorage(): StorageService {
  switch (process.env.STORAGE_DRIVER ?? "local") {
    case "local":
      return localStorageService;
    default:
      // Future: case "s3": return s3StorageService; case "cloudinary": ...
      throw new Error(`Unsupported STORAGE_DRIVER "${process.env.STORAGE_DRIVER}"`);
  }
}
