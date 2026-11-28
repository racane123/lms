import "server-only";
import { revalidatePath } from "next/cache";
import { toFormState, type FormState } from "./action-state";
import type { Role } from "./permissions";
import { requireRole, type SessionContext } from "./session";

export async function runAction(
  roles: Role[],
  fn: (ctx: SessionContext) => Promise<void>,
  opts: { success?: string; revalidate?: string[] } = {},
): Promise<FormState> {
  const ctx = await requireRole(...roles); // redirects (throws) outside the try on purpose
  try {
    await fn(ctx);
  } catch (e) {
    return toFormState(e);
  }
  for (const p of opts.revalidate ?? []) revalidatePath(p, p.includes("[") ? "page" : undefined);
  return opts.success ? { success: opts.success } : {};
}
