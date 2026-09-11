import { cn } from "@/lib/utils/cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Chargement"
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-line-strong border-t-ink-1",
        className,
      )}
    />
  );
}
