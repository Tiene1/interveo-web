import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  children: ReactNode;
}

export function Field({ label, required, optional, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-soft">
        {label}
        {required && <span className="text-danger"> *</span>}
        {optional && <span className="normal-case tracking-normal text-text-weak"> (optionnel)</span>}
      </label>
      {children}
      {error && <p className="text-[13px] text-danger">{error}</p>}
    </div>
  );
}
