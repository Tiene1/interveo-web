"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Filter } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";

interface InterventionsFiltresPanneauProps {
  dateDebut: string;
  onDateDebutChange: (value: string) => void;
  dateFin: string;
  onDateFinChange: (value: string) => void;
  motCle: string;
  onMotCleChange: (value: string) => void;
}

/**
 * Bouton "Filtres" (chrome de maquette inerte depuis le 2026-09-14, cf.
 * web/docs/architecture.md) devenu fonctionnel : panneau regroupant la
 * periode (US3.4, sur `datePrevue`) et la recherche libre (US3.8, sur
 * adresse/motif/probleme/travaux). Applique immediatement, comme les
 * autres filtres de cet ecran.
 */
export function InterventionsFiltresPanneau({
  dateDebut,
  onDateDebutChange,
  dateFin,
  onDateFinChange,
  motCle,
  onMotCleChange,
}: InterventionsFiltresPanneauProps) {
  const [ouvert, setOuvert] = useState(false);
  const racineRef = useRef<HTMLDivElement>(null);
  const panneauId = useId();
  const filtreActif = dateDebut !== "" || dateFin !== "" || motCle !== "";

  useEffect(() => {
    if (!ouvert) return;
    function onClicExterieur(event: MouseEvent) {
      if (racineRef.current && !racineRef.current.contains(event.target as Node)) {
        setOuvert(false);
      }
    }
    function onEchap(event: KeyboardEvent) {
      if (event.key === "Escape") setOuvert(false);
    }
    document.addEventListener("mousedown", onClicExterieur);
    document.addEventListener("keydown", onEchap);
    return () => {
      document.removeEventListener("mousedown", onClicExterieur);
      document.removeEventListener("keydown", onEchap);
    };
  }, [ouvert]);

  return (
    <div ref={racineRef} className="relative">
      <button
        type="button"
        aria-expanded={ouvert}
        aria-controls={panneauId}
        onClick={() => setOuvert((precedent) => !precedent)}
        className={cn(
          "inline-flex h-9 items-center justify-center gap-2 rounded-md border px-4 text-[13px] font-medium text-ink-1",
          filtreActif ? "border-ink-1 bg-line-soft" : "border-line",
        )}
      >
        <Filter size={14} strokeWidth={1.75} />
        Filtres
      </button>

      {ouvert && (
        <div
          id={panneauId}
          className="absolute right-0 top-[calc(100%+6px)] z-20 w-72 rounded-md border border-line bg-paper p-4 shadow-[0_12px_32px_-8px_rgba(15,23,42,.18)]"
        >
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.06em] text-text-weak">
            Période (date prévue)
          </p>
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-[13px] font-medium text-text-soft">
              Du
              <Input
                type="date"
                value={dateDebut}
                onChange={(event) => onDateDebutChange(event.target.value)}
                max={dateFin || undefined}
              />
            </label>
            <label className="flex flex-col gap-1 text-[13px] font-medium text-text-soft">
              Au
              <Input
                type="date"
                value={dateFin}
                onChange={(event) => onDateFinChange(event.target.value)}
                min={dateDebut || undefined}
              />
            </label>
          </div>

          <p className="mb-3 mt-4 text-[11px] font-medium uppercase tracking-[0.06em] text-text-weak">
            Mot-clé
          </p>
          <label className="flex flex-col gap-1 text-[13px] font-medium text-text-soft">
            Adresse, motif, problème, travaux
            <Input
              type="text"
              value={motCle}
              onChange={(event) => onMotCleChange(event.target.value)}
              placeholder="Ex. climatisation, panne électrique…"
            />
          </label>

          {filtreActif && (
            <button
              type="button"
              onClick={() => {
                onDateDebutChange("");
                onDateFinChange("");
                onMotCleChange("");
              }}
              className="mt-3 text-[13px] font-medium text-brand underline decoration-1 underline-offset-[3px] hover:text-brand-hover"
            >
              Réinitialiser
            </button>
          )}
        </div>
      )}
    </div>
  );
}
