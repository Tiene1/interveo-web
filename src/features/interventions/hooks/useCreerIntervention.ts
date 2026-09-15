import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import type { Intervention } from "../types/intervention";

export interface CreerInterventionPayload {
  nomClient: string;
  adresse: string;
  telephone1: string;
  telephone2?: string;
  geolocalisation?: string;
  motifSignale?: string;
  typeEquipement?: string | null;
  datePrevue: string;
  technicienId: string;
}

export function useCreerIntervention() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreerInterventionPayload) =>
      apiRequest<Intervention>("/interventions", { method: "POST", body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interventions"] });
    },
  });
}
