"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Filter, Plus, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatePanel } from "@/components/ui/StatePanel";
import { useDebouncedValue } from "@/lib/utils/useDebouncedValue";
import { useInterventions } from "../hooks/useInterventions";
import { useTechniciens } from "../hooks/useTechniciens";
import { InterventionsFiltres } from "./InterventionsFiltres";
import { InterventionsTable } from "./InterventionsTable";
import { InterventionsTableSkeleton } from "./InterventionsTableSkeleton";
import { InterventionsPagination } from "./InterventionsPagination";

export function InterventionsListe() {
  const [page, setPage] = useState(1);
  const [client, setClient] = useState("");
  const [technicienId, setTechnicienId] = useState("");
  const clientDebounce = useDebouncedValue(client);
  const filtreActif = client !== "" || technicienId !== "";

  const interventions = useInterventions({ page, client: clientDebounce, technicienId });
  const techniciens = useTechniciens();

  function reinitialiserFiltres() {
    setClient("");
    setTechnicienId("");
    setPage(1);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Zone fixe : titre, légende, actions, filtres */}
      <div className="shrink-0">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.06em] text-text-weak">
          <span>Opérations</span>
          <span className="opacity-50">/</span>
          <span className="font-semibold text-text-soft">Interventions</span>
        </div>

        <div className="mb-5 flex items-end justify-between gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-baseline gap-3.5">
              <h1 className="font-serif text-[44px] font-normal leading-[1.05] tracking-[-0.035em] text-ink-1">
                Interventions<span className="italic">.</span>
              </h1>
              {/* Selecteur de statut : pas encore fonctionnel (US3.4 Nice to
                  have, hors perimetre MVP). Span inerte, meme convention que
                  les icones Techniciens/Parametres du rail (Rail.tsx). */}
              <span
                aria-hidden
                className="inline-flex cursor-default items-center gap-1 rounded-md py-1 pl-2.5 pr-2 text-[13px] font-medium text-text-soft"
              >
                Toutes
                <ChevronDown size={14} strokeWidth={1.75} />
              </span>
            </div>
            {interventions.data && (
              <p className="max-w-[640px] text-sm leading-[1.5] text-text-soft">
                <span className="font-semibold text-ink-1">{interventions.data.total}</span> interventions au
                total — <span className="font-semibold text-ink-1">{interventions.data.parStatut.PLANIFIEE}</span>{" "}
                planifiées, <span className="font-semibold text-ink-1">{interventions.data.parStatut.REALISEE}</span>{" "}
                réalisées, <span className="font-semibold text-ink-1">{interventions.data.parStatut.ANNULEE}</span>{" "}
                annulées.
              </p>
            )}
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            {/* Bouton Filtres : pas encore fonctionnel (periode + mot-cle,
                US3.4/3.5/3.8 Nice to have, hors perimetre MVP). Meme
                convention inerte que le selecteur de statut ci-dessus. */}
            <span
              aria-hidden
              className="inline-flex h-9 cursor-default items-center justify-center gap-2 rounded-md border border-line px-4 text-[13px] font-medium text-ink-1"
            >
              <Filter size={14} strokeWidth={1.75} />
              Filtres
            </span>
            <Link href="/interventions/nouvelle">
              <Button variant="primary" size="sm">
                <Plus size={14} strokeWidth={1.75} />
                Nouvelle intervention
              </Button>
            </Link>
          </div>
        </div>

        <InterventionsFiltres
          client={client}
          onClientChange={(value) => {
            setClient(value);
            setPage(1);
          }}
          technicienId={technicienId}
          onTechnicienIdChange={(value) => {
            setTechnicienId(value);
            setPage(1);
          }}
          techniciens={techniciens.data ?? []}
        />
      </div>

      {/* Zone scrollable : uniquement la liste */}
      <div
        className={`min-h-0 flex-1 overflow-y-auto transition-opacity ${
          interventions.isFetching && !interventions.isPending ? "opacity-50" : ""
        }`}
      >
        {interventions.isPending && <InterventionsTableSkeleton />}

        {interventions.isError && (
          <StatePanel
            tone="danger"
            kicker="Erreur de chargement"
            title={
              <>
                Impossible de charger les <span className="italic">interventions</span>.
              </>
            }
            description="Une erreur est survenue lors de la récupération des données. Vérifiez votre connexion, puis réessayez."
            actions={
              <Button variant="secondary" size="sm" onClick={() => interventions.refetch()}>
                <RotateCw size={14} strokeWidth={1.75} />
                Réessayer
              </Button>
            }
          />
        )}

        {interventions.data && interventions.data.data.length === 0 && filtreActif && (
          <StatePanel
            kicker="Aucun résultat"
            title={
              <>
                Aucune intervention ne correspond <span className="italic">à ces filtres</span>.
              </>
            }
            description="Essayez un autre nom de client ou un autre technicien."
            actions={
              <Button variant="secondary" size="sm" onClick={reinitialiserFiltres}>
                Réinitialiser les filtres
              </Button>
            }
          />
        )}

        {interventions.data && interventions.data.data.length === 0 && !filtreActif && (
          <StatePanel
            kicker="Aucune donnée"
            title={
              <>
                Aucune intervention <span className="italic">pour le moment</span>.
              </>
            }
            description="Commencez par créer votre première intervention. Vous pourrez ensuite l'attribuer à un technicien et suivre son avancement depuis cette page."
            actions={
              <Link href="/interventions/nouvelle">
                <Button variant="primary" size="sm">
                  <Plus size={14} strokeWidth={1.75} />
                  Nouvelle intervention
                </Button>
              </Link>
            }
          />
        )}

        {interventions.data && interventions.data.data.length > 0 && (
          <InterventionsTable
            interventions={interventions.data.data}
            techniciens={techniciens.data ?? []}
          />
        )}
      </div>

      {/* Zone fixe : pagination */}
      {interventions.data && interventions.data.data.length > 0 && (
        <div className="shrink-0">
          <InterventionsPagination
            page={interventions.data.page}
            limit={interventions.data.limit}
            total={interventions.data.total}
            onPageChange={setPage}
            disabled={interventions.isFetching}
          />
        </div>
      )}
    </div>
  );
}
