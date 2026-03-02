# Système crédits et achats PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable users to view their credit balance, purchase credits via Polar, and use credits for workshops, so that the platform can monetize and users can participate in paid workshops.

## Why

**Business Justification:**
- Monetization
- Workshop participation (credit cost)
- Polar integration for payments

**Priority:** High (monetization)

## What

### Feature Description
- Credit balance: app_user.creditBalance
- Credit transactions: TOP_UP, USAGE, REFUND
- Purchase page: Polar checkout integration
- Webhook: Polar webhook to credit account on purchase
- Deduct credits on workshop participation (when applicable)
- Transaction history

### Scope
**In Scope:**
- Balance display
- Credit transaction types
- Polar webhook
- Buy credits page
- Deduct on workshop usage

**Out of Scope:**
- Refund flow (manual)
- Credit packages (paliers) - separate config
- Cashback (separate PRP/flow)

### User Stories
1. As a user, I want to see my credit balance so that I know how many I have
2. As a user, I want to buy credits so that I can participate in workshops
3. As a user, I want to see my transaction history so that I can track my spending

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/database.md` | credit_transaction, CreditTransactionType |
| `ai_docs/docs/services.md` | CreditService |
| `back/src/app/api/polar/webhook/route.ts` | Polar webhook |
| `back/src/routers/credits/credits.router.ts` | Credits procedures |
| `front/src/app/buy-credits/page.tsx` | Purchase page |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/app/buy-credits/page.tsx` | MODIFY | Balance, Polar link |
| `front/src/app/paliers/page.tsx` | MODIFY | Credit packages |
| `back/src/app/api/polar/webhook/route.ts` | MODIFY | Handle purchase |
| `back/src/routers/credits/credits.router.ts` | MODIFY | getBalance, getHistory |
| `back/src/lib/credits/services/credit.service.ts` | MODIFY | topUp, deduct |

### Existing Patterns to Follow

```typescript
// CreditService.getBalance(userId)
// CreditService.addCredits(userId, amount, "TOP_UP", description)
// CreditService.deductCredits(userId, amount, "USAGE", description)
```

### Dependencies
- Polar API
- CreditService

## Implementation Details

### API Endpoints

#### `POST /api/polar/webhook`
**Purpose:** Polar webhook on purchase completion

**Request:** Polar webhook payload (verify signature)

**Response:** 200

**Auth:** Polar signature verification

### tRPC Procedures

#### `credits.getBalance`
**Output:** `{ balance: number }`

#### `credits.getHistory`
**Input:** `{ limit?: number, cursor?: string }`
**Output:** `credit_transaction[]` (paginated)

### Database
- `credit_transaction`: userId, amount, type (TOP_UP, USAGE, REFUND), description
- `app_user.creditBalance`: updated on transaction

### Credit Flow
1. User clicks "Buy credits" → redirect to Polar checkout
2. User completes payment on Polar
3. Polar webhook → CreditService.addCredits → credit_transaction
4. Workshop participation → CreditService.deductCredits (if applicable)

### Components

| Component | Location | Props |
|-----------|----------|-------|
| CreditBalance | - | balance |
| TransactionHistory | - | transactions |
| BuyCreditsButton | - | packageId |

## Validation Criteria

### Functional Requirements
- [ ] Balance displayed correctly
- [ ] Buy credits → Polar checkout
- [ ] Webhook credits account
- [ ] Transaction history loads
- [ ] Workshop deducts credits when applicable

### Technical Requirements
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] Webhook signature verification
- [ ] Idempotent webhook (no double credit)
- [ ] Atomic balance update

### Security Checklist
- [ ] Webhook signature verification
- [ ] No manual balance manipulation from frontend
- [ ] Audit log for credit changes

### Testing Steps
1. Check balance
2. Simulate webhook (or test Polar sandbox)
3. Verify transaction created
4. Workshop participation → deduct

---
