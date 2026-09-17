import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { CompteTechnicien } from "../types/utilisateur";

interface ConfirmationSuppressionCompteModalProps {
  technicien: CompteTechnicien;
  isPending: boolean;
  erreur: Error | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Le backend bloque la suppression (409) si le technicien a au moins une
 * intervention dans son historique (cf. backend/docs/architecture.md) : pas
 * de moyen cote client de le savoir a l'avance sans un nouvel appel reseau,
 * donc on tente la suppression et on affiche le message d'erreur serveur
 * tel quel en cas d'echec, meme principe que CreerCompteModal (409 identifiant).
 */
export function ConfirmationSuppressionCompteModal({
  technicien,
  isPending,
  erreur,
  onConfirm,
  onCancel,
}: ConfirmationSuppressionCompteModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-confirmation-suppression-compte"
      className="fixed inset-0 z-20 flex items-center justify-center bg-ink-1/55 p-6 backdrop-blur-[2px]"
    >
      <div className="flex w-[480px] flex-col gap-3 border border-line border-t-2 border-t-danger bg-paper p-8 shadow-[0_40px_80px_-20px_rgba(15,23,42,.35)]">
        <div className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-danger">
          <span aria-hidden className="h-px w-6 bg-danger" />
          Action irréversible
        </div>
        <h3
          id="titre-confirmation-suppression-compte"
          className="font-serif text-[26px] font-normal leading-[1.15] tracking-[-0.025em] text-ink-1"
        >
          Supprimer ce <span className="italic">compte</span> ?
        </h3>
        <p className="text-sm leading-[1.55] text-text-soft">
          <strong className="font-semibold text-ink-1">{technicien.nom}</strong> sera supprimé
          définitivement. Impossible si ce technicien a déjà des interventions à son actif.
        </p>

        {erreur && (
          <p role="alert" className="flex items-center gap-2 text-[13px] font-medium text-danger">
            <AlertCircle size={14} strokeWidth={2} className="shrink-0" />
            {erreur.message}
          </p>
        )}

        <div className="mt-2 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={isPending}>
            Retour
          </Button>
          <Button variant="danger-solid" size="sm" onClick={onConfirm} disabled={isPending}>
            Supprimer définitivement
          </Button>
        </div>
      </div>
    </div>
  );
}
