"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Rail } from "./Rail";
import { useMoi } from "@/features/auth/hooks/useMoi";
import { salutation } from "@/lib/utils/date";

function formatHorodatage(date: Date): string {
  const jour = date.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" });
  const heure = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return `${jour} · ${heure}`;
}

/**
 * Retour de Cedric le 2026-09-18 : "comme les apps mobiles modernes qui
 * affichent bonjour ou bonsoir", equivalent web du nom du technicien deja
 * affiche cote mobile. Remplace le kicker statique "Interveo" par une
 * salutation dynamique une fois le profil charge (GET /auth/moi, deja
 * utilise par RouteGuard/mobile) ; retombe sur le libelle statique pendant
 * le chargement ou si la requete echoue, pas de flash a vide.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [horodatage, setHorodatage] = useState<string | null>(null);
  const [salutationActuelle, setSalutationActuelle] = useState<string | null>(null);
  const moi = useMoi();

  useEffect(() => {
    function actualiser() {
      const maintenant = new Date();
      setHorodatage(formatHorodatage(maintenant));
      setSalutationActuelle(salutation(maintenant));
    }
    actualiser();
    const id = setInterval(actualiser, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid h-screen grid-cols-[56px_1fr] overflow-hidden border-t-2 border-brand">
      <Rail />
      <div className="flex h-full min-w-0 flex-col overflow-hidden bg-paper">
        <div className="flex shrink-0 items-center justify-between px-10 pt-5 pb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-text-weak">
          <span>
            {moi.data && salutationActuelle ? `${salutationActuelle}, ${moi.data.nom}` : "Interveo"}
          </span>
          <span className="font-mono normal-case tracking-[0.02em] text-text-soft">{horodatage}</span>
        </div>
        <div className="mx-auto flex w-full min-h-0 max-w-[1200px] flex-1 flex-col overflow-hidden px-10 pb-8 pt-7">
          {children}
        </div>
      </div>
    </div>
  );
}
