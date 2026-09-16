import { AppShell } from "@/components/layout/AppShell";
import { RouteGuard } from "@/features/auth/lib/RouteGuard";
import { TechniciensListe } from "@/features/techniciens/components/TechniciensListe";

export default function TechniciensPage() {
  return (
    <RouteGuard>
      <AppShell>
        <TechniciensListe />
      </AppShell>
    </RouteGuard>
  );
}
