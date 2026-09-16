import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import type { PageInterventions } from "../types/intervention";

export interface InterventionsFiltre {
  page?: number;
  client?: string;
  technicienId?: string;
  statut?: string;
  dateDebut?: string;
  dateFin?: string;
}

export function useInterventions(filtre: InterventionsFiltre = {}) {
  const params = new URLSearchParams();
  if (filtre.page) params.set("page", String(filtre.page));
  if (filtre.client) params.set("client", filtre.client);
  if (filtre.technicienId) params.set("technicienId", filtre.technicienId);
  if (filtre.statut) params.set("statut", filtre.statut);
  if (filtre.dateDebut) params.set("dateDebut", filtre.dateDebut);
  if (filtre.dateFin) params.set("dateFin", filtre.dateFin);
  const query = params.toString();

  return useQuery({
    queryKey: ["interventions", filtre],
    queryFn: () => apiRequest<PageInterventions>(`/interventions${query ? `?${query}` : ""}`),
    placeholderData: keepPreviousData,
  });
}
