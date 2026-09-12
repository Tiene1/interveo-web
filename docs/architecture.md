# architecture.md — Cible `web/` : back-office web SIM Interventions

Structure spécifique au dépôt `web/`. La fiche ADR complète et le socle commun sont dans `docs/ADR.md`, qui fait foi. Le contrat d'API (endpoints, corps) est décrit dans `backend/docs/architecture.md`, qui fait foi pour les types.

- **Stack** : Next.js 14 (App Router), export statique, React Query, Tailwind.
- **Utilisateur unique** : M. Kouassi, au bureau, en ligne. Pas d'offline.
- **Périmètre** : les 10 User Stories MVP qui touchent le back-office.

---

## 1. User Stories couvertes

| US | Écran | Élément |
|---|---|---|
| US4.4 | Connexion | Identifiant, mot de passe, bouton, message d'erreur |
| US3.1 | Interventions (liste) | Tableau de toutes les interventions, plus récentes en premier |
| US3.2 | Interventions (liste) | Filtre « Client » |
| US3.3 | Interventions (liste) | Filtre « Technicien » (liste déroulante) |
| US1.1 | Nouvelle intervention | Nom du client, date et heure prévues, technicien |
| US1.8 | Nouvelle intervention | Adresse, téléphone 1, téléphone 2 (optionnel), géolocalisation (optionnel) |
| US1.3 | Nouvelle intervention | Liste déroulante technicien alimentée par `GET /utilisateurs?role=TECHNICIEN&actif=true` |
| US3.6 | Détail intervention | Client, lieu, motif, type d'équipement, problème, travaux, photos avant/après, technicien, dates |
| US3.7 | Détail intervention | Vignette cliquable, photo en plein écran |
| US1.7 | Détail intervention | Bouton Annuler + confirmation (autorisé si statut `PLANIFIEE`) |

---

## 2. Arborescence

```
web/
  docs/
    ADR.md
    architecture.md
  CLAUDE.md
  .env.example                 (NEXT_PUBLIC_API_URL)
  next.config.mjs              (output: 'export')
  package.json
  tsconfig.json
  tailwind.config.ts
  src/
    app/
      layout.tsx
      page.tsx                 (redirige vers /interventions si connecté, sinon /connexion)
      connexion/page.tsx
      interventions/
        page.tsx               (liste + filtres)
        nouvelle/page.tsx      (formulaire de création)
        detail/page.tsx        (détail, id lu via ?id= — voir note ci-dessous)
    features/
      auth/
        components/LoginForm.tsx
        hooks/useAuth.ts        (état de session, redirection)
        hooks/useLogin.ts       (mutation POST /auth/login)
        lib/token.ts            (lecture/écriture du JWT côté client)
        lib/RouteGuard.tsx      (redirige vers /connexion si pas de session)
      interventions/
        components/InterventionsTable.tsx
        components/InterventionFilters.tsx   (client, technicien)
        components/InterventionForm.tsx      (création)
        components/InterventionDetail.tsx
        components/PhotoThumbnails.tsx
        hooks/useInterventions.ts            (query liste, filtres en paramètres)
        hooks/useIntervention.ts             (query détail)
        hooks/useCreateIntervention.ts       (mutation)
        hooks/useCancelIntervention.ts       (mutation)
        hooks/useTechniciens.ts              (query GET /utilisateurs)
        hooks/usePhoto.ts                    (fetch blob avec le JWT)
        types/intervention.ts                (aligné sur les DTO backend)
    lib/
      api/
        client.ts             (wrapper fetch, ajoute le JWT, base = NEXT_PUBLIC_API_URL)
        query-client.ts        (config React Query)
      utils/
        maps.ts               (construit le lien Google Maps à partir de la géolocalisation)
    components/
      ui/                      (Button, Input, Select, Field, Table, Dialog, PhotoLightbox, EmptyState, ErrorState, Spinner)
  test/                        (Vitest, couverture > 70 %)
```

Règle : **pas de `lib/database/`**, aucun accès base de données depuis l'app web. Tout passe par `lib/api/client.ts`.

---

## 3. Les 4 états d'écran

Chaque écran qui charge des données gère explicitement les 4 états : **chargement**, **erreur**, **vide**, **données**. Composants dédiés dans `components/ui/` (`Spinner`, `ErrorState`, `EmptyState`).

---

## 4. Points de conception spécifiques à l'app web

### Authentification
- Connexion via `POST /auth/login`, le JWT est conservé côté client (`lib/token.ts`, `localStorage`).
- `RouteGuard` : au montage, si pas de token, redirection vers `/connexion`. Sur une réponse `401`, purge du token et redirection.
- Le client API ajoute `Authorization: Bearer <jwt>` à chaque requête.

### State serveur
- Tout le state serveur passe par **React Query** : `useInterventions`, `useIntervention`, `useTechniciens` (queries), `useCreateIntervention`, `useCancelIntervention` (mutations avec invalidation de la liste).
- Pas de store global (Redux, Zustand). Le peu d'état local (valeurs des filtres, ouverture de la lightbox) reste dans les composants.

### Filtres
- Filtres « client » et « technicien » combinables, passés en paramètres de `GET /interventions?client=&technicienId=`.
- Les filtres période et état (US3.4, US3.5), la recherche (US3.8) sont **hors périmètre MVP**.

### Photos
- `GET /photos/:id` exige le JWT dans l'en-tête, donc un `<img src>` direct ne suffit pas. `usePhoto` récupère la photo en `blob`, crée un `objectURL`, le libère au démontage.
- `PhotoThumbnails` affiche les catégories AVANT et APRES séparément. Clic sur une vignette : `PhotoLightbox` en plein écran.

### Géolocalisation
- Sur le détail, la géolocalisation est un lien qui ouvre Google Maps dans un nouvel onglet (`lib/utils/maps.ts` gère les deux formes : lien Google Maps collé tel quel, ou coordonnées `lat,lng`).

### Formulaire de création
- Champs : nom du client, adresse, téléphone 1 (requis), téléphone 2 (optionnel), géolocalisation (optionnel), date et heure prévues, technicien (select).
- **Pas de champ « motif signalé »** dans le MVP (US1.2 Nice to have).
- **Pas de champ « type d'équipement »** (renseigné côté mobile, US2.4 Nice to have).

### Déploiement
- `output: 'export'` : build statique dans `out/`, servi par Nginx sur le VPS.
- Pas de route API Next, pas de SSR, pas de server actions.
- `NEXT_PUBLIC_API_URL` pointe vers l'API (même domaine, chemin `/api` routé par Nginx).
- **Pas de route dynamique par segment de chemin** (`[id]`) : `output: 'export'` exige
  `generateStaticParams()` connu au build, incompatible avec des identifiants
  d'intervention créés en continu (testé : `next build` échoue même avec un
  tableau vide). Le détail vit donc sur une route statique `interventions/detail`,
  l'identifiant passé en paramètre de requête (`?id=`) et lu côté client
  (`useSearchParams`, dans une limite `Suspense`). Même règle à appliquer si
  d'autres écrans à identifiant dynamique s'ajoutent plus tard.

---

## 5. Hors périmètre de l'app web pour le MVP

- Modifier ou réattribuer une intervention (US1.5, US1.6).
- Filtres période et état, recherche par mot-clé (US3.4, US3.5, US3.8).
- Exports PDF et CSV (US3.9, US3.10).
- Écrans de gestion des comptes techniciens (US4.5 à US4.9).
- Champ « motif signalé » dans le formulaire, champ « type d'équipement ».
- Toute consultation mobile pour M. Kouassi.
