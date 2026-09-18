import { useEffect, useRef } from "react";

/**
 * Persiste et restaure la position de defilement d'un conteneur, via
 * `sessionStorage` (survit a un remount complet du composant, ex. retour de
 * Cedric le 2026-09-18 : filtrer une liste, ouvrir le detail d'une ligne,
 * revenir en arriere devait garder la position de defilement). Necessaire
 * car la liste defile dans un `<div overflow-y-auto>` interne, pas dans la
 * fenetre : la restauration native du navigateur ne s'applique qu'au
 * defilement de la fenetre, jamais a un conteneur interne.
 */
export function useScrollRestaure<T extends HTMLElement>(cle: string, pretARestaurer: boolean) {
  const ref = useRef<T>(null);
  const dejaRestaure = useRef(false);

  useEffect(() => {
    if (dejaRestaure.current || !pretARestaurer || !ref.current) return;
    const sauvegarde = sessionStorage.getItem(cle);
    if (sauvegarde) ref.current.scrollTop = Number(sauvegarde);
    dejaRestaure.current = true;
  }, [cle, pretARestaurer]);

  function onScroll() {
    // Le montage initial du conteneur declenche parfois un evenement scroll
    // natif (scrollTop=0) avant meme que l'effet ci-dessus ait pu restaurer
    // la position sauvegardee : ignore tout scroll tant que la restauration
    // n'a pas eu lieu, sinon elle ecrase la valeur avant meme d'etre lue.
    if (!dejaRestaure.current || !ref.current) return;
    sessionStorage.setItem(cle, String(ref.current.scrollTop));
  }

  return { ref, onScroll };
}
