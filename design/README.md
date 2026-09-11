# Maquettes — back-office web

Maquettes validées des écrans du back-office, produites en Phase II avant le développement.

Générées avec GenSpark AI à partir du brief `Docs/Brief-Maquettes-GenSpark.md` (racine du projet),
en lui laissant le rôle de designer sur la direction visuelle. Direction retenue : **« Fiche technique
éditoriale »** (Fraunces pour les titres, Inter pour l'UI, JetBrains Mono pour les données, rail de
navigation, chips carrées). **Référence exacte des tokens, typo et composants : `DESIGN-SYSTEM.md`
dans ce dossier — c'est lui qui fait foi pour l'implémentation, pas le §2 du brief.**

| Fichier | Écran | User Stories | États livrés |
|---|---|---|---|
| `W1 - Connexion.html` | Connexion | US4.4 | normal, envoi en cours, erreur |
| `W2 - Liste interventions.html` | Liste des interventions | US3.1, US3.2, US3.3 | données, chargement, liste vide, erreur |
| `W3 - Nouvelle intervention.html` | Nouvelle intervention | US1.1, US1.8, US1.3 | formulaire vierge, erreurs de validation |
| `W4 - Detail intervention.html` | Détail d'une intervention | US3.6, US1.7 | Planifiée, Réalisée, modale d'annulation |
| `W5 - Photo plein ecran.html` | Photo en plein écran | US3.7 | visionneuse plein écran |

Design system commun web + mobile : `DESIGN-SYSTEM.md` (copie identique côté mobile, `mobile/design/`).
Palette et composants identiques entre les deux apps.
