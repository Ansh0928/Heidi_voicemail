# Heidi Voicemail Intelligence (HVI)

An intelligent voicemail triage dashboard built on top of [Heidi Health](https://www.heidihealth.com/). Turns raw after-hours GP voicemails into prioritised, structured, actionable work items for clinic admin staff.

**Live demo:** https://master.d156vsb2zd7bmk.amplifyapp.com/voicemails

---

## The Problem

Multi-location GP clinics using Heidi Calls receive 20–40 unstructured voicemails overnight. Every morning, admin staff arrive to a flat list with no urgency signals, no structured data, and no way to prioritise without listening to each recording in full. Before the clinical day begins, they are already behind.

This is not an audio problem. It is a workflow and information problem.

---

## Solution

HVI processes each voicemail through an AI pipeline (Deepgram transcription → Claude classification) and surfaces every recording as a structured card with:

- **Urgency level** — URGENT / HIGH / NORMAL / LOW, auto-ranked
- **Intent classification** — one of 14 standardised codes (rx-refill, appt-book, symptom-acute, etc.)
- **Plain-English summary** — 1–2 sentence digest
- **Key details** — extracted dates, medications, symptoms
- **Suggested action** — what the admin should do next
- **Full transcript** — searchable, skimmable
- **Playable audio** — original recording always available

---

## Wireframe & Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HeiSidebar (220px)          │  VoicemailList (420px)  │  VoicemailDetail   │
│                              │                         │  (flex-1)          │
│  [HeidiMark logo]            │  StatsBar               │                    │
│                              │  ┌──────────────────┐   │  Caller name       │
│  ○ Scribe                    │  │  12 total         │   │  + number + time   │
│  ○ Evidence                  │  │  3 urgent         │   │                    │
│  ✓≡ Tasks  ← active          │  │  5 in progress    │   │  [URGENT] [badge]  │
│  ○ Comms                     │  │  4 resolved       │   │  Intent tag        │
│  ○ My Templates              │  └──────────────────┘   │                    │
│  ○ Templates                 │                         │  Summary           │
│  ○ Team                      │  FilterBar              │  ────────────────  │
│                              │  [All][Urgent][New]     │  Key details list  │
│  ──────────────              │  [In Progress][Done]    │                    │
│                              │                         │  Suggested action  │
│  Clinic: [All Clinics ▾]     │  VoicemailCard          │  ────────────────  │
│   ├ All Clinics              │  ┌──────────────────┐   │                    │
│   ├ Clinic 1                 │  │ [URGENT]  name   │   │  Transcript        │
│   ├ Clinic 2                 │  │ intent    time   │   │  (scrollable)      │
│   └ Clinic 3                 │  │ summary excerpt  │   │                    │
│                              │  │ key details ×3   │   │  Audio player      │
│                              │  └──────────────────┘   │  ────────────────  │
│                              │                         │                    │
│                              │  VoicemailCard ×N       │  [Calling back]    │
│                              │  (sorted by urgency     │  [Assign]          │
│                              │   then received time)   │  [Resolve]         │
│                              │                         │  [Archive]         │
└──────────────────────────────┴─────────────────────────┴────────────────────┘
```

---

## Architecture

### Phase 1 — Prototype (current, deployed)

```
Browser
  └── Next.js 15 App Router (SSR)
        │
        ├── app/voicemails/page.tsx        ← async server component
        │     └── getVoicemails()          ← queries Neon DB
        │
        ├── app/voicemails/VoicemailsClient.tsx  ← client shell, holds clinic filter state
        │     ├── HeiSidebar              ← nav + clinic dropdown
        │     └── VoicemailList           ← list + detail panel
        │           ├── StatsBar
        │           ├── FilterBar
        │           ├── VoicemailCard ×N
        │           └── VoicemailDetail
        │
        └── lib/
              ├── db.ts                   ← Neon serverless connection
              ├── voicemail-queries.ts    ← SQL via tagged template literals
              ├── mock-data.ts            ← seed data (12 realistic voicemails)
              └── urgency.ts             ← URGENCY_CONFIG, INTENT_LABELS, sortByUrgency
```

### Phase 2 — Real AI Pipeline (planned)

```
Heidi Calls
    │  webhook POST /api/voicemail/ingest
    ▼
Ingest Handler
    │  download audio from Heidi signed URL
    │  store in S3 (ap-southeast-2)
    ▼
Deepgram Nova-2
    │  Australian English model
    │  speaker diarization (caller vs. system greeting)
    │  entity detection: phone numbers, dates, names
    │  ~$0.0043/min ≈ $0.26/night for 30 voicemails
    ▼
Claude claude-sonnet-4-6
    │  structured JSON output (schema-enforced)
    │  urgency classification + confidence score
    │  intent code (14 categories)
    │  plain-English summary
    │  key detail extraction
    │  suggested action
    │  flag for human review
    ▼
Neon Postgres (voicemails + status_events tables)
    ▼
Next.js SSR → HVI Dashboard
```

---

## Data Model

```
voicemails
├── id                  TEXT PRIMARY KEY
├── caller_name         TEXT
├── caller_number       TEXT
├── received_at         TIMESTAMPTZ
├── duration            INTEGER           (seconds)
├── location            TEXT              ('Clinic 1' | 'Clinic 2' | 'Clinic 3')
├── urgency             TEXT              ('urgent' | 'high' | 'normal' | 'low')
├── urgency_confidence  REAL              (0.0 – 1.0)
├── intent              TEXT              (14-code enum)
├── summary             TEXT
├── key_details         TEXT[]
├── suggested_action    TEXT
├── transcript_excerpt  TEXT
├── transcript          TEXT
├── audio_url           TEXT
├── flag_for_human      BOOLEAN
├── status              TEXT              ('new' | 'in-progress' | 'done')
└── assigned_to         TEXT

status_events
├── id                  SERIAL PRIMARY KEY
├── voicemail_id        TEXT → voicemails(id)
├── status              TEXT
├── changed_at          TIMESTAMPTZ
├── changed_by          TEXT
└── note                TEXT
```

---

## Intent Codes

| Code | Label |
|------|-------|
| `appt-book` | Appointment — Book |
| `appt-change` | Appointment — Change |
| `rx-refill` | Prescription Refill |
| `rx-new` | New Prescription |
| `results` | Test Results |
| `referral` | Referral |
| `symptom-acute` | Acute Symptom |
| `symptom-routine` | Routine Symptom |
| `callback` | Callback Request |
| `mental-health` | Mental Health |
| `admin` | Admin / General |
| `post-op` | Post-Op / Follow-up |
| `med-cert` | Medical Certificate |
| `other` | Other |

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15.3.0 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 (`@theme {}` tokens) |
| UI primitives | Radix UI (Dialog, Select, Tooltip, ScrollArea) |
| Icons | Lucide React |
| Database | Neon (serverless Postgres) |
| Date utils | date-fns |
| Deployment | AWS Amplify |
| Package manager | bun |

### Heidi Design Tokens

```css
--color-brand:        #4c2934   /* buttons, active states */
--color-brand-dark:   #3d1520   /* primary text */
--color-bg-sidebar:   #f7f1ee   /* sidebar background */
--color-bg-active:    #f0e2d8   /* active nav item */
```

---

## File Structure

```
heidi-voicemail/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                          ← redirect → /voicemails
│   └── voicemails/
│       ├── page.tsx                      ← async server component, fetches DB
│       └── VoicemailsClient.tsx          ← client shell, clinic filter state
├── components/
│   ├── layout/
│   │   ├── HeidiNav.tsx
│   │   └── HeiSidebar.tsx               ← HeidiMark SVG + clinic dropdown
│   └── voicemail/
│       ├── FilterBar.tsx
│       ├── IntentTag.tsx
│       ├── StatsBar.tsx
│       ├── UrgencyBadge.tsx
│       ├── VoicemailCard.tsx
│       ├── VoicemailDetail.tsx
│       └── VoicemailList.tsx
├── lib/
│   ├── db.ts                            ← Neon connection
│   ├── mock-data.ts                     ← 12 realistic seed voicemails
│   ├── urgency.ts                       ← URGENCY_CONFIG, sortByUrgency
│   ├── utils.ts
│   └── voicemail-queries.ts             ← SQL queries
├── scripts/
│   └── seed.ts                          ← populate DB from mock-data
├── types/
│   └── voicemail.ts                     ← VoicemailItem, IntentCode, etc.
├── public/audio/
│   └── vm-001.mp3 … vm-012.mp3         ← real voicemail recordings
└── instrumentation.ts                   ← localStorage polyfill (Node 25)
```

---

## Local Setup

```bash
# 1. Clone and install
git clone <repo>
cd heidi-voicemail
bun install

# 2. Environment
cp .env.example .env.local
# Set DATABASE_URL to your Neon connection string

# 3. Seed the database
bunx tsx scripts/seed.ts

# 4. Run dev server
node node_modules/.bin/next dev --port 3000
# NOTE: use node, not bun — Node 25 has a bun incompatibility with Next.js
```

> The app is at `http://localhost:3000/voicemails`

---

## Users

| Role | Pain point addressed |
|------|---------------------|
| **Clinic Admin** (primary) | No urgency signal → auto-sorted inbox; no need to listen to every recording |
| **Practice Manager** | No visibility → stats bar shows volume and resolution rate |
| **GP / Clinical Lead** | Missed urgencies → URGENT voicemails surface immediately, flagged for human review |

---

## Roadmap

- [x] Three-panel layout (sidebar + list + detail)
- [x] Urgency sorting + colour system
- [x] Intent classification (14 codes)
- [x] Clinic filter (All / Clinic 1 / Clinic 2 / Clinic 3)
- [x] Action buttons (Calling back / Assign / Resolve / Archive)
- [x] Status history timeline
- [x] Real audio playback (12 MP3 recordings)
- [x] Full transcript display
- [x] Neon Postgres integration
- [x] AWS Amplify deployment
- [ ] Heidi Calls webhook ingest (`POST /api/voicemail/ingest`)
- [ ] Deepgram transcription pipeline
- [ ] Claude classification pipeline
- [ ] Real-time status updates (optimistic UI)
- [ ] Batch actions (mark all read)
- [ ] Keyboard shortcuts
- [ ] Analytics / resolution trend charts
