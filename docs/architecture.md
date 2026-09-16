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
| US3.5 | Interventions (liste) | Filtre « Statut » (liste déroulante Toutes/Planifiées/Réalisées/Annulées) (**Nice to have promue**) |
| US3.4 | Interventions (liste) | Filtre « Période » (Du/Au, sur date prévue), panneau « Filtres » (**Nice to have promue**) |
| US3.8 | Interventions (liste) | Recherche mot-clé (adresse/motif/problème/travaux), même panneau « Filtres » (**Nice to have promue**) |
| US3.10 | Interventions (liste) | Export CSV de la liste filtrée (`;`, BOM UTF-8, libellés français) (**Nice to have promue**) |
| US3.9 | Détail intervention | Export PDF texte (sans photos, décidé avec Cédric), généré côté client (**Nice to have promue**) |
| US4.6 | Techniciens (liste) | Tableau des comptes techniciens, actifs et inactifs (**Nice to have promue**) |
| US4.5 | Techniciens (liste) | Modale « Créer un compte technicien » (nom, identifiant, mot de passe) (**Nice to have promue**) |
| US4.7 | Techniciens (liste) | Bouton « Désactiver » par ligne (comptes actifs seulement) + confirmation (**Nice to have promue**) |
| US4.9 | Techniciens (liste) | Bouton « Réinitialiser » par ligne (toutes lignes) + modale mot de passe (**Nice to have promue**) |
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
- Filtres « recherche » (mot-clé, fusionné avec l'ancien filtre client le 2026-09-16, cf. section dédiée ci-dessous), « technicien », « statut » et « période » combinables, passés en paramètres de `GET /interventions?motCle=&technicienId=&statut=&dateDebut=&dateFin=`.

### Filtre par statut (US3.5, promu le 2026-09-16)
Premier ticket Nice to have après validation de la recette Must have par Cédric. Le sélecteur « Toutes ⌄ » à côté du titre, jusque-là un `<span aria-hidden>` décoratif, est remplacé par le composant `Select` (`variant="inline"`, cf. « Menu déroulant personnalisé » ci-dessous) déjà utilisé pour le filtre Technicien — même moteur, pas de nouveau composant. Options `Toutes`/`Planifiées`/`Réalisées`/`Annulées` (`value=""` pour Toutes, absent du paramètre de requête). Backend : `ListInterventionsDto.statut` (`@IsEnum(StatutIntervention)`, optionnel), transmis tel quel à `InterventionsRepository.list()` (`where.statut`). Le changement de statut réinitialise la page à 1 et entre dans le calcul de `filtreActif` (déclenche l'état « Aucun résultat » avec réinitialisation groupée client/technicien/statut), au même titre que les deux filtres existants.

### Filtre par période et recherche par mot-clé (US3.4 et US3.8, promus le 2026-09-16)
Deuxième et troisième tickets Nice to have, juste après US3.5, regroupés dans le même composant `InterventionsFiltresPanneau.tsx` (renommé depuis `InterventionsFiltrePeriode.tsx` du ticket US3.4 dès l'ajout du mot-clé, pour rester exact — même fichier, même bouton). Le bouton « Filtres », jusque-là un `<span aria-hidden>` décoratif, devient un vrai bouton qui ouvre un panneau positionné en absolu (même styling que le panneau du `Select` maison : `border-line`, `bg-paper`, `shadow`) :
- **Période** : deux champs `<input type="date">` (réutilise `components/ui/Input.tsx`, pas de nouveau composant de champ), « Du » et « Au ». Filtre sur `datePrevue` (colonne affichée sur la liste, cohérent avec le tri annoncé « Trié par date prévue »), pas sur `creeLe`.
- **Mot-clé** (US3.8, portée précisée avec Cédric — le CDC ne détaillait pas les champs couverts) : un champ texte, recherche **OR** sur adresse/motif signalé/problème constaté/travaux réalisés. Le filtre « Client » existant reste séparé et inchangé, pas absorbé par ce champ.

Les deux fermetures au clic extérieur et à `Échap`, même mécanique que `Select.tsx`. Appliqués immédiatement à chaque changement (mot-clé débounced comme le filtre Client, via `useDebouncedValue`), comme les autres filtres de l'écran ; entrent dans le calcul de `filtreActif` et de `reinitialiserFiltres`. Bouton mis en évidence (`border-ink-1 bg-line-soft`) quand une des trois valeurs est active, un lien « Réinitialiser » propre au panneau efface les trois sans fermer les filtres Client/Technicien/Statut.

Backend : `ListInterventionsDto.dateDebut`/`dateFin` (`@Type(() => Date)`, `@IsDate()`, optionnels chacun), 400 explicite si `dateDebut > dateFin` (`InterventionsService.lister()`). `InterventionsRepository.list()` filtre `datePrevue` avec `gte: dateDebut` et `lt: lendemainMinuit(dateFin)` — **borne haute exclusive sur le lendemain**, pas `lte: dateFin`, sinon une intervention prévue l'après-midi du dernier jour de la période (`datePrevue` a une heure, le filtre ne reçoit qu'une date) serait exclue à tort. Abidjan étant sur le même fuseau que UTC (`Africa/Abidjan` = UTC+0), une date seule envoyée par le `<input type="date">` du navigateur correspond exactement à minuit local, sans décalage à gérer. `motCle` ajoute un bloc `OR` au `where` Prisma, cohabitant avec les conditions `AND` implicites des autres filtres (syntaxe valide de `Prisma.InterventionWhereInput`, pas de conflit avec `client`/`technicienId`/`statut`/`datePrevue`).

### Fusion du filtre client et de la recherche mot-clé (US3.2/US3.8, le 2026-09-16, après recette Nice to have)
**Corrige l'affirmation ci-dessus** (« le filtre Client existant reste séparé et inchangé ») : retour de Cédric pendant la recette manuelle de la grille Nice to have. Il avait marqué US3.8 « Non », convaincu que la recherche mot-clé ne fonctionnait que sur le nom du client — en réalité il tapait dans le champ « Filtrer par nom de client » (`InterventionsFiltres.tsx`, toujours visible en haut de l'écran), pas dans le champ « Mot-clé » du panneau Filtres (caché derrière un clic). Vérifié en direct côté serveur avant de répondre : `motCle` fonctionnait bien sur `adresse`/`motifSignale`/`problemeConstate`/`travauxRealises`, US3.8 n'avait pas de bug. Diagnostic transmis à Cédric comme un problème de découvrabilité (deux champs de recherche distincts, un visible en permanence et un caché) ; sa décision a été plus radicale que la correction UX proposée : supprimer le champ « Filtrer par nom de client » et faire porter la recherche mot-clé par le champ toujours visible.

- `InterventionsFiltres.tsx` : props renommées `client`/`onClientChange` → `motCle`/`onMotCleChange`. Placeholder « Rechercher un client, une adresse, un motif… », `aria-label="Rechercher une intervention"` (remplace « Filtrer par nom de client »). Largeur du champ élargie (`max-w-[260px]` → `max-w-[320px]`) pour rester lisible avec le nouveau placeholder plus long.
- `InterventionsFiltresPanneau.tsx` : section « Mot-clé » retirée entièrement (label, `<Input>`, entrée dans `filtreActif` et dans le lien « Réinitialiser » du panneau). Le panneau ne contient plus que « Période ».
- `useInterventions.ts` (`InterventionsFiltre`) et `InterventionsListe.tsx` : état `client` supprimé, un seul état `motCle` (débounced) alimente la recherche, l'export CSV et le calcul de `filtreActif`.
- Backend (cf. `backend/docs/architecture.md`) : `ListInterventionsDto.client` retiré, `?client=` désormais rejeté en 400 (`forbidNonWhitelisted`). La clause `OR` de `motCle` inclut désormais `nomClient` en plus des quatre champs déjà couverts par US3.8.

**Piège de fixture e2e découvert à cette occasion, sans lien avec ce ticket** : la suite e2e backend a montré 6 échecs inattendus après ce changement (403 attendu, 401 reçu pour toutes les requêtes authentifiées technicien). Diagnostic : le mot de passe du compte `koffi` (fixture e2e partagée avec la base de dev) ne correspondait plus à `technicien123` — presque certainement changé par Cédric lui-même en testant manuellement le flux US4.9 (réinitialisation de mot de passe) sur ce compte réel plutôt que sur un compte jetable, marqué « OK » dans la grille de recette. Corrigé en réutilisant `PATCH /utilisateurs/:id/reinitialiser-mot-de-passe` (l'endpoint tout juste livré) pour restaurer `technicien123`, plutôt qu'une manipulation SQL directe. Aucune leçon d'architecture ici, juste un rappel : les comptes du seed (`koffi`, `awa`, `serge`, `ismael`, `kouassi`) servent de fixtures aux tests e2e et ne devraient pas être utilisés pour les tests manuels une fois le MVP livré — un compte technicien de test dédié serait plus sûr, noté en dette technique sans être traité ici (hors périmètre de ce ticket).

### Persistance des filtres de la liste à la navigation (bug, corrigé le 2026-09-16)
Retour de Cédric dans le feedback libre de la grille de recette Nice to have : « quand je filtre une liste d'intervention et que je ressors la liste toutes apparait alors qu'elle doit rester sur la liste que j'ai filtrer ». Cause : `InterventionsListe.tsx` gardait les filtres dans du `useState` local pur, jamais reflété dans l'URL ; `BoutonRetour` du détail (`components/ui/BoutonRetour.tsx`) et le bouton « Nouvelle intervention » pointaient vers `/interventions` en dur — remonter le composant `InterventionsListe` (ce que fait toute navigation vers une autre route) repartait donc systématiquement d'un état vierge.

**Périmètre du ticket** : uniquement le flux liste → détail → Retour, et liste → nouvelle intervention → Annuler. Explicitement **hors périmètre**, noté en dette technique : après une création réussie, la redirection vers `/interventions/detail?id=<nouvel id>` ne reporte pas plus loin ce retour — depuis le détail d'une intervention tout juste créée, Retour ramène à la liste sans filtre. Un directeur qui vient de créer une intervention a une pertinence discutable à retomber sur un vieux filtre, pas traité comme un oubli.

- `InterventionsListe.tsx` : les filtres (`technicienId`, `statut`, `dateDebut`, `dateFin`, `motCle`, `page`) sont initialisés depuis `useSearchParams()` puis resynchronisés dans l'URL de `/interventions` via `router.replace()` (jamais empilé dans l'historique) à chaque changement — même principe déjà en place pour `/interventions/detail?id=` (contrainte `output: 'export'`, cf. plus haut), étendu ici à un usage différent (survie au remount, pas juste identification d'une ressource). Nécessite un `<Suspense>` autour du composant dans `app/interventions/page.tsx` (`useSearchParams()` l'exige).
- `InterventionsTable.tsx` : chaque ligne transmet la query filtrée courante au détail via `?retour=<query encodée>` (nouvelle prop `retourQuery`).
- `app/interventions/detail/page.tsx` lit ce `retour` et le transmet à `InterventionDetail` sous forme de prop `hrefListe` (`/interventions?<retour>` décodé, ou `/interventions` par défaut si absent — accès direct par URL inchangé) ; `InterventionDetail.tsx` l'utilise pour ses deux `BoutonRetour` et pour la redirection après suppression (`router.push(hrefListe)`, remplace le `"/interventions"` en dur).
- Même mécanique pour « Nouvelle intervention » : `InterventionsListe.tsx` construit `hrefNouvelle` avec le même `retour`, `app/interventions/nouvelle/page.tsx` (désormais aussi derrière un `<Suspense>`) le lit et le transmet à `InterventionForm` via une nouvelle prop `hrefListe` (mode `creer` uniquement — en modification, Annuler retourne déjà au détail, inchangé), qui remplace le `destinationAnnuler` en dur.

Effet de bord positif, pas cherché mais cohérent avec le principe déjà appliqué à `/interventions/detail?id=` : l'URL de la liste est désormais partageable/rechargeable avec ses filtres (`/interventions?statut=REALISEE&motCle=climatisation` restaure l'état exact).

### Export CSV de la liste (US3.10, promu le 2026-09-16)
Quatrième ticket Nice to have, premier du bloc « Exports ». Bouton « Exporter CSV » (icône `Download`, variant `secondary`) à côté du bouton « Filtres ». **Décision de périmètre prise sans repasser par Cédric** (raisonnement explicité, pas une question bloquante comme US3.8) : exporte la liste telle que **filtrée à l'instant présent** (client/technicien/statut/période/mot-clé combinés), pas seulement la période comme le laissait entendre le CDC (« CSV liste par période ») — un director qui a déjà filtré sur un technicien ou un mot-clé attend logiquement que l'export reflète ce qu'il regarde, pas qu'il reparte d'une liste non filtrée.

**Répartition backend/web délibérée, pour rester dans les limites déjà posées par l'architecture (« le backend fait foi pour les types », les libellés français sont une responsabilité des clients, jamais du backend — cf. `typeEquipement.ts`)** : `GET /interventions/export` renvoie du **JSON brut** (mêmes filtres que `GET /interventions`, sans pagination, technicien inclus en `{ nom }`), pas un CSV déjà généré côté serveur. Le CSV lui-même (`features/interventions/lib/csv.ts`, `genererCsvInterventions()`) est construit côté web, à partir des mêmes fonctions de libellé déjà utilisées par l'écran (`libelleStatut()` exportée de `StatusChip.tsx`, `libelleTypeEquipement()` de `typeEquipement.ts`) et du même formateur de date (`formatDateTime()`). Colonnes : Client, Adresse, Téléphone, Date prévue, Technicien, Statut, Type d'équipement, Date de réalisation, Problème constaté, Travaux réalisés.

**Deux choix de format, documentés pour ne pas être « corrigés » par erreur plus tard** :
- **Séparateur `;`, pas `,`** : Excel en locale française (poste de Cédric/M. Kouassi à Abidjan) traite la virgule comme séparateur décimal ; un CSV `,` s'ouvrirait en une seule colonne sans passer par l'assistant d'import.
- **BOM UTF-8** (`﻿` préfixé au Blob) : sans lui, Excel interprète le fichier en ANSI et casse les accents (« Réalisée » devient illisible).
- Tous les champs sont systématiquement entre guillemets (`champCsv()`), guillemets internes doublés — plus simple et plus sûr que d'échapper seulement quand nécessaire, vu que `problemeConstate`/`travauxRealises` sont du texte libre pouvant contenir `;` ou des guillemets.

Téléchargement en JSON + Blob côté client plutôt qu'en `StreamableFile` côté backend (contrairement à `GET /photos/:id`) : consommer du JSON via `apiRequest` existant suffit, pas besoin du mécanisme d'authentification par blob (`apiFetchBlob`) réservé aux fichiers binaires. `URL.createObjectURL` sur un `Blob` texte + `<a download>` temporaire cliqué puis retiré, `URL.revokeObjectURL` ensuite.

Backend : refactor mineur avant l'ajout — la construction du `where` Prisma (`list()`) a été extraite dans `construireWhere()`, réutilisée telle quelle par la nouvelle `InterventionsRepository.listPourExport()` (mêmes filtres, sans `skip`/`take`) pour ne jamais dupliquer la logique de filtrage entre liste paginée et export. `InterventionsController.exporter()` déclaré **avant** `detail(':id')` : sinon `ParseUUIDPipe` intercepte `"export"` comme un id invalide (400) avant même d'atteindre la bonne route — piège classique de routing Express/Nest avec un segment littéral après un segment paramétré.

### Export PDF du détail (US3.9, promu le 2026-09-16)
Cinquième ticket Nice to have, deuxième et dernier du bloc « Exports ». **Portée décidée avec Cédric avant d'implémenter** (`AskUserQuestion`, le CDC ne précisait pas si les photos avant/après devaient être intégrées) : PDF **texte seul**, sans photos — client, adresse, téléphone(s), géolocalisation, dates, technicien, statut, type d'équipement, motif signalé, problème constaté, travaux réalisés. Les photos restent consultables uniquement dans l'application.

**Génération entièrement côté client** (nouvelle dépendance `jspdf`, aucun changement backend) : `features/interventions/lib/pdf.ts`, `genererPdfIntervention()` construit le document à partir des données déjà chargées par `useIntervention()` sur l'écran de détail — aucun appel réseau supplémentaire, contrairement à l'export CSV qui doit re-fetch une liste non paginée. Réutilise les mêmes fonctions de libellé que le reste de l'écran (`libelleStatut()`, `libelleTypeEquipement()`, `formatDateTime()`, `nonRenseigne()`), aucune duplication de logique de présentation. Bouton « Exporter PDF » toujours visible dans l'en-tête du détail (contrairement à « Modifier »/« Annuler »/« Supprimer », conditionnés au statut) : un rapport doit pouvoir être exporté quel que soit l'état de l'intervention.

**Choix architectural : PDF généré côté web, pas côté backend** (à la différence de ce qu'un premier réflexe suggérait — `pdfkit` côté NestJS, dans la même veine que `StreamableFile` pour les photos). Écarté une fois réalisé que `GET /interventions/:id` renvoie déjà tout le nécessaire (`InterventionDetail`, technicien inclus) : générer le PDF côté client évite un nouvel endpoint, une nouvelle dépendance backend, et reste cohérent avec le principe déjà posé pour le CSV (US3.10) — le backend ne porte jamais de libellé français, cette responsabilité reste entièrement dans `web/`.

`jspdf@^4.2.1` installé (`npm install jspdf`), aucune dépendance native, fonctionne aussi bien en environnement de test (Vitest/jsdom) qu'en navigateur réel — vérifié directement (`doc.output("datauristring")` commence par `data:application/pdf`). Script `postinstall` d'une dépendance transitive (`core-js@3.50.0`) inspecté avant approbation (`npm approve-scripts`) : bannière de soutien au projet, inoffensif, comportement documenté et connu de l'écosystème JS.

### Comptes techniciens (US4.6, promu le 2026-09-16)
Sixième ticket Nice to have, premier du bloc « Comptes techniciens » (US4.6 liste → US4.5 créer → US4.7 désactiver → US4.9 réinitialiser mot de passe, dans cet ordre). **Ticket volontairement limité à la lecture seule** : les actions (créer, désactiver, réinitialiser) sont des tickets séparés, pas ajoutées par anticipation.

**Aucun changement backend** : `GET /utilisateurs?role=TECHNICIEN` existait déjà (US1.3/US3.3, alimente la liste déroulante d'attribution) et renvoie déjà tous les champs publics nécessaires (`nom`, `identifiant`, `actif`, `creeLe`). Nouveau module `features/techniciens/` (parallèle à `features/interventions/`) :
- `hooks/useComptesTechniciens.ts` : **sans** `actif=true`, contrairement à `useTechniciens()` (`features/interventions`) qui filtre les actifs pour la liste déroulante — cet écran doit au contraire montrer les comptes désactivés (c'est tout l'intérêt d'un écran de gestion).
- `components/TechniciensTable.tsx` : même grammaire visuelle que `InterventionsTable.tsx` (barre d'accent au survol, badge d'initiales, colonnes alignées), puce de statut Actif/Inactif calquée sur `StatusChip` mais écrite localement (concept différent, pas les 3 statuts d'intervention) — vert pour Actif, gris neutre pour Inactif (pas de rouge : une désactivation n'est pas une erreur, contrairement à une intervention Annulée).
- `components/TechniciensListe.tsx` : même charpente que `InterventionsListe.tsx` (légende avec décompte réel, états chargement/erreur/vide), pas de filtres (4 techniciens dans le seed, inutile pour l'instant).
- Route `app/techniciens/page.tsx` (`RouteGuard` + `AppShell`, même patron que `app/interventions/page.tsx`).

Icône « Techniciens » du rail (`Rail.tsx`) : `<span aria-hidden>` inerte depuis le 2026-09-12 (cf. section 6), devient un vrai `<Link href="/techniciens">`. Fil d'Ariane « Administration / Techniciens » (nouveau, distinct d'« Opérations / Interventions ») : première fois que l'app a deux sections de navigation top-level, taxonomie introduite ici plutôt que réutiliser « Opérations » à tort.

### Création de compte technicien (US4.5, promu le 2026-09-16)
Deuxième ticket du bloc « Comptes techniciens », juste après US4.6. Backend : `POST /utilisateurs` (`DIRECTEUR`, hérité du contrôleur), crée **toujours** un compte `TECHNICIEN` — le rôle n'est pas un champ du DTO, cet endpoint n'est pas une création d'utilisateur générique. `CreateUtilisateurDto` (`nom`, `identifiant`, `motDePasse` avec `@MinLength(8)`) ; `UtilisateursService.creer()` vérifie l'unicité de l'identifiant en amont (`findByIdentifiant`, 409 explicite) plutôt que de laisser remonter la contrainte `@unique` Prisma brute, puis hash le mot de passe avec `argon2.hash()` (même bibliothèque que `auth.service.ts` et `prisma/seed.ts`, jamais réinventée). `UtilisateursRepository.create()` utilise `select: CHAMPS_PUBLICS` à la création : le hash ne transite jamais, même en mémoire côté contrôleur.

Web : `CreerCompteModal.tsx` (même gabarit que `ConfirmationSuppressionModal.tsx` : `role="dialog"`, overlay flouté, bordure supérieure colorée — `border-t-brand` au lieu de `border-t-danger`, action constructive pas destructive), champ mot de passe avec bouton afficher/masquer copié du `LoginForm.tsx` (pas de composant partagé extrait, deux occurrences seulement, pas encore une règle de trois). Validation locale avant envoi (nom/identifiant non vides, mot de passe ≥ 8 caractères, même seuil que le backend — dupliqué volontairement côté client pour feedback immédiat, la validation qui fait foi reste côté serveur) ; l'erreur serveur (409 identifiant déjà pris) s'affiche telle quelle (`error.message` de `ApiError`, déjà le message français renvoyé par le backend, aucune traduction supplémentaire nécessaire). `useCreerCompteTechnicien()` invalide **deux** clés de requête au succès : `["utilisateurs"]` (cette liste) et `["techniciens"]` (clé distincte utilisée par `useTechniciens()` dans `features/interventions`, qui alimente le menu déroulant d'attribution du formulaire de création d'intervention) — sans la seconde invalidation, un technicien fraîchement créé n'apparaîtrait pas dans ce menu avant un rechargement complet de la page.

**Piège de test rencontré et corrigé** : `Field` (`components/ui/Field.tsx`) accepte une prop `required` qui ajoute un `*` visuel dans le texte du `<label>` — jamais utilisée avant ce ticket (`LoginForm.tsx` ne la passe pas). `screen.getByLabelText("Nom")` échoue alors avec « Unable to find a label with text of: Nom » car le texte réel du label est « Nom *« , pas « Nom » (correspondance exacte par défaut de Testing Library). Corrigé avec un matcher `/^Nom/` (regex, préfixe) plutôt que de retirer `required` — l'astérisque reste une amélioration UX réelle. **À réappliquer pour tout futur test de formulaire utilisant `Field` avec `required`.**

Vérifié de bout en bout dans le navigateur : création réussie (liste 6 → 7, modale fermée automatiquement), doublon d'identifiant refusé avec le message serveur affiché, modale toujours ouverte après l'échec (pas de perte de saisie).

**Complexité de mot de passe ajoutée le 2026-09-16** (feedback libre de la grille de recette Nice to have, même changement backend que `ReinitialiserMotDePasseModal.tsx` ci-dessous) : nouveau `features/techniciens/lib/motDePasse.ts` (`validerMotDePasse()`), seule logique partagée extraite entre les deux modales — contrairement au seuil `@MinLength(8)` (une ligne, dupliquée sans abstraction), la regex de complexité est assez substantielle pour justifier un point de vérité unique, le risque de divergence entre deux copies étant réel. Même regex que le backend (`^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).+$`). Indication statique ajoutée sous le champ (« 8 caractères minimum, avec majuscule, minuscule, chiffre et caractère spécial »), affichée tant qu'aucune erreur n'est déclenchée, remplacée par le message d'erreur sinon — évite que Cédric découvre la règle seulement après un rejet.

### Désactivation de compte technicien (US4.7, promu le 2026-09-16)
Troisième ticket du bloc « Comptes techniciens », juste après US4.5. Backend : `PATCH /utilisateurs/:id/desactiver` (pas de corps, action dédiée plutôt qu'un `PATCH` générique à la `PATCH /interventions/:id`) — décision délibérée : contrairement aux interventions, aucune User Story « modifier nom/identifiant d'un compte » n'existe dans le CDC, donc pas de dispatcher générique à construire ; une route par action reste plus explicite et n'oblige pas à anticiper la forme du DTO d'US4.9 (réinitialisation de mot de passe) à l'avance. Réservé aux comptes `TECHNICIEN` (400 sinon — un `DIRECTEUR`, y compris soi-même, ne peut jamais être désactivé via cet écran), 404 si l'id est inconnu, **idempotent** (désactiver un compte déjà inactif renvoie 200 sans erreur, pas de rejet arbitraire). Aucune logique d'authentification à ajouter : `AuthService.login()`/`moi()` vérifiaient déjà `actif` (garde-fou déjà présent depuis le socle MVP, jamais exploité par une action de désactivation avant ce ticket) — désactiver un compte y coupe donc immédiatement l'accès, connexions futures **et** session en cours (le prochain appel à `GET /auth/moi` échoue).

Web : nouvelle colonne d'action dans `TechniciensTable.tsx`, bouton « Désactiver » (`variant="ghost"`) visible **seulement** si `technicien.actif` — même logique que les boutons conditionnels au statut de `InterventionDetail.tsx`. `ConfirmationDesactivationModal.tsx` (même gabarit que `ConfirmationSuppressionModal.tsx`, texte adapté : pas de destruction de données, juste une perte d'accès). **Piège d'architecture de hook résolu** : `useDesactiverCompteTechnicien(id)` a besoin d'un `id` qui n'est connu qu'au moment où une ligne est sélectionnée (contrairement à `useAnnulerIntervention(id)` dans `InterventionDetail.tsx`, où `id` est fixe pour toute la durée de vie de l'écran) — impossible d'appeler ce hook inconditionnellement en haut de `TechniciensListe.tsx`. Résolu avec un petit composant intermédiaire `DesactivationConnectee` (privé, défini dans `TechniciensListe.tsx`), monté seulement quand `technicienADesactiver` n'est pas `null`, qui appelle le hook avec l'id du technicien reçu en prop. `useDesactiverCompteTechnicien()` invalide les deux mêmes clés que `useCreerCompteTechnicien()` (`["utilisateurs"]`, `["techniciens"]`), même raisonnement : un compte désactivé ne doit plus apparaître dans le menu déroulant d'attribution des interventions.

Vérifié de bout en bout dans le navigateur : désactivation réussie (bouton disparaît de la ligne, statut passe à Inactif, décompte actifs/inactifs mis à jour), confirmée par la requête réseau (`PATCH .../desactiver → 200`).

### Réinitialisation de mot de passe (US4.9, promu le 2026-09-16)
Quatrième et dernier ticket du bloc « Comptes techniciens », ferme le backlog Nice to have initial. Backend : `PATCH /utilisateurs/:id/reinitialiser-mot-de-passe` (`{ motDePasse }`), même schéma d'action dédiée qu'US4.7. `ReinitialiserMotDePasseDto.motDePasse` reprend exactement `@MinLength(8)` de `CreateUtilisateurDto` (US4.5) — même règle, deux DTO distincts plutôt qu'un DTO partagé : trois lignes dupliquées ne justifient pas une abstraction. **Refactor associé** (justifié par la duplication réelle avec `desactiver()`, pas un embellissement gratuit) : `UtilisateursService` — la paire « `findById` puis vérifier `role === TECHNICIEN`, sinon 404/400 » extraite en `trouverTechnicienOuEchouer()` privée, réutilisée par `desactiver()` et `reinitialiserMotDePasse()`. Réservé aux comptes `TECHNICIEN`, 404 si id inconnu — mêmes garanties qu'US4.7. Aucune invalidation de session existante : le JWT déjà émis reste valide jusqu'à expiration (30 jours), changer le mot de passe ne révoque pas les jetons déjà distribués — limitation déjà connue de l'architecture JWT sans état de ce projet, pas un oubli de ce ticket.

Web : `ReinitialiserMotDePasseModal.tsx`, formulaire (pas une simple confirmation comme US4.7) avec un seul champ mot de passe + bascule afficher/masquer (copié de `CreerCompteModal.tsx`/`LoginForm.tsx`, toujours pas de composant partagé — troisième occurrence, pourrait devenir une règle de trois si un futur écran en a besoin). Pas de champ « confirmer le mot de passe » : la bascule afficher/masquer permet déjà de vérifier visuellement la saisie, cohérent avec `CreerCompteModal.tsx` qui fait le même choix. Bouton « Réinitialiser » visible sur **toutes** les lignes (contrairement à « Désactiver », réservé aux comptes actifs) : réinitialiser le mot de passe d'un compte inactif reste sans effet nuisible, pas de raison de le bloquer. `ReinitialisationConnectee` (composant intermédiaire privé dans `TechniciensListe.tsx`) résout le même piège d'architecture de hook que `DesactivationConnectee` (US4.7) : `useReinitialiserMotDePasse(id)` a besoin d'un id connu seulement à la sélection d'une ligne.

**Piège de test rencontré et corrigé** : le titre de la modale (« Réinitialiser le mot de passe ») et le bouton de soumission portaient initialement des libellés différents (« Réinitialiser le mot de passe » vs « Réinitialiser »), mais le bouton de la ligne du tableau s'appelle aussi « Réinitialiser » — `screen.getByText(/Réinitialiser le/)` matchait à la fois le titre et le bouton de soumission une fois celui-ci renommé en « Réinitialiser le mot de passe » pour plus de clarté, rendant le sélecteur ambigu. Corrigé en ciblant `getByRole("heading", { name: /Réinitialiser le mot de passe/ })`, qui ne peut matcher que le `<h3>`, jamais un `<button>`. **À généraliser** : sur cet écran, préférer cibler par rôle (`heading`, `button` avec un nom exact) plutôt que par texte brut dès que deux éléments proches peuvent partager une sous-chaîne.

**Complexité de mot de passe ajoutée le 2026-09-16** : même correction et même `validerMotDePasse()` partagé que `CreerCompteModal.tsx` (US4.5, cf. plus haut) — `@MinLength(8)` seul ne suffit plus, la règle backend exige aussi majuscule/minuscule/chiffre/caractère spécial.

Vérifié de bout en bout dans le navigateur : réinitialisation réussie (modale fermée, requête confirmée à 200), y compris sur un compte déjà inactif (bouton bien présent, action acceptée).

### Menu déroulant personnalisé (`components/ui/Select.tsx`) — 2026-09-14
Le `<select>` natif (filtre Technicien, champ Technicien assigné du formulaire) ouvre un menu dessiné par le système d'exploitation, impossible à restyler pour coller au design system — constat Cédric ("pas quelque chose de générique"). Reconstruit à la main (aucune nouvelle dépendance, ni Radix ni Headless UI) : un bouton déclencheur (`role="combobox"`, `aria-expanded`/`aria-controls`/`aria-haspopup`) et un panneau `role="listbox"` positionné en absolu, coché sur l'option sélectionnée. Navigation clavier (flèches, Entrée, Échap), fermeture au clic extérieur. Deux variantes visuelles pour un seul moteur d'interaction : `variant="field"` (soulignement + icône, même gabarit que `Champ` dans `InterventionForm.tsx`) et `variant="inline"` (libellé + valeur + chevron, sans bordure visible par défaut, pour `InterventionsFiltres.tsx`). Remplace l'ancien `Select.tsx` (wrapper de `<select>` natif jamais branché nulle part) au même emplacement.

**Piège de test rencontré (2 tentatives, corrigé)** : `scrollIntoView` n'existe pas dans jsdom — chaînage optionnel sur l'appel (`?.()`), pas seulement sur le nœud, sinon `TypeError` silencieuse qui casse le rendu du composant en test. Plusieurs tests de `InterventionForm.test.tsx` utilisaient `await screen.findByText("Awa Traore", { exact: false })` comme simple signal « les techniciens ont fini de charger » — cassé par ce composant, dont les options ne sont dans le DOM que menu ouvert (contrairement aux `<option>` d'un `<select>` natif, toujours présentes). Remplacé par un helper `attendreTechniciensCharges()` qui ouvre le menu, attend l'option, puis referme.

### Photos
- `GET /photos/:id` exige le JWT dans l'en-tête, donc un `<img src>` direct ne suffit pas. `usePhoto` récupère la photo en `blob`, crée un `objectURL`, le libère au démontage.
- `PhotoThumbnails` affiche les catégories AVANT et APRES séparément. Clic sur une vignette : `PhotoLightbox` en plein écran.

### Géolocalisation
- Sur le détail, la géolocalisation est un lien qui ouvre Google Maps dans un nouvel onglet (`lib/utils/maps.ts` gère les deux formes : lien Google Maps collé tel quel, ou coordonnées `lat,lng`).

### Formulaire de création et d'édition
- Champs : nom du client, adresse, téléphone 1 (requis), téléphone 2 (optionnel), géolocalisation (optionnel), motif signalé (optionnel), type d'équipement (optionnel), date et heure prévues, technicien (`components/ui/Select.tsx`, cf. section "Menu déroulant personnalisé" ci-dessous).
- **Édition (US1.5/US1.6)** : mêmes champs, préremplis depuis l'intervention chargée. Bouton « Modifier » sur l'écran de détail, visible seulement si `PLANIFIEE` (même règle que l'annulation US1.7). `telephone2`/`geolocalisation`/`motifSignale` toujours envoyés au PATCH (même vides) : une chaîne vide efface explicitement le champ côté API, contrairement à la création où ces champs optionnels vides sont simplement omis du corps de la requête.
- **Motif signalé (US1.2) promu le 2026-09-14** : Cédric a remarqué, en testant le mobile, que « Motif signalé » s'affichait toujours « non renseigné » sur le détail (US2.2/US3.6) faute de tout moyen de le saisir — incohérence déjà actée sans correctif en Phase II (`docs/ADR.md` backend, incohérence n°2). Plutôt que de masquer l'affichage, US1.2 est promue comme US1.5/US1.6 l'ont été : `<textarea>` optionnel ajouté en fin de la section « Client et lieu » (pas de composant `Champ` réutilisé, celui-ci ne gère que `<input>` — la fonction `champ()` généralisée pour accepter aussi `HTMLTextAreaElement`). Backend : `motifSignale` était déjà accepté à la création (`CreateInterventionDto`), ajouté au PATCH (`PatchInterventionDto`, `interventions.service.ts`) avec la même sémantique « chaîne vide efface » que `telephone2`/`geolocalisation`.

**Type d'équipement (US2.4) promu le 2026-09-15** : même schéma exact que « Motif signalé » — Cédric a remarqué que le champ s'affichait sur le détail sans jamais pouvoir être saisi (US2.4 classée Nice to have au tri initial, cf. `backend/docs/architecture.md`). `Select` (composant maison, pas un `<textarea>`) ajouté en fin de la section « Client et lieu », options `CLIMATISATION`/`GROUPE_ELECTROGENE`/`INSTALLATION_ELECTRIQUE`/`AUTRE` + une option `""` = « Non renseigné » pour permettre de revenir à vide. Libellés français et la fonction `libelleTypeEquipement()` centralisés dans `features/interventions/lib/typeEquipement.ts`, partagés entre le formulaire et `InterventionDetail.tsx` (qui affichait jusque-là la valeur brute de l'enum, ex. `GROUPE_ELECTROGENE`, plutôt qu'un libellé lisible). **Sémantique d'effacement différente des autres champs optionnels** : un enum n'a pas de « chaîne vide », donc la modification envoie `typeEquipement: form.typeEquipement || null` (au lieu de `|| ''` pour `telephone2`/`motifSignale`) — `null` explicite efface côté API, une chaîne vide échouerait la validation `IsEnum`.

### Référence courte (`lib/reference.ts`) retirée de l'affichage — 2026-09-14
Cédric a demandé le retrait des références courtes (`referenceCourte()`, ex. `#0142`) partout où elles restaient visibles côté web : l'en-tête du détail (`InterventionDetail.tsx`, à côté de « Créée le … »), la lightbox photo (`PhotoLightbox.tsx`, à côté du nom du client) et la modale de confirmation d'annulation (`ConfirmationAnnulationModal.tsx`). Même raisonnement que le retrait déjà fait sur mobile (commit `5147612`) et sur la colonne « Réf. » du tableau liste (12/09) : sans utilité visuelle pour le directeur, qui identifie une intervention par le client et la date. Texte simplement retiré, rien ne le remplace. **`lib/reference.ts` (`referenceCourte()`) n'est plus appelé nulle part dans `src/`** — laissé en place (pas de suppression de fichier sans confirmation explicite), à supprimer si Cédric confirme.

### Bouton Retour étendu à la création et l'édition — 2026-09-14
`BoutonRetour` existait déjà sur le détail (ajouté le 12/09), mais pas sur `InterventionForm.tsx` (création/édition) — demandé par Cédric. Promu en composant partagé `components/ui/BoutonRetour.tsx` (prend un `href` optionnel, `/interventions` par défaut). `InterventionForm.tsx` lui passe `destinationAnnuler` (déjà calculé pour le bouton « Annuler » du bas de page) : `/interventions` en création, `/interventions/detail?id=` en édition — même cible, deux affordances.

### Fidélité du haut de page « Interventions » à la maquette W2 — 2026-09-14
Cédric a insisté deux fois (capture de la maquette à l'appui) pour que le haut de `InterventionsListe.tsx` reprenne fidèlement `W2 - Liste interventions.html` — précision obtenue après clarification : **visuel uniquement**, pas de nouvelle fonctionnalité de filtrage/tri (même principe que les icônes inertes du rail, `Rail.tsx`).
- Fil d'Ariane « Opérations / Interventions » restauré **sur cet écran seulement** (contrairement au détail/création/édition qui ont désormais un bouton Retour, la liste est la racine de la navigation, atteinte depuis le rail — pas de redondance ici, donc pas de contradiction avec le retrait du 12/09).
- Sélecteur de statut « Toutes ⌄ » (à côté du titre) et bouton « Filtres » : `<span aria-hidden>` inertes (pas `<button>`), même convention que `Rail.tsx` — représentent US3.4/US3.5/US3.8 (filtre état/période, recherche mot-clé), Nice to have hors périmètre MVP, non construites.
- « Trié par date prévue [S] » ajouté à `InterventionsFiltres.tsx` : le tri par date prévue, lui, **est** le comportement réel (US3.1) — texte honnête, pas inerte. La puce « S » (raccourci clavier dans la maquette) reste purement décorative, aucun raccourci branché.
- **Légende avec vraie répartition par statut** (« X interventions au total — Y planifiées, Z réalisées, W annulées ») : contrairement aux éléments ci-dessus, ce n'était pas un simple habillage visuel — afficher des chiffres inventés aurait été trompeur. `GET /interventions` renvoie désormais `parStatut` (backend, commit `6484cee`), consommé directement dans la légende.

### Détail scrollable — 2026-09-14
Bug réel signalé par Cédric : `AppShell` (`components/layout/AppShell.tsx`) a `overflow-hidden` sur sa zone de contenu — chaque écran est responsable de son propre défilement interne. `InterventionForm.tsx` le fait déjà (`h-full overflow-y-auto`), mais `InterventionDetail.tsx` ne l'avait jamais eu : au-delà d'une certaine hauteur de contenu (plusieurs photos avant/après, champs longs), le bas de la page était purement inaccessible, pas juste caché derrière un scroll manquant. Corrigé en alignant `InterventionDetail.tsx` sur le même motif que `InterventionForm.tsx`.

### Indicateur de survol sur la liste — 2026-09-14, couleur ajustée le 2026-09-15
Demande de Cédric : un « sélecteur » plus visible au survol d'une ligne du tableau, en plus du simple changement de fond déjà présent (`hover:bg-zebra`). Barre verticale à gauche de la cellule Client, en `opacity-0 group-hover:opacity-100`. D'abord en bleu (`--brand`, même langage que l'état `.selected` de `W2 - Liste interventions.html`), changée en gris clair (`--line-strong`) le lendemain à la demande de Cédric — un accent bleu suggérait une action/sélection plus qu'un simple repère visuel au survol.

**Fond de ligne quasi invisible, corrigé le 2026-09-15** : `hover:bg-zebra` (`--zebra: #fcfcfa`) est à peine distinguable de `--paper` (`#fbfbf9`, le fond de page) — Cédric a rapporté ne voir aucun changement du tout au survol des lignes, en comparant explicitement au remplissage net du bouton de déconnexion au survol (`hover:bg-danger`). Remplacé par `hover:bg-line-soft` (`#eef2f6`), un contraste net avec le fond de page tout en restant un gris clair neutre — cohérent avec la couleur déjà choisie pour la barre d'accent. Vérifié dans le navigateur (l'automatisation de survol nécessite un court délai avant capture pour que le repaint soit visible sur la capture d'écran, sans quoi l'effet semble à tort absent).

### Déconnexion (US4.3, promue le 2026-09-14, découvrabilité corrigée le 2026-09-15)
Même demande que côté mobile (cf. `mobile/docs/architecture.md`) : bouton de déconnexion dans `Rail.tsx` (rail de navigation latéral), en bas sous l'espace flexible. `clearToken()` (déjà exposé par `features/auth/lib/token.ts`, réutilisé tel quel — pas de nouveau code de gestion de jeton) puis `router.push('/connexion')`. Pas de modale de confirmation côté web (contrairement au mobile) : aucune donnée locale n'est purgée ici, l'action est bénigne et immédiatement réversible (reconnexion), donc pas de risque à confirmer.

**Bug de découvrabilité corrigé le 2026-09-15** : la première version affichait les initiales du technicien (« KB ») par défaut, révélant l'icône de déconnexion seulement au survol (`group-hover:hidden`/`group-hover:block`) — Cédric a rapporté ne pas voir de bouton de déconnexion du tout, le badge ressemblant à un simple avatar décoratif sans jamais avoir survolé cette zone précise. Corrigé en affichant directement l'icône `LogOut` en permanence, même style que les autres icônes du rail (`ITEM_CLASSES`), fond rouge (`danger`) au survol pour signaler l'action. **Leçon retenue** : un élément d'interface qui ne révèle sa fonction qu'au survol n'est pas découvrable sur une interface qu'on n'explore pas activement — à éviter pour toute action qu'un utilisateur doit pouvoir trouver sans indice préalable.

### Suppression d'une intervention (US3.11, promue le 2026-09-15)
Cédric a demandé la suppression définitive pour les interventions Annulées côté web ; question posée avant d'implémenter (étendre à tous les statuts « au cas où » ?), tranchée en faveur d'un périmètre strict (cf. `backend/docs/architecture.md` pour le raisonnement complet — perte de preuve de travail pour une Réalisée, risque de casse de synchro mobile pour une Planifiée). Bouton « Supprimer » sur `InterventionDetail.tsx`, visible seulement si `statut === "ANNULEE"` (même position que le bouton « Annuler », mutuellement exclusifs), `ConfirmationSuppressionModal.tsx` (même gabarit visuel que `ConfirmationAnnulationModal.tsx`, texte adapté à l'irréversibilité). `useSupprimerIntervention` (`DELETE /interventions/:id`, `apiRequest<void>` — gère déjà le `204 No Content`) invalide la query `["interventions"]` puis, à la différence de l'annulation qui reste sur le détail, redirige vers `/interventions` : la ressource affichée n'existe plus après succès.

### Environnement de développement
- **Serveur de dev sur le port 3001** (`next dev -p 3001`, `next start -p 3001`) — `next dev` démarre sur le port 3000 par défaut, en conflit avec le backend NestJS qui écoute déjà sur ce port en local. `NEXT_PUBLIC_API_URL` reste `http://localhost:3000` (celui du backend, inchangé).
- **Contournement ponctuel du 2026-09-15** : le port 3000 était occupé par un processus tiers (serveur MCP de Draw.io desktop) au moment de tester le ticket déconnexion, donc le backend a été démarré sur le port 3001 à la place pour cette session, et le web sur le port 3002 (`NEXT_PUBLIC_API_URL=http://localhost:3001` dans `.env.local`, fichier non versionné). Ceci n'est **pas** un changement de convention — dès que le conflit de port est résolu (Draw.io fermé, ou tourne sur un autre port), revenir à web=3001/backend=3000 comme documenté ci-dessus.

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

- Les filtres par état (US3.5), par période (US3.4) et la recherche par mot-clé (US3.8) sont construits, cf. section 4.
- Les exports PDF du détail (US3.9) et CSV de la liste (US3.10) sont construits, cf. section 4.
- Le tableau des comptes techniciens (US4.6), la création (US4.5), la désactivation (US4.7) et la réinitialisation de mot de passe (US4.9) sont construits, cf. section 4. **Le bloc « Comptes techniciens » est désormais complet.**
- Champ « type d'équipement » dans le formulaire (US2.4 Nice to have, non promue).
- Toute consultation mobile pour M. Kouassi.

---

## 6. Icônes de la barre latérale (Rail)

Décision du 2026-09-12, suite à un retour d'usage de Cédric. Trois icônes décoratives dans la maquette GenSpark, aucune ne correspond à un écran du MVP :

| Icône | Statut | Justification |
|---|---|---|
| Calendrier | **Retirée** | Vérifié dans `Docs/SIM_Abidjan_UserStories_01-09-26.docx` : ne correspond à aucune des 39 User Stories, ni MVP ni Nice to have. Pure invention décorative GenSpark, aucun besoin réel derrière. |
| Techniciens | **Fonctionnelle depuis le 2026-09-16** | US4.5 à US4.9 (créer/lister/désactiver un compte technicien, réinitialiser un mot de passe) — **les quatre livrées**, cf. section « Comptes techniciens » ci-dessous. Besoin opérationnel réel : jusqu'ici la seule façon de gérer les comptes techniciens était le script `prisma/seed.ts`, aucun moyen de le faire sans toucher au code. |
| Paramètres | Gardée, inerte | Pas de User Story avant cette date. Ancrée sur **US4.8** (« changer son propre mot de passe », jamais rattachée à un écran auparavant), classée Nice to have. Pistes de réglages proposées par l'agent et à valider/décomposer par Cédric avant de devenir des User Stories formelles : nombre d'interventions par page (facile, actuellement fixé à 20 dans `PaginationDto`), coordonnées de l'entreprise pour les futurs exports PDF/CSV (US3.9/US3.10), durée de session avant déconnexion automatique (fixée en dur à 30 jours côté JWT backend), politique de conservation des photos (aucune limite aujourd'hui). Écarté : notifications email/SMS (infra hors périmètre MVP), personnalisation visuelle/logo, multi-comptes directeur, aucun besoin exprimé pour ces trois. |
