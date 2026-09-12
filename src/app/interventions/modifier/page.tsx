"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { RouteGuard } from "@/features/auth/lib/RouteGuard";
import { InterventionForm } from "@/features/interventions/components/InterventionForm";
import { StatePanel } from "@/components/ui/StatePanel";
import { useIntervention } from "@/features/interventions/hooks/useIntervention";

function ModifierContenu({ id }: { id: string }) {
  const intervention = useIntervention(id);

  if (intervention.isPending) {
    return <p className="pt-10 text-sm text-text-soft">Chargement…</p>;
  }

  if (intervention.isError) {
    return (
      <StatePanel
        tone="danger"
        kicker="Erreur de chargement"
        title={
          <>
            Impossible de charger cette <span className="italic">intervention</span>.
          </>
        }
        description="Une erreur est survenue lors de la récupération des données. Vérifiez votre connexion, puis réessayez."
      />
    );
  }

  if (intervention.data.statut !== "PLANIFIEE") {
    return (
      <StatePanel
        tone="danger"
        kicker="Modification impossible"
        title={
          <>
            Cette intervention n&apos;est plus <span className="italic">modifiable</span>.
          </>
        }
        description="Seule une intervention encore Planifiée peut être modifiée."
        actions={
          <Link href={`/interventions/detail?id=${id}`}>
            <Button variant="secondary" size="sm">
              Retour au détail
            </Button>
          </Link>
        }
      />
    );
  }

  return <InterventionForm mode="modifier" intervention={intervention.data} />;
}

function ModifierRacine() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) {
    return <p className="pt-10 text-sm text-danger">Intervention introuvable.</p>;
  }

  return <ModifierContenu id={id} />;
}

export default function ModifierInterventionPage() {
  return (
    <RouteGuard>
      <AppShell>
        <Suspense fallback={null}>
          <ModifierRacine />
        </Suspense>
      </AppShell>
    </RouteGuard>
  );
}
