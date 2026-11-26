import { redirect } from "next/navigation";
import { homeByRole } from "@/config/navigation";
import { requireUser } from "@/lib/session";

export default async function HomeRedirect() {
  const ctx = await requireUser();
  redirect(homeByRole[ctx.role]);
}
