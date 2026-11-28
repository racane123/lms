import type { Role } from "@/lib/permissions";

export const homeByRole: Record<Role, string> = {
  ADMIN: "/admin",
  INSTRUCTOR: "/instructor",
  STUDENT: "/dashboard",
};

export const navByRole: Record<Role, { label: string; href: string }[]> = {
  ADMIN: [
    { label: "Dashboard", href: "/admin" },
    { label: "Courses", href: "/admin/courses" },
    { label: "Enrollments", href: "/admin/enrollments" },
    { label: "Course catalog", href: "/courses" },
  ],
  INSTRUCTOR: [
    { label: "Dashboard", href: "/instructor" },
    { label: "My courses", href: "/instructor/courses" },
    { label: "Course catalog", href: "/courses" },
  ],
  STUDENT: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Course catalog", href: "/courses" },
  ],
};
