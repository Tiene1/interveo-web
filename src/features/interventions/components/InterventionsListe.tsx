"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, RotateCw } from "lucide-react";
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
    <div>
      <div className="mb-7 flex items-end justify-between gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.06em] text-text-weak">
            <span>Opérations</span>
            <span className="opacity-50">/</span>
            <span className="font-semibold text-text-soft">Interventions</span>
          </div>
          <h1 className="font-serif text-[44px] font-normal leading-[1.05] tracking-[-0.035em] text-ink-1">
            Interventions<span className="italic">.</span>
          </h1>
          {interventions.data && (
            <p className="max-w-[640px] text-sm leading-[1.5] text-text-soft">
              <span className="font-semibold text-ink-1">{interventions.data.total}</span> interventions au
              total, les plus récentes en premier.
            </p>
          )}
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
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
        <>
          <InterventionsTable
            interventions={interventions.data.data}
            techniciens={techniciens.data ?? []}
          />
          <InterventionsPagination
            page={interventions.data.page}
            limit={interventions.data.limit}
            total={interventions.data.total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
