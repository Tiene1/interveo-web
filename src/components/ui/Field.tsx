import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, required, optional, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-soft"
      >
        {label}
        {required && <span className="text-danger"> *</span>}
        {optional && <span className="normal-case tracking-normal text-text-weak"> (optionnel)</span>}
      </label>
      {children}
      {error && <p className="text-[13px] text-danger">{error}</p>}
    </div>
  );
}
