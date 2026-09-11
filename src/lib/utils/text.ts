/** Convention design/DESIGN-SYSTEM.md §6 : toujours "— non renseigné —" (cadratins), jamais un tiret simple. */
export function nonRenseigne(value: string | null | undefined): string {
  return value && value.trim() !== "" ? value : "— non renseigné —";
}
