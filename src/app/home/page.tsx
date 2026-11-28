
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { homeByRole } from "@/config/navigation";
import { requireUser } from "@/lib/session";

async function HomeRedirectContent() {
  const ctx = await requireUser();
  redirect(homeByRole[ctx.role]);
}

export default function HomeRedirect() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeRedirectContent />
    </Suspense>
  );
}
