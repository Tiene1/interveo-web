import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";

export function useSupprimerCompteTechnicien(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiRequest<void>(`/utilisateurs/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilisateurs"] });
      queryClient.invalidateQueries({ queryKey: ["techniciens"] });
    },
  });
}
