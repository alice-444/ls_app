# Support avec pièces jointes PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable users to attach files to support requests so that they can provide screenshots or documents when reporting issues.

## Why

**Business Justification:**
- Better support : visual context helps resolution
- Common need for bug reports
- Improves first-contact resolution

**Priority:** Medium

## What

### Feature Description
- **Upload pièces jointes** : User selects files before/during support form submission
- **Stockage** : Files stored via FileStorageService
- **Association** : support_request.attachments (Json array of filenames or URLs)
- **Téléchargement** : Route to serve attachment for support team (admin) or email inclusion

### Scope
**In Scope:**
- Support form with file input
- Upload to storage (S3, local, etc.)
- POST /api/support-request with attachments
- GET /api/support-request/attachments/[filename] for download (admin or authenticated)

**Out of Scope:**
- Admin UI to view support requests
- Email inline images (optional)
- Multiple file types validation (beyond size/type)

### User Stories
1. As a user, I want to attach a screenshot to my support request so that I can show the issue
2. As support, I want to download attachments so that I can investigate

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/database.md` | support_request (attachments Json) |
| `ai_docs/docs/services.md` | FileStorageService, EmailService |
| `back/src/app/api/support-request/route.ts` | Support request API |
| `back/src/app/api/support-request/attachments/[filename]/route.ts` | Attachment download |
| `front/src/app/support-request/page.tsx` | Support form |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/app/support-request/page.tsx` | MODIFY | File input, upload |
| `back/src/app/api/support-request/route.ts` | MODIFY | Handle attachments |
| `back/src/app/api/support-request/attachments/[filename]/route.ts` | MODIFY | Serve file |
| `back/src/lib/users/services/account/shared/file-storage.service.ts` | REFERENCE | Storage |

### Existing Patterns to Follow

```typescript
// FileStorageService.upload(buffer, path, contentType)
// support_request.attachments: string[] (filenames or keys)
```

### Dependencies
- FileStorageService
- support_request table

## Implementation Details

### API Endpoints

#### `POST /api/support-request`
**Purpose:** Submit support request with optional attachments

**Request:** multipart/form-data
- email, subject, description, problemType
- attachments[] (files)

**Response:** `{ success: boolean }`

**Auth:** Optional (userId if logged in)

#### `GET /api/support-request/attachments/[filename]`
**Purpose:** Download attachment (for support/admin)

**Response:** File stream

**Auth:** Admin or internal

### Database
- `support_request.attachments`: Json array `["key1", "key2"]`

### Storage
- Path: `support/{requestId}/{filename}` or similar
- Max size: e.g. 5MB per file, 3 files max

### Components

| Component | Location | Props |
|-----------|----------|-------|
| SupportRequestForm | - | - |
| FileUploadInput | - | onFilesSelected, maxFiles |

## Validation Criteria

### Functional Requirements
- [ ] User can select files in support form
- [ ] Files uploaded with request
- [ ] support_request.attachments populated
- [ ] Download route serves file
- [ ] File size/type validation

### Technical Requirements
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] Multipart parsing
- [ ] Secure filename handling

### Security Checklist
- [ ] File type whitelist (images, PDF)
- [ ] File size limit
- [ ] Download auth (admin only or signed URL)
- [ ] No path traversal

### Testing Steps
1. Submit support with file → attachment stored
2. Download attachment (admin) → file received
3. Invalid file type → rejected

---
