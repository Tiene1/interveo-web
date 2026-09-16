"use client";

import { useState } from "react";
import { Plus, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatePanel } from "@/components/ui/StatePanel";
import { useComptesTechniciens } from "../hooks/useComptesTechniciens";
import { CreerCompteModal } from "./CreerCompteModal";
import { TechniciensTable } from "./TechniciensTable";

/** US4.6 (liste) + US4.5 (creation). Desactiver/reinitialiser le mot de
 * passe restent des tickets separes (US4.7, US4.9). */
export function TechniciensListe() {
  const techniciens = useComptesTechniciens();
  const [modaleCreationOuverte, setModaleCreationOuverte] = useState(false);

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
            description="Créez le premier compte pour qu'un technicien puisse se connecter sur mobile."
            actions={
              <Button variant="primary" size="sm" onClick={() => setModaleCreationOuverte(true)}>
                <Plus size={14} strokeWidth={1.75} />
                Créer un compte
              </Button>
            }
          />
        )}

        {techniciens.data && techniciens.data.length > 0 && (
          <TechniciensTable techniciens={techniciens.data} />
        )}
      </div>

      {modaleCreationOuverte && (
        <CreerCompteModal
          onClose={() => setModaleCreationOuverte(false)}
          onCreated={() => setModaleCreationOuverte(false)}
        />
      )}
    </div>
  );
}
