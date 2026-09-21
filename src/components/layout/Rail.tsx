"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, List, LogOut, Users } from "lucide-react";
import { ChangerMotDePasseModal } from "@/features/auth/components/ChangerMotDePasseModal";
import { clearToken } from "@/features/auth/lib/token";
import { cn } from "@/lib/utils/cn";

const ITEM_CLASSES = "flex h-9 w-9 items-center justify-center rounded-md transition-colors";

export function Rail() {
  const router = useRouter();
  const [modalMotDePasseOuvert, setModalMotDePasseOuvert] = useState(false);

  function seDeconnecter() {
    clearToken();
    router.push("/connexion");
  }

  return (
    <aside className="sticky top-0 flex h-screen shrink-0 flex-col items-center gap-1 overflow-hidden border-r border-line bg-paper py-4">
      <span className="mb-3.5 font-serif text-base font-semibold tracking-tight text-ink-1">I</span>

      <Link
        href="/interventions"
        aria-label="Interventions"
        className={cn(ITEM_CLASSES, "text-ink-1 hover:bg-line-soft")}
      >
        <List size={18} strokeWidth={1.6} />
      </Link>
      <Link
        href="/techniciens"
        aria-label="Techniciens"
        className={cn(ITEM_CLASSES, "text-ink-1 hover:bg-line-soft")}
      >
        <Users size={18} strokeWidth={1.6} />
      </Link>

      <div className="flex-1" />

      {/* Anciennement une icone Reglages decorative et inerte ; devenue le point
          d'entree du changement de mot de passe (2026-09-21). */}
      <button
        type="button"
        onClick={() => setModalMotDePasseOuvert(true)}
        aria-label="Changer mon mot de passe"
        title="Changer mon mot de passe"
        className={cn(ITEM_CLASSES, "text-text-soft hover:bg-line-soft hover:text-ink-1")}
      >
        <KeyRound size={18} strokeWidth={1.6} />
      </button>
      <button
        type="button"
        onClick={seDeconnecter}
        aria-label="Se déconnecter"
        title="Se déconnecter"
        className={cn(ITEM_CLASSES, "text-text-soft hover:bg-danger hover:text-white")}
      >
        <LogOut size={18} strokeWidth={1.6} />
      </button>

      {modalMotDePasseOuvert && <ChangerMotDePasseModal onClose={() => setModalMotDePasseOuvert(false)} />}
    </aside>
  );
}
