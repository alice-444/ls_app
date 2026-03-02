# Analytics cashback mentor PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable mentors to view their cashback analytics (earnings, workshops, trends) so that they can track their activity and income.

## Why

**Business Justification:**
- Mentor motivation
- Transparency on earnings
- Data for tax/reporting

**Priority:** Low-Medium

## What

### Feature Description
- **Vue mentor** : Cashback earned, by workshop, over time
- **cashbackAnalytics** router : getSummary, getByWorkshop, getHistory
- **Page** : Section in dashboard or `/mentor/analytics` or `/my-workshops` with stats
- **Données** : workshop_cashback_queue (PROCESSED), credit_transaction (if tips/earnings stored)

### Scope
**In Scope:**
- tRPC cashbackAnalytics procedures
- Mentor dashboard section or dedicated page
- Summary: total earned, by period
- List of workshops with cashback status

**Out of Scope:**
- Withdrawal flow
- Tax documents
- Admin analytics

### User Stories
1. As a mentor, I want to see my total cashback earned so that I know my earnings
2. As a mentor, I want to see cashback by workshop so that I can track each session

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/database.md` | workshop_cashback_queue, credit_transaction |
| `back/src/routers/workshops/analytics/cashback-analytics.router.ts` | Cashback procedures |
| `front/src/components/dashboard/MentorDashboard.tsx` | Mentor dashboard |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/components/dashboard/MentorDashboard.tsx` | MODIFY | Cashback section |
| `front/src/app/mentor/analytics/page.tsx` | CREATE | Or integrate in dashboard |
| `back/src/routers/workshops/analytics/cashback-analytics.router.ts` | MODIFY | getSummary, getHistory |

### Existing Patterns to Follow

```typescript
// cashbackAnalytics.getSummary(userId) → total, by month
// cashbackAnalytics.getHistory(userId) → workshop_cashback_queue items
// Only MENTOR, only own data
```

### Dependencies
- workshop_cashback_queue
- WorkshopCashbackService
- Mentor = workshop creator

## Implementation Details

### tRPC Procedures

#### `cashbackAnalytics.getSummary`
**Input:** `{ from?: Date, to?: Date }`

**Output:** `{ totalEarned: number, byMonth: { month: string, amount: number }[] }`

**Auth:** Required (MENTOR)

#### `cashbackAnalytics.getHistory`
**Input:** `{ limit?: number, cursor?: string }`

**Output:** `{ items: cashbackItem[], nextCursor?: string }`

**Auth:** Required (MENTOR)

### Database
- `workshop_cashback_queue`: workshopId, participantUserId, cashbackAmount, status PROCESSED
- Join with workshop where creatorId = mentorId

### Components

| Component | Location | Props |
|-----------|----------|-------|
| CashbackSummaryCard | `dashboard/` | summary |
| CashbackHistoryList | - | items |

## Validation Criteria

### Functional Requirements
- [ ] Mentor sees cashback summary
- [ ] Total earned correct
- [ ] History list with workshops
- [ ] Only MENTOR can access
- [ ] Only own data

### Technical Requirements
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] Date range filter
- [ ] Loading states

### Testing Steps
1. Login as mentor with processed cashbacks
2. View dashboard → summary visible
3. Verify amounts match queue

---
