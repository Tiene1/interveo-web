import type { InterventionStatut } from "@/components/ui/StatusChip";

export type { InterventionStatut };

export interface Intervention {
  id: string;
  nomClient: string;
  adresse: string;
  telephone1: string;
  telephone2: string | null;
  geolocalisation: string | null;
  motifSignale: string | null;
  datePrevue: string;
  technicienId: string;
  creeParId: string;
  typeEquipement: string | null;
  problemeConstate: string | null;
  travauxRealises: string | null;
  statut: InterventionStatut;
  dateRealisation: string | null;
  creeLe: string;
  misAJourLe: string;
}

export interface PageInterventions {
  data: Intervention[];
  total: number;
  page: number;
  limit: number;
  parStatut: Record<InterventionStatut, number>;
}

export interface Technicien {
  id: string;
  nom: string;
  identifiant: string;
  role: "TECHNICIEN" | "DIRECTEUR";
  actif: boolean;
}

export type CategoriePhoto = "AVANT" | "APRES";

export interface Photo {
  id: string;
  interventionId: string;
  categorie: CategoriePhoto;
  cheminFichier: string;
  creeLe: string;
}

export interface InterventionDetail extends Intervention {
  photos: Photo[];
  technicien: Technicien;
}
