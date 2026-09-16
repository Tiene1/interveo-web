import { describe, expect, it } from "vitest";
import { genererCsvInterventions } from "./csv";
import type { InterventionExport } from "../types/intervention";

function intervention(partiel: Partial<InterventionExport> = {}): InterventionExport {
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
    technicien: { nom: "Awa Traoré" },
    ...partiel,
  };
}

describe("genererCsvInterventions", () => {
  it("genere l'entete puis une ligne par intervention, separees par ;", () => {
    const csv = genererCsvInterventions([intervention()]);
    const [entete, ligne] = csv.split("\r\n");

    expect(entete).toBe(
      '"Client";"Adresse";"Téléphone";"Date prévue";"Technicien";"Statut";"Type d\'équipement";"Date de réalisation";"Problème constaté";"Travaux réalisés"',
    );
    expect(ligne).toContain('"Hôtel Ivoire"');
    expect(ligne).toContain('"Awa Traoré"');
    expect(ligne).toContain('"Planifiée"');
    expect(ligne.split(";")).toHaveLength(10);
  });

  it("traduit le statut et le type d'equipement en libelle francais", () => {
    const csv = genererCsvInterventions([
      intervention({ statut: "REALISEE", typeEquipement: "GROUPE_ELECTROGENE" }),
    ]);

    expect(csv).toContain('"Réalisée"');
    expect(csv).toContain('"Groupe électrogène"');
  });

  it("echappe les guillemets internes et laisse les points-virgules dans le champ", () => {
    const csv = genererCsvInterventions([
      intervention({ problemeConstate: 'Fuite ; bruit "anormal"' }),
    ]);

    expect(csv).toContain('"Fuite ; bruit ""anormal"""');
  });

  it("laisse les champs nullables vides plutot que 'null'", () => {
    const csv = genererCsvInterventions([intervention()]);

    expect(csv).not.toContain("null");
  });

  it("ne genere que l'entete quand la liste est vide", () => {
    const csv = genererCsvInterventions([]);

    expect(csv.split("\r\n")).toHaveLength(1);
  });
});
