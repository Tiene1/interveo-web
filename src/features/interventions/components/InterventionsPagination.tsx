import { ChevronLeft, ChevronRight } from "lucide-react";

interface InterventionsPaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function InterventionsPagination({ page, limit, total, onPageChange }: InterventionsPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const debut = total === 0 ? 0 : (page - 1) * limit + 1;
  const fin = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between pt-5 text-xs text-text-soft">
      <div className="font-mono tracking-wide">
        <strong className="font-semibold text-ink-1">
          {debut}–{fin}
        </strong>{" "}
        sur <strong className="font-semibold text-ink-1">{total}</strong> interventions
      </div>
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-7 items-center gap-1 rounded px-2 font-medium text-text-soft transition-colors hover:enabled:bg-line-soft hover:enabled:text-ink-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft size={12} strokeWidth={2} />
          Précédent
        </button>
        <span className="px-2 font-mono font-medium text-ink-1">
          {page}
          <span className="mx-1 text-text-weak">/</span>
          {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-7 items-center gap-1 rounded px-2 font-medium text-text-soft transition-colors hover:enabled:bg-line-soft hover:enabled:text-ink-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Suivant
          <ChevronRight size={12} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
