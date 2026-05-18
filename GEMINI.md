# SCP Foundation Internal Directory & Admin Terminal (v4.1.0)

## Project Overview
This application is a high-fidelity, immersive internal directory and administrative terminal for the SCP Foundation. It provides a secure interface for Level 4 and Level 5 personnel to browse, analyze, and manage anomalous entities within the Foundation's database.

The project is designed with a "Terminal/Brutalist" aesthetic, utilizing high-contrast typography, glass-morphism panels, and scanline effects to evoke a sense of classified government hardware.

## Core Capabilities
- **Advanced Directory**: Browse the full SCP database with real-time filtering by Object Class, Disruption Class, Risk Class, and more.
- **Deep Analytics**: A comprehensive data visualization suite using Recharts, featuring:
    - Strategic Overviews (Containment, Disruption, Risk).
    - Anomalous Profiling (Ontology, Morphology, Anomaly Types).
    - Containment & Logistics (Status, Facility Distribution, Departmental Workload).
    - Historical Data (Discovery Timelines, Methods, and Locations).
    - Advanced Anomaly Profiling (Origin Analysis, Interaction Types, Natural Law Violations, Spread Mechanisms).
- **Relational Mapping**: Interactive network graph visualization (Cytoscape.js) for exploring connections between anomalies.
- **Admin Terminal (CRUD)**: Full administrative control for authorized personnel to create, edit, and delete SCP entries.
- **Secure Media Storage**: Integrated file upload system for SCP visual data (images) and audio logs, powered by Supabase Storage.
- **SEO Optimized**: Full support for search engine indexing with dynamic meta tags, canonical URLs, and semantic HTML structure via `react-helmet-async`.
- **High-Performance Rendering**: Virtualized grid system (`react-window`) for the main directory, capable of handling thousands of records at 60fps.

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite.
- **State Management**: React Context (UI state) + React Query (Server state/Caching).
- **Styling**: Tailwind CSS v4 (Utility-first, mobile-responsive).
- **Animations**: Motion (formerly Framer Motion).
- **Icons**: Lucide React.
- **Charts**: Recharts (Customized for instant feedback and terminal aesthetic).
- **Graphing**: Cytoscape.js with fcose layout.
- **Backend**: Supabase (PostgreSQL database, Auth, and Storage).

## Database Schema (77 Columns)
The application uses a highly granular schema to capture every forensic detail of an anomaly. Key fields include:
- **Identification**: `scp_designation`, `code_name`, `rating`, `original_scp_article_author`.
- **Classification**: `object_containment_class`, `disruption_class`, `risk_class`, `ontological_category`, `morphology`, `anomaly_type`.
- **Forensics**: `origin`, `interaction_type`, `affected_natural_laws`, `spread_mechanism`, `abilities`, `weaknesses`.
- **Logistics**: `containment_facility`, `respective_department`, `involved_personnel` (Doctors, Researchers, Agents, MTFs).
- **Historical**: `date_discovered`, `country_of_discovery`, `discovery_method`.

## Instructions for Future Models
If you are taking over this project, please adhere to the following guidelines:

### 1. UI/UX Consistency
- Maintain the **Foundation Aesthetic**: Use the `terminal-text`, `glass-panel`, and `scanline-container` classes.
- **Typography**: Headers should be uppercase, tracking-widest, and often use `font-mono`.
- **Color Palette**: Stick to the established `foundation-accent` (#ff4400), `foundation-terminal` (#00ff41), and `foundation-muted` (#888).
- **Popups**: Ensure popup cards (like in `SimilarAnomalies.tsx`) are solid (`#0a0a0a`) for maximum legibility.

### 2. Data Handling
- **Normalization**: Always use the `normalizeValue` utility when processing data for charts to ensure consistency across the 77-column dataset.
- **Exclusion**: When building new charts, ensure you filter out values in the `EXCLUDED_VALUES` list (e.g., 'missing', 'not in source') to keep the analysis informative.
- **Redaction**: Use the `DetailItem` component for displaying SCP details; it handles the logic for replacing missing/non-informative data with `[REDACTED]`.

### 3. SEO & Routing
- **Helmet**: Every page component MUST include a `<Helmet>` block with a unique title and description.
- **Canonical URLs**: Always include a canonical link using `window.location.href` or `window.location.origin`.
- **Semantic Tags**: Use `<h1>` for the primary page title and `<h2>` for section headers.

### 4. Performance (Virtualization)
- The main directory uses `react-window` for virtualization. Do not attempt to render the full list of SCPs directly as it will cause significant lag.
- Use `AutoSizer` to ensure the virtualized grid fills its container correctly.

## Setup & Environment Variables
The following environment variables are required in the `.env` file:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_EMAIL=your-admin-email@example.com
```

## Recent Refinements
- **Security Posture Audit**: Transitioned from hardcoded credentials to environment-based administration (`VITE_ADMIN_EMAIL`).
- **Data Integrity Core**: Implemented `zod` for server-side validation of all SCP entries to prevent database poisoning.
- **Identity Verification**: Switched all administrative checks from `getSession()` to the more secure `getUser()` to prevent JWT spoofing.
- **Storage Hardening**: Added rigorous MIME-type and file-size (50MB) validation for all media uploads.
- **Redaction Engine**: Implemented generic error redacting to prevent internal database schema leaks during failures.
- **SCP Detail View Overhaul**: Replaced the tabbed interface with a comprehensive, scrollable "Forensic Report" dossier.
- **Forensic Report Engine**: A new component (`SCPForensicReport.tsx`) that maps all 77 database columns into structured, thematic sections (Executive Summary, Anomalous Analysis, Containment Protocol, etc.).
- **Sticky Dossier Navigation**: Implemented a high-fidelity sticky navigation bar with jump-links and scroll-position awareness using IntersectionObserver.
- **Visual "Hole" Fix**: Resolved a common sticky positioning glitch by using negative margins and padding to cover layout-level padding on scroll.
- **SEO Overhaul**: Implemented dynamic metadata, canonical URLs, and semantic HTML for all pages.
- **UI Hardening**: Made "Related Anomalies" popups solid and improved their positioning logic.
- **Performance**: Optimized the virtualized grid for smoother scrolling on mobile devices.
- **Relational Mapping**: Added a dedicated network graph view in the Analytics section.
- **Global Exclusion**: Refined the data normalization engine to handle complex multi-value fields.
- **Audio Playback Optimization**: Fixed a critical bug where audio logs wouldn't load or update by transitioning to a keyed `src` attribute pattern and removing restrictive MIME type constraints.
- **Audit Logging & Rate Limiting**: Implemented a security middleware in `scpService` to log administrative actions (Save/Delete/Upload) and prevent rapid-fire secondary mutations.

### 5. Security & Data Integrity
- **Zero-Trust Writes**: Every mutation (UPSERT/DELETE) must be preceded by a call to `supabase.auth.getUser()` to verify identity.
- **Rate-Limiting Guard**: A 2-second cooldown is enforced on all administrative mutations to prevent scripted database poisoning or resource exhaustion.
- **Audit Trail**: Administrative actions are logged with user identity, action type, and target resource for forensic review.
- **Schema Enforcement**: Use the `SCPSchema` in `src/services/validationSchemas.ts` for any operation involving the `scps` table.
- **Error Redaction**: Never pass raw database or storage errors to the client. Always mask them with generic "Security Violation" or "Database Failure" messages.
- **Storage Validation**: Media uploads must be checked for both size and MIME type before being transmitted to the bucket.
