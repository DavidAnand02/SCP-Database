# SCP Foundation System Guidelines (AGENTS.md)

## Core Architectural Guardrails

### 1. Audio & Media Handling
- **Pattern**: Always use the "Keyed Direct Source" pattern for `<audio>` and `<img>` elements.
- **Implementation**: Provide a `key` prop tied to the URL to force re-mounting when the media source changes. 
- **Reason**: Prevents stale media state in the browser's DOM buffer during rapid navigation or state updates.
- **Constraints**: Avoid restrictive `type` attributes on `<source>` tags within `<audio>` elements to maximize browser codec compatibility.

### 2. Administrative Security Mutations
- **Middleware**: All `Save`, `Delete`, and `Upload` operations must pass through the `_verifyAndLog` internal middleware in `scpService.ts`.
- **Identity Check**: Use `supabase.auth.getUser()` (NOT `getSession()`) for every mutation to prevent JWT/Token spoofing.
- **Rate-Limiting**: A mandatory 2-second cooldown is enforced on mutations to prevent resource exhaustion and scripted attacks.
- **Validation**: Every upsert MUST be validated against `SCPSchema` via Zod before database submission.

### 3. UI/UX & Aesthetic Invariants
- **Theme**: Stick to "Foundation Brutalist" (Glass panels, scanlines, monospace typography).
- **Typography**: Header text should be tracking-widest and uppercase.
- **Redaction**: Use the `<DetailItem>` or `normalizeValue` utilities to handle missing data with the standard `[REDACTED]` string.
- **Virtualization**: The secure directory MUST use `react-window` virtualization to maintain 60fps performance with large datasets.

### 4. Database Schema Integrity
- **Granularity**: The SCP database uses 77 granular columns. Never assume fields are optional unless explicitly handled by the default value engine in `validationSchemas.ts`.
- **Arrays**: Fields like `image_urls` and `audio_urls` are handled as Postgres arrays. Ensure Zod schemas are updated if new media arrays are introduced.

## Security Posture
- **Email Lock**: Administrative capabilities are strictly locked to the email defined in `VITE_ADMIN_EMAIL`. 
- **Production Audit**: Critical actions are logged to the console (and potentially a future `audit_logs` table) for forensic integrity.
