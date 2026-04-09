import { MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>TrustQuest</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Not affiliated with the National Trust. Community-built.
        </p>
      </div>
    </footer>
  );
}
