import { redirect } from "next/navigation";
import { homeByRole } from "@/config/navigation";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function HomeRedirect() {
  const ctx = await requireUser();
  redirect(homeByRole[ctx.role]);
}
