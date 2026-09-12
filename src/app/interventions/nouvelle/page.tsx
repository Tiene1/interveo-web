"use client";

import { AppShell } from "@/components/layout/AppShell";
import { RouteGuard } from "@/features/auth/lib/RouteGuard";
import { InterventionForm } from "@/features/interventions/components/InterventionForm";

export default function NouvelleInterventionPage() {
  return (
    <RouteGuard>
      <AppShell>
        <InterventionForm mode="creer" />
      </AppShell>
    </RouteGuard>
  );
}
