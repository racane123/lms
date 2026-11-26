import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import { auth } from "../src/lib/auth";

const prisma = new PrismaClient();

async function main() {
  const slug = process.env.DEFAULT_ORG_SLUG ?? "default";
  const org = await prisma.organization.upsert({
    where: { slug },
    update: {},
    create: { slug, name: process.env.DEFAULT_ORG_NAME ?? "My LMS" },
  });

  const categories = ["Programming", "Business", "Design", "Science", "Languages"];
  for (const name of categories) {
    const catSlug = name.toLowerCase();
    await prisma.category.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: catSlug } },
      update: {},
      create: { organizationId: org.id, name, slug: catSlug },
    });
  }

  const password = process.env.SEED_PASSWORD ?? "ChangeMe123!";
  const accounts: { name: string; email: string; role: Role }[] = [
    { name: "Admin User", email: "admin@example.com", role: "ADMIN" },
    { name: "Ian Instructor", email: "instructor@example.com", role: "INSTRUCTOR" },
    { name: "Sam Student", email: "student@example.com", role: "STUDENT" },
  ];

  for (const a of accounts) {
    const existing = await prisma.user.findUnique({ where: { email: a.email } });
    if (!existing) {
      await auth.api.signUpEmail({ body: { name: a.name, email: a.email, password } });
    }
    // role is not settable via sign-up (input:false), so promote here.
    await prisma.user.update({
      where: { email: a.email },
      data: { role: a.role, emailVerified: true },
    });
  }

  console.log("Seeded organization, categories, and 3 users (admin/instructor/student@example.com).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
