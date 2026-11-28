export function NativeSelect({ className = "", ...props }: React.ComponentProps<"select">) {
  return (
    <select
      className={`h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
      {...props}
    />
  );
}
