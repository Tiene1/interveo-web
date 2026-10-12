# Back-office web Interveo

![CI](https://github.com/Tiene1/interveo-web/actions/workflows/ci.yml/badge.svg)

Back-office de suivi d'interventions techniques pour PME du bâtiment (électricité, sécurité électronique, domotique, plomberie, climatisation...), utilisé par le directeur : création, attribution et suivi des interventions, historique avec filtres et recherche, photos avant/après, gestion des comptes techniciens, exports CSV et PDF.

- Stack : Next.js 14 (App Router, export statique), React Query, Tailwind CSS.
- Documentation : `docs/ADR.md`, `docs/architecture.md`.
- Règles de développement : `CLAUDE.md`.
- En production : Vercel (site statique), qui appelle l'API Interveo hébergée sur Render.

## Essayer Interveo en une commande (Docker)

Seul prérequis : [Docker](https://docs.docker.com/get-started/get-docker/). Le `docker-compose.yml` complet vit dans le dépôt de l'API, qui construit ce back-office directement depuis GitHub : un seul clone suffit.

```bash
git clone https://github.com/Tiene1/interveo-backend.git
cd interveo-backend
docker compose up
```

Puis ouvrez http://localhost:3001 et connectez-vous avec le compte directeur de démo : `kouassi` / `directeur123`.

`docker compose up` lance plusieurs conteneurs (base PostgreSQL, migrations, API, ce site servi par nginx) : le détail, les autres comptes, la gestion des ports (`API_PORT`, `WEB_PORT`) et la remise à zéro sont dans le [README de l'API](https://github.com/Tiene1/interveo-backend#essayer-interveo-en-une-commande-docker). Point à retenir : l'adresse de l'API est **intégrée au site à sa construction**, donc si vous changez `API_PORT`, relancez avec `docker compose up --build`.

Le `Dockerfile` de ce dépôt peut aussi servir seul (il faut alors une API joignable depuis votre navigateur) :

```bash
docker build -t interveo-web --build-arg NEXT_PUBLIC_API_URL=http://localhost:3000 .
docker run --rm -p 3001:80 interveo-web
```

## Démarrage manuel

Prérequis : Node 24, et l'API Interveo qui tourne sur `http://localhost:3000` (dépôt [interveo-backend](https://github.com/Tiene1/interveo-backend) : `docker compose up` ou démarrage manuel). La variable `CORS_ORIGIN` de l'API doit contenir `http://localhost:3001` (c'est le cas par défaut).

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_URL : http://localhost:3000 par défaut
npm install
npm run dev                  # http://localhost:3001
```

Compte directeur de démo : `kouassi` / `directeur123` (créé par `npx prisma db seed` côté API).

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

## Licence

Licence MIT — voir [LICENSE](LICENSE).
