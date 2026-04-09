export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
      <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
      <div className="mt-6 h-24 animate-pulse rounded-xl bg-muted" />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}
