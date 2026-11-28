"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/action-state";

export function ActionForm({
  action, children, className,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, {} as FormState);
  return (
    <form action={formAction} className={className}>
      {children}
      {state.error && <p role="alert" className="mt-1 block text-sm text-destructive">{state.error}</p>}
      {state.success && <p role="status" className="mt-1 block text-sm text-emerald-600">{state.success}</p>}
    </form>
  );
}
