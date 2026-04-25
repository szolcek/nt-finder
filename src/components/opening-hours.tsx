type Asset = { name: string; hours: string };

export type OpeningHoursData = {
  source?: string;
  scrapedAt?: string;
  today?: { date?: string | null; assets?: Asset[] } | null;
  notes?: string[];
};

export function OpeningHours({ data }: { data: OpeningHoursData | null }) {
  const assets = data?.today?.assets ?? [];
  if (assets.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        Spring &amp; summer hours
      </p>

      <ul className="divide-y divide-slate-200/70 rounded-xl bg-white shadow-sm">
        {assets.map((a) => (
          <li
            key={a.name}
            className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
          >
            <span className="font-medium text-slate-700">{a.name}</span>
            <span className="tabular-nums text-slate-600">{a.hours}</span>
          </li>
        ))}
      </ul>

      {data?.notes && data.notes.length > 0 && (
        <ul className="space-y-1 text-xs text-slate-500">
          {data.notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
