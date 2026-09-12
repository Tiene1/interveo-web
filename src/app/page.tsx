"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasValidSession } from "@/features/auth/lib/token";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(hasValidSession() ? "/interventions" : "/connexion");
  }, [router]);

  return null;
}
