"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RouteGuard } from "@/features/auth/lib/RouteGuard";
import { InterventionsListe } from "@/features/interventions/components/InterventionsListe";

export default function InterventionsPage() {
  return (
    <RouteGuard>
      <AppShell>
        <Suspense fallback={null}>
          <InterventionsListe />
        </Suspense>
      </AppShell>
    </RouteGuard>
  );
}
