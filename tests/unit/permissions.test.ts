import { describe, expect, it } from "vitest";
import { can, type Ctx } from "../../src/lib/permissions";

const org = "org_1";
const admin: Ctx = { userId: "a", role: "ADMIN", organizationId: org };
const teacher: Ctx = { userId: "t1", role: "INSTRUCTOR", organizationId: org };
const student: Ctx = { userId: "s1", role: "STUDENT", organizationId: org };

describe("permissions", () => {
  it("lets admins do everything in their own organization", () => {
    expect(can(admin, "user:manage")).toBe(true);
    expect(can(admin, "course:update", { ownerId: "t1", organizationId: org })).toBe(true);
  });

  it("blocks cross-organization access, even for admins", () => {
    expect(can(admin, "course:update", { ownerId: "t1", organizationId: "other_org" })).toBe(false);
  });

  it("lets instructors modify only their own courses", () => {
    expect(can(teacher, "course:create")).toBe(true);
    expect(can(teacher, "course:update", { ownerId: "t1", organizationId: org })).toBe(true);
    expect(can(teacher, "course:update", { ownerId: "t2", organizationId: org })).toBe(false);
    expect(can(teacher, "course:update")).toBe(false); // no resource => deny
  });

  it("keeps students out of admin and instructor actions", () => {
    expect(can(student, "course:enroll")).toBe(true);
    expect(can(student, "course:create")).toBe(false);
    expect(can(student, "user:manage")).toBe(false);
    expect(can(student, "quiz:manage", { ownerId: "s1", organizationId: org })).toBe(false);
  });
});
