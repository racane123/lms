import type { Role } from "@/lib/permissions";

export const homeByRole: Record<Role, string> = {
  ADMIN: "/admin",
  INSTRUCTOR: "/instructor",
  STUDENT: "/dashboard",
};

export const navByRole: Record<Role, { label: string; href: string }[]> = {
  ADMIN: [{ label: "Dashboard", href: "/admin" }],
  INSTRUCTOR: [{ label: "Dashboard", href: "/instructor" }],
  STUDENT: [{ label: "Dashboard", href: "/dashboard" }],
};
