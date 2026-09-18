/** Format design/DESIGN-SYSTEM.md §10 : "14/09/2026 · 09:00" (JetBrains Mono a l'affichage). */
export function formatDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const jour = date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const heure = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return `${jour} · ${heure}`;
}

/**
 * Salutation dynamique selon l'heure, utilisee en tete d'AppShell (retour de
 * Cedric le 2026-09-18 : "comme les apps mobiles modernes qui affichent
 * bonjour ou bonsoir"). Equivalent Dart dans mobile/lib/utils/date.dart
 * (memes bornes, dupliquees faute de code partage entre les deux stacks).
 */
export function salutation(date: Date): string {
  const heure = date.getHours();
  if (heure < 5) return "Bonsoir";
  if (heure < 12) return "Bonjour";
  if (heure < 18) return "Bon après-midi";
  return "Bonsoir";
}
