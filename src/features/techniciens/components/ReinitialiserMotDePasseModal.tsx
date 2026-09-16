"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils/cn";
import type { CompteTechnicien } from "../types/utilisateur";
import { validerMotDePasse } from "../lib/motDePasse";

interface ReinitialiserMotDePasseModalProps {
  technicien: CompteTechnicien;
  isPending: boolean;
  erreur: Error | null;
  onSubmit: (motDePasse: string) => void;
  onClose: () => void;
}

export function ReinitialiserMotDePasseModal({
  technicien,
  isPending,
  erreur,
  onSubmit,
  onClose,
}: ReinitialiserMotDePasseModalProps) {
  const [motDePasse, setMotDePasse] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [erreurLocale, setErreurLocale] = useState<string | undefined>();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const erreurValidation = validerMotDePasse(motDePasse);
    if (erreurValidation) {
      setErreurLocale(erreurValidation);
      return;
    }
    setErreurLocale(undefined);
    onSubmit(motDePasse);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-reinitialiser-mot-de-passe"
      className="fixed inset-0 z-20 flex items-center justify-center bg-ink-1/55 p-6 backdrop-blur-[2px]"
    >
      <form
        onSubmit={handleSubmit}
        className="flex w-[420px] flex-col gap-5 border border-line border-t-2 border-t-brand bg-paper p-8 shadow-[0_40px_80px_-20px_rgba(15,23,42,.35)]"
      >
        <h3
          id="titre-reinitialiser-mot-de-passe"
          className="font-serif text-[26px] font-normal leading-[1.15] tracking-[-0.025em] text-ink-1"
        >
          Réinitialiser le <span className="italic">mot de passe</span>
        </h3>
        <p className="text-sm leading-[1.55] text-text-soft">
          Nouveau mot de passe pour <strong className="font-semibold text-ink-1">{technicien.nom}</strong>.
          À communiquer directement au technicien.
        </p>

        <Field label="Nouveau mot de passe" htmlFor="nouveau-mot-de-passe" required error={erreurLocale}>
          <div
            className={cn(
              "flex items-center gap-2 border-b py-2",
              erreurLocale ? "border-danger" : "border-line-strong focus-within:border-ink-1",
            )}
          >
            <input
              id="nouveau-mot-de-passe"
              type={showPassword ? "text" : "password"}
              value={motDePasse}
              onChange={(event) => setMotDePasse(event.target.value)}
              disabled={isPending}
              className="flex-1 border-0 bg-transparent text-[16px] font-medium text-ink-1 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              className="text-text-weak hover:text-ink-1"
            >
              {showPassword ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
            </button>
          </div>
        </Field>
        {!erreurLocale && (
          <p className="-mt-3 text-[12px] text-text-weak">
            8 caractères minimum, avec majuscule, minuscule, chiffre et caractère spécial.
          </p>
        )}

        {erreur && (
          <p role="alert" className="flex items-center gap-2 text-[13px] font-medium text-danger">
            <AlertCircle size={14} strokeWidth={2} className="shrink-0" />
            {erreur.message}
          </p>
        )}

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isPending}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isPending}>
            {isPending && <Spinner className="border-white/30 border-t-white" />}
            Réinitialiser le mot de passe
          </Button>
        </div>
      </form>
    </div>
  );
}
