import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import type { PageInterventions } from "../types/intervention";

export interface InterventionsFiltre {
  page?: number;
  technicienId?: string;
  statut?: string;
  dateDebut?: string;
  dateFin?: string;
  /** US3.2 fusionne avec US3.8, le 2026-09-16 : recherche unique (client, adresse, motif, probleme, travaux). */
  motCle?: string;
}

/** Reutilise pour la liste paginee (US3.1) et l'export CSV (US3.10, sans page/limit). */
export function construireParamsFiltre(filtre: InterventionsFiltre): URLSearchParams {
  const params = new URLSearchParams();
  if (filtre.page) params.set("page", String(filtre.page));
  if (filtre.technicienId) params.set("technicienId", filtre.technicienId);
  if (filtre.statut) params.set("statut", filtre.statut);
  if (filtre.dateDebut) params.set("dateDebut", filtre.dateDebut);
  if (filtre.dateFin) params.set("dateFin", filtre.dateFin);
  if (filtre.motCle) params.set("motCle", filtre.motCle);
  return params;
}

export function useInterventions(filtre: InterventionsFiltre = {}) {
  const query = construireParamsFiltre(filtre).toString();

  return useQuery({
    queryKey: ["interventions", filtre],
    queryFn: () => apiRequest<PageInterventions>(`/interventions${query ? `?${query}` : ""}`),
    placeholderData: keepPreviousData,
  });
}
