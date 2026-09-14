"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, RotateCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatePanel } from "@/components/ui/StatePanel";
import { StatusChip } from "@/components/ui/StatusChip";
import { formatDateTime } from "@/lib/utils/date";
import { nonRenseigne } from "@/lib/utils/text";
import { lienGoogleMaps } from "@/lib/utils/maps";
import { useAnnulerIntervention } from "../hooks/useAnnulerIntervention";
import { useIntervention } from "../hooks/useIntervention";
import type { Photo } from "../types/intervention";
import { ConfirmationAnnulationModal } from "./ConfirmationAnnulationModal";
import { PhotoLightbox } from "./PhotoLightbox";
import { PhotoThumbnail } from "./PhotoThumbnail";

function BoutonRetour() {
  return (
    <Link
      href="/interventions"
      className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-text-soft hover:text-ink-1"
    >
      <ArrowLeft size={14} strokeWidth={1.75} />
      Retour
    </Link>
  );
}

function SideItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-line-soft py-1.5 last:border-none">
      <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-text-weak">{label}</span>
      <span className="text-sm font-medium leading-snug text-ink-1">{children}</span>
    </div>
  );
}

function SousSectionPhotos({
  titre,
  photos,
  onOuvrir,
}: {
  titre: string;
  photos: Photo[];
  onOuvrir: (index: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2 border-t border-line-soft pt-5 first:border-none first:pt-0">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-weak">{titre}</span>
        <span className="font-mono text-[11px] font-medium text-text-weak">{photos.length} / 2</span>
      </div>
      {photos.length === 0 ? (
        <p className="py-1.5 text-[13px] italic text-text-weak">Aucune photo</p>
      ) : (
        <div className="mt-1 flex flex-wrap gap-2.5">
          {photos.map((photo, index) => (
            <PhotoThumbnail key={photo.id} photo={photo} numero={index + 1} onClick={() => onOuvrir(index)} />
          ))}
        </div>
      )}
    </div>
  );
}

export function InterventionDetail({ id }: { id: string }) {
  const [modaleOuverte, setModaleOuverte] = useState(false);
  const [lightbox, setLightbox] = useState<{ photos: Photo[]; index: number } | null>(null);
  const intervention = useIntervention(id);
  const annuler = useAnnulerIntervention(id);

  if (intervention.isPending) {
    return <p className="pt-10 text-sm text-text-soft">Chargement…</p>;
  }

  if (intervention.isError) {
    return (
      <div>
        <BoutonRetour />
        <StatePanel
          tone="danger"
          kicker="Erreur de chargement"
          title={
            <>
              Impossible de charger cette <span className="italic">intervention</span>.
            </>
          }
          description="Une erreur est survenue lors de la récupération des données. Vérifiez votre connexion, puis réessayez."
          actions={
            <Button variant="secondary" size="sm" onClick={() => intervention.refetch()}>
              <RotateCw size={14} strokeWidth={1.75} />
              Réessayer
            </Button>
          }
        />
      </div>
    );
  }

  const data = intervention.data;
  const photosAvant = data.photos.filter((photo) => photo.categorie === "AVANT");
  const photosApres = data.photos.filter((photo) => photo.categorie === "APRES");
  const peutAnnuler = data.statut === "PLANIFIEE";

  return (
    <div className="pb-16">
      <BoutonRetour />

      <div className="mt-4 flex items-start justify-between gap-6 border-b border-ink-1 pb-6">
        <div className="flex min-w-0 flex-1 flex-col gap-3.5">
          <div className="flex items-center gap-3.5 font-mono text-[11px] font-medium text-text-weak">
            <span>Créée le {formatDateTime(data.creeLe)}</span>
          </div>
          <h1 className="font-serif text-[44px] font-normal leading-[1.05] tracking-[-0.035em] text-ink-1">
            {data.nomClient}
          </h1>
          <div className="flex flex-wrap items-center gap-5 text-[13px] text-text-soft">
            <StatusChip statut={data.statut} />
            {data.statut === "REALISEE" ? (
              <>
                <span className="inline-flex items-center gap-2 font-mono">
                  <span className="font-medium text-text-weak">Prévu</span>
                  <span className="font-medium text-ink-1">{formatDateTime(data.datePrevue)}</span>
                </span>
                {data.dateRealisation && (
                  <span className="inline-flex items-center gap-2 font-mono">
                    <span className="font-medium text-text-weak">Clôturée</span>
                    <span className="font-medium text-ink-1">{formatDateTime(data.dateRealisation)}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-2">
                  <span className="font-medium text-text-weak">Par</span>
                  <span className="font-medium text-ink-1">{data.technicien.nom}</span>
                </span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-2 font-mono">
                  <span className="font-medium text-text-weak">→</span>
                  <span className="font-medium text-ink-1">{formatDateTime(data.datePrevue)}</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="font-medium text-text-weak">Assigné à</span>
                  <span className="font-medium text-ink-1">{data.technicien.nom}</span>
                </span>
              </>
            )}
          </div>
        </div>
        {peutAnnuler && (
          <div className="flex flex-shrink-0 items-center gap-2">
            <Link href={`/interventions/modifier?id=${data.id}`}>
              <Button variant="secondary" size="sm">
                <Pencil size={14} strokeWidth={1.75} />
                Modifier
              </Button>
            </Link>
            <Button variant="danger-outline" size="sm" onClick={() => setModaleOuverte(true)}>
              <XCircle size={14} strokeWidth={1.75} />
              Annuler l&apos;intervention
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-[240px_1fr] gap-14 pt-8">
        <aside className="flex flex-col gap-7">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-weak">
              Client &amp; lieu
            </span>
            <SideItem label="Client">{data.nomClient}</SideItem>
            <SideItem label="Adresse">{data.adresse}</SideItem>
            <SideItem label="Téléphone 1">{data.telephone1}</SideItem>
            {data.telephone2 && <SideItem label="Téléphone 2">{data.telephone2}</SideItem>}
            <SideItem label="Géolocalisation">
              {data.geolocalisation ? (
                <a
                  href={lienGoogleMaps(data.geolocalisation)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand underline decoration-1 underline-offset-2 hover:text-brand-hover"
                >
                  Ouvrir dans Google Maps ↗
                </a>
              ) : (
                <span className="italic text-text-weak">{nonRenseigne(null)}</span>
              )}
            </SideItem>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-weak">
              Attribution
            </span>
            <SideItem label="Technicien">{data.technicien.nom}</SideItem>
            <SideItem label="Motif signalé">
              <span className={data.motifSignale ? undefined : "italic text-text-weak"}>
                {nonRenseigne(data.motifSignale)}
              </span>
            </SideItem>
            <SideItem label="Type d'équipement">
              <span className={data.typeEquipement ? undefined : "italic text-text-weak"}>
                {nonRenseigne(data.typeEquipement)}
              </span>
            </SideItem>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-11">
          <section>
            <div className="mb-5 flex items-baseline justify-between border-b border-line pb-3">
              <h2 className="font-serif text-[22px] font-normal tracking-[-0.02em] text-ink-1">
                <span className="italic">Compte rendu</span> terrain
              </h2>
              <span className="font-mono text-[11px] font-medium text-text-weak">01</span>
            </div>
            <div className="flex flex-col gap-5">
              <div>
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-text-weak">
                  Problème constaté
                </span>
                <p
                  className={`text-[15px] leading-[1.65] text-ink-1 ${data.problemeConstate ? "" : "italic text-text-weak"}`}
                >
                  {nonRenseigne(data.problemeConstate)}
                </p>
              </div>
              <div className="border-t border-line-soft pt-5">
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-text-weak">
                  Travaux réalisés
                </span>
                <p
                  className={`text-[15px] leading-[1.65] text-ink-1 ${data.travauxRealises ? "" : "italic text-text-weak"}`}
                >
                  {nonRenseigne(data.travauxRealises)}
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-5 flex items-baseline justify-between border-b border-line pb-3">
              <h2 className="font-serif text-[22px] font-normal tracking-[-0.02em] text-ink-1">
                <span className="italic">Photos</span> avant / après
              </h2>
              <span className="font-mono text-[11px] font-medium text-text-weak">02</span>
            </div>
            <div className="flex flex-col gap-5">
              <SousSectionPhotos
                titre="Avant"
                photos={photosAvant}
                onOuvrir={(index) => setLightbox({ photos: photosAvant, index })}
              />
              <SousSectionPhotos
                titre="Après"
                photos={photosApres}
                onOuvrir={(index) => setLightbox({ photos: photosApres, index })}
              />
            </div>
          </section>
        </div>
      </div>

      {modaleOuverte && (
        <ConfirmationAnnulationModal
          intervention={data}
          isPending={annuler.isPending}
          onCancel={() => setModaleOuverte(false)}
          onConfirm={() =>
            annuler.mutate(undefined, {
              onSuccess: () => setModaleOuverte(false),
            })
          }
        />
      )}

      {lightbox && (
        <PhotoLightbox
          photos={lightbox.photos}
          index={lightbox.index}
          intervention={data}
          onClose={() => setLightbox(null)}
          onIndexChange={(index) => setLightbox({ photos: lightbox.photos, index })}
        />
      )}
    </div>
  );
}
