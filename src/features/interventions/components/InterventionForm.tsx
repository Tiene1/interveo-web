"use client";

import { useState, type InputHTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Map,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { useCreerIntervention, type CreerInterventionPayload } from "../hooks/useCreerIntervention";
import { useModifierIntervention } from "../hooks/useModifierIntervention";
import { useTechniciens } from "../hooks/useTechniciens";
import { referenceCourte } from "../lib/reference";
import type { InterventionDetail } from "../types/intervention";

interface ChampProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  error?: boolean;
}

function Champ({ icon: Icon, error, className, ...props }: ChampProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 border-b py-2",
        error ? "border-danger" : "border-line-strong focus-within:border-ink-1",
      )}
    >
      {Icon && <Icon size={14} strokeWidth={1.75} className="shrink-0 text-text-weak" />}
      <input
        {...props}
        className={cn(
          "w-full border-0 bg-transparent text-[16px] font-medium text-ink-1 placeholder:font-normal placeholder:text-text-weak focus:outline-none",
          className,
        )}
      />
    </div>
  );
}

function Label({
  htmlFor,
  requis,
  optionnel,
  children,
}: {
  htmlFor: string;
  requis?: boolean;
  optionnel?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-soft"
    >
      {children}
      {requis && <span className="text-danger">*</span>}
      {optionnel && <span className="font-mono text-[10px] normal-case tracking-normal text-text-weak">(optionnel)</span>}
    </label>
  );
}

function MessageErreur({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 pt-1 text-xs font-medium text-danger">
      <AlertCircle size={12} strokeWidth={2} />
      {children}
    </p>
  );
}

interface FormState {
  nomClient: string;
  adresse: string;
  telephone1: string;
  telephone2: string;
  geolocalisation: string;
  date: string;
  heure: string;
  technicienId: string;
}

const ETAT_INITIAL: FormState = {
  nomClient: "",
  adresse: "",
  telephone1: "",
  telephone2: "",
  geolocalisation: "",
  date: "",
  heure: "",
  technicienId: "",
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function etatDepuisIntervention(intervention: InterventionDetail): FormState {
  const date = new Date(intervention.datePrevue);
  return {
    nomClient: intervention.nomClient,
    adresse: intervention.adresse,
    telephone1: intervention.telephone1,
    telephone2: intervention.telephone2 ?? "",
    geolocalisation: intervention.geolocalisation ?? "",
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    heure: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
    technicienId: intervention.technicienId,
  };
}

const LIBELLES_CHAMPS: Record<string, string> = {
  nomClient: "Nom du client",
  adresse: "Adresse",
  telephone1: "Téléphone 1",
  datePrevue: "Date et heure prévues",
  technicienId: "Technicien assigné",
};

function valider(state: FormState): Record<string, string> {
  const erreurs: Record<string, string> = {};
  if (!state.nomClient.trim()) erreurs.nomClient = "Le nom du client est requis";
  if (!state.adresse.trim()) erreurs.adresse = "L'adresse est requise";
  if (!state.telephone1.trim()) erreurs.telephone1 = "Le téléphone 1 est requis";
  if (!state.date || !state.heure) erreurs.datePrevue = "La date et l'heure prévues sont requises";
  if (!state.technicienId) erreurs.technicienId = "Sélectionnez un technicien";
  return erreurs;
}

interface InterventionFormProps {
  mode: "creer" | "modifier";
  intervention?: InterventionDetail;
}

export function InterventionForm({ mode, intervention }: InterventionFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() =>
    intervention ? etatDepuisIntervention(intervention) : ETAT_INITIAL,
  );
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const techniciens = useTechniciens();
  const creer = useCreerIntervention();
  const modifier = useModifierIntervention(intervention?.id ?? "");
  const mutation = mode === "creer" ? creer : modifier;

  function champ<K extends keyof FormState>(cle: K) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((precedent) => ({ ...precedent, [cle]: event.target.value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const prochaine = valider(form);
    setErreurs(prochaine);
    if (Object.keys(prochaine).length > 0) return;

    const champsCommuns = {
      nomClient: form.nomClient.trim(),
      adresse: form.adresse.trim(),
      telephone1: form.telephone1.trim(),
      datePrevue: new Date(`${form.date}T${form.heure}:00`).toISOString(),
      technicienId: form.technicienId,
    };

    if (mode === "creer") {
      const payload: CreerInterventionPayload = {
        ...champsCommuns,
        telephone2: form.telephone2.trim() || undefined,
        geolocalisation: form.geolocalisation.trim() || undefined,
      };
      creer.mutate(payload, {
        onSuccess: (resultat) => router.push(`/interventions/detail?id=${resultat.id}`),
      });
      return;
    }

    // En modification, telephone2/geolocalisation sont toujours envoyes (meme
    // vides) : une chaine vide efface explicitement le champ cote API.
    modifier.mutate(
      { ...champsCommuns, telephone2: form.telephone2.trim(), geolocalisation: form.geolocalisation.trim() },
      { onSuccess: () => router.push(`/interventions/detail?id=${intervention!.id}`) },
    );
  }

  const estModification = mode === "modifier" && intervention;
  const dateReference = estModification ? new Date(intervention.creeLe) : new Date();
  const dateFormatee = dateReference.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const destinationAnnuler = estModification ? `/interventions/detail?id=${intervention.id}` : "/interventions";
  const libelleAction = estModification ? "d'enregistrer les modifications" : "de créer l'intervention";

  return (
    <div className="h-full overflow-y-auto pb-16">
      <div className="mb-4 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.06em] text-text-weak">
        <Link href="/interventions" className="text-text-soft hover:text-ink-1">
          Opérations
        </Link>
        <span className="opacity-50">/</span>
        <Link href="/interventions" className="text-text-soft hover:text-ink-1">
          Interventions
        </Link>
        <span className="opacity-50">/</span>
        {estModification ? (
          <>
            <Link href={`/interventions/detail?id=${intervention.id}`} className="text-text-soft hover:text-ink-1">
              #{referenceCourte(intervention.id)}
            </Link>
            <span className="opacity-50">/</span>
            <span className="font-semibold text-text-soft">Modifier</span>
          </>
        ) : (
          <span className="font-semibold text-text-soft">Nouvelle</span>
        )}
      </div>

      <div className="mb-8 flex flex-col gap-3">
        <h1 className="font-serif text-[44px] font-normal leading-[1.05] tracking-[-0.035em] text-ink-1">
          {estModification ? (
            <>
              Modifier <span className="italic">l&apos;intervention</span>.
            </>
          ) : (
            <>
              Nouvelle <span className="italic">intervention</span>.
            </>
          )}
        </h1>
        <p className="max-w-[640px] text-sm leading-[1.5] text-text-soft">
          {estModification
            ? "Modifiez les informations de cette intervention. "
            : "Créez une intervention pour l'un de vos clients et attribuez-la à un technicien. "}
          Les champs marqués <span className="text-danger">*</span> sont requis.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {Object.keys(erreurs).length > 0 && (
          <div role="alert" className="mb-6 flex items-start gap-3 border-l-2 border-danger bg-danger-bg px-5 py-4 text-[13px] leading-[1.5] text-danger">
            <AlertCircle size={16} strokeWidth={2} className="mt-0.5 shrink-0" />
            <div>
              <strong className="font-semibold">
                {Object.keys(erreurs).length} champ{Object.keys(erreurs).length > 1 ? "s" : ""} requis à
                compléter
              </strong>{" "}
              avant {libelleAction} :
              <ul className="ml-4 mt-1.5 list-disc font-medium">
                {Object.keys(erreurs).map((cle) => (
                  <li key={cle}>{LIBELLES_CHAMPS[cle]}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="grid grid-cols-[220px_1fr] gap-12 border-t border-ink-1 py-7">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[11px] font-medium text-text-weak">01</span>
            <h2 className="font-serif text-[22px] font-normal leading-[1.15] tracking-[-0.02em] text-ink-1">
              <span className="italic">Client</span> et lieu
            </h2>
            <p className="max-w-[180px] text-[13px] leading-[1.5] text-text-soft">
              Coordonnées du site à intervenir.
            </p>
          </div>

          <div className="flex max-w-[560px] flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nomClient" requis>
                Nom du client
              </Label>
              <Champ
                id="nomClient"
                placeholder="Ex. Hôtel Ivoire"
                value={form.nomClient}
                onChange={champ("nomClient")}
                error={Boolean(erreurs.nomClient)}
                aria-invalid={Boolean(erreurs.nomClient)}
              />
              {erreurs.nomClient && <MessageErreur>{erreurs.nomClient}</MessageErreur>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="adresse" requis>
                Adresse
              </Label>
              <Champ
                id="adresse"
                icon={MapPin}
                placeholder="Boulevard Hassan II, Cocody"
                value={form.adresse}
                onChange={champ("adresse")}
                error={Boolean(erreurs.adresse)}
                aria-invalid={Boolean(erreurs.adresse)}
              />
              {erreurs.adresse && <MessageErreur>{erreurs.adresse}</MessageErreur>}
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="telephone1" requis>
                  Téléphone 1
                </Label>
                <Champ
                  id="telephone1"
                  type="tel"
                  icon={Phone}
                  placeholder="+225 07 07 07 07 07"
                  value={form.telephone1}
                  onChange={champ("telephone1")}
                  error={Boolean(erreurs.telephone1)}
                  aria-invalid={Boolean(erreurs.telephone1)}
                />
                {erreurs.telephone1 && <MessageErreur>{erreurs.telephone1}</MessageErreur>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="telephone2" optionnel>
                  Téléphone 2
                </Label>
                <Champ
                  id="telephone2"
                  type="tel"
                  icon={Phone}
                  placeholder="+225 07 07 07 07 07"
                  value={form.telephone2}
                  onChange={champ("telephone2")}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="geolocalisation" optionnel>
                Géolocalisation
              </Label>
              <Champ
                id="geolocalisation"
                icon={Map}
                placeholder="https://maps.google.com/…"
                value={form.geolocalisation}
                onChange={champ("geolocalisation")}
              />
              <p className="text-xs text-text-weak">Lien Google Maps ou coordonnées lat,lng.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[220px_1fr] gap-12 border-t border-line py-7">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[11px] font-medium text-text-weak">02</span>
            <h2 className="font-serif text-[22px] font-normal leading-[1.15] tracking-[-0.02em] text-ink-1">
              <span className="italic">Planification</span>
            </h2>
            <p className="max-w-[180px] text-[13px] leading-[1.5] text-text-soft">
              Date, heure et technicien assigné.
            </p>
          </div>

          <div className="flex max-w-[560px] flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="date" requis>
                Date et heure prévues
              </Label>
              <div className="grid grid-cols-2 gap-5">
                <Champ
                  id="date"
                  type="date"
                  icon={Calendar}
                  value={form.date}
                  onChange={champ("date")}
                  error={Boolean(erreurs.datePrevue)}
                  aria-invalid={Boolean(erreurs.datePrevue)}
                />
                <Champ
                  id="heure"
                  type="time"
                  icon={Clock}
                  value={form.heure}
                  onChange={champ("heure")}
                  error={Boolean(erreurs.datePrevue)}
                  aria-invalid={Boolean(erreurs.datePrevue)}
                />
              </div>
              {erreurs.datePrevue && <MessageErreur>{erreurs.datePrevue}</MessageErreur>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="technicienId" requis>
                Technicien assigné
              </Label>
              <div
                className={cn(
                  "flex items-center gap-2.5 border-b py-2",
                  erreurs.technicienId ? "border-danger" : "border-line-strong focus-within:border-ink-1",
                )}
              >
                <User size={14} strokeWidth={1.75} className="shrink-0 text-text-weak" />
                <select
                  id="technicienId"
                  value={form.technicienId}
                  onChange={champ("technicienId")}
                  aria-invalid={Boolean(erreurs.technicienId)}
                  className={cn(
                    "w-full appearance-none border-0 bg-transparent text-[16px] font-medium focus:outline-none",
                    form.technicienId ? "text-ink-1" : "text-text-weak",
                  )}
                >
                  <option value="" disabled>
                    Choisir un technicien…
                  </option>
                  {(techniciens.data ?? []).map((technicien) => (
                    <option key={technicien.id} value={technicien.id} className="text-ink-1">
                      {technicien.nom}
                    </option>
                  ))}
                </select>
              </div>
              {erreurs.technicienId && <MessageErreur>{erreurs.technicienId}</MessageErreur>}
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-ink-1 pt-7">
          <div className="flex items-center gap-3 text-xs text-text-weak">
            <span>
              Statut{estModification ? "" : " initial"} : <strong className="font-semibold text-ink-1">Planifiée</strong>
            </span>
            <span className="opacity-50">·</span>
            <span>
              Créée le <span className="font-mono font-medium text-ink-1">{dateFormatee}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="md" onClick={() => router.push(destinationAnnuler)}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={mutation.isPending}>
              {estModification ? (
                <>
                  Enregistrer les modifications
                  <Check size={14} strokeWidth={1.75} />
                </>
              ) : (
                <>
                  Créer l&apos;intervention
                  <ArrowRight size={14} strokeWidth={1.75} />
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
