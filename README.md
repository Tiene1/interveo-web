# Back-office web Interveo

![CI](https://github.com/Tiene1/interveo-web/actions/workflows/ci.yml/badge.svg)

Back-office de suivi d'interventions techniques pour PME du bâtiment (électricité, sécurité électronique, domotique, plomberie, climatisation...), utilisé par le directeur : création, attribution et suivi des interventions, historique avec filtres et recherche, photos avant/après, gestion des comptes techniciens, exports CSV et PDF.

- Stack : Next.js 14 (App Router, export statique), React Query, Tailwind CSS.
- Documentation : `docs/ADR.md`, `docs/architecture.md`.
- Règles de développement : `CLAUDE.md`.
- En production : Vercel (site statique), qui appelle l'API Interveo hébergée sur Render.

## Démarrage

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_URL : adresse du backend
npm install
npm run dev                  # http://localhost:3001
```

Le backend doit tourner (voir le dépôt `interveo-backend`) et autoriser l'adresse du site dans sa variable `CORS_ORIGIN`.

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement (port 3001) |
| `npm run build` | Build de production (export statique) |
| `npm test` | Tests (Vitest) |
| `npm run test:cov` | Couverture |
| `npm run lint` | Lint |
| `npx tsc --noEmit` | Vérification des types |

## Déploiement

L'adresse de l'API (`NEXT_PUBLIC_API_URL`) est **intégrée au code au moment du build** (export statique) : elle doit être définie dans Vercel avant le déploiement, et un changement n'a d'effet qu'au build suivant. Chaque nouvelle adresse du site (domaine personnalisé compris) doit aussi être ajoutée à `CORS_ORIGIN` côté backend.

## Intégration continue

Chaque push et chaque pull request lancent GitHub Actions (`.github/workflows/ci.yml`) : types, lint, tests et build de production. La CI ne déploie rien : Vercel redéploie de son côté à chaque push sur `main`.
