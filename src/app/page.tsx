"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/features/auth/lib/token";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getToken() ? "/interventions" : "/connexion");
  }, [router]);

  return null;
}
