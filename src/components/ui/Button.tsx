import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger-outline" | "danger-solid";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-ink-1 text-white border border-ink-1 hover:bg-black",
  secondary: "bg-transparent text-ink-1 border border-line hover:bg-line-soft hover:border-line-strong",
  ghost: "bg-transparent text-text-soft border-none hover:bg-line-soft hover:text-ink-1",
  "danger-outline": "bg-transparent text-danger border border-danger hover:bg-danger-bg",
  "danger-solid": "bg-danger text-white border border-danger hover:bg-danger-hover",
};

// Hauteurs design/DESIGN-SYSTEM.md : 36px (compact) / 40px (formulaire)
const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-10 px-5 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
        "disabled:pointer-events-none disabled:opacity-40",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    />
  );
}
