/**
 * Reference courte purement visuelle (design/DESIGN-SYSTEM.md §10 : "#0142").
 * Il n'existe pas de numero de ticket sequentiel cote backend : on derive
 * un identifiant compact et stable a partir de l'UUID de l'intervention.
 */
export function referenceCourte(id: string): string {
  return id.replace(/-/g, "").slice(-4).toUpperCase();
}
