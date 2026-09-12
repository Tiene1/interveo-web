import { beforeEach, describe, expect, it } from "vitest";
import { getToken, hasValidSession, setToken } from "./token";

function makeJwt(exp: number): string {
  const base64url = (value: string) =>
    btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({ sub: "test", exp }));
  return `${header}.${payload}.signature`;
}

describe("hasValidSession", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renvoie false sans jeton", () => {
    expect(hasValidSession()).toBe(false);
  });

  it("renvoie true pour un jeton dont l'expiration est future", () => {
    setToken(makeJwt(Math.floor(Date.now() / 1000) + 3600));
    expect(hasValidSession()).toBe(true);
  });

  it("renvoie false et purge un jeton expire", () => {
    setToken(makeJwt(Math.floor(Date.now() / 1000) - 3600));
    expect(hasValidSession()).toBe(false);
    expect(getToken()).toBeNull();
  });
});
