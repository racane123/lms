import "server-only";
import { notFound } from "next/navigation";
import { NotFoundError } from "./errors";
import { ForbiddenError } from "./permissions";

export async function orNotFound<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (e) {
    if (e instanceof NotFoundError || e instanceof ForbiddenError) notFound();
    throw e;
  }
}
