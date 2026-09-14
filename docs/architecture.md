# architecture.md — Cible `web/` : back-office web SIM Interventions

Structure spécifique au dépôt `web/`. La fiche ADR complète et le socle commun sont dans `docs/ADR.md`, qui fait foi. Le contrat d'API (endpoints, corps) est décrit dans `backend/docs/architecture.md`, qui fait foi pour les types.

- **Stack** : Next.js 14 (App Router), export statique, React Query, Tailwind.
- **Utilisateur unique** : M. Kouassi, au bureau, en ligne. Pas d'offline.
- **Périmètre** : les 10 User Stories MVP qui touchent le back-office, plus US1.5/US1.6/US1.2 (Nice to have promues après livraison du MVP, cf. section 1).

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
| US1.2 | Nouvelle intervention / Modifier | Motif signalé (optionnel, textarea) (**Nice to have promue**) |
| US3.6 | Détail intervention | Client, lieu, motif, type d'équipement, problème, travaux, photos avant/après, technicien, dates |
| US3.7 | Détail intervention | Vignette cliquable, photo en plein écran |
| US1.7 | Détail intervention | Bouton Annuler + confirmation (autorisé si statut `PLANIFIEE`) |
| US1.5 | Détail intervention → Modifier | Formulaire d'édition préempli (client, adresse, téléphones, géolocalisation, date/heure), autorisé si statut `PLANIFIEE` (**Nice to have promue**) |
| US1.6 | Détail intervention → Modifier | Réattribution à un autre technicien, même formulaire (**Nice to have promue**) |

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
        modifier/page.tsx      (formulaire d'édition, id lu via ?id=, même contrainte que detail/, US1.5/US1.6)
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
        components/InterventionForm.tsx      (création et édition, mode 'creer' | 'modifier')
        components/InterventionDetail.tsx
        components/PhotoThumbnails.tsx
        hooks/useInterventions.ts            (query liste, filtres en paramètres)
        hooks/useIntervention.ts             (query détail)
        hooks/useCreateIntervention.ts       (mutation)
        hooks/useModifierIntervention.ts     (mutation PATCH, US1.5/US1.6)
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
- Les filtres période et état (US3.4, US3.5), la recherche (US3.8) sont **hors périmètre MVP**. De même pour le sélecteur de statut « Toutes » et le bouton « Filtres » visibles sur `W2 - Liste interventions.html` : chrome de maquette pour ces mêmes User Stories non construites, volontairement absents de l'implémentation (constat Cédric du 2026-09-14, tranché : pas de fausse UI qui ne fait rien au clic).

### Menu déroulant personnalisé (`components/ui/Select.tsx`) — 2026-09-14
Le `<select>` natif (filtre Technicien, champ Technicien assigné du formulaire) ouvre un menu dessiné par le système d'exploitation, impossible à restyler pour coller au design system — constat Cédric ("pas quelque chose de générique"). Reconstruit à la main (aucune nouvelle dépendance, ni Radix ni Headless UI) : un bouton déclencheur (`role="combobox"`, `aria-expanded`/`aria-controls`/`aria-haspopup`) et un panneau `role="listbox"` positionné en absolu, coché sur l'option sélectionnée. Navigation clavier (flèches, Entrée, Échap), fermeture au clic extérieur. Deux variantes visuelles pour un seul moteur d'interaction : `variant="field"` (soulignement + icône, même gabarit que `Champ` dans `InterventionForm.tsx`) et `variant="inline"` (libellé + valeur + chevron, sans bordure visible par défaut, pour `InterventionsFiltres.tsx`). Remplace l'ancien `Select.tsx` (wrapper de `<select>` natif jamais branché nulle part) au même emplacement.

**Piège de test rencontré (2 tentatives, corrigé)** : `scrollIntoView` n'existe pas dans jsdom — chaînage optionnel sur l'appel (`?.()`), pas seulement sur le nœud, sinon `TypeError` silencieuse qui casse le rendu du composant en test. Plusieurs tests de `InterventionForm.test.tsx` utilisaient `await screen.findByText("Awa Traore", { exact: false })` comme simple signal « les techniciens ont fini de charger » — cassé par ce composant, dont les options ne sont dans le DOM que menu ouvert (contrairement aux `<option>` d'un `<select>` natif, toujours présentes). Remplacé par un helper `attendreTechniciensCharges()` qui ouvre le menu, attend l'option, puis referme.

### Photos
- `GET /photos/:id` exige le JWT dans l'en-tête, donc un `<img src>` direct ne suffit pas. `usePhoto` récupère la photo en `blob`, crée un `objectURL`, le libère au démontage.
- `PhotoThumbnails` affiche les catégories AVANT et APRES séparément. Clic sur une vignette : `PhotoLightbox` en plein écran.

### Géolocalisation
- Sur le détail, la géolocalisation est un lien qui ouvre Google Maps dans un nouvel onglet (`lib/utils/maps.ts` gère les deux formes : lien Google Maps collé tel quel, ou coordonnées `lat,lng`).

### Formulaire de création et d'édition
- Champs : nom du client, adresse, téléphone 1 (requis), téléphone 2 (optionnel), géolocalisation (optionnel), motif signalé (optionnel), date et heure prévues, technicien (`components/ui/Select.tsx`, cf. section "Menu déroulant personnalisé" ci-dessous).
- **Pas de champ « type d'équipement »** (renseigné côté mobile, US2.4 Nice to have).
- **Édition (US1.5/US1.6)** : mêmes champs, préremplis depuis l'intervention chargée. Bouton « Modifier » sur l'écran de détail, visible seulement si `PLANIFIEE` (même règle que l'annulation US1.7). `telephone2`/`geolocalisation`/`motifSignale` toujours envoyés au PATCH (même vides) : une chaîne vide efface explicitement le champ côté API, contrairement à la création où ces champs optionnels vides sont simplement omis du corps de la requête.
- **Motif signalé (US1.2) promu le 2026-09-14** : Cédric a remarqué, en testant le mobile, que « Motif signalé » s'affichait toujours « non renseigné » sur le détail (US2.2/US3.6) faute de tout moyen de le saisir — incohérence déjà actée sans correctif en Phase II (`docs/ADR.md` backend, incohérence n°2). Plutôt que de masquer l'affichage, US1.2 est promue comme US1.5/US1.6 l'ont été : `<textarea>` optionnel ajouté en fin de la section « Client et lieu » (pas de composant `Champ` réutilisé, celui-ci ne gère que `<input>` — la fonction `champ()` généralisée pour accepter aussi `HTMLTextAreaElement`). Backend : `motifSignale` était déjà accepté à la création (`CreateInterventionDto`), ajouté au PATCH (`PatchInterventionDto`, `interventions.service.ts`) avec la même sémantique « chaîne vide efface » que `telephone2`/`geolocalisation`.

### Référence courte (`lib/reference.ts`) retirée de l'affichage — 2026-09-14
Cédric a demandé le retrait des références courtes (`referenceCourte()`, ex. `#0142`) partout où elles restaient visibles côté web : l'en-tête du détail (`InterventionDetail.tsx`, à côté de « Créée le … »), la lightbox photo (`PhotoLightbox.tsx`, à côté du nom du client) et la modale de confirmation d'annulation (`ConfirmationAnnulationModal.tsx`). Même raisonnement que le retrait déjà fait sur mobile (commit `5147612`) et sur la colonne « Réf. » du tableau liste (12/09) : sans utilité visuelle pour le directeur, qui identifie une intervention par le client et la date. Texte simplement retiré, rien ne le remplace. **`lib/reference.ts` (`referenceCourte()`) n'est plus appelé nulle part dans `src/`** — laissé en place (pas de suppression de fichier sans confirmation explicite), à supprimer si Cédric confirme.

### Bouton Retour étendu à la création et l'édition — 2026-09-14
`BoutonRetour` existait déjà sur le détail (ajouté le 12/09), mais pas sur `InterventionForm.tsx` (création/édition) — demandé par Cédric. Promu en composant partagé `components/ui/BoutonRetour.tsx` (prend un `href` optionnel, `/interventions` par défaut). `InterventionForm.tsx` lui passe `destinationAnnuler` (déjà calculé pour le bouton « Annuler » du bas de page) : `/interventions` en création, `/interventions/detail?id=` en édition — même cible, deux affordances.

### Environnement de développement
- **Serveur de dev sur le port 3001** (`next dev -p 3001`, `next start -p 3001`) — `next dev` démarre sur le port 3000 par défaut, en conflit avec le backend NestJS qui écoute déjà sur ce port en local. `NEXT_PUBLIC_API_URL` reste `http://localhost:3000` (celui du backend, inchangé).

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

- Filtres période et état, recherche par mot-clé (US3.4, US3.5, US3.8).
- Exports PDF et CSV (US3.9, US3.10).
- Écrans de gestion des comptes techniciens (US4.5 à US4.9).
- Champ « type d'équipement » dans le formulaire (US2.4 Nice to have, non promue).
- Toute consultation mobile pour M. Kouassi.

---

## 6. Icônes de la barre latérale (Rail)

Décision du 2026-09-12, suite à un retour d'usage de Cédric. Trois icônes décoratives dans la maquette GenSpark, aucune ne correspond à un écran du MVP :

| Icône | Statut | Justification |
|---|---|---|
| Calendrier | **Retirée** | Vérifié dans `Docs/SIM_Abidjan_UserStories_01-09-26.docx` : ne correspond à aucune des 39 User Stories, ni MVP ni Nice to have. Pure invention décorative GenSpark, aucun besoin réel derrière. |
| Techniciens | Gardée, inerte | US4.5 à US4.9 (créer/lister/désactiver un compte technicien, réinitialiser un mot de passe). Nice to have, mais besoin opérationnel réel : aujourd'hui la seule façon de gérer les comptes techniciens est le script `prisma/seed.ts`, aucun moyen de le faire sans toucher au code. |
| Paramètres | Gardée, inerte | Pas de User Story avant cette date. Ancrée sur **US4.8** (« changer son propre mot de passe », jamais rattachée à un écran auparavant), classée Nice to have. Pistes de réglages proposées par l'agent et à valider/décomposer par Cédric avant de devenir des User Stories formelles : nombre d'interventions par page (facile, actuellement fixé à 20 dans `PaginationDto`), coordonnées de l'entreprise pour les futurs exports PDF/CSV (US3.9/US3.10), durée de session avant déconnexion automatique (fixée en dur à 30 jours côté JWT backend), politique de conservation des photos (aucune limite aujourd'hui). Écarté : notifications email/SMS (infra hors périmètre MVP), personnalisation visuelle/logo, multi-comptes directeur, aucun besoin exprimé pour ces trois. |
