import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BoutonRetourProps {
  /** Cible du lien. Par defaut, la liste des interventions. */
  href?: string;
}

/**
 * Fixe (sticky) en haut de la zone de defilement, le 2026-09-18 (retour de
 * Cedric : sur une page longue, il fallait remonter tout en haut pour
 * retrouver le bouton). `flex w-full` + fond opaque (au lieu de l'ancien
 * `inline-flex`) pour masquer completement le contenu qui defile en dessous,
 * pas seulement derriere le texte du bouton.
 */
export function BoutonRetour({ href = "/interventions" }: BoutonRetourProps) {
  return (
    <Link
      href={href}
      className="sticky top-0 z-10 mb-4 flex items-center gap-1.5 bg-paper py-3 text-[13px] font-medium text-text-soft hover:text-ink-1"
    >
      <ArrowLeft size={14} strokeWidth={1.75} />
      Retour
    </Link>
  );
}
