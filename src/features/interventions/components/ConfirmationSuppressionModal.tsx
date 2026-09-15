import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils/date";
import type { Intervention } from "../types/intervention";

interface ConfirmationSuppressionModalProps {
  intervention: Intervention;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationSuppressionModal({
  intervention,
  isPending,
  onConfirm,
  onCancel,
}: ConfirmationSuppressionModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-confirmation-suppression"
      className="fixed inset-0 z-20 flex items-center justify-center bg-ink-1/55 p-6 backdrop-blur-[2px]"
    >
      <div className="flex w-[480px] flex-col gap-3 border border-line border-t-2 border-t-danger bg-paper p-8 shadow-[0_40px_80px_-20px_rgba(15,23,42,.35)]">
        <div className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-danger">
          <span aria-hidden className="h-px w-6 bg-danger" />
          Action irréversible
        </div>
        <h3
          id="titre-confirmation-suppression"
          className="font-serif text-[26px] font-normal leading-[1.15] tracking-[-0.025em] text-ink-1"
        >
          Supprimer cette <span className="italic">intervention</span> ?
        </h3>
        <p className="text-sm leading-[1.55] text-text-soft">
          Cette action est définitive et ne peut pas être annulée. L&apos;intervention sera
          supprimée de façon permanente.
        </p>
        <div className="my-2 border-l-2 border-line-strong bg-line-soft px-3.5 py-3 font-mono text-xs text-text-weak">
          <strong className="font-semibold text-ink-1">{intervention.nomClient}</strong> · prévue le{" "}
          {formatDateTime(intervention.datePrevue)}
        </div>
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
