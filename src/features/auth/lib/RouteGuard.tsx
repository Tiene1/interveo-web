"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { hasValidSession } from "./token";

/** Enveloppe les pages protegees : redirige vers /connexion si le jeton est absent ou expire. */
export function RouteGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [autorise, setAutorise] = useState(false);

  useEffect(() => {
    if (!hasValidSession()) {
      router.replace("/connexion");
      return;
    }
    setAutorise(true);
  }, [router]);

  if (!autorise) return null;
  return <>{children}</>;
}
