import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import type { CompteTechnicien } from "../types/utilisateur";

export interface CreerCompteTechnicienPayload {
  nom: string;
  identifiant: string;
  motDePasse: string;
}

export function useCreerCompteTechnicien() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreerCompteTechnicienPayload) =>
      apiRequest<CompteTechnicien>("/utilisateurs", { method: "POST", body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["utilisateurs"] });
      // Meme donnee que useTechniciens() (features/interventions), cle differente :
      // sans ca, le technicien nouvellement cree n'apparaitrait pas dans la liste
      // deroulante d'attribution avant un rechargement complet de la page.
      queryClient.invalidateQueries({ queryKey: ["techniciens"] });
    },
  });
}
