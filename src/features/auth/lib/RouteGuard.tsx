"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "./token";

/** Enveloppe les pages protegees : redirige vers /connexion si aucun jeton n'est present. */
export function RouteGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [autorise, setAutorise] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/connexion");
      return;
    }
    setAutorise(true);
  }, [router]);

  if (!autorise) return null;
  return <>{children}</>;
}
