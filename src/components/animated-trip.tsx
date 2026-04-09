"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, Compass, MessageCircle } from "lucide-react";

const stops = [
  { num: "1", name: "Corfe Castle", type: "Castle", color: "border-l-violet-400" },
  { num: "2", name: "Brownsea Island", type: "Coast", color: "border-l-sky-400" },
  { num: "3", name: "Kingston Lacy", type: "House & Garden", color: "border-l-blue-400" },
  { num: "4", name: "Studland Bay", type: "Beach & Nature", color: "border-l-teal-400" },
  { num: "5", name: "Lulworth Cove", type: "Coastline Walk", color: "border-l-emerald-400" },
];

export function AnimatedTrip() {
  const ref = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [showNote, setShowNote] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      setVisibleCount(stops.length);
      setShowNote(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          // Stagger each stop
          stops.forEach((_, i) => {
            setTimeout(() => setVisibleCount(i + 1), 600 + i * 350);
          });
          // Show note after all stops
          setTimeout(() => setShowNote(true), 600 + stops.length * 350 + 200);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative space-y-3">
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-800">Dorset Weekend</div>
            <div className="mt-0.5 text-xs text-slate-500">
              <span className="tabular-nums">{visibleCount}</span> {visibleCount === 1 ? "property" : "properties"} &middot; 2 days
            </div>
          </div>
          <div className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
            <Calendar className="mr-1 inline h-3 w-3" />
            Apr 12-13
          </div>
        </div>
      </div>

      <div className="ml-4 space-y-2 sm:ml-8">
        {stops.map((stop, i) => (
          <div
            key={stop.name}
            className={`flex items-center gap-2.5 rounded-lg border-l-[3px] bg-white p-2.5 shadow-sm transition-all duration-500 ${stop.color}`}
            style={{
              opacity: i < visibleCount ? 1 : 0,
              transform: i < visibleCount ? "translateX(0)" : "translateX(-12px)",
            }}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-600">
              {stop.num}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-slate-800">{stop.name}</div>
              <div className="text-xs text-slate-400">{stop.type}</div>
            </div>
            <Compass
              className="h-3.5 w-3.5 text-slate-300 transition-transform duration-300"
              style={{
                transform: i < visibleCount ? "rotate(0deg)" : "rotate(-90deg)",
                opacity: i < visibleCount ? 1 : 0,
              }}
            />
          </div>
        ))}
      </div>

      <div
        className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all duration-500 sm:ml-4"
        style={{
          opacity: showNote ? 1 : 0,
          transform: showNote ? "translateY(0)" : "translateY(8px)",
        }}
      >
        <MessageCircle className="h-3 w-3 text-sky-500" />
        Remember to book parking at Corfe!
      </div>
    </div>
  );
}
