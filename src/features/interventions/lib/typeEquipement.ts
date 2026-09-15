export const OPTIONS_TYPE_EQUIPEMENT = [
  { value: "", label: "Non renseigné" },
  { value: "CLIMATISATION", label: "Climatisation" },
  { value: "GROUPE_ELECTROGENE", label: "Groupe électrogène" },
  { value: "INSTALLATION_ELECTRIQUE", label: "Installation électrique" },
  { value: "AUTRE", label: "Autre" },
];

const LIBELLES: Record<string, string> = Object.fromEntries(
  OPTIONS_TYPE_EQUIPEMENT.filter((option) => option.value).map((option) => [option.value, option.label]),
);

/** Libellé français d'un type d'équipement, ou la valeur brute si inconnue. */
export function libelleTypeEquipement(valeur: string): string {
  return LIBELLES[valeur] ?? valeur;
}
