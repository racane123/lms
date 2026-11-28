import { z } from "zod";

/** HTML forms send "" for empty fields; treat that as "not provided". */
export const emptyToUndefined = (v: unknown) => (v === "" || v === null ? undefined : v);

export const idSchema = z.string().min(1, "Missing id.");
export const directionSchema = z.enum(["up", "down"]);
