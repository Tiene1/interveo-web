import { libelleStatut } from "@/components/ui/StatusChip";
import { formatDateTime } from "@/lib/utils/date";
import { libelleTypeEquipement } from "./typeEquipement";
import type { InterventionExport } from "../types/intervention";

const ENTETES = [
  "Client",
  "Adresse",
  "Téléphone",
  "Date prévue",
  "Technicien",
  "Statut",
  "Type d'équipement",
  "Date de réalisation",
  "Problème constaté",
  "Travaux réalisés",
];

/** Échappe un champ pour un CSV séparé par `;` (guillemets systématiques, plus simple et sans risque). */
function champCsv(valeur: string): string {
  return `"${valeur.replace(/"/g, '""')}"`;
}

function ligneCsv(intervention: InterventionExport): string {
  return [
    intervention.nomClient,
    intervention.adresse,
    intervention.telephone1,
    formatDateTime(intervention.datePrevue),
    intervention.technicien.nom,
    libelleStatut(intervention.statut),
    intervention.typeEquipement ? libelleTypeEquipement(intervention.typeEquipement) : "",
    intervention.dateRealisation ? formatDateTime(intervention.dateRealisation) : "",
    intervention.problemeConstate ?? "",
    intervention.travauxRealises ?? "",
  ]
    .map(champCsv)
    .join(";");
}

/**
 * US3.10. Séparateur `;` (pas `,`) : Excel en locale française interprète la
 * virgule comme séparateur décimal, `,` comme séparateur de liste ouvrirait
 * le fichier en une seule colonne sans l'assistant d'import.
 */
export function genererCsvInterventions(interventions: InterventionExport[]): string {
  return [ENTETES.map(champCsv).join(";"), ...interventions.map(ligneCsv)].join("\r\n");
}
