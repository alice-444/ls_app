# ai_docs – Documentation pour assistants IA

Ce dossier contient tout le **contexte pour Gemini** (ou Claude, etc.) : cahier des charges, tests E2E, doc technique dédiée IA, et flux PRP.

## Structure

```
ai_docs/
├── README.md                 # Ce fichier
├── gemini-context.md         # Guide : quels docs fournir à l’IA, résumé copier-coller
├── PRD/                      # Cahier des charges produit (découpé)
│   ├── README.md             # Index PRD, ordre de lecture
│   ├── PRD-00-vision-users.md
│   ├── PRD-01-perimetre-fonctionnel.md
│   └── PRD-02-exigences-references.md
├── EPTC/                     # Plan de tests E2E et critères (découpé)
│   ├── README.md             # Index EPTC, config Cypress
│   ├── EPTC-01-back-sante.md
│   ├── EPTC-02-front-accueil-auth.md
│   ├── EPTC-03-front-dashboard-workshops.md
│   ├── EPTC-04-front-pages-secondaires.md
│   └── EPTC-05-priorisation-pratiques.md
├── gemini/                   # Index et prompts pour l’IA
│   ├── README.md
│   ├── 00-index-documents.md # Liste de tous les documents
│   └── 01-prompts-exemples.md
├── docs/                     # Documentation technique pour l’IA
│   ├── README.md
│   ├── architecture.md
│   ├── services.md
│   ├── patterns.md
│   ├── database.md
│   └── components.md
└── concept_library/
    └── cc_PRP_flow/
        ├── README.md
        └── PRPs/
            ├── base_template_v1.md
            ├── PRP-auth-login-signup-onboarding.md
            ├── PRP-workshop-catalogue-request.md
            └── PRP-dashboard.md
```

## Rôle des documents

| Document / Dossier | Rôle |
|--------------------|------|
| **PRD/** | Vision, utilisateurs, périmètre fonctionnel, exigences NF (quoi construire). |
| **EPTC/** | Scénarios E2E par domaine, critères d’acceptation, priorisation Cypress. |
| **gemini-context.md** + **gemini/** | Quels documents charger, ordre, exemples de prompts, index complet. |
| **docs/** | Détails techniques : architecture, services, patterns, base de données, composants. |
| **concept_library/cc_PRP_flow/** | Définition des PRPs, workflow, template. |
| **concept_library/cc_PRP_flow/PRPs/** | PRPs par feature : entrée pour l’implémentation par l’IA. |

## Utilisation

- **Contexte court** et exemples de prompts : [gemini-context.md](gemini-context.md) et [gemini/01-prompts-exemples.md](gemini/01-prompts-exemples.md).
- **Liste complète des documents** : [gemini/00-index-documents.md](gemini/00-index-documents.md).
- **Créer un PRP** : [concept_library/cc_PRP_flow/README.md](concept_library/cc_PRP_flow/README.md) + template `PRPs/base_template_v1.md`.
- **Doc technique repo** (racine) : dossier **`docs/`** à la racine du projet (architecture, front, back).
