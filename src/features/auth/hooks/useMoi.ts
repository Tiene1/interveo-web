import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";

export interface ProfilUtilisateur {
  id: string;
  nom: string;
  identifiant: string;
  role: "TECHNICIEN" | "DIRECTEUR";
}

/** GET /auth/moi, meme endpoint que le mobile (AuthService.nomTechnicien()). */
export function useMoi() {
  return useQuery({
    queryKey: ["moi"],
    queryFn: () => apiRequest<ProfilUtilisateur>("/auth/moi"),
  });
}
