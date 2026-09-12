"use client";

import { AppShell } from "@/components/layout/AppShell";
import { RouteGuard } from "@/features/auth/lib/RouteGuard";
import { NouvelleInterventionForm } from "@/features/interventions/components/NouvelleInterventionForm";

export default function NouvelleInterventionPage() {
  return (
    <RouteGuard>
      <AppShell>
        <NouvelleInterventionForm />
      </AppShell>
    </RouteGuard>
  );
}
