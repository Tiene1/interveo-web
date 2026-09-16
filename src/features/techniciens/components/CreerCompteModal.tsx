"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils/cn";
import { useCreerCompteTechnicien } from "../hooks/useCreerCompteTechnicien";
import { validerMotDePasse } from "../lib/motDePasse";

interface CreerCompteModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export function CreerCompteModal({ onClose, onCreated }: CreerCompteModalProps) {
  const [nom, setNom] = useState("");
  const [identifiant, setIdentifiant] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [erreursLocales, setErreursLocales] = useState<{ nom?: string; identifiant?: string; motDePasse?: string }>(
    {},
  );
  const creerCompte = useCreerCompteTechnicien();

  function valider(): boolean {
    const erreurs: typeof erreursLocales = {};
    if (!nom.trim()) erreurs.nom = "Le nom est requis.";
    if (!identifiant.trim()) erreurs.identifiant = "L'identifiant est requis.";
    const erreurMotDePasse = validerMotDePasse(motDePasse);
    if (erreurMotDePasse) erreurs.motDePasse = erreurMotDePasse;
    setErreursLocales(erreurs);
    return Object.keys(erreurs).length === 0;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!valider()) return;
    creerCompte.mutate(
      { nom: nom.trim(), identifiant: identifiant.trim(), motDePasse },
      { onSuccess: onCreated },
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-creer-compte"
      className="fixed inset-0 z-20 flex items-center justify-center bg-ink-1/55 p-6 backdrop-blur-[2px]"
    >
      <form
        onSubmit={handleSubmit}
        className="flex w-[420px] flex-col gap-5 border border-line border-t-2 border-t-brand bg-paper p-8 shadow-[0_40px_80px_-20px_rgba(15,23,42,.35)]"
      >
        <h3
          id="titre-creer-compte"
          className="font-serif text-[26px] font-normal leading-[1.15] tracking-[-0.025em] text-ink-1"
        >
          Créer un <span className="italic">compte technicien</span>
        </h3>

        <Field label="Nom" htmlFor="nom-technicien" required error={erreursLocales.nom}>
          <Input
            id="nom-technicien"
            value={nom}
            onChange={(event) => setNom(event.target.value)}
            disabled={creerCompte.isPending}
            error={Boolean(erreursLocales.nom)}
          />
        </Field>

        <Field label="Identifiant" htmlFor="identifiant-technicien" required error={erreursLocales.identifiant}>
          <Input
            id="identifiant-technicien"
            value={identifiant}
            onChange={(event) => setIdentifiant(event.target.value)}
            autoComplete="off"
            disabled={creerCompte.isPending}
            error={Boolean(erreursLocales.identifiant)}
          />
        </Field>

        <Field label="Mot de passe" htmlFor="mot-de-passe-technicien" required error={erreursLocales.motDePasse}>
          <div
            className={cn(
              "flex items-center gap-2 border-b py-2",
              erreursLocales.motDePasse ? "border-danger" : "border-line-strong focus-within:border-ink-1",
            )}
          >
            <input
              id="mot-de-passe-technicien"
              type={showPassword ? "text" : "password"}
              value={motDePasse}
              onChange={(event) => setMotDePasse(event.target.value)}
              disabled={creerCompte.isPending}
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
        {!erreursLocales.motDePasse && (
          <p className="-mt-3 text-[12px] text-text-weak">
            8 caractères minimum, avec majuscule, minuscule, chiffre et caractère spécial.
          </p>
        )}

        {creerCompte.isError && (
          <p role="alert" className="flex items-center gap-2 text-[13px] font-medium text-danger">
            <AlertCircle size={14} strokeWidth={2} className="shrink-0" />
            {creerCompte.error.message}
          </p>
        )}

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={creerCompte.isPending}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={creerCompte.isPending}>
            {creerCompte.isPending && <Spinner className="border-white/30 border-t-white" />}
            Créer le compte
          </Button>
        </div>
      </form>
    </div>
  );
}
