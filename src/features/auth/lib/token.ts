const STORAGE_KEY = "sim-interventions.jwt";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(STORAGE_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

/** Lit la date d'expiration (claim "exp") du JWT, sans verifier sa signature. */
function readExpiry(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof json.exp === "number" ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * true si un jeton est present et pas visiblement expire. Purge le jeton
 * expire au passage, pour que / et RouteGuard renvoient toujours vers
 * /connexion dans ce cas, comme si l'utilisateur n'etait pas connecte.
 */
export function hasValidSession(): boolean {
  const token = getToken();
  if (!token) return false;

  const expiry = readExpiry(token);
  if (expiry !== null && expiry <= Date.now()) {
    clearToken();
    return false;
  }
  return true;
}
