import { jsPDF } from "jspdf";
import { libelleStatut } from "@/components/ui/StatusChip";
import { formatDateTime } from "@/lib/utils/date";
import { nonRenseigne } from "@/lib/utils/text";
import { libelleTypeEquipement } from "./typeEquipement";
import type { InterventionDetail } from "../types/intervention";

const MARGE = 15;
const LARGEUR_PAGE = 210; // A4, mm
const LARGEUR_TEXTE = LARGEUR_PAGE - MARGE * 2;
const LARGEUR_LABEL = 45;

function champ(doc: jsPDF, y: number, label: string, valeur: string): number {
  doc.setFont("helvetica", "bold");
  doc.text(label, MARGE, y);
  doc.setFont("helvetica", "normal");
  doc.text(valeur, MARGE + LARGEUR_LABEL, y);
  return y + 7;
}

function paragraphe(doc: jsPDF, y: number, titre: string, texte: string): number {
  doc.setFont("helvetica", "bold");
  doc.text(titre, MARGE, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  const lignes: string[] = doc.splitTextToSize(texte, LARGEUR_TEXTE);
  doc.text(lignes, MARGE, y);
  return y + lignes.length * 5 + 6;
}

/** US3.9. PDF texte seul (pas de photos, decide avec Cedric), genere cote client depuis les donnees deja chargees du detail. */
export function genererPdfIntervention(intervention: InterventionDetail): jsPDF {
  const doc = new jsPDF();
  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Rapport d'intervention", MARGE, y);
  y += 4;
  doc.setLineWidth(0.3);
  doc.line(MARGE, y, LARGEUR_PAGE - MARGE, y);
  y += 10;

  doc.setFontSize(11);
  y = champ(doc, y, "Client", intervention.nomClient);
  y = champ(doc, y, "Adresse", intervention.adresse);
  y = champ(
    doc,
    y,
    "Téléphone",
    [intervention.telephone1, intervention.telephone2].filter(Boolean).join(" / "),
  );
  if (intervention.geolocalisation) {
    y = champ(doc, y, "Géolocalisation", intervention.geolocalisation);
  }
  y = champ(doc, y, "Date prévue", formatDateTime(intervention.datePrevue));
  if (intervention.dateRealisation) {
    y = champ(doc, y, "Date de réalisation", formatDateTime(intervention.dateRealisation));
  }
  y = champ(doc, y, "Technicien", intervention.technicien.nom);
  y = champ(doc, y, "Statut", libelleStatut(intervention.statut));
  if (intervention.typeEquipement) {
    y = champ(doc, y, "Type d'équipement", libelleTypeEquipement(intervention.typeEquipement));
  }

  y += 5;
  y = paragraphe(doc, y, "Motif signalé", nonRenseigne(intervention.motifSignale));
  y = paragraphe(doc, y, "Problème constaté", nonRenseigne(intervention.problemeConstate));
  paragraphe(doc, y, "Travaux réalisés", nonRenseigne(intervention.travauxRealises));

  return doc;
}
