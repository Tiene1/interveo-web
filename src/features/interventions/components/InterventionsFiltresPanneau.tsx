"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Filter } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils/cn";
import type { Technicien } from "../types/intervention";

const OPTIONS_STATUT = [
  { value: "", label: "Tous" },
  { value: "PLANIFIEE", label: "Planifiées" },
  { value: "REALISEE", label: "Réalisées" },
  { value: "ANNULEE", label: "Annulées" },
];

interface InterventionsFiltresPanneauProps {
  statut: string;
  onStatutChange: (value: string) => void;
  technicienId: string;
  onTechnicienIdChange: (value: string) => void;
  techniciens: Technicien[];
  dateDebut: string;
  onDateDebutChange: (value: string) => void;
  dateFin: string;
  onDateFinChange: (value: string) => void;
}

/**
 * Unifie le 2026-09-18 (retour de Cedric apres la recette Nice to have lot
 * 2 : "unifier tous les filtres en un seul bouton, ca devenait redondant
 * visuellement") : statut (jusque-la un Select "inline" a cote du titre) et
 * technicien (jusque-la dans InterventionsFiltres.tsx, a cote de la
 * recherche) rejoignent ici la periode (US3.4, deja geree par ce panneau).
 * Le mot-cle reste seul et toujours visible dans InterventionsFiltres.tsx :
 * frequence d'usage plus elevee qu'un filtre occasionnel, ne justifie pas
 * d'etre derriere un clic (convention Linear/Notion/Airtable).
 */
export function InterventionsFiltresPanneau({
  statut,
  onStatutChange,
  technicienId,
  onTechnicienIdChange,
  techniciens,
  dateDebut,
  onDateDebutChange,
  dateFin,
  onDateFinChange,
}: InterventionsFiltresPanneauProps) {
  const [ouvert, setOuvert] = useState(false);
  const racineRef = useRef<HTMLDivElement>(null);
  const panneauId = useId();
  const nombreFiltresActifs = [statut !== "", technicienId !== "", dateDebut !== "" || dateFin !== ""].filter(
    Boolean,
  ).length;
  const filtreActif = nombreFiltresActifs > 0;

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
        {filtreActif && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-ink-1 px-1 text-[10px] font-semibold text-paper">
            {nombreFiltresActifs}
          </span>
        )}
      </button>

      {ouvert && (
        <div
          id={panneauId}
          className="absolute right-0 top-[calc(100%+6px)] z-20 w-72 rounded-md border border-line bg-paper p-4 shadow-[0_12px_32px_-8px_rgba(15,23,42,.18)]"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-text-weak">Statut</p>
              <Select
                variant="field"
                value={statut}
                onChange={onStatutChange}
                ariaLabel="Filtrer par statut"
                options={OPTIONS_STATUT}
              />
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-text-weak">Technicien</p>
              <Select
                variant="field"
                value={technicienId}
                onChange={onTechnicienIdChange}
                ariaLabel="Filtrer par technicien"
                options={[
                  { value: "", label: "Tous" },
                  ...techniciens.map((technicien) => ({ value: technicien.id, label: technicien.nom })),
                ]}
              />
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-text-weak">
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
            </div>
          </div>

          {filtreActif && (
            <button
              type="button"
              onClick={() => {
                onStatutChange("");
                onTechnicienIdChange("");
                onDateDebutChange("");
                onDateFinChange("");
              }}
              className="mt-4 text-[13px] font-medium text-brand underline decoration-1 underline-offset-[3px] hover:text-brand-hover"
            >
              Réinitialiser
            </button>
          )}
        </div>
      )}
    </div>
  );
}
