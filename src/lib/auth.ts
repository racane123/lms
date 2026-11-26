import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";
import { getDefaultOrganizationId } from "./tenant";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Extension point: swap for a real email service in Phase 4+.
    sendResetPassword: async ({ user, url }) => {
      console.log(`[dev] Password reset for ${user.email}: ${url}`);
    },
  },

  // Extension point for OAuth: add `socialProviders: { google: {...} }` here.

  user: {
    additionalFields: {
      // input:false => clients can NOT set these at sign-up (prevents self-promotion to ADMIN)
      role: { type: "string", defaultValue: "STUDENT", input: false },
      isActive: { type: "boolean", defaultValue: true, input: false },
      organizationId: { type: "string", required: false, input: false },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const organizationId = await getDefaultOrganizationId();
          return { data: { ...user, organizationId } };
        },
      },
    },
  },

  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
    },
  },
});
