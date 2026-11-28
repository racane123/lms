import type { Prisma } from "@prisma/client";
import { db } from "./db";
import type { Ctx } from "./permissions";

export async function logActivity(
  ctx: Ctx, action: string, entityType: string, entityId?: string, metadata?: Prisma.InputJsonValue,
) {
  await db.activityLog.create({
    data: { organizationId: ctx.organizationId, actorId: ctx.userId, action, entityType, entityId, metadata },
  });
}
