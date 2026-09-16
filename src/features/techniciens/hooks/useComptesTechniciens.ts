import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import type { CompteTechnicien } from "../types/utilisateur";

/** US4.6. Tous les comptes techniciens (actifs et inactifs) : contrairement a
 * useTechniciens (features/interventions), qui ne liste que les actifs pour
 * la liste deroulante d'attribution, cet ecran doit aussi montrer les inactifs. */
export function useComptesTechniciens() {
  return useQuery({
    queryKey: ["utilisateurs", "techniciens"],
    queryFn: () => apiRequest<CompteTechnicien[]>("/utilisateurs?role=TECHNICIEN"),
  });
}
