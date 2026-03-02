# Tipping (pourboires) PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable apprenants to tip mentors after a workshop so that they can show appreciation and mentors can receive extra compensation.

## Why

**Business Justification:**
- Mentor motivation
- User engagement (optional gesture)
- Monetization complement

**Priority:** Low (optional feature)

## What

### Feature Description
- **TippingModal** : After workshop, apprenant can open modal to tip mentor
- **Montant** : Preset amounts or custom
- **Paiement** : Polar or internal credits (to define)
- **Historique** : Mentor sees tips received (optional)

### Scope
**In Scope:**
- TippingModal component
- WorkshopTippingService
- tRPC or API for tip submission
- Integration with payment (Polar or credits)

**Out of Scope:**
- Withdrawal flow for mentors
- Tip analytics dashboard

### User Stories
1. As an apprenant, I want to tip my mentor after a workshop so that I can thank them
2. As a mentor, I want to receive tips so that I am rewarded for good sessions

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/services.md` | WorkshopTippingService |
| `ai_docs/docs/components.md` | TippingModal |
| `front/src/components/workshop/TippingModal.tsx` | Tipping modal |
| `back/src/lib/workshops/services/feedback/workshop-tipping.service.ts` | Tipping logic |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/components/workshop/TippingModal.tsx` | MODIFY | Tip form, amounts |
| `back/src/routers/workshops/workshop-feedback.router.ts` | MODIFY | submitTip procedure |
| `back/src/lib/workshops/services/feedback/workshop-tipping.service.ts` | MODIFY | Process tip |

### Existing Patterns to Follow

```typescript
// WorkshopTippingService.tip(apprenticeId, mentorId, workshopId, amount)
// Payment: Polar checkout or credit deduction
```

### Dependencies
- WorkshopTippingService
- Polar API or CreditService (depending on implementation)
- workshop, mentor_feedback context

## Implementation Details

### tRPC Procedure

#### `workshopFeedback.submitTip`
**Input:** `{ workshopId: string, mentorId: string, amount: number }`

**Output:** `{ success: boolean, checkoutUrl?: string }` (if Polar redirect)

**Auth:** Required (APPRENANT, participant of workshop)

### Flow
1. Apprenant completes workshop
2. TippingModal shown (or accessible from workshop detail)
3. Select amount, submit
4. If Polar: redirect to checkout
5. If credits: deduct from balance, credit mentor
6. Webhook/callback on payment success

### Database
- May need `tip` or `mentor_tip` table, or use credit_transaction with type TIP
- Or store in mentor_feedback if combined

### Components

| Component | Location | Props |
|-----------|----------|-------|
| TippingModal | `workshop/` | workshop, mentor, open, onClose |

## Validation Criteria

### Functional Requirements
- [ ] TippingModal opens after workshop
- [ ] User can select/specify amount
- [ ] Submit triggers payment flow
- [ ] Mentor receives tip (or pending)
- [ ] One tip per workshop per apprenant (optional)

### Technical Requirements
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] Amount validation (min, max)
- [ ] Participant check

### Security Checklist
- [ ] Only participant can tip
- [ ] Workshop must be COMPLETED
- [ ] Amount limits

### Testing Steps
1. Complete workshop as apprenant
2. Open tipping modal
3. Submit tip → payment flow or credit deduction
4. Mentor sees tip (if UI exists)

---
