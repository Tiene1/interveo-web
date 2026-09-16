export interface CompteTechnicien {
  id: string;
  nom: string;
  identifiant: string;
  role: "TECHNICIEN" | "DIRECTEUR";
  actif: boolean;
  creeLe: string;
  misAJourLe: string;
}
