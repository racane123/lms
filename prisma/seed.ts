
import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import { auth } from "../src/lib/auth";

const prisma = new PrismaClient();

async function main() {
  // 1. Create or retrieve organization
  const slug = process.env.DEFAULT_ORG_SLUG ?? "default";

  const org = await prisma.organization.upsert({
    where: { slug },
    update: {},
    create: {
      slug,
      name: process.env.DEFAULT_ORG_NAME ?? "My LMS",
    },
  });

  // 2. Create categories
  const categories = [
    "Programming",
    "Business",
    "Design",
    "Science",
    "Languages",
  ];

  for (const name of categories) {
    const catSlug = name.toLowerCase();

    await prisma.category.upsert({
      where: {
        organizationId_slug: {
          organizationId: org.id,
          slug: catSlug,
        },
      },
      update: {},
      create: {
        organizationId: org.id,
        name,
        slug: catSlug,
      },
    });
  }

  // 3. Create users
  const password = process.env.SEED_PASSWORD ?? "ChangeMe123!";

  const accounts: { name: string; email: string; role: Role }[] = [
    { name: "Admin User", email: "admin@example.com", role: "ADMIN" },
    { name: "Ian Instructor", email: "instructor@example.com", role: "INSTRUCTOR" },
    { name: "Sam Student", email: "student@example.com", role: "STUDENT" },
  ];

  for (const a of accounts) {
    const existing = await prisma.user.findUnique({
      where: { email: a.email },
    });

    if (!existing) {
      await auth.api.signUpEmail({
        body: {
          name: a.name,
          email: a.email,
          password,
        },
      });
    }

    await prisma.user.update({
      where: { email: a.email },
      data: {
        role: a.role,
        emailVerified: true,
      },
    });
  }

  // 4. Retrieve instructor and student
  const instructor = await prisma.user.findUniqueOrThrow({
    where: { email: "instructor@example.com" },
  });

  const student = await prisma.user.findUniqueOrThrow({
    where: { email: "student@example.com" },
  });

  // 5. Retrieve categories
  const programming = await prisma.category.findUniqueOrThrow({
    where: {
      organizationId_slug: {
        organizationId: org.id,
        slug: "programming",
      },
    },
  });

  const business = await prisma.category.findUniqueOrThrow({
    where: {
      organizationId_slug: {
        organizationId: org.id,
        slug: "business",
      },
    },
  });

  // 6. Development courses
  const sampleCourses = [
    {
      slug: "intro-to-python",
      title: "Introduction to Python",
      categoryId: programming.id,
      level: "BEGINNER" as const,
      status: "PUBLISHED" as const,
      description:
        "Learn the basics of programming with Python: variables, control flow, and functions.",
      modules: [
        {
          title: "Getting started",
          lessons: [
            {
              title: "What is programming?",
              content:
                "Programming is giving a computer precise instructions. In this lesson we look at how code becomes behavior.",
            },
            {
              title: "Variables and types",
              content:
                "A variable is a named place to store a value. Python infers the type from the value you assign.",
            },
          ],
        },
        {
          title: "Control flow",
          lessons: [
            {
              title: "Conditionals",
              content:
                "Use if, elif, and else to run different code depending on a condition.",
            },
            {
              title: "Loops",
              content:
                "Use for and while loops to repeat work without repeating code.",
            },
          ],
        },
      ],
    },
    {
      slug: "web-development-fundamentals",
      title: "Web Development Fundamentals",
      categoryId: programming.id,
      level: "INTERMEDIATE" as const,
      status: "PUBLISHED" as const,
      description:
        "HTML, CSS, and JavaScript essentials for building your first web pages.",
      modules: [
        {
          title: "HTML and CSS",
          lessons: [
            {
              title: "Structure with HTML",
              content:
                "HTML describes the structure of a page using elements such as headings, paragraphs, and links.",
            },
            {
              title: "Styling with CSS",
              content:
                "CSS controls layout, color, and typography. Selectors choose which elements a rule applies to.",
            },
          ],
        },
      ],
    },
    {
      slug: "project-management-essentials",
      title: "Project Management Essentials",
      categoryId: business.id,
      level: "BEGINNER" as const,
      status: "DRAFT" as const,
      description: "Plan, schedule, and deliver projects on time.",
      modules: [
        {
          title: "Planning",
          lessons: [
            {
              title: "Defining scope",
              content:
                "Scope is the agreed list of what a project will and will not deliver.",
            },
          ],
        },
      ],
    },
  ];

  // 7. Create courses and their modules/lessons
  for (const c of sampleCourses) {
    const exists = await prisma.course.findUnique({
      where: {
        organizationId_slug: {
          organizationId: org.id,
          slug: c.slug,
        },
      },
    });

    if (exists) continue;

    await prisma.course.create({
      data: {
        organizationId: org.id,
        instructorId: instructor.id,
        categoryId: c.categoryId,
        title: c.title,
        slug: c.slug,
        description: c.description,
        level: c.level,
        status: c.status,
        modules: {
          create: c.modules.map((m, mi) => ({
            title: m.title,
            position: mi,
            lessons: {
              create: m.lessons.map((l, li) => ({
                title: l.title,
                type: "TEXT" as const,
                content: l.content,
                position: li,
              })),
            },
          })),
        },
      },
    });
  }

  // 8. Enroll student in Python course
  const python = await prisma.course.findUniqueOrThrow({
    where: {
      organizationId_slug: {
        organizationId: org.id,
        slug: "intro-to-python",
      },
    },
  });

  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: student.id,
        courseId: python.id,
      },
    },
    update: {},
    create: {
      userId: student.id,
      courseId: python.id,
    },
  });

  console.log(
    "Successfully seeded organization, categories, users, courses, modules, lessons, and enrollment!"
  );
}

// Execute seed
main()
  .catch((e) => {
    console.error("Database seeding failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
