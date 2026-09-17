import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import type { CompteTechnicien } from "../types/utilisateur";

/**
 * Contrairement a useDesactiverCompteTechnicien(id) (id fixe a la creation
 * du hook, pour alimenter une modale de confirmation par instance), la
 * reactivation n'a pas de modale : action a faible risque, immediatement
 * reversible par une nouvelle desactivation, meme principe que "Reessayer"
 * ailleurs dans l'app. L'id est donc passe a mutate(), pas au hook.
 */
export function useReactiverCompteTechnicien() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<CompteTechnicien>(`/utilisateurs/${id}/reactiver`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilisateurs"] });
      queryClient.invalidateQueries({ queryKey: ["techniciens"] });
    },
  });
}
