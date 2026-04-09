"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Compass } from "lucide-react";

export function ExploreButton({ href }: { href: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "expanding" | "waiting" | "fading">("idle");
  const btnRef = useRef<HTMLButtonElement>(null);

  // Prefetch the locations page
  useEffect(() => {
    router.prefetch(href);
  }, [router, href]);

  // Listen for map-ready event
  useEffect(() => {
    if (phase !== "waiting") return;

    let lastTileTime = 0;
    let settleTimer: ReturnType<typeof setTimeout> | null = null;

    function onTilesLoaded() {
      lastTileTime = Date.now();
      console.log("[Explore] map-tiles-loaded", lastTileTime);

      // Clear any previous settle timer
      if (settleTimer) clearTimeout(settleTimer);

      // Wait 500ms after the LAST tilesloaded event to ensure all tiles are painted
      settleTimer = setTimeout(() => {
        console.log("[Explore] tiles settled, fading out", Date.now());
        setPhase("fading");
        setTimeout(() => setPhase("idle"), 500);
      }, 500);
    }

    window.addEventListener("map-tiles-loaded", onTilesLoaded);

    // Safety timeout — don't wait forever
    const timeout = setTimeout(() => {
      console.log("[Explore] safety timeout, fading out", Date.now());
      setPhase("fading");
      setTimeout(() => setPhase("idle"), 500);
    }, 5000);

    return () => {
      window.removeEventListener("map-tiles-loaded", onTilesLoaded);
      clearTimeout(timeout);
      if (settleTimer) clearTimeout(settleTimer);
    };
  }, [phase]);

  function handleClick() {
    if (phase !== "idle") return;
    console.log("[Explore] click, starting expand", Date.now());
    setPhase("expanding");

    // Start navigation after circle expands
    setTimeout(() => {
      console.log("[Explore] navigating to", href, Date.now());
      router.push(href);
      setPhase("waiting");
    }, 500);
  }

  const active = phase !== "idle";

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleClick}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-500 px-7 text-[15px] font-semibold text-white shadow-lg transition-all hover:bg-teal-600 active:scale-95"
      >
        <Compass
          className="h-4 w-4"
          style={active ? { animation: "spin-compass 600ms ease-in-out" } : undefined}
        />
        {active ? "Loading map..." : "Start Exploring"}
      </button>

      {/* Full-screen transition overlay */}
      {active && (
        <div
          className="fixed inset-0 z-[100]"
          style={{
            pointerEvents: phase === "fading" ? "none" : "auto",
            opacity: phase === "fading" ? 0 : 1,
            transition: "opacity 500ms ease-out",
          }}
        >
          {/* Expanding circle */}
          <div
            className="absolute rounded-full bg-teal-500"
            style={{
              left: "50%",
              bottom: "80px",
              width: "20px",
              height: "20px",
              transform: "translate(-50%, 50%)",
              animation: "map-reveal 500ms ease-in forwards",
            }}
          />

          {/* Map pin drop */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              transform: "translate(-50%, -50%)",
              animation: "pin-drop 400ms ease-out 250ms both",
            }}
          >
            <svg width="40" height="52" viewBox="0 0 26 34" fill="none">
              <path
                d="M13 0C7.477 0 3 4.477 3 10c0 7.5 10 24 10 24S23 17.5 23 10c0-5.523-4.477-10-10-10z"
                fill="white"
                fillOpacity="0.9"
              />
              <circle cx="13" cy="10" r="4" fill="#0d9488" />
            </svg>
          </div>

          {/* Loading pulse while waiting */}
          {phase === "waiting" && (
            <div className="absolute left-1/2 top-1/2 mt-12 -translate-x-1/2">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60 [animation-delay:0ms]" />
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60 [animation-delay:150ms]" />
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60 [animation-delay:300ms]" />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
