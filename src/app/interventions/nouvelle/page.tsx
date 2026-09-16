"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { RouteGuard } from "@/features/auth/lib/RouteGuard";
import { InterventionForm } from "@/features/interventions/components/InterventionForm";

function NouvelleContenu() {
  const searchParams = useSearchParams();
  const retour = searchParams.get("retour");

  return <InterventionForm mode="creer" hrefListe={retour ? `/interventions?${retour}` : "/interventions"} />;
}

export default function NouvelleInterventionPage() {
  return (
    <RouteGuard>
      <AppShell>
        <Suspense fallback={null}>
          <NouvelleContenu />
        </Suspense>
      </AppShell>
    </RouteGuard>
  );
}
