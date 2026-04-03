"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackToMap({ variant = "default" }: { variant?: "default" | "light" }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
        variant === "light"
          ? "text-white/70 hover:text-white"
          : "text-slate-400 hover:text-slate-700"
      }`}
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      Back to map
    </button>
  );
}
