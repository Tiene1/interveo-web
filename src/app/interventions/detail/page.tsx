"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { RouteGuard } from "@/features/auth/lib/RouteGuard";
import { InterventionDetail } from "@/features/interventions/components/InterventionDetail";

/**
 * "/interventions/detail?id=..." plutot que "/interventions/[id]" : une route
 * dynamique par segment exige generateStaticParams (connu au build) avec
 * output: 'export', impossible ici (les interventions se creent en continu).
 * Le paramètre de requete est lu cote client, cf. docs/architecture.md.
 */
function DetailContenu() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const retour = searchParams.get("retour");

  if (!id) {
    return <p className="pt-10 text-sm text-danger">Intervention introuvable.</p>;
  }

  return <InterventionDetail id={id} hrefListe={retour ? `/interventions?${retour}` : "/interventions"} />;
}

export default function InterventionDetailPage() {
  return (
    <RouteGuard>
      <AppShell>
        <Suspense fallback={null}>
          <DetailContenu />
        </Suspense>
      </AppShell>
    </RouteGuard>
  );
}
