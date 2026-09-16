import { Button } from "@/components/ui/Button";
import type { CompteTechnicien } from "../types/utilisateur";

interface ConfirmationDesactivationModalProps {
  technicien: CompteTechnicien;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDesactivationModal({
  technicien,
  isPending,
  onConfirm,
  onCancel,
}: ConfirmationDesactivationModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-confirmation-desactivation"
      className="fixed inset-0 z-20 flex items-center justify-center bg-ink-1/55 p-6 backdrop-blur-[2px]"
    >
      <div className="flex w-[480px] flex-col gap-3 border border-line border-t-2 border-t-danger bg-paper p-8 shadow-[0_40px_80px_-20px_rgba(15,23,42,.35)]">
        <h3
          id="titre-confirmation-desactivation"
          className="font-serif text-[26px] font-normal leading-[1.15] tracking-[-0.025em] text-ink-1"
        >
          Désactiver ce <span className="italic">compte</span> ?
        </h3>
        <p className="text-sm leading-[1.55] text-text-soft">
          <strong className="font-semibold text-ink-1">{technicien.nom}</strong> ne pourra plus se
          connecter à l&apos;application mobile, ni être proposé pour de nouvelles interventions.
        </p>
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={isPending}>
            Retour
          </Button>
          <Button variant="danger-solid" size="sm" onClick={onConfirm} disabled={isPending}>
            Désactiver le compte
          </Button>
        </div>
      </div>
    </div>
  );
}
