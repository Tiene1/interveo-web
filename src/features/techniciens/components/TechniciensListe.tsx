"use client";

import { useState } from "react";
import { Plus, RotateCw, Search, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { StatePanel } from "@/components/ui/StatePanel";
import { useComptesTechniciens } from "../hooks/useComptesTechniciens";
import { useDesactiverCompteTechnicien } from "../hooks/useDesactiverCompteTechnicien";
import { useReactiverCompteTechnicien } from "../hooks/useReactiverCompteTechnicien";
import { useSupprimerCompteTechnicien } from "../hooks/useSupprimerCompteTechnicien";
import { useReinitialiserMotDePasse } from "../hooks/useReinitialiserMotDePasse";
import { useScrollRestaure } from "@/lib/utils/useScrollRestaure";
import { CreerCompteModal } from "./CreerCompteModal";
import { ConfirmationDesactivationModal } from "./ConfirmationDesactivationModal";
import { ConfirmationSuppressionCompteModal } from "./ConfirmationSuppressionCompteModal";
import { ReinitialiserMotDePasseModal } from "./ReinitialiserMotDePasseModal";
import { TechniciensTable } from "./TechniciensTable";
import type { CompteTechnicien } from "../types/utilisateur";

/**
 * Isole l'appel a useDesactiverCompteTechnicien(id) : l'id de la cible n'est
 * connu qu'une fois un technicien selectionne (contrairement a InterventionDetail
 * ou l'id est fixe pour toute la duree de vie de l'ecran), donc le hook ne peut
 * pas etre appele inconditionnellement en haut de TechniciensListe.
 */
function DesactivationConnectee({
  technicien,
  onClose,
}: {
  technicien: CompteTechnicien;
  onClose: () => void;
}) {
  const desactiver = useDesactiverCompteTechnicien(technicien.id);
  return (
    <ConfirmationDesactivationModal
      technicien={technicien}
      isPending={desactiver.isPending}
      onCancel={onClose}
      onConfirm={() => desactiver.mutate(undefined, { onSuccess: onClose })}
    />
  );
}

/** Meme raison que DesactivationConnectee : l'id cible n'est connu qu'a la selection. */
function SuppressionConnectee({
  technicien,
  onClose,
}: {
  technicien: CompteTechnicien;
  onClose: () => void;
}) {
  const supprimer = useSupprimerCompteTechnicien(technicien.id);
  return (
    <ConfirmationSuppressionCompteModal
      technicien={technicien}
      isPending={supprimer.isPending}
      erreur={supprimer.error}
      onCancel={onClose}
      onConfirm={() => supprimer.mutate(undefined, { onSuccess: onClose })}
    />
  );
}

/** Meme raison que DesactivationConnectee : l'id cible n'est connu qu'a la selection. */
function ReinitialisationConnectee({
  technicien,
  onClose,
}: {
  technicien: CompteTechnicien;
  onClose: () => void;
}) {
  const reinitialiser = useReinitialiserMotDePasse(technicien.id);
  return (
    <ReinitialiserMotDePasseModal
      technicien={technicien}
      isPending={reinitialiser.isPending}
      erreur={reinitialiser.error}
      onClose={onClose}
      onSubmit={(motDePasse) => reinitialiser.mutate(motDePasse, { onSuccess: onClose })}
    />
  );
}

const OPTIONS_STATUT = [
  { value: "", label: "Tous" },
  { value: "actif", label: "Actifs" },
  { value: "inactif", label: "Inactifs" },
];

/**
 * Recherche (nom/identifiant) et filtre de statut ajoutes le 2026-09-16
 * (retour de Cedric apres la recette Nice to have). Filtrage cote client :
 * useComptesTechniciens() charge deja la liste complete, non paginee
 * (contrairement a la liste des interventions), donc pas besoin de nouveaux
 * parametres de requete cote backend pour un jeu de donnees de cette taille.
 */
function filtrerTechniciens(
  techniciens: CompteTechnicien[],
  recherche: string,
  statut: string,
): CompteTechnicien[] {
  const rechercheNormalisee = recherche.trim().toLowerCase();
  return techniciens.filter((technicien) => {
    const correspondRecherche =
      rechercheNormalisee === "" ||
      technicien.nom.toLowerCase().includes(rechercheNormalisee) ||
      technicien.identifiant.toLowerCase().includes(rechercheNormalisee);
    const correspondStatut =
      statut === "" || (statut === "actif" ? technicien.actif : !technicien.actif);
    return correspondRecherche && correspondStatut;
  });
}

/** US4.6 (liste) + US4.5 (creation) + US4.7 (desactivation) + US4.9 (reinitialisation). */
export function TechniciensListe() {
  const techniciens = useComptesTechniciens();
  const reactiver = useReactiverCompteTechnicien();
  const [modaleCreationOuverte, setModaleCreationOuverte] = useState(false);
  const [technicienADesactiver, setTechnicienADesactiver] = useState<CompteTechnicien | null>(null);
  const [technicienASupprimer, setTechnicienASupprimer] = useState<CompteTechnicien | null>(null);
  const [technicienAReinitialiser, setTechnicienAReinitialiser] = useState<CompteTechnicien | null>(null);
  const [recherche, setRecherche] = useState("");
  const [statutFiltre, setStatutFiltre] = useState("");
  const { ref: scrollRef, onScroll } = useScrollRestaure<HTMLDivElement>(
    "scroll:techniciens-liste",
    Boolean(techniciens.data),
  );

  const techniciensFiltres = techniciens.data
    ? filtrerTechniciens(techniciens.data, recherche, statutFiltre)
    : undefined;
  const filtreActif = recherche !== "" || statutFiltre !== "";

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.06em] text-text-weak">
          <span>Administration</span>
          <span className="opacity-50">/</span>
          <span className="font-semibold text-text-soft">Techniciens</span>
        </div>

        <div className="mb-5 flex items-end justify-between gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <h1 className="font-serif text-[44px] font-normal leading-[1.05] tracking-[-0.035em] text-ink-1">
              Techniciens<span className="italic">.</span>
            </h1>
            {techniciens.data && (
              <p className="max-w-[640px] text-sm leading-[1.5] text-text-soft">
                <span className="font-semibold text-ink-1">{techniciens.data.length}</span> techniciens au total —{" "}
                <span className="font-semibold text-ink-1">
                  {techniciens.data.filter((technicien) => technicien.actif).length}
                </span>{" "}
                actifs,{" "}
                <span className="font-semibold text-ink-1">
                  {techniciens.data.filter((technicien) => !technicien.actif).length}
                </span>{" "}
                inactifs.
              </p>
            )}
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => setModaleCreationOuverte(true)}>
              <Plus size={14} strokeWidth={1.75} />
              Créer un compte
            </Button>
          </div>
        </div>

        {techniciens.data && techniciens.data.length > 0 && (
          <div className="mb-0 flex items-center gap-5 border-b border-line pb-3">
            <div className="flex max-w-[320px] flex-1 items-center gap-2 border-b border-transparent py-1.5 focus-within:border-ink-1">
              <Search size={14} strokeWidth={1.75} className="shrink-0 text-text-weak" />
              <input
                type="text"
                value={recherche}
                onChange={(event) => setRecherche(event.target.value)}
                placeholder="Rechercher un nom, un identifiant…"
                aria-label="Rechercher un technicien"
                className="w-full border-0 bg-transparent text-[13px] text-ink-1 placeholder:text-text-weak focus:outline-none"
              />
            </div>

            <Select
              variant="inline"
              icon={Tag}
              label="Statut"
              value={statutFiltre}
              onChange={setStatutFiltre}
              ariaLabel="Filtrer par statut"
              options={OPTIONS_STATUT}
            />

            {filtreActif && (
              <button
                type="button"
                onClick={() => {
                  setRecherche("");
                  setStatutFiltre("");
                }}
                aria-label="Réinitialiser les filtres"
                className="text-[13px] font-medium text-brand underline decoration-1 underline-offset-[3px] hover:text-brand-hover"
              >
                Réinitialiser
              </button>
            )}
          </div>
        )}
      </div>

      <div ref={scrollRef} onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto">
        {techniciens.isPending && <p className="pt-10 text-sm text-text-soft">Chargement…</p>}

        {techniciens.isError && (
          <StatePanel
            tone="danger"
            kicker="Erreur de chargement"
            title={
              <>
                Impossible de charger les <span className="italic">techniciens</span>.
              </>
            }
            description="Une erreur est survenue lors de la récupération des données. Vérifiez votre connexion, puis réessayez."
            actions={
              <Button variant="secondary" size="sm" onClick={() => techniciens.refetch()}>
                <RotateCw size={14} strokeWidth={1.75} />
                Réessayer
              </Button>
            }
          />
        )}

        {techniciens.data && techniciens.data.length === 0 && (
          <StatePanel
            kicker="Aucune donnée"
            title={
              <>
                Aucun technicien <span className="italic">pour le moment</span>.
              </>
            }
            description="Créez le premier compte pour qu'un technicien puisse se connecter sur mobile."
            actions={
              <Button variant="primary" size="sm" onClick={() => setModaleCreationOuverte(true)}>
                <Plus size={14} strokeWidth={1.75} />
                Créer un compte
              </Button>
            }
          />
        )}

        {techniciensFiltres && techniciensFiltres.length === 0 && techniciens.data && techniciens.data.length > 0 && (
          <StatePanel
            kicker="Aucun résultat"
            title={
              <>
                Aucun technicien ne correspond <span className="italic">à ces filtres</span>.
              </>
            }
            description="Essayez un autre nom, un autre identifiant ou un autre statut."
            actions={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setRecherche("");
                  setStatutFiltre("");
                }}
              >
                Réinitialiser les filtres
              </Button>
            }
          />
        )}

        {techniciensFiltres && techniciensFiltres.length > 0 && (
          <TechniciensTable
            techniciens={techniciensFiltres}
            onDesactiver={setTechnicienADesactiver}
            onReactiver={(technicien) => reactiver.mutate(technicien.id)}
            onSupprimer={setTechnicienASupprimer}
            onReinitialiserMotDePasse={setTechnicienAReinitialiser}
          />
        )}
      </div>

      {modaleCreationOuverte && (
        <CreerCompteModal
          onClose={() => setModaleCreationOuverte(false)}
          onCreated={() => setModaleCreationOuverte(false)}
        />
      )}

      {technicienADesactiver && (
        <DesactivationConnectee
          technicien={technicienADesactiver}
          onClose={() => setTechnicienADesactiver(null)}
        />
      )}

      {technicienASupprimer && (
        <SuppressionConnectee
          technicien={technicienASupprimer}
          onClose={() => setTechnicienASupprimer(null)}
        />
      )}

      {technicienAReinitialiser && (
        <ReinitialisationConnectee
          technicien={technicienAReinitialiser}
          onClose={() => setTechnicienAReinitialiser(null)}
        />
      )}
    </div>
  );
}
