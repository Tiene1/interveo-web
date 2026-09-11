/** Format design/DESIGN-SYSTEM.md §10 : "14/09/2026 · 09:00" (JetBrains Mono a l'affichage). */
export function formatDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const jour = date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const heure = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return `${jour} · ${heure}`;
}
