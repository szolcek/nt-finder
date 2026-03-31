"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Map } from "lucide-react";

export function BackToMap() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to map
    </button>
  );
}
