export type Role = "ADMIN" | "INSTRUCTOR" | "STUDENT";

/** Resolved on the server from the session. Never built from request input. */
export type Ctx = { userId: string; role: Role; organizationId: string };

export type Action =
  | "user:manage"
  | "course:create"
  | "course:update"
  | "course:delete"
  | "course:viewEnrollments"
  | "quiz:manage"
  | "quiz:viewResults"
  | "course:enroll"
  | "lesson:complete"
  | "quiz:take"
  | "analytics:viewPlatform"
  | "settings:manage";

export type Resource = { organizationId?: string; ownerId?: string };

type Rule = boolean | ((ctx: Ctx, resource?: Resource) => boolean);

const owns: Rule = (ctx, r) => !!r?.ownerId && r.ownerId === ctx.userId;

const instructorRules: Partial<Record<Action, Rule>> = {
  "course:create": true,
  "course:update": owns,
  "course:delete": owns,
  "course:viewEnrollments": owns,
  "quiz:manage": owns,
  "quiz:viewResults": owns,
};

const studentRules: Partial<Record<Action, Rule>> = {
  "course:enroll": true,
  "lesson:complete": true,
  "quiz:take": true,
};

export function can(ctx: Ctx, action: Action, resource?: Resource): boolean {
  // Tenant isolation: always enforced, for every role.
  if (resource?.organizationId && resource.organizationId !== ctx.organizationId) return false;

  if (ctx.role === "ADMIN") return true;

  const rules = ctx.role === "INSTRUCTOR" ? instructorRules : studentRules;
  const rule = rules[action];
  if (rule === undefined) return false;
  return typeof rule === "function" ? rule(ctx, resource) : rule;
}

export class ForbiddenError extends Error {
  constructor(message = "You do not have permission to perform this action.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export function assertCan(ctx: Ctx, action: Action, resource?: Resource): void {
  if (!can(ctx, action, resource)) throw new ForbiddenError();
}
