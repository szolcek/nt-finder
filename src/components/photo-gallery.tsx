"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface Photo {
  id: number;
  url: string;
  caption: string | null;
  user: { name: string | null };
}

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  if (photos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No photos yet. Be the first to share one!
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo) => (
          <div key={photo.id} className="group">
            <button
              type="button"
              className="w-full overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={photo.url}
                alt={photo.caption ?? "Location photo"}
                className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
              />
            </button>
            <div className="mt-1.5 space-y-0.5 px-0.5">
              {photo.caption && (
                <p className="text-xs text-foreground line-clamp-2">
                  {photo.caption}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {photo.user.name ?? "Anonymous"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="max-h-[85vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.caption ?? "Location photo"}
              className="max-h-[80vh] max-w-full rounded-lg object-contain"
            />
            {(selectedPhoto.caption || selectedPhoto.user.name) && (
              <div className="mt-3 text-center">
                {selectedPhoto.caption && (
                  <p className="text-sm text-white">{selectedPhoto.caption}</p>
                )}
                <p className="mt-1 text-xs text-white/70">
                  Photo by {selectedPhoto.user.name ?? "Anonymous"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
