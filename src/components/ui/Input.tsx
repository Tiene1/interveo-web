import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

/** Style "underline" signature v4 : pas de fond ni de boîte, juste un filet en dessous. */
export function Input({ error, className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full border-0 border-b bg-transparent py-2 text-[16px] font-medium text-ink-1",
        "placeholder:font-normal placeholder:text-text-weak focus:outline-none",
        error ? "border-danger" : "border-line-strong focus:border-ink-1",
        className,
      )}
      {...props}
    />
  );
}
