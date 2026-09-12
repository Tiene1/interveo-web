"use client";

import { useEffect } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon, X } from "lucide-react";
import { formatDateTime } from "@/lib/utils/date";
import { usePhotoUrl } from "../hooks/usePhotoUrl";
import { referenceCourte } from "../lib/reference";
import type { InterventionDetail, Photo } from "../types/intervention";

interface PhotoLightboxProps {
  photos: Photo[];
  index: number;
  intervention: InterventionDetail;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function PhotoLightbox({ photos, index, intervention, onClose, onIndexChange }: PhotoLightboxProps) {
  const photo = photos[index];
  const { url } = usePhotoUrl(photo.id);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && index > 0) onIndexChange(index - 1);
      if (event.key === "ArrowRight" && index < photos.length - 1) onIndexChange(index + 1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [index, photos.length, onClose, onIndexChange]);

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-30 flex flex-col bg-[#0A0E1A]">
      <div className="flex items-center justify-between px-8 py-5 text-[11px] font-medium uppercase tracking-[0.14em] text-white/75">
        <div className="flex items-center gap-3 font-mono tracking-[0.04em]">
          <span className="text-white/50">#</span>
          <span className="font-semibold text-white">{referenceCourte(intervention.id)}</span>
          <span className="text-white/30">·</span>
          <span>{intervention.nomClient}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 rounded border border-white/15 px-3 py-2 text-white transition-colors hover:border-white/25 hover:bg-white/[.06]"
        >
          Fermer
          <X size={14} strokeWidth={1.75} />
          <span className="ml-0.5 rounded bg-white/10 px-1.5 py-px font-mono text-[9px] normal-case">Esc</span>
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-24 pb-14">
        {index > 0 && (
          <button
            type="button"
            aria-label="Photo précédente"
            onClick={() => onIndexChange(index - 1)}
            className="absolute left-8 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/10 text-white transition-colors hover:border-white/25 hover:bg-white/[.06]"
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>
        )}

        <div className="relative flex aspect-[4/3] h-[600px] max-h-full w-auto max-w-full items-center justify-center overflow-hidden bg-ink-1 shadow-[0_30px_60px_rgba(0,0,0,.4)]">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-contain" />
          ) : (
            <div
              className="flex h-full w-[450px] items-center justify-center text-white/15"
              style={{
                backgroundImage: "repeating-linear-gradient(45deg, #1E293B 0 12px, #253248 12px 24px)",
              }}
            >
              <ImageIcon size={80} strokeWidth={1} />
            </div>
          )}
        </div>

        {index < photos.length - 1 && (
          <button
            type="button"
            aria-label="Photo suivante"
            onClick={() => onIndexChange(index + 1)}
            className="absolute right-8 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/10 text-white transition-colors hover:border-white/25 hover:bg-white/[.06]"
          >
            <ChevronRight size={20} strokeWidth={1.5} />
          </button>
        )}
      </div>

      <div className="flex items-end justify-between gap-8 border-t border-white/[.08] px-8 py-6">
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] font-medium tracking-[0.08em] text-white/50">
            {photo.categorie} · {formatDateTime(photo.creeLe)}
          </span>
          <div className="flex items-center gap-3 text-xs text-white/55">
            <span>
              Photographiée par <strong className="font-medium text-white/85">{intervention.technicien.nom}</strong>
            </span>
            <span className="text-white/25">·</span>
            <span>{intervention.adresse}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.06em] text-white/70">
            <span className="font-semibold text-white">{String(index + 1).padStart(2, "0")}</span>
            <span className="text-white/30">/</span>
            <span>{String(photos.length).padStart(2, "0")}</span>
          </div>
          <div className="flex gap-1.5">
            {photos.map((p, i) => (
              <button
                key={p.id}
                type="button"
                aria-label={`Voir la photo ${i + 1}`}
                onClick={() => onIndexChange(i)}
                className={`flex h-9 w-12 items-center justify-center border bg-white/[.06] text-white/25 ${
                  i === index ? "border-white/80" : "border-transparent"
                }`}
              >
                <ImageIcon size={14} strokeWidth={1.5} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {photos.length > 1 && (
        <div className="pointer-events-none absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-4 font-mono text-[10px] tracking-[0.06em] text-white/40">
          <span>
            <span className="rounded bg-white/[.08] px-1.5 py-0.5 text-white/70">←</span> précédent
          </span>
          <span>
            <span className="rounded bg-white/[.08] px-1.5 py-0.5 text-white/70">→</span> suivant
          </span>
          <span>
            <span className="rounded bg-white/[.08] px-1.5 py-0.5 text-white/70">Esc</span> fermer
          </span>
        </div>
      )}
    </div>
  );
}
