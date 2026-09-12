"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { StatusChip } from "@/components/ui/StatusChip";
import { formatDateTime } from "@/lib/utils/date";
import { referenceCourte } from "../lib/reference";
import type { Intervention, Technicien } from "../types/intervention";

const TH_CLASSES =
  "sticky top-0 z-10 border-b border-line bg-paper pb-3 pt-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-text-weak";
const TD_CLASSES = "border-b border-line-soft py-4 align-middle text-ink-1";

function initiales(nom: string): string {
  return nom
    .split(" ")
    .map((mot) => mot[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface InterventionsTableProps {
  interventions: Intervention[];
  techniciens: Technicien[];
}

export function InterventionsTable({ interventions, techniciens }: InterventionsTableProps) {
  const router = useRouter();
  const nomTechnicien = (id: string) => techniciens.find((technicien) => technicien.id === id)?.nom ?? "—";

  return (
    <table className="w-full border-collapse text-[13px]">
      <thead>
        <tr>
          <th className={`${TH_CLASSES} w-[120px] pl-0`}>Réf.</th>
          <th className={`${TH_CLASSES} w-[30%]`}>Client</th>
          <th className={`${TH_CLASSES} w-[170px]`}>Date prévue</th>
          <th className={`${TH_CLASSES} w-[20%]`}>Technicien</th>
          <th className={`${TH_CLASSES} w-[140px]`}>Statut</th>
          <th className={`${TH_CLASSES} w-9 pr-0`} />
        </tr>
      </thead>
      <tbody>
        {interventions.map((intervention) => (
          <tr
            key={intervention.id}
            onClick={() => router.push(`/interventions/detail?id=${intervention.id}`)}
            className="group cursor-pointer transition-colors hover:bg-zebra"
          >
            <td className={`${TD_CLASSES} pl-0 font-mono text-[11px] text-text-weak`}>
              #{referenceCourte(intervention.id)}
            </td>
            <td className={TD_CLASSES}>
              <span className="block text-sm font-semibold leading-tight text-ink-1">
                {intervention.nomClient}
              </span>
              <span className="mt-0.5 block text-xs leading-tight text-text-soft">{intervention.adresse}</span>
            </td>
            <td className={`${TD_CLASSES} whitespace-nowrap font-mono text-[12.5px]`}>
              {formatDateTime(intervention.datePrevue)}
            </td>
            <td className={TD_CLASSES}>
              <span className="inline-flex items-center gap-2.5">
                <span className="rounded border border-line bg-paper px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-text-weak">
                  {initiales(nomTechnicien(intervention.technicienId))}
                </span>
                <span className="text-[13px] font-medium text-ink-1">
                  {nomTechnicien(intervention.technicienId)}
                </span>
              </span>
            </td>
            <td className={TD_CLASSES}>
              <StatusChip statut={intervention.statut} />
            </td>
            <td className={`${TD_CLASSES} pr-0 text-right text-text-weak opacity-0 transition-opacity group-hover:opacity-100`}>
              <ChevronRight size={14} strokeWidth={1.75} className="ml-auto" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
