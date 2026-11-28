import { ActionForm } from "./action-form";
import { SubmitButton } from "./submit-button";
import type { FormState } from "@/lib/action-state";

export function InlineAction({
  action, fields, children, ariaLabel, variant = "ghost", confirm,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  fields: Record<string, string>;
  children: React.ReactNode;
  ariaLabel?: string;
  variant?: "ghost" | "outline" | "destructive" | "default";
  confirm?: string;
}) {
  return (
    <ActionForm action={action} className="inline-flex flex-col">
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <SubmitButton size="sm" variant={variant} aria-label={ariaLabel} confirm={confirm} pendingText="…">
        {children}
      </SubmitButton>
    </ActionForm>
  );
}
