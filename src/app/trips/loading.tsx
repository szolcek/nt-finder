export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
      <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
