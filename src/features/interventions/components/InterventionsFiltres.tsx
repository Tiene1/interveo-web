import { ArrowUpDown, Search } from "lucide-react";
import { Select } from "@/components/ui/Select";
import type { Technicien } from "../types/intervention";

interface InterventionsFiltresProps {
  motCle: string;
  onMotCleChange: (value: string) => void;
  technicienId: string;
  onTechnicienIdChange: (value: string) => void;
  techniciens: Technicien[];
}

/**
 * US3.2 fusionne avec US3.8 le 2026-09-16 (retour de Cedric apres la
 * recette Nice to have) : la recherche mot-cle avait ete construite comme
 * un champ separe dans le panneau "Filtres" (US3.8), mais Cedric a trouve
 * ca peu intuitif face a ce champ deja visible en permanence. Ce champ
 * cherche desormais sur nomClient/adresse/motifSignale/problemeConstate/
 * travauxRealises (cf. web/docs/architecture.md), un seul champ au lieu
 * de deux.
 */
export function InterventionsFiltres({
  motCle,
  onMotCleChange,
  technicienId,
  onTechnicienIdChange,
  techniciens,
}: InterventionsFiltresProps) {
  const filtreActif = motCle !== "" || technicienId !== "";

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

        <Select
          variant="inline"
          label="Technicien"
          value={technicienId}
          onChange={onTechnicienIdChange}
          ariaLabel="Filtrer par technicien"
          options={[
            { value: "", label: "Tous" },
            ...techniciens.map((technicien) => ({ value: technicien.id, label: technicien.nom })),
          ]}
        />

        {filtreActif && (
          <button
            type="button"
            onClick={() => {
              onMotCleChange("");
              onTechnicienIdChange("");
            }}
            className="text-[13px] font-medium text-brand underline decoration-1 underline-offset-[3px] hover:text-brand-hover"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Tri par colonne cliquable : pas encore construit (aucune User Story
          associee). Le tri par date prevue, lui, est deja le comportement
          reel (US3.1) : affiche a titre indicatif. Icone ajoutee le 2026-09-17
          (retour de Cedric : le texte semblait flotter sans repere visuel,
          remplace la puce "S" decorative qui n'expliquait rien). */}
      <div className="flex shrink-0 items-center gap-2 text-[13px] text-text-soft">
        <ArrowUpDown size={13} strokeWidth={1.75} className="shrink-0 text-text-weak" aria-hidden />
        <span>
          Trié par <strong className="font-semibold text-ink-1">date prévue</strong>
        </span>
      </div>
    </div>
  );
}
