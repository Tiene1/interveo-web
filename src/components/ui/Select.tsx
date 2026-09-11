import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export function Select({ error, className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "w-full appearance-none border-0 border-b bg-transparent py-2 text-[16px] font-medium text-ink-1",
        "focus:outline-none",
        error ? "border-danger" : "border-line-strong focus:border-ink-1",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
