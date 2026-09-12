import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";
import { setToken } from "../lib/token";

export interface LoginPayload {
  identifiant: string;
  motDePasse: string;
}

interface LoginResult {
  accessToken: string;
}

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      apiRequest<LoginResult>("/auth/login", { method: "POST", body: payload }),
    onSuccess: (data) => setToken(data.accessToken),
  });
}
