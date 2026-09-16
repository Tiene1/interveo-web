import { cn } from "@/lib/utils/cn";

export type InterventionStatut = "PLANIFIEE" | "REALISEE" | "ANNULEE";

const LABELS: Record<InterventionStatut, string> = {
  PLANIFIEE: "Planifiée",
  REALISEE: "Réalisée",
  ANNULEE: "Annulée",
};

/** Libellé français d'un statut, réutilisé hors composant (ex. export CSV). */
export function libelleStatut(statut: InterventionStatut): string {
  return LABELS[statut];
}

const MARKER_CLASSES: Record<InterventionStatut, string> = {
  PLANIFIEE: "bg-warning",
  REALISEE: "bg-success",
  ANNULEE: "bg-danger",
};

export function StatusChip({ statut }: { statut: InterventionStatut }) {
  return (
    <span className="inline-flex items-center gap-2 text-[13px] font-medium text-ink-1">
      <span aria-hidden className={cn("h-2 w-2 rounded-[1.5px]", MARKER_CLASSES[statut])} />
      <span className={statut === "ANNULEE" ? "text-text-soft line-through" : undefined}>
        {LABELS[statut]}
      </span>
    </span>
  );
}
