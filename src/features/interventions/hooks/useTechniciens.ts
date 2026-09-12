import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import type { Technicien } from "../types/intervention";

export function useTechniciens() {
  return useQuery({
    queryKey: ["techniciens"],
    queryFn: () => apiRequest<Technicien[]>("/utilisateurs?role=TECHNICIEN&actif=true"),
  });
}
