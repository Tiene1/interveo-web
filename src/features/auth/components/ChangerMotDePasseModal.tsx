"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils/cn";
import { validerMotDePasse } from "@/features/techniciens/lib/motDePasse";
import { useChangerMotDePasse } from "../hooks/useChangerMotDePasse";

interface ChangerMotDePasseModalProps {
  onClose: () => void;
}

interface ChampMotDePasseProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  invalide?: boolean;
  autoComplete: string;
}

function ChampMotDePasse({ id, value, onChange, disabled, invalide, autoComplete }: ChampMotDePasseProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b py-2",
        invalide ? "border-danger" : "border-line-strong focus-within:border-ink-1",
      )}
    >
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        autoComplete={autoComplete}
        className="flex-1 border-0 bg-transparent text-[16px] font-medium text-ink-1 focus:outline-none"
      />
      <button
        type="button"
        onClick={() => setVisible((precedent) => !precedent)}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        className="text-text-weak hover:text-ink-1"
      >
        {visible ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
      </button>
    </div>
  );
}

/**
 * Libre-service (retour de Cedric le 2026-09-21 : le directeur doit pouvoir
 * changer son mot de passe lui-meme). Reutilise `validerMotDePasse` des
 * comptes techniciens : meme regle de complexite que le backend.
 */
export function ChangerMotDePasseModal({ onClose }: ChangerMotDePasseModalProps) {
  const mutation = useChangerMotDePasse();
  const [actuel, setActuel] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreurNouveau, setErreurNouveau] = useState<string | undefined>();
  const [erreurConfirmation, setErreurConfirmation] = useState<string | undefined>();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const erreurValidation = validerMotDePasse(nouveau);
    const erreurCorrespondance =
      !erreurValidation && nouveau !== confirmation
        ? "La confirmation ne correspond pas au nouveau mot de passe."
        : undefined;
    setErreurNouveau(erreurValidation);
    setErreurConfirmation(erreurCorrespondance);
    if (erreurValidation || erreurCorrespondance) return;

    mutation.mutate({ motDePasseActuel: actuel, nouveauMotDePasse: nouveau });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-changer-mot-de-passe"
      className="fixed inset-0 z-30 flex items-center justify-center bg-ink-1/55 p-6 backdrop-blur-[2px]"
    >
      {mutation.isSuccess ? (
        <div className="flex w-[420px] flex-col gap-5 border border-line border-t-2 border-t-brand bg-paper p-8 shadow-[0_40px_80px_-20px_rgba(15,23,42,.35)]">
          <h3
            id="titre-changer-mot-de-passe"
            className="font-serif text-[26px] font-normal leading-[1.15] tracking-[-0.025em] text-ink-1"
          >
            Mot de passe <span className="italic">modifié</span>
          </h3>
          <p role="status" className="flex items-center gap-2 text-sm leading-[1.55] text-text-soft">
            <CheckCircle2 size={16} strokeWidth={1.75} className="shrink-0 text-brand" />
            Utilisez-le dès votre prochaine connexion.
          </p>
          <div className="mt-1 flex justify-end">
            <Button type="button" variant="primary" size="sm" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex w-[420px] flex-col gap-5 border border-line border-t-2 border-t-brand bg-paper p-8 shadow-[0_40px_80px_-20px_rgba(15,23,42,.35)]"
        >
          <h3
            id="titre-changer-mot-de-passe"
            className="font-serif text-[26px] font-normal leading-[1.15] tracking-[-0.025em] text-ink-1"
          >
            Changer mon <span className="italic">mot de passe</span>
          </h3>

          <Field label="Mot de passe actuel" htmlFor="mot-de-passe-actuel" required>
            <ChampMotDePasse
              id="mot-de-passe-actuel"
              value={actuel}
              onChange={setActuel}
              disabled={mutation.isPending}
              autoComplete="current-password"
            />
          </Field>

          <Field label="Nouveau mot de passe" htmlFor="nouveau-mot-de-passe" required error={erreurNouveau}>
            <ChampMotDePasse
              id="nouveau-mot-de-passe"
              value={nouveau}
              onChange={setNouveau}
              disabled={mutation.isPending}
              invalide={Boolean(erreurNouveau)}
              autoComplete="new-password"
            />
          </Field>
          {!erreurNouveau && (
            <p className="-mt-3 text-[12px] text-text-weak">
              8 caractères minimum, avec majuscule, minuscule, chiffre et caractère spécial.
            </p>
          )}

          <Field
            label="Confirmer le nouveau mot de passe"
            htmlFor="confirmation-mot-de-passe"
            required
            error={erreurConfirmation}
          >
            <ChampMotDePasse
              id="confirmation-mot-de-passe"
              value={confirmation}
              onChange={setConfirmation}
              disabled={mutation.isPending}
              invalide={Boolean(erreurConfirmation)}
              autoComplete="new-password"
            />
          </Field>

          {mutation.error && (
            <p role="alert" className="flex items-center gap-2 text-[13px] font-medium text-danger">
              <AlertCircle size={14} strokeWidth={2} className="shrink-0" />
              {mutation.error.message}
            </p>
          )}

          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={mutation.isPending}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={mutation.isPending || !actuel}>
              {mutation.isPending && <Spinner className="border-white/30 border-t-white" />}
              Changer le mot de passe
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
