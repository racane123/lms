export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10" aria-busy="true">
      <div className="h-8 w-56 animate-pulse rounded bg-muted" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-44 animate-pulse rounded-xl bg-muted" />)}
      </div>
    </main>
  );
}
