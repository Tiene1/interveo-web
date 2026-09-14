import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BoutonRetourProps {
  /** Cible du lien. Par defaut, la liste des interventions. */
  href?: string;
}

export function BoutonRetour({ href = "/interventions" }: BoutonRetourProps) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-text-soft hover:text-ink-1"
    >
      <ArrowLeft size={14} strokeWidth={1.75} />
      Retour
    </Link>
  );
}
