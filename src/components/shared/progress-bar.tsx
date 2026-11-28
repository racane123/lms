export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <div
      role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}
      aria-label={label ?? "Progress"}
      className="h-2 w-full overflow-hidden rounded-full bg-muted"
    >
      <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
    </div>
  );
}
