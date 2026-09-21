import { clearToken, getToken } from "@/features/auth/lib/token";
import { ApiError, type ApiErrorBody } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Requete JSON authentifiee vers l'API. Sur 401, purge le jeton : c'est
 * ensuite RouteGuard qui redirige vers /connexion (pas ce module).
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...authHeaders(),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401) {
    clearToken();
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => undefined)) as ApiErrorBody | undefined;
    throw new ApiError(response.status, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

/**
 * Reveille le serveur sans rien attendre ni signaler. L'offre gratuite de
 * l'hebergeur endort le backend apres ~15 min d'inactivite et il met jusqu'a
 * une minute a repondre : appele a l'ouverture de la page de connexion, le
 * reveil se fait pendant que l'utilisateur saisit ses identifiants.
 */
export function reveillerServeur(): void {
  fetch(`${API_URL}/health`).catch(() => undefined);
}

/** Recupere un fichier protege par JWT (photos) en blob, jamais via <img src> direct. */
export async function apiFetchBlob(path: string): Promise<Blob> {
  const response = await fetch(`${API_URL}${path}`, { headers: authHeaders() });

  if (response.status === 401) {
    clearToken();
  }
  if (!response.ok) {
    throw new ApiError(response.status, undefined);
  }
  return response.blob();
}
