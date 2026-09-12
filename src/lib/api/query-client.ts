import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "./types";

/**
 * Une session expiree (401) ailleurs que sur /connexion renvoie a la connexion.
 * Sur /connexion elle-meme (ex: mauvais mot de passe), on laisse le formulaire
 * afficher son propre message d'erreur plutot que de recharger la page.
 */
function onAuthError(error: unknown) {
  if (
    error instanceof ApiError &&
    error.status === 401 &&
    typeof window !== "undefined" &&
    window.location.pathname !== "/connexion"
  ) {
    window.location.assign("/connexion");
  }
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
    queryCache: new QueryCache({ onError: onAuthError }),
    mutationCache: new MutationCache({ onError: onAuthError }),
  });
}
