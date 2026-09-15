import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";

export function useSupprimerIntervention(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiRequest<void>(`/interventions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      // L'intervention n'existe plus : invalide la liste (le detail, lui,
      // n'a plus lieu d'etre refetch, la page redirige juste apres).
      queryClient.invalidateQueries({ queryKey: ["interventions"] });
    },
  });
}
