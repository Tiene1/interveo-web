"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Rail } from "./Rail";

function formatHorodatage(date: Date): string {
  const jour = date.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" });
  const heure = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return `${jour} · ${heure}`;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [horodatage, setHorodatage] = useState<string | null>(null);

  useEffect(() => {
    setHorodatage(formatHorodatage(new Date()));
    const id = setInterval(() => setHorodatage(formatHorodatage(new Date())), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid min-h-screen grid-cols-[56px_1fr] border-t-2 border-brand">
      <Rail />
      <div className="flex min-w-0 flex-col bg-paper">
        <div className="flex items-center justify-between px-10 pt-5 text-[11px] font-medium uppercase tracking-[0.08em] text-text-weak">
          <span>SIM · Interventions</span>
          <span className="font-mono normal-case tracking-[0.02em] text-text-soft">{horodatage}</span>
        </div>
        <div className="mx-auto w-full max-w-[1200px] flex-1 px-10 pb-12 pt-8">{children}</div>
      </div>
    </div>
  );
}
