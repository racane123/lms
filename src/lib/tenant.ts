import { db } from "./db";

let cachedOrgId: string | null = null;

/** MVP: every user belongs to the default workspace. Future: resolve from invite/subdomain. */
export async function getDefaultOrganizationId(): Promise<string> {
  if (cachedOrgId) return cachedOrgId;
  const slug = process.env.DEFAULT_ORG_SLUG ?? "default";
  const org = await db.organization.findUnique({ where: { slug } });
  if (!org) throw new Error(`Default organization "${slug}" not found. Run: npm run db:seed`);
  cachedOrgId = org.id;
  return org.id;
}
