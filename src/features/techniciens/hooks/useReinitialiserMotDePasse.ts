import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import type { CompteTechnicien } from "../types/utilisateur";

export function useReinitialiserMotDePasse(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (motDePasse: string) =>
      apiRequest<CompteTechnicien>(`/utilisateurs/${id}/reinitialiser-mot-de-passe`, {
        method: "PATCH",
        body: { motDePasse },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilisateurs"] });
    },
  });
}
