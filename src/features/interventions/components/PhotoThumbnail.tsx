"use client";

import { Image as ImageIcon } from "lucide-react";
import { usePhotoUrl } from "../hooks/usePhotoUrl";
import type { Photo } from "../types/intervention";

interface PhotoThumbnailProps {
  photo: Photo;
  numero: number;
  onClick?: () => void;
}

export function PhotoThumbnail({ photo, numero, onClick }: PhotoThumbnailProps) {
  const { url } = usePhotoUrl(photo.id);

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative h-[90px] w-[120px] shrink-0 overflow-hidden rounded-sm border border-line bg-paper-soft"
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center text-text-weak"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #E8E8E3 0 8px, #EFEFEA 8px 16px)",
          }}
        >
          <ImageIcon size={20} strokeWidth={1.5} className="opacity-60" />
        </div>
      )}
      <span className="absolute bottom-1.5 left-1.5 rounded-sm bg-ink-1 px-1.5 py-0.5 font-mono text-[9px] font-medium tracking-wide text-white">
        {photo.categorie} · {String(numero).padStart(2, "0")}
      </span>
    </button>
  );
}
