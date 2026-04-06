"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedProgressProps {
  /** Target percentage (0–100) */
  percent: number;
  /** Visited count */
  visited: number;
  /** Total count */
  total: number;
  /** Delay in ms before animation starts */
  delay?: number;
}

export function AnimatedProgress({
  percent,
  visited,
  total,
  delay = 0,
}: AnimatedProgressProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced) {
      requestAnimationFrame(() => {
        setProgress(percent);
        setCount(visited);
      });
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();

          const timeout = setTimeout(() => {
            const duration = 1200;
            const steps = 40;
            const stepTime = duration / steps;
            let current = 0;

            const timer = setInterval(() => {
              current++;
              const t = current / steps;
              const eased = 1 - Math.pow(1 - t, 3);
              setProgress(Math.round(eased * percent));
              setCount(Math.round(eased * visited));

              if (current >= steps) {
                setProgress(percent);
                setCount(visited);
                clearInterval(timer);
              }
            }, stepTime);
          }, delay);

          return () => clearTimeout(timeout);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [percent, visited, delay]);

  return (
    <div ref={ref} className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-800">Your Progress</div>
        <div className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold tabular-nums text-emerald-700">
          {progress}%
        </div>
      </div>
      <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-emerald-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-[width] duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-1.5 text-xs text-slate-500">
        <span className="tabular-nums">{count}</span> of {total} properties visited
      </div>
    </div>
  );
}
