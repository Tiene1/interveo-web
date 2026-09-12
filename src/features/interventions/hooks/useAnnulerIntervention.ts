import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import type { Intervention } from "../types/intervention";

export function useAnnulerIntervention(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiRequest<Intervention>(`/interventions/${id}`, {
        method: "PATCH",
        body: { statut: "ANNULEE" },
      }),
    onSuccess: () => {
      // Prefixe partage par la liste (["interventions", filtre]) et le detail
      // (["interventions", "detail", id]) : les deux sont rafraichis.
      queryClient.invalidateQueries({ queryKey: ["interventions"] });
    },
  });
}
