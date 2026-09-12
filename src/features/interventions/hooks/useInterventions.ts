import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import type { PageInterventions } from "../types/intervention";

export interface InterventionsFiltre {
  page?: number;
  client?: string;
  technicienId?: string;
}

export function useInterventions(filtre: InterventionsFiltre = {}) {
  const params = new URLSearchParams();
  if (filtre.page) params.set("page", String(filtre.page));
  if (filtre.client) params.set("client", filtre.client);
  if (filtre.technicienId) params.set("technicienId", filtre.technicienId);
  const query = params.toString();

  return useQuery({
    queryKey: ["interventions", filtre],
    queryFn: () => apiRequest<PageInterventions>(`/interventions${query ? `?${query}` : ""}`),
  });
}
