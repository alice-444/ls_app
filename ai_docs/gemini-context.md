# Contexte Gemini – Guide d’utilisation

Guide pour fournir le bon contexte à l’IA (Gemini, Claude, etc.) sur le projet **LearnSup**.

## Où trouver quoi

| Besoin | Où aller |
|--------|----------|
| **Liste de tous les documents** | [gemini/00-index-documents.md](gemini/00-index-documents.md) |
| **Exemples de prompts** | [gemini/01-prompts-exemples.md](gemini/01-prompts-exemples.md) |
| **Vue d’ensemble produit (PRD)** | [PRD/README.md](PRD/README.md) → PRD-00, PRD-01, PRD-02 |
| **Plan de tests E2E (EPTC)** | [EPTC/README.md](EPTC/README.md) → EPTC-01 à EPTC-05 |
| **Implémentation par feature (PRP)** | [concept_library/cc_PRP_flow/PRPs/](concept_library/cc_PRP_flow/PRPs/) |
| **Doc technique (architecture, patterns)** | [docs/](docs/) |

## Ordre de chargement recommandé

1. **Vue produit** : PRD/README → PRD-00 → PRD-01 → PRD-02  
2. **Implémenter une feature** : PRP de la feature + docs/architecture.md + docs/patterns.md  
3. **Écrire des tests E2E** : EPTC/README + fichier EPTC du domaine (ex. EPTC-02 pour auth)  
4. **Rédiger un nouveau PRP** : concept_library/cc_PRP_flow/README + base_template_v1 + PRD-01  

## Résumé à copier-coller (contexte court)

**LearnSup** : plateforme d’apprentissage entre pairs (mentors / apprenants). Rôles : APPRENANT (voir ateliers, demander à participer, dashboard), MENTOR (créer ateliers, gérer demandes, profil publié). Stack : Next.js (front 3001, back 4500), tRPC, Better Auth, Prisma, PostgreSQL, Socket.IO. Auth : sign-up, sign-in, onboarding (choix MENTOR/APPRENANT). Fonctionnalités : ateliers (catalogue, demandes, accept/refuse), dashboard par rôle, profil mentor, messagerie, crédits (Polar), support, modération. Tests E2E : Cypress (baseUrl 4500), scénarios dans ai_docs/EPTC/. PRPs par feature dans ai_docs/concept_library/cc_PRP_flow/PRPs/.

## Documents créés / modifiés récemment

- **PRD** : découpé en PRD/ (PRD-00, PRD-01, PRD-02).  
- **EPTC** : découpé en EPTC/ (back santé, accueil-auth, dashboard-workshops, pages secondaires, priorisation-pratiques).  
- **PRPs** : PRP-auth-login-signup-onboarding, PRP-workshop-catalogue-request, PRP-dashboard.  
- **Gemini** : gemini/00-index-documents.md (liste complète), gemini/01-prompts-exemples.md (exemples de prompts).
