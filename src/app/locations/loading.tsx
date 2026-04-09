export default function Loading() {
  return (
    <div className="flex h-[calc(100dvh-4rem)] items-center justify-center md:h-[calc(100vh-3.5rem)]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-teal-200 border-t-teal-600" />
        <span className="text-sm text-muted-foreground">Loading map...</span>
      </div>
    </div>
  );
}
