"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  id?: string;
  /** "field" : champ de formulaire pleine largeur (soulignement, icône). "inline" : bouton de filtre compact (libellé + valeur). */
  variant?: "field" | "inline";
  icon?: LucideIcon;
  label?: string;
  placeholder?: string;
  error?: boolean;
  ariaLabel?: string;
  className?: string;
}

/**
 * Remplace le `<select>` natif : la liste déroulante ouverte d'un `<select>`
 * est dessinée par le système d'exploitation, impossible à restyler pour
 * coller au design system (constat Cédric, 2026-09-14). Construit à la main
 * (pas de nouvelle dépendance) : un bouton déclencheur + un panneau
 * `role="listbox"` positionné en absolu, navigation clavier (flèches,
 * Entrée, Échap), fermeture au clic extérieur.
 */
export function Select({
  value,
  onChange,
  options,
  id,
  variant = "field",
  icon: Icon,
  label,
  placeholder = "Sélectionner…",
  error,
  ariaLabel,
  className,
}: SelectProps) {
  const [ouvert, setOuvert] = useState(false);
  const [surligne, setSurligne] = useState(0);
  const racineRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLLIElement | null>>([]);
  const listboxId = useId();

  const indexSelectionne = options.findIndex((option) => option.value === value);
  const optionSelectionnee = indexSelectionne >= 0 ? options[indexSelectionne] : undefined;

  useEffect(() => {
    if (!ouvert) return;
    setSurligne(indexSelectionne >= 0 ? indexSelectionne : 0);
  }, [ouvert, indexSelectionne]);

  useEffect(() => {
    if (!ouvert) return;
    function onClicExterieur(event: MouseEvent) {
      if (racineRef.current && !racineRef.current.contains(event.target as Node)) {
        setOuvert(false);
      }
    }
    document.addEventListener("mousedown", onClicExterieur);
    return () => document.removeEventListener("mousedown", onClicExterieur);
  }, [ouvert]);

  useEffect(() => {
    // scrollIntoView absent de jsdom (tests) : chainage optionnel sur l'appel,
    // pas seulement sur le noeud.
    if (ouvert) optionRefs.current[surligne]?.scrollIntoView?.({ block: "nearest" });
  }, [ouvert, surligne]);

  function choisir(optionValue: string) {
    onChange(optionValue);
    setOuvert(false);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (!ouvert) {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setOuvert(true);
      }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setOuvert(false);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setSurligne((precedent) => Math.min(precedent + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSurligne((precedent) => Math.max(precedent - 1, 0));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (options[surligne]) choisir(options[surligne].value);
    } else if (event.key === "Tab") {
      setOuvert(false);
    }
  }

  const estField = variant === "field";

  return (
    <div ref={racineRef} className={cn("relative", estField ? "w-full" : "inline-block", className)}>
      <button
        type="button"
        id={id}
        role="combobox"
        aria-expanded={ouvert}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-label={ariaLabel}
        onClick={() => setOuvert((precedent) => !precedent)}
        onKeyDown={onKeyDown}
        className={
          estField
            ? cn(
                "flex w-full items-center gap-2.5 border-b py-2 text-left focus:outline-none",
                error ? "border-danger" : "border-line-strong focus:border-ink-1",
              )
            : "flex cursor-pointer items-center gap-1.5 py-1.5 text-[13px] font-medium focus:outline-none"
        }
      >
        {estField && Icon && <Icon size={14} strokeWidth={1.75} className="shrink-0 text-text-weak" />}
        {!estField && label && <span className="font-medium text-text-weak">{label}</span>}
        <span
          className={cn(
            estField ? "w-full text-[16px] font-medium" : "font-semibold",
            optionSelectionnee ? "text-ink-1" : "text-text-weak",
          )}
        >
          {optionSelectionnee ? optionSelectionnee.label : placeholder}
        </span>
        <ChevronDown
          size={estField ? 14 : 13}
          strokeWidth={1.75}
          className={cn("shrink-0 text-text-weak transition-transform", ouvert && "rotate-180")}
        />
      </button>

      {ouvert && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 top-[calc(100%+6px)] z-20 max-h-64 min-w-full overflow-y-auto rounded-md border border-line bg-paper py-1 shadow-[0_12px_32px_-8px_rgba(15,23,42,.18)]"
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              ref={(node) => {
                optionRefs.current[index] = node;
              }}
              role="option"
              aria-selected={option.value === value}
              onMouseEnter={() => setSurligne(index)}
              onClick={() => choisir(option.value)}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-3 whitespace-nowrap px-3 py-2 text-[13px] font-medium text-ink-1",
                index === surligne && "bg-line-soft",
              )}
            >
              {option.label}
              {option.value === value && <Check size={13} strokeWidth={2.25} className="shrink-0 text-brand" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
