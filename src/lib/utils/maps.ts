/**
 * M. Kouassi peut saisir soit un lien Google Maps colle tel quel, soit des
 * coordonnees ou une adresse texte. Dans le second cas on construit un lien
 * de recherche Google Maps.
 */
export function lienGoogleMaps(geolocalisation: string): string {
  const valeur = geolocalisation.trim();
  if (valeur.startsWith("http://") || valeur.startsWith("https://")) {
    return valeur;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(valeur)}`;
}
