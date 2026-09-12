import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import type { InterventionDetail } from "../types/intervention";

export function useIntervention(id: string) {
  return useQuery({
    queryKey: ["interventions", "detail", id],
    queryFn: () => apiRequest<InterventionDetail>(`/interventions/${id}`),
  });
}
