"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const animatingRef = useRef(false);

  const animate = useCallback(() => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    setCount(0);

    const duration = 1800;
    const steps = 50;
    const stepTime = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current++;
      const progress = current / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (current >= steps) {
        setCount(target);
        clearInterval(timer);
        animatingRef.current = false;
      }
    }, stepTime);
  }, [target]);

  // Initial animation on scroll into view
  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [animate]);

  return (
    <span
      ref={ref}
      className="tabular-nums cursor-default"
      onMouseEnter={animate}
    >
      {count}
    </span>
  );
}
