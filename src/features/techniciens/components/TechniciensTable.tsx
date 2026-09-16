import { formatDateTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import type { CompteTechnicien } from "../types/utilisateur";

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

function PuceStatutCompte({ actif }: { actif: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 text-[13px] font-medium text-ink-1">
      <span aria-hidden className={cn("h-2 w-2 rounded-[1.5px]", actif ? "bg-success" : "bg-text-weak")} />
      <span className={actif ? undefined : "text-text-soft"}>{actif ? "Actif" : "Inactif"}</span>
    </span>
  );
}

export function TechniciensTable({ techniciens }: { techniciens: CompteTechnicien[] }) {
  return (
    <table className="w-full border-collapse text-[13px]">
      <thead>
        <tr>
          <th className={`${TH_CLASSES} w-[38%] pl-0`}>Nom</th>
          <th className={`${TH_CLASSES} w-[26%]`}>Identifiant</th>
          <th className={`${TH_CLASSES} w-[140px]`}>Statut</th>
          <th className={`${TH_CLASSES} w-[170px] pr-0`}>Créé le</th>
        </tr>
      </thead>
      <tbody>
        {techniciens.map((technicien) => (
          <tr key={technicien.id} className="group transition-colors hover:bg-line-soft">
            <td className={`${TD_CLASSES} relative pl-0`}>
              <span
                aria-hidden
                className="absolute -left-2.5 top-0 bottom-0 w-0.5 bg-line-strong opacity-0 transition-opacity group-hover:opacity-100"
              />
              <span className="inline-flex items-center gap-2.5">
                <span className="rounded border border-line bg-paper px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-text-weak">
                  {initiales(technicien.nom)}
                </span>
                <span className="text-[13px] font-semibold text-ink-1">{technicien.nom}</span>
              </span>
            </td>
            <td className={`${TD_CLASSES} font-mono text-[12.5px] text-text-soft`}>{technicien.identifiant}</td>
            <td className={TD_CLASSES}>
              <PuceStatutCompte actif={technicien.actif} />
            </td>
            <td className={`${TD_CLASSES} whitespace-nowrap pr-0 font-mono text-[12.5px] text-text-soft`}>
              {formatDateTime(technicien.creeLe)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
