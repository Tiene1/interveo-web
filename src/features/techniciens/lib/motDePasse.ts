const LONGUEUR_MIN_MOT_DE_PASSE = 8;

/** Meme regle que backend/src/modules/utilisateurs/dto (CreateUtilisateurDto/ReinitialiserMotDePasseDto). */
const REGEX_COMPLEXITE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).+$/;

/** Retourne le message d'erreur si le mot de passe est invalide, undefined sinon. */
export function validerMotDePasse(motDePasse: string): string | undefined {
  if (motDePasse.length < LONGUEUR_MIN_MOT_DE_PASSE) {
    return `Le mot de passe doit contenir au moins ${LONGUEUR_MIN_MOT_DE_PASSE} caractères.`;
  }
  if (!REGEX_COMPLEXITE.test(motDePasse)) {
    return "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.";
  }
  return undefined;
}
