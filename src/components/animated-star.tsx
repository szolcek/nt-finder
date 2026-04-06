"use client";

import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedStarProps {
  /** Delay in ms before the star fills */
  delay?: number;
  className?: string;
}

export function AnimatedStar({ delay = 0, className }: AnimatedStarProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(() => setFilled(true), 0);
      return () => clearTimeout(t);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timer = setTimeout(() => setFilled(true), delay);
          observer.disconnect();
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex transition-transform duration-300",
        filled && "animate-[star-pop_0.5s_cubic-bezier(0.16,1,0.3,1)]",
        className,
      )}
    >
      <Star
        className={cn(
          "h-4 w-4 flex-shrink-0 transition-colors duration-500",
          filled
            ? "fill-amber-400 text-amber-400"
            : "fill-transparent text-slate-200",
        )}
      />
    </span>
  );
}
