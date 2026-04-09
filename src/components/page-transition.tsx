"use client";

import { usePathname } from "next/navigation";
import { useRef, useEffect, useState, type ReactNode } from "react";

const tabOrder = ["/", "/locations", "/trips", "/account"];

function getTabIndex(path: string): number {
  if (path === "/") return 0;
  for (let i = tabOrder.length - 1; i >= 0; i--) {
    if (tabOrder[i] !== "/" && path.startsWith(tabOrder[i])) return i;
  }
  return -1;
}

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (pathname === prevPath.current) return;

    const prevIndex = getTabIndex(prevPath.current);
    const nextIndex = getTabIndex(pathname);
    prevPath.current = pathname;

    // Only animate between tab pages
    if (prevIndex < 0 || nextIndex < 0 || prevIndex === nextIndex) return;

    // Check for reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Only on mobile
    if (window.innerWidth >= 768) return;

    setDirection(nextIndex > prevIndex ? "left" : "right");
    setAnimating(true);

    const timeout = setTimeout(() => {
      setAnimating(false);
      setDirection(null);
    }, 250);

    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <div
      className="md:contents"
      style={
        animating && direction
          ? {
              animation: `slide-in-from-${direction} 250ms ease-out`,
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
