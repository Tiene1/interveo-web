# CLAUDE.md — Dépôt `web/` : back-office web Interveo

Règles pour l'agent Claude Code de ce dépôt. Tu écris le back-office web Next.js d'Interveo, un outil de suivi d'interventions techniques pour PME du bâtiment (électricité, sécurité électronique, domotique, plomberie, climatisation...), utilisé par le responsable de l'entreprise, au bureau, en ligne.

## Sources de vérité

- `docs/ADR.md` : fiche ADR complète, socle commun (modèles, énumérations, relations), tableau une ligne par User Story MVP. **Ne se refactore pas.**
- `docs/architecture.md` : structure du dépôt `web/`, arborescence, écrans, points de conception.
- `../backend/docs/architecture.md` : le contrat d'API (endpoints, méthode, corps, rôle requis). Fait foi pour les types de l'app web.
- En cas d'ambiguïté ou d'incomplétude d'un document, tu t'arrêtes et tu demandes.

## Langue

Réponds toujours en français.

## Méthode de travail (Phase III)

- **Un ticket = une seule responsabilité**, avec son **périmètre explicite listé** : fichiers, écrans, hooks concernés. Tu ne modifies que ce périmètre.
- Dès que tu envisages de toucher un fichier hors périmètre, tu **t'arrêtes et tu demandes avant d'agir**. Formulation : *« Ceci est hors du périmètre du ticket [X]. Je le note en dette technique et je continue sur le périmètre prévu, confirme si tu veux que je traite ça maintenant à la place. »*
- **Definition of Done** : le code compile, le cas nominal fonctionne (test manuel de Cédric en 1 à 2 minutes), aucun crash évident. Pas un critère de perfection ni de couverture à 100 %.
- **3 tentatives maximum** sur un bug donné, puis tu rends la main avec l'explication précise du blocage.
- **Un commit par ticket terminé**. Jamais un commit géant en fin de session.
- **Transparence des commandes** : tu affiches les commandes exactes que tu exécutes (git, build, dev, tests).
- La **dette technique** hors scope se note dans une liste, elle ne se résout pas en boucle en cours de développement.

## Périmètre fonctionnel

- **Seulement les 10 User Stories MVP** qui touchent le back-office (voir `docs/architecture.md` section 1). Le Nice to have est hors périmètre.
- Pas de champ « motif signalé » ni « type d'équipement » dans le formulaire de création.
- Pas de filtres période et état, pas de recherche, pas d'export PDF ou CSV, pas de modification ou réattribution d'intervention, pas d'écran de gestion de comptes.

## Règles de l'app web

- **Pas de `lib/database/`**, aucun accès base de données. Tout passe par `lib/api/client.ts`.
- **Les 4 états d'écran** (chargement, erreur, vide, données) sont gérés explicitement sur chaque écran qui charge des données.
- State serveur : **React Query** uniquement. Pas de store global (Redux, Zustand). L'état local simple (filtres, lightbox) reste dans les composants.
- Types de l'app web **alignés sur les DTO du backend** (`../backend/docs/architecture.md`). Si le contrat d'API est ambigu, tu demandes plutôt que d'inventer.
- Le **socle** (modèles, énumérations dans `docs/ADR.md`) ne se refactore pas.

## Stack imposée

Next.js 14 App Router, **export statique** (`output: 'export'`), React Query, Tailwind. Pas de SSR, pas de route API Next, pas de server actions. `NEXT_PUBLIC_API_URL` en variable d'environnement.

## Sécurité

- Aucun secret dans le code. Seule variable : `NEXT_PUBLIC_API_URL` (publique par nature).
- JWT conservé côté client (`localStorage`), ajouté en `Authorization: Bearer` par le client API, purgé sur `401`.
- Les photos (`GET /photos/:id`) se récupèrent en `blob` avec l'en-tête d'autorisation, jamais via un `<img src>` direct.

## Tests

- Vitest. Couverture **> 70 %** (règle de Cédric pour le front).
- Cas à couvrir : connexion échouée, liste vide, erreur réseau, filtres combinés, annulation d'une intervention déjà réalisée (bouton désactivé).

## Confirmation obligatoire avant

- Tout déploiement.
- Toute suppression de fichier.

## Commandes que tu affiches toujours

```
npm run dev
npm run build
npm test
git add -A && git commit -m "<ticket> : <résumé>"
```
