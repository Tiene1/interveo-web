import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import type { ProfilUtilisateur } from "./useMoi";

/**
 * PATCH /auth/nom : libre-service, tout compte connecte. Le backend renvoie
 * le profil a jour (200) pour permettre une mise a jour immediate de
 * l'affichage sans attendre un prochain GET /auth/moi.
 */
export function useChangerNom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nom: string) =>
      apiRequest<ProfilUtilisateur>("/auth/nom", { method: "PATCH", body: { nom } }),
    onSuccess: (profil) => {
      queryClient.setQueryData(["moi"], profil);
    },
  });
}
