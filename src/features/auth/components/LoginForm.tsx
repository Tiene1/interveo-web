"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { ApiError } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { useLogin } from "../hooks/useLogin";

/**
 * Le message doit refleter la vraie cause : jusqu'au 2026-09-21 tout echec
 * affichait "Identifiant ou mot de passe incorrect", ce qui masquait un blocage
 * de debit (429), un serveur injoignable ou un probleme CORS (constate en
 * production : Cedric ne pouvait pas savoir si le serveur dormait ou non).
 */
function decrireErreur(erreur: Error | null): { message: string; identifiantsEnCause: boolean } {
  if (erreur instanceof ApiError) {
    if (erreur.status === 401) {
      return { message: "Identifiant ou mot de passe incorrect", identifiantsEnCause: true };
    }
    if (erreur.status === 429) {
      return { message: "Trop de tentatives. Patientez une minute, puis réessayez.", identifiantsEnCause: false };
    }
    return { message: "Le serveur a rencontré un problème. Réessayez dans un instant.", identifiantsEnCause: false };
  }
  return {
    message: "Serveur injoignable. Inactif, il peut mettre jusqu'à une minute à se réveiller : réessayez dans un instant.",
    identifiantsEnCause: false,
  };
}

export function LoginForm() {
  const router = useRouter();
  const [identifiant, setIdentifiant] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();
  const erreur = login.isError ? decrireErreur(login.error) : null;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    login.mutate(
      { identifiant, motDePasse },
      { onSuccess: () => router.push("/interventions") },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-[380px] flex-col">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-soft">
        Espace directeur
      </p>
      <h2 className="mb-7 font-serif text-[32px] font-normal leading-[1.1] tracking-[-0.03em] text-ink-1">
        Bienvenue.
      </h2>

      <div className="mb-5">
        <Field label="Identifiant" htmlFor="identifiant">
          <Input
            id="identifiant"
            value={identifiant}
            onChange={(event) => setIdentifiant(event.target.value)}
            autoComplete="off"
            disabled={login.isPending}
            error={erreur?.identifiantsEnCause}
          />
        </Field>
      </div>

      <div className="mb-5">
        <Field label="Mot de passe" htmlFor="mot-de-passe">
          <div
            className={cn(
              "flex items-center gap-2 border-b py-2",
              erreur?.identifiantsEnCause ? "border-danger" : "border-line-strong focus-within:border-ink-1",
            )}
          >
            <input
              id="mot-de-passe"
              type={showPassword ? "text" : "password"}
              value={motDePasse}
              onChange={(event) => setMotDePasse(event.target.value)}
              disabled={login.isPending}
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
        {erreur && (
          <p
            role="alert"
            className="mt-2 flex items-center gap-2 border-t border-danger/15 pt-3 text-[13px] font-medium text-danger"
          >
            <AlertCircle size={14} strokeWidth={2} className="shrink-0" />
            {erreur.message}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <Button type="submit" size="md" disabled={login.isPending} className="w-full">
          {login.isPending && <Spinner className="border-white/30 border-t-white" />}
          Se connecter
          {!login.isPending && <ArrowRight size={14} strokeWidth={1.75} />}
        </Button>
        <div className="flex items-center justify-between text-xs text-text-weak">
          {erreur?.identifiantsEnCause ? (
            <span>Vérifiez vos identifiants et réessayez</span>
          ) : erreur ? (
            <span>Vos identifiants ne sont pas en cause</span>
          ) : (
            <>
              <span>Utilisez vos identifiants professionnels</span>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] font-medium text-text-soft">
                <span className="rounded border border-line bg-line-soft px-1.5 py-px">⏎</span> valider
              </span>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
