import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import type { CompteTechnicien } from "../types/utilisateur";

export function useDesactiverCompteTechnicien(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiRequest<CompteTechnicien>(`/utilisateurs/${id}/desactiver`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilisateurs"] });
      // Le technicien desactive ne doit plus apparaitre dans la liste
      // deroulante d'attribution (features/interventions), meme raison
      // que pour la creation (useCreerCompteTechnicien).
      queryClient.invalidateQueries({ queryKey: ["techniciens"] });
    },
  });
}
