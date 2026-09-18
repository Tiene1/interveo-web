import { ArrowUpDown, Search } from "lucide-react";

interface InterventionsFiltresProps {
  motCle: string;
  onMotCleChange: (value: string) => void;
}

/**
 * Recherche mot-cle : seule dans ce composant depuis le 2026-09-18 (retour
 * de Cedric apres la recette Nice to have lot 2, unification des filtres).
 * Le technicien en est retire, regroupe desormais avec statut et periode
 * dans InterventionsFiltresPanneau.tsx (bouton "Filtres" unique) — la
 * recherche reste separee et toujours visible : frequence d'usage plus
 * elevee qu'un filtre occasionnel, ne justifie pas d'etre derriere un clic.
 * Cherche sur nomClient/adresse/motifSignale/problemeConstate/
 * travauxRealises (cf. web/docs/architecture.md).
 */
export function InterventionsFiltres({ motCle, onMotCleChange }: InterventionsFiltresProps) {
  return (
    <div className="mb-0 flex items-center justify-between gap-4 border-b border-line pb-3">
      <div className="flex min-w-0 flex-1 items-center gap-5">
        <div className="flex max-w-[320px] flex-1 items-center gap-2 border-b border-transparent py-1.5 focus-within:border-ink-1">
          <Search size={14} strokeWidth={1.75} className="shrink-0 text-text-weak" />
          <input
            type="text"
            value={motCle}
            onChange={(event) => onMotCleChange(event.target.value)}
            placeholder="Rechercher un client, une adresse, un motif…"
            aria-label="Rechercher une intervention"
            className="w-full border-0 bg-transparent text-[13px] text-ink-1 placeholder:text-text-weak focus:outline-none"
          />
        </div>

        {motCle !== "" && (
          <button
            type="button"
            onClick={() => onMotCleChange("")}
            className="text-[13px] font-medium text-brand underline decoration-1 underline-offset-[3px] hover:text-brand-hover"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Tri par colonne cliquable : pas encore construit (aucune User Story
          associee). Le tri par date prevue, lui, est deja le comportement
          reel (US3.1) : affiche a titre indicatif. */}
      <div className="flex shrink-0 items-center gap-2 text-[13px] text-text-soft">
        <ArrowUpDown size={13} strokeWidth={1.75} className="shrink-0 text-text-weak" aria-hidden />
        <span>
          Trié par <strong className="font-semibold text-ink-1">date prévue</strong>
        </span>
      </div>
    </div>
  );
}
