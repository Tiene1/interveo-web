"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { List, LogOut, Settings, Users } from "lucide-react";
import { clearToken } from "@/features/auth/lib/token";
import { cn } from "@/lib/utils/cn";

const ITEM_CLASSES = "flex h-9 w-9 items-center justify-center rounded-md transition-colors";

export function Rail() {
  const router = useRouter();

  function seDeconnecter() {
    clearToken();
    router.push("/connexion");
  }

  return (
    <aside className="sticky top-0 flex h-screen shrink-0 flex-col items-center gap-1 overflow-hidden border-r border-line bg-paper py-4">
      <span className="mb-3.5 font-serif text-base font-semibold tracking-tight text-ink-1">S</span>

      <Link
        href="/interventions"
        aria-label="Interventions"
        className={cn(ITEM_CLASSES, "text-ink-1 hover:bg-line-soft")}
      >
        <List size={18} strokeWidth={1.6} />
      </Link>
      <span aria-hidden className={cn(ITEM_CLASSES, "cursor-default text-text-soft")}>
        <Users size={18} strokeWidth={1.6} />
      </span>

      <div className="flex-1" />

      <span aria-hidden className={cn(ITEM_CLASSES, "cursor-default text-text-soft")}>
        <Settings size={18} strokeWidth={1.6} />
      </span>
      <button
        type="button"
        onClick={seDeconnecter}
        aria-label="Se déconnecter"
        title="Se déconnecter"
        className="group mt-2 flex h-7 w-7 items-center justify-center rounded bg-ink-1 font-mono text-[10px] font-semibold text-white transition-colors hover:bg-danger"
      >
        <span className="group-hover:hidden">KB</span>
        <LogOut size={12} strokeWidth={2} className="hidden group-hover:block" />
      </button>
    </aside>
  );
}
