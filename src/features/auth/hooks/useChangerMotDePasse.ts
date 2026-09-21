import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";

export interface ChangerMotDePassePayload {
  motDePasseActuel: string;
  nouveauMotDePasse: string;
}

/** PATCH /auth/mot-de-passe : libre-service, tout compte connecte. */
export function useChangerMotDePasse() {
  return useMutation({
    mutationFn: (payload: ChangerMotDePassePayload) =>
      apiRequest<void>("/auth/mot-de-passe", { method: "PATCH", body: payload }),
  });
}
