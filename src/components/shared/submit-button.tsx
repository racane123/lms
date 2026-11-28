"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type Props = Omit<React.ComponentProps<typeof Button>, "type"> & { pendingText?: string; confirm?: string };

export function SubmitButton({ children, pendingText = "Saving…", confirm, disabled, onClick, ...props }: Props) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending || disabled}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
        onClick?.(e);
      }}
      {...props}
    >
      {pending ? pendingText : children}
    </Button>
  );
}
