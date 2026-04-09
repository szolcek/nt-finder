"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";

interface Visit {
  name: string;
  date: string;
  emoji: string;
}

const visits: Visit[] = [
  { name: "Stourhead", date: "28 Mar", emoji: "\uD83C\uDFE0" },
  { name: "Corfe Castle", date: "15 Mar", emoji: "\uD83C\uDFF0" },
  { name: "White Cliffs", date: "2 Mar", emoji: "\uD83C\uDFD6\uFE0F" },
];

export function AnimatedVisits() {
  const ref = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      setVisibleCount(visits.length);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          visits.forEach((_, i) => {
            setTimeout(() => setVisibleCount(i + 1), 1400 + i * 400);
          });
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="ml-4 rounded-xl bg-white p-3.5 shadow-sm sm:ml-8">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        Recent visits
      </div>
      {visits.map((v, i) => (
        <div
          key={v.name}
          className="flex items-center gap-2.5 border-b border-slate-100 py-1.5 last:border-0 transition-all duration-500"
          style={{
            opacity: i < visibleCount ? 1 : 0,
            transform: i < visibleCount ? "translateY(0)" : "translateY(8px)",
          }}
        >
          <span className="text-base">{v.emoji}</span>
          <span className="flex-1 text-sm font-medium text-slate-700">{v.name}</span>
          <span className="text-xs text-slate-400">{v.date}</span>
          <CheckCircle2
            className="h-3.5 w-3.5 text-emerald-500 transition-transform duration-300"
            style={{
              transform: i < visibleCount ? "scale(1)" : "scale(0)",
              transitionDelay: i < visibleCount ? "200ms" : "0ms",
            }}
          />
        </div>
      ))}
    </div>
  );
}
