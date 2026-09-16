"use client";

import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatePanel } from "@/components/ui/StatePanel";
import { useComptesTechniciens } from "../hooks/useComptesTechniciens";
import { TechniciensTable } from "./TechniciensTable";

/** US4.6. Lecture seule pour ce ticket : creer/desactiver/reinitialiser
 * le mot de passe sont des tickets separes (US4.5, US4.7, US4.9). */
export function TechniciensListe() {
  const techniciens = useComptesTechniciens();

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.06em] text-text-weak">
          <span>Administration</span>
          <span className="opacity-50">/</span>
          <span className="font-semibold text-text-soft">Techniciens</span>
        </div>

        <div className="mb-5 flex flex-col gap-3">
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
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
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
            description="Les comptes techniciens sont créés par l'équipe technique."
          />
        )}

        {techniciens.data && techniciens.data.length > 0 && (
          <TechniciensTable techniciens={techniciens.data} />
        )}
      </div>
    </div>
  );
}
