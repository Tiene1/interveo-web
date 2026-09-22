"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { useMoi } from "../hooks/useMoi";
import { useChangerNom } from "../hooks/useChangerNom";

interface ChangerNomModalProps {
  onClose: () => void;
}

/**
 * Libre-service (retour de Cedric le 2026-09-22 : le compte connecte n'est
 * pas forcement tenu par la meme personne dans la duree). Pre-rempli avec le
 * nom actuel (useMoi()) : on edite plutot que de retaper depuis zero.
 */
export function ChangerNomModal({ onClose }: ChangerNomModalProps) {
  const moi = useMoi();
  const mutation = useChangerNom();
  const [nom, setNom] = useState(moi.data?.nom ?? "");
  const [erreurValidation, setErreurValidation] = useState<string | undefined>();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const valeur = nom.trim();
    if (valeur === "") {
      setErreurValidation("Le nom ne peut pas être vide.");
      return;
    }
    setErreurValidation(undefined);
    mutation.mutate(valeur);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-changer-nom"
      className="fixed inset-0 z-30 flex items-center justify-center bg-ink-1/55 p-6 backdrop-blur-[2px]"
    >
      {mutation.isSuccess ? (
        <div className="flex w-[420px] flex-col gap-5 border border-line border-t-2 border-t-brand bg-paper p-8 shadow-[0_40px_80px_-20px_rgba(15,23,42,.35)]">
          <h3
            id="titre-changer-nom"
            className="font-serif text-[26px] font-normal leading-[1.15] tracking-[-0.025em] text-ink-1"
          >
            Nom <span className="italic">modifié</span>
          </h3>
          <p role="status" className="flex items-center gap-2 text-sm leading-[1.55] text-text-soft">
            <CheckCircle2 size={16} strokeWidth={1.75} className="shrink-0 text-brand" />
            Le nouveau nom s&apos;affiche dès maintenant.
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
            id="titre-changer-nom"
            className="font-serif text-[26px] font-normal leading-[1.15] tracking-[-0.025em] text-ink-1"
          >
            Changer mon <span className="italic">nom</span>
          </h3>

          <Field label="Nom" htmlFor="nouveau-nom" required error={erreurValidation}>
            <Input
              id="nouveau-nom"
              value={nom}
              onChange={(event) => setNom(event.target.value)}
              disabled={mutation.isPending}
              error={Boolean(erreurValidation)}
              autoFocus
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
            <Button type="submit" variant="primary" size="sm" disabled={mutation.isPending}>
              {mutation.isPending && <Spinner className="border-white/30 border-t-white" />}
              Enregistrer
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
