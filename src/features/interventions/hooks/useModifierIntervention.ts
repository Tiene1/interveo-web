import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import type { Intervention } from "../types/intervention";
import type { CreerInterventionPayload } from "./useCreerIntervention";

export function useModifierIntervention(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreerInterventionPayload) =>
      apiRequest<Intervention>(`/interventions/${id}`, { method: "PATCH", body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interventions"] });
    },
  });
}
