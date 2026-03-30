/** Display labels and colors for property category badges */

const CATEGORY_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  house: { label: "House & Garden", bg: "bg-blue-50", text: "text-blue-700" },
  garden: { label: "Garden", bg: "bg-green-50", text: "text-green-700" },
  castle: { label: "Castle", bg: "bg-purple-50", text: "text-purple-700" },
  countryside: {
    label: "Countryside",
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
  coast: { label: "Coast", bg: "bg-sky-50", text: "text-sky-700" },
};

export function getCategoryConfig(category: string) {
  return (
    CATEGORY_CONFIG[category] ?? {
      label: category,
      bg: "bg-secondary",
      text: "text-secondary-foreground",
    }
  );
}

/** Hex colors for use in inline styles (map popups, SVG markers, etc.) */
export const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  house: { bg: "#eff6ff", text: "#1d4ed8" },
  garden: { bg: "#e6f5ed", text: "#007A3D" },
  castle: { bg: "#f5f3ff", text: "#7c3aed" },
  countryside: { bg: "#fffbeb", text: "#b45309" },
  coast: { bg: "#f0f9ff", text: "#0284c7" },
};
