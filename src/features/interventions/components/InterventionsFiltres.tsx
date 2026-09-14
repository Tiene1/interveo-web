import { Search } from "lucide-react";
import { Select } from "@/components/ui/Select";
import type { Technicien } from "../types/intervention";

interface InterventionsFiltresProps {
  client: string;
  onClientChange: (value: string) => void;
  technicienId: string;
  onTechnicienIdChange: (value: string) => void;
  techniciens: Technicien[];
}

export function InterventionsFiltres({
  client,
  onClientChange,
  technicienId,
  onTechnicienIdChange,
  techniciens,
}: InterventionsFiltresProps) {
  const filtreActif = client !== "" || technicienId !== "";

  return (
    <div className="mb-0 flex items-center justify-between gap-4 border-b border-line pb-3">
      <div className="flex min-w-0 flex-1 items-center gap-5">
        <div className="flex max-w-[260px] flex-1 items-center gap-2 border-b border-transparent py-1.5 focus-within:border-ink-1">
          <Search size={14} strokeWidth={1.75} className="shrink-0 text-text-weak" />
          <input
            type="text"
            value={client}
            onChange={(event) => onClientChange(event.target.value)}
            placeholder="Filtrer par nom de client…"
            aria-label="Filtrer par nom de client"
            className="w-full border-0 bg-transparent text-[13px] text-ink-1 placeholder:text-text-weak focus:outline-none"
          />
        </div>

        <Select
          variant="inline"
          label="Technicien"
          value={technicienId}
          onChange={onTechnicienIdChange}
          ariaLabel="Filtrer par technicien"
          options={[
            { value: "", label: "Tous" },
            ...techniciens.map((technicien) => ({ value: technicien.id, label: technicien.nom })),
          ]}
        />

        {filtreActif && (
          <button
            type="button"
            onClick={() => {
              onClientChange("");
              onTechnicienIdChange("");
            }}
            className="text-[13px] font-medium text-brand underline decoration-1 underline-offset-[3px] hover:text-brand-hover"
          >
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}
