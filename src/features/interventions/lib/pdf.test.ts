import { describe, expect, it } from "vitest";
import { genererPdfIntervention } from "./pdf";
import type { InterventionDetail } from "../types/intervention";

function intervention(partiel: Partial<InterventionDetail> = {}): InterventionDetail {
  return {
    id: "3915b537-5d7a-40b7-be54-87578e11be91",
    nomClient: "Hôtel Ivoire",
    adresse: "Boulevard Hassan II, Cocody",
    telephone1: "+2250700000001",
    telephone2: null,
    geolocalisation: null,
    motifSignale: null,
    datePrevue: "2026-09-20T09:00:00.000Z",
    technicienId: "tech-1",
    creeParId: "directeur-1",
    typeEquipement: null,
    problemeConstate: null,
    travauxRealises: null,
    statut: "PLANIFIEE",
    dateRealisation: null,
    creeLe: "2026-09-10T00:00:00.000Z",
    misAJourLe: "2026-09-10T00:00:00.000Z",
    photos: [],
    technicien: { id: "tech-1", nom: "Awa Traoré", identifiant: "awa", role: "TECHNICIEN", actif: true },
    ...partiel,
  };
}

describe("genererPdfIntervention", () => {
  it("genere un document contenant le nom du client et le technicien", () => {
    const doc = genererPdfIntervention(intervention());
    const texte = doc.output("datauristring");

    expect(texte.startsWith("data:application/pdf")).toBe(true);
    expect(doc.getNumberOfPages()).toBe(1);
  });

  it("n'echoue pas quand les champs optionnels sont absents", () => {
    expect(() => genererPdfIntervention(intervention())).not.toThrow();
  });

  it("n'echoue pas avec tous les champs optionnels renseignes (texte long)", () => {
    expect(() =>
      genererPdfIntervention(
        intervention({
          telephone2: "+2250700000002",
          geolocalisation: "https://maps.google.com/?q=5.32,-4.03",
          typeEquipement: "GROUPE_ELECTROGENE",
          motifSignale: "Le client signale un bruit anormal au démarrage.",
          problemeConstate:
            "Compresseur défaillant, fuite de gaz réfrigérant détectée sur le circuit principal. ".repeat(5),
          travauxRealises: "Remplacement du compresseur et recharge complète du circuit.",
          statut: "REALISEE",
          dateRealisation: "2026-09-21T14:00:00.000Z",
        }),
      ),
    ).not.toThrow();
  });
});
