import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface StatePanelProps {
  tone?: "neutral" | "danger";
  kicker: string;
  title: ReactNode;
  description: string;
  actions?: ReactNode;
}

/** Bloc "vide" / "erreur" typographique, cf design/DESIGN-SYSTEM.md (pas d'illustration). */
export function StatePanel({ tone = "neutral", kicker, title, description, actions }: StatePanelProps) {
  return (
    <div className="flex max-w-[520px] flex-col items-start gap-3 py-20">
      <span aria-hidden className={cn("h-px w-8", tone === "danger" ? "bg-danger" : "bg-ink-1")} />
      <span
        className={cn(
          "text-[11px] font-semibold uppercase tracking-[0.14em]",
          tone === "danger" ? "text-danger" : "text-text-soft",
        )}
      >
        {kicker}
      </span>
      <h3 className="font-serif text-[28px] font-normal leading-[1.15] tracking-[-0.028em] text-ink-1">{title}</h3>
      <p className="text-sm leading-[1.55] text-text-soft">{description}</p>
      {actions && <div className="mt-3 flex gap-2">{actions}</div>}
    </div>
  );
}
