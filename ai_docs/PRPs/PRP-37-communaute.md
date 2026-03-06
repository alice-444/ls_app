# Hub Communauté & Vie Étudiante PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Provide an all-in-one student hub where users can manage their academic life (Workshops), save money (Bons Plans), find the best places to work (Spot Finder), and engage with the community through lightweight interactions (Polls).

## Why

**Business Justification:**
- **Daily Utility**: Students return to the app for deals and spots, not just for classes.
- **Engagement**: Polls provide a low-friction way to participate in the community.
- **Solidarity**: Spot Finder leverages collective knowledge (best libraries, quietest cafes).
- **Branding**: Positions LearnSup as a lifestyle partner for students.

**Priority:** High

## What

### Feature Description
- **Page `/communaute`** : The central hub.
- **Events Hub (Ateliers)** :
  - Tabs: "À venir" / "Passés".
  - Clean cards showing the mentor and the topic.
- **Bons Plans (Student Deals)** :
  - Curated reductions (Food, Software, Culture).
- **Carte des Bons Coins (Spot Finder)** :
  - A list/grid of student-recommended places (Libraries, Cafes, Parks).
  - **Chill Tags**: "Ultra Calme", "Prises dispo", "Café pas cher", "Ouvert tard".
- **Sondage de la Semaine (Community Pulse)** :
  - One simple question per week.
  - Real-time result visualization after voting.
- **Member Discovery** : light directory of the community.

### Scope
**In Scope:**
- Full layout for `/communauty`.
- CRUD/Listing for "Bons Plans" and "Bons Coins" (Admin curated or basic user submission).
- Poll voting system (one vote per user).
- Integration with Workshop router for events.

**Out of Scope:**
- Real-time map for Spot Finder (List/Grid view only for MVP).
- Complex poll logic (multiple questions, images).

### User Stories
1. As a student, I want to find a quiet place with Wi-Fi to study today.
2. As a student, I want to see how other students voted on the weekly poll.
3. As a student, I want to browse upcoming workshops and student discounts in one go.

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `back/src/routers/workshops/workshop.router.ts` | Workshop queries |
| `front/src/app/layout.tsx` | Styling consistency |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/app/communauty/page.tsx` | CREATE | Hub main entry |
| `front/src/components/community/SpotFinder.tsx` | CREATE | List of spots with tags |
| `front/src/components/community/CommunityPoll.tsx` | CREATE | Interactive poll widget |
| `front/src/components/community/DealsGrid.tsx` | CREATE | Grid of student deals |
| `back/src/routers/social/community.router.ts` | CREATE | Procedures for Hub data |
| `back/prisma/schema/schema.prisma` | MODIFY | Add `student_deal`, `community_spot`, `poll` models |

## Implementation Details

### tRPC Procedures

#### `community.getHubData`
**Output:** Combined data for all sections (Events, Deals, Spots, Poll).

#### `community.voteInPoll`
**Input:** `{ pollId: string, optionId: string }`
**Action:** Register vote, ensure one vote per user.

#### `community.getSpots`
**Input:** `{ tag?: string }`
**Output:** `community_spot[]`

### Database (New Models)
- **`student_deal`**: title, description, category, link, promoCode.
- **`community_spot`**: name, description, address, tags (array), rating.
- **`community_poll`**: question, options (JSON), active (boolean), results (JSON).

### Components (DA Reference)
- Use `Card` with `shadow-sm` and `hover:shadow-md`.
- Amber accents (`#FFB647`) for interactive elements (Poll bars, Tags).
- Deep Blue (`#26547C`) for headings and primary buttons.

## Validation Criteria

### Functional Requirements
- [ ] Page `/communauty` displays all 4 sections (Events, Deals, Spots, Poll).
- [ ] Voting in the poll updates the bars in real-time.
- [ ] Spot Finder displays tags like "Ultra Calme" correctly.
- [ ] Deals can be filtered by category.
- [ ] Events show the correct status (Upcoming vs Past).

### Technical Requirements
- [ ] Atomic voting logic (no double voting).
- [ ] Clean responsive grid for mobile users.
- [ ] Single tRPC call for the initial hub data load.

### Security Checklist
- [ ] Poll votes are linked to userId to prevent spam.
- [ ] Only public data shown for member discovery.

---
