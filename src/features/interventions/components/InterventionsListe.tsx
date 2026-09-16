"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, Plus, RotateCw } from "lucide-react";
import { apiRequest } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { StatePanel } from "@/components/ui/StatePanel";
import { useDebouncedValue } from "@/lib/utils/useDebouncedValue";
import { genererCsvInterventions } from "../lib/csv";
import type { InterventionExport } from "../types/intervention";
import { construireParamsFiltre, useInterventions } from "../hooks/useInterventions";
import { useTechniciens } from "../hooks/useTechniciens";
import { InterventionsFiltres } from "./InterventionsFiltres";
import { InterventionsFiltresPanneau } from "./InterventionsFiltresPanneau";
import { InterventionsTable } from "./InterventionsTable";
import { InterventionsTableSkeleton } from "./InterventionsTableSkeleton";
import { InterventionsPagination } from "./InterventionsPagination";

const OPTIONS_STATUT = [
  { value: "", label: "Toutes" },
  { value: "PLANIFIEE", label: "Planifiées" },
  { value: "REALISEE", label: "Réalisées" },
  { value: "ANNULEE", label: "Annulées" },
];

export function InterventionsListe() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
  const [technicienId, setTechnicienId] = useState(() => searchParams.get("technicienId") ?? "");
  const [statut, setStatut] = useState(() => searchParams.get("statut") ?? "");
  const [dateDebut, setDateDebut] = useState(() => searchParams.get("dateDebut") ?? "");
  const [dateFin, setDateFin] = useState(() => searchParams.get("dateFin") ?? "");
  const [motCle, setMotCle] = useState(() => searchParams.get("motCle") ?? "");
  const motCleDebounce = useDebouncedValue(motCle);
  const filtreActif =
    technicienId !== "" ||
    statut !== "" ||
    dateDebut !== "" ||
    dateFin !== "" ||
    motCle !== "";

  /**
   * Retour de Cedric le 2026-09-16 : filtrer puis ouvrir une intervention
   * (ou en creer une) puis revenir en arriere reinitialisait la liste. La
   * query de "/interventions" reflete desormais toujours les filtres actifs
   * (remplacee, jamais empilee dans l'historique), et "Nouvelle intervention"
   * / la navigation vers le detail transmettent cette query en `retour` pour
   * que le bouton Retour de ces ecrans y revienne telle quelle.
   */
  const queryFiltre = construireParamsFiltre({
    page,
    technicienId,
    statut,
    dateDebut,
    dateFin,
    motCle: motCleDebounce,
  }).toString();
  const hrefNouvelle = `/interventions/nouvelle${queryFiltre ? `?retour=${encodeURIComponent(queryFiltre)}` : ""}`;

  useEffect(() => {
    router.replace(`/interventions${queryFiltre ? `?${queryFiltre}` : ""}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryFiltre]);

  const interventions = useInterventions({
    page,
    technicienId,
    statut,
    dateDebut,
    dateFin,
    motCle: motCleDebounce,
  });
  const techniciens = useTechniciens();

  function reinitialiserFiltres() {
    setTechnicienId("");
    setStatut("");
    setDateDebut("");
    setDateFin("");
    setMotCle("");
    setPage(1);
  }

  const [exportEnCours, setExportEnCours] = useState(false);
  const [erreurExport, setErreurExport] = useState(false);

  async function exporterCsv() {
    setExportEnCours(true);
    setErreurExport(false);
    try {
      const params = construireParamsFiltre({
        technicienId,
        statut,
        dateDebut,
        dateFin,
        motCle: motCleDebounce,
      });
      const query = params.toString();
      const donnees = await apiRequest<InterventionExport[]>(
        `/interventions/export${query ? `?${query}` : ""}`,
      );
      const csv = genererCsvInterventions(donnees);
      const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" }));
      const lien = document.createElement("a");
      lien.href = url;
      lien.download = "interventions.csv";
      lien.click();
      URL.revokeObjectURL(url);
    } catch {
      setErreurExport(true);
    } finally {
      setExportEnCours(false);
    }
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
              <Select
                variant="inline"
                value={statut}
                onChange={(value) => {
                  setStatut(value);
                  setPage(1);
                }}
                ariaLabel="Filtrer par statut"
                options={OPTIONS_STATUT}
              />
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
            <InterventionsFiltresPanneau
              dateDebut={dateDebut}
              onDateDebutChange={(value) => {
                setDateDebut(value);
                setPage(1);
              }}
              dateFin={dateFin}
              onDateFinChange={(value) => {
                setDateFin(value);
                setPage(1);
              }}
            />
            <Button variant="secondary" size="sm" onClick={exporterCsv} disabled={exportEnCours}>
              {exportEnCours ? <Spinner /> : <Download size={14} strokeWidth={1.75} />}
              Exporter CSV
            </Button>
            <Link href={hrefNouvelle}>
              <Button variant="primary" size="sm">
                <Plus size={14} strokeWidth={1.75} />
                Nouvelle intervention
              </Button>
            </Link>
          </div>
        </div>

        {erreurExport && (
          <p className="mb-3 text-[13px] font-medium text-danger">
            Échec de l&apos;export CSV, réessayez.
          </p>
        )}

        <InterventionsFiltres
          motCle={motCle}
          onMotCleChange={(value) => {
            setMotCle(value);
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
            description="Essayez un autre nom de client, un autre technicien, un autre statut, une autre période ou un autre mot-clé."
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
              <Link href={hrefNouvelle}>
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
            retourQuery={queryFiltre}
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
