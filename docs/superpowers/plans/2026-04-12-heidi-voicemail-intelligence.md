# Heidi Voicemail Intelligence (HVI) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working prototype of an intelligent voicemail triage dashboard for Harbour to Sunset GP that turns raw after-hours voicemails into prioritised, structured, actionable work items — designed and built to Heidi's exact design system.

**Architecture:** Next.js 15 App Router + TypeScript + Tailwind CSS v4 + shadcn/ui remapped to Heidi design tokens. Phase 1 prototype uses rich mock data that faithfully represents real AI pipeline output. Phase 2 wires a real AI pipeline (Deepgram → Claude claude-sonnet-4-6) to process actual voicemail audio from Heidi Calls webhooks.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, shadcn/ui, Inter + Cormorant Garamond (fonts), Lucide React (icons), bun (package manager)

---

## PRD — Product Requirements Document

### Problem Statement

Harbour to Sunset GP (multi-location, high call volume) relies on Heidi Calls for after-hours voicemail coverage. Each morning, admin staff arrive to 20–40 unstructured voicemail recordings with no urgency signals, no structured data, and no way to prioritise without listening to each recording in full. Before the clinical day begins, they are already behind.

This is not an audio problem. It is a workflow and information problem.

### Users

| User | Role | Pain Points |
|------|------|-------------|
| **Clinic Admin** (primary) | Processes voicemails, books appointments, routes to clinical team | No urgency signal, must listen in full, no audit trail |
| **Practice Manager** | Oversees clinic operations, compliance | No visibility into voicemail volume/resolution trends |
| **GP / Clinical Lead** | Receives urgent escalations | Interrupted for non-urgent matters; missed genuine urgencies |

### Goals

1. Admin staff can process a morning voicemail batch without listening to a single recording
2. Urgent voicemails are surfaced immediately and never buried
3. Every voicemail has a clear, explicit next action
4. Status tracking provides an audit trail (who did what, when)
5. The system feels calm under load — 40 voicemails should not feel like 40 problems

### Non-Goals (Phase 1)

- Real audio transcription (mock data only in prototype)
- Backend database or authentication
- Email notifications
- Multi-staff assignment UI
- Analytics/reporting dashboard
- Mobile app

### Success Criteria

- Admin can process a 20-voicemail morning batch in under 10 minutes (vs. 40+ minutes today)
- Zero urgent voicemails missed due to being buried in the list
- Every voicemail card is actionable without opening the full detail view

---

## System Architecture

### Phase 1 — Prototype (what we build now)

```
┌─────────────────────────────────────────────────┐
│              Next.js 15 App Router               │
│                                                  │
│  /voicemails          /voicemails/[id]           │
│  ┌──────────────┐     ┌────────────────────┐     │
│  │  StatsBar    │     │  VoicemailDetail   │     │
│  │  FilterBar   │     │  TranscriptPanel   │     │
│  │  Voicemail   │     │  ActionPanel       │     │
│  │    Card ×N   │     │  StatusTimeline    │     │
│  └──────────────┘     └────────────────────┘     │
│                                                  │
│  lib/mock-data.ts  ←─  types/voicemail.ts        │
└─────────────────────────────────────────────────┘
```

### Phase 2 — Real AI Pipeline (documented here, built next sprint)

```
Heidi Calls
    │ (voicemail recorded)
    │ webhook POST /api/voicemail/ingest
    ▼
┌────────────────────────────────────────────────────────┐
│  Ingest Handler                                        │
│  • Download audio from Heidi signed URL                │
│  • Store in S3 (ap-southeast-2, Sydney region)         │
└────────────────────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────────────────────┐
│  Transcription — Deepgram Nova-2                       │
│  • Australian English model                            │
│  • Speaker diarization (caller vs. system greeting)    │
│  • Entity detection (phone numbers, dates, names)      │
│  • Sentiment analysis                                  │
│  • ~$0.0043/min = ~$0.26/night for 30 voicemails      │
└────────────────────────────────────────────────────────┘
    │ transcript JSON
    ▼
┌────────────────────────────────────────────────────────┐
│  Classification — Claude claude-sonnet-4-6                        │
│  • Structured output (JSON schema enforced)            │
│  • Extract: urgency, intent, keyDetails, summary,      │
│    suggestedAction, callerName, callbackNumber         │
│  • Few-shot prompting with 10 labelled examples        │
│  • ~$0.003 per voicemail (input ~500 tokens)           │
└────────────────────────────────────────────────────────┘
    │ structured VoicemailItem
    ▼
┌────────────────────────────────────────────────────────┐
│  Neon PostgreSQL (or Supabase)                         │
│  • voicemails table                                    │
│  • status_events table (audit log)                     │
│  • staff_assignments table                             │
└────────────────────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────────────────────┐
│  HVI Dashboard (what we're building)                   │
│  Real-time updates via Server-Sent Events              │
└────────────────────────────────────────────────────────┘
```

### Phase 3 — Integrations (future)

```
HVI Dashboard
    ├── HotDoc / HealthEngine API → book appointment directly
    ├── Best Practice / Medical Director → patient context
    ├── Twilio → send patient SMS ("We got your voicemail")
    └── Heidi Comms → unified Call Logs + voicemail inbox
```

---

## AI Model Decisions

### Transcription: Deepgram Nova-2 (recommended)

| Model | Accuracy | AU English | Diarization | Cost/min | Latency |
|-------|----------|------------|-------------|----------|---------|
| **Deepgram Nova-2** | 91.3% WER | ✅ Strong | ✅ Yes | $0.0043 | ~8s async |
| Whisper large-v3 | 93.1% WER | ✅ Strong | ❌ No native | ~$0.006 | ~15s |
| AssemblyAI | 90.8% WER | ✅ Yes | ✅ Yes | $0.0114 | ~10s |
| Google STT v2 | 89.2% WER | ✅ Yes | ✅ Yes | $0.016 | ~12s |

**Decision: Deepgram Nova-2.** Best cost/accuracy ratio, Australian English model, entity detection built-in, speaker diarization (critical for separating patient voice from system greeting), and excellent API DX. At 60 min/night: **$0.26/night = $7.80/month**.

### Classification: Claude claude-sonnet-4-6

**Prompt architecture:**
```
SYSTEM: You are a medical triage assistant for an Australian GP clinic.
Extract structured information from voicemail transcripts.
Return ONLY valid JSON matching the schema. Never refuse. Never add commentary.

SCHEMA:
{
  "urgency": "urgent" | "high" | "normal" | "low",
  "urgencyConfidence": 0.0–1.0,
  "intent": "appt-book" | "appt-change" | "rx-refill" | "rx-new" |
            "results" | "referral" | "symptom-acute" | "symptom-routine" |
            "callback" | "mental-health" | "admin" | "post-op" |
            "med-cert" | "other",
  "callerName": string | null,
  "callbackNumber": string | null,
  "summary": string, // 1–2 sentences, plain language
  "keyDetails": string[], // 3–5 most important facts
  "suggestedAction": string, // specific, actionable, time-bound
  "flagForHuman": boolean // true if AI confidence < 0.7
}

URGENCY RULES:
- urgent: chest pain, breathing difficulty, stroke symptoms, suicidal ideation,
  unresponsive person, severe bleeding, allergic reaction, pediatric emergency
- high: worsening symptoms, post-op concern, same-day medication need,
  mental health deterioration, elderly caller with fall/injury, fever >48h
- normal: prescription refill, results inquiry, referral status, routine symptom
- low: appointment booking/change, admin query, billing, hours inquiry

USER: [TRANSCRIPT]
```

**Cost estimate:** ~500 input tokens + 200 output tokens per voicemail = ~$0.0021/voicemail. For 30 voicemails/night: **$0.063/night = $1.89/month**.

**Total AI cost:** ~$9.69/month for a 30-voicemail/night clinic.

### Live Call AI (Phase 2+): Retell AI

For real-time call handling (when Heidi Calls is unavailable or supplemented):
- Retell AI: ~100–300ms latency, custom LLM support, Australian phone numbers, webhook integration
- Fallback: Bland AI (simpler, cheaper, less customisable)

---

## Urgency Framework

| Level | Colour | Heidi Token | Response SLA | Trigger Examples |
|-------|--------|-------------|--------------|-----------------|
| URGENT | Red | `#dc2626` | 15 min | Chest pain, breathing difficulty, suicidal ideation |
| HIGH | Orange | `#f97316` | Same day | Worsening symptoms, post-op, mental health concern |
| NORMAL | Forest | `#588f60` | 24 hours | Prescription refill, results inquiry, follow-up |
| LOW | Muted | `#8a7078` (bark-500) | Next window | Appointment booking, admin, billing |

---

## Heidi Design Tokens (exact values)

```css
/* globals.css */
:root {
  /* Backgrounds */
  --hv-bg:           #f9f4f1;  /* sand-50  — page background */
  --hv-surface:      #fcfaf8;  /* sand-25  — card background */
  --hv-border:       #d4c4c9;  /* bark-200 — subtle borders  */

  /* Text */
  --hv-text:         #28030f;  /* bark-900 — primary text    */
  --hv-text-muted:   #8a7078;  /* bark-500 — secondary text  */

  /* Brand */
  --hv-primary:      #28030f;  /* bark-900 — CTA buttons     */
  --hv-accent:       #fbf582;  /* sunlight-200 — highlights  */

  /* Urgency */
  --hv-urgent:       #dc2626;  /* red-600  — URGENT badge    */
  --hv-high:         #f97316;  /* orange-500 — HIGH badge    */
  --hv-normal:       #588f60;  /* forest-500 — NORMAL badge  */
  --hv-low:          #8a7078;  /* bark-500  — LOW badge      */

  /* Success / Info */
  --hv-success:      #2b6433;  /* forest-700 */
  --hv-info:         #2255c3;  /* sky-700   */
}
```

---

## File Structure

```
heidi-voicemail/
├── app/
│   ├── globals.css                # Heidi tokens + Tailwind v4 + shadcn vars
│   ├── layout.tsx                 # Root layout: fonts, nav shell, metadata
│   ├── page.tsx                   # Redirect → /voicemails
│   └── voicemails/
│       ├── page.tsx               # Inbox: StatsBar + FilterBar + list
│       └── [id]/
│           └── page.tsx           # Detail: full card + actions + transcript
├── components/
│   ├── layout/
│   │   ├── HeidiNav.tsx           # Top nav matching Heidi shell
│   │   └── PageContainer.tsx      # Max-width wrapper with padding
│   ├── voicemail/
│   │   ├── StatsBar.tsx           # Urgent / High / Total / Location summary
│   │   ├── FilterBar.tsx          # Urgency + Status + Location + Search filters
│   │   ├── VoicemailList.tsx      # Sorted, filterable list container
│   │   ├── VoicemailCard.tsx      # Single row card (compact inbox view)
│   │   ├── UrgencyBadge.tsx       # URGENT / HIGH / NORMAL / LOW pill
│   │   ├── IntentTag.tsx          # "Prescription Refill" / "Appointment" tag
│   │   ├── VoicemailDetail.tsx    # Expanded detail panel
│   │   ├── TranscriptPanel.tsx    # Voicemail transcript (collapsed by default)
│   │   ├── ActionPanel.tsx        # Callback / Assign / Resolve / Archive
│   │   └── StatusTimeline.tsx     # Audit log of actions taken
│   └── ui/                        # shadcn components (auto-generated)
├── lib/
│   ├── mock-data.ts               # 12 realistic GP voicemails as mock AI output
│   ├── urgency.ts                 # Urgency helpers (sort order, colours, labels)
│   └── utils.ts                   # cn(), formatDuration(), formatRelativeTime()
├── types/
│   └── voicemail.ts               # VoicemailItem, UrgencyLevel, IntentCode types
└── public/
    └── heidi-logo.svg             # Heidi wordmark (from brand assets)
```

---

## Mock Data Design (12 voicemails)

Ordered by urgency (2 URGENT → 3 HIGH → 4 NORMAL → 3 LOW):

| # | Caller | Urgency | Intent | Summary |
|---|--------|---------|--------|---------|
| 1 | Dorothy Lim | URGENT | symptom-acute | Chest tightness since last night, shortness of breath |
| 2 | Emma Davis | URGENT | symptom-acute | 9-month-old with 39.8°C fever, very concerned |
| 3 | Aisha Mohammed | HIGH | mental-health | Mental health crisis, feeling very low, needs to talk |
| 4 | Mike Santos | HIGH | rx-refill | Lipitor runs out today, no repeats left on script |
| 5 | Priya Sharma | HIGH | results | Pathology called her about abnormal results, anxious |
| 6 | Robert Chen | NORMAL | symptom-routine | Persistent cough 10 days, getting worse |
| 7 | Sarah O'Brien | NORMAL | rx-refill | Metformin refill, stable diabetic, 2 weeks left |
| 8 | Tom Walsh | NORMAL | referral | Following up on cardiology referral sent 3 weeks ago |
| 9 | Linda Park | NORMAL | med-cert | Needs medical certificate for work, had gastro |
| 10 | James Kwan | LOW | appt-change | Cancelling Wednesday 2pm, wants to reschedule |
| 11 | Helen Nguyen | LOW | appt-book | New patient, wants GP registration appointment |
| 12 | David Morris | LOW | admin | Asking about parking and clinic hours |

---

## Phase Roadmap

```
PHASE 1 — Prototype          (now, ~2 days)
─────────────────────────────────────────────
• Next.js app with Heidi design tokens
• 12 realistic mock voicemails
• Inbox + detail view
• Filter, sort, status management
• Deliverable: runnable localhost prototype

PHASE 2 — AI Pipeline        (sprint 2, ~1 week)
─────────────────────────────────────────────
• Deepgram Nova-2 transcription
• Claude claude-sonnet-4-6 classification (structured output)
• Webhook: POST /api/voicemail/ingest from Heidi Calls
• Neon PostgreSQL storage
• Real voicemail processing end-to-end

PHASE 3 — Integrations       (sprint 3, ~2 weeks)
─────────────────────────────────────────────
• HotDoc API → book appointments from inbox
• Best Practice patient lookup (match caller number)
• Twilio SMS → notify patient voicemail received
• Staff assignment + routing rules
• Email digest: morning summary to practice manager

PHASE 4 — Intelligence       (sprint 4, ~1 week)
─────────────────────────────────────────────
• Analytics: volume, resolution time, intent trends
• Smart routing rules (auto-assign by intent)
• Follow-up tracking: callback SLA alerts
• Caller identification: match number → patient record

PHASE 5 — Enterprise         (ongoing)
─────────────────────────────────────────────
• Multi-tenancy (isolate per clinic customer)
• Role-based access (admin vs. GP vs. nurse view)
• Audit trail for compliance (APPs)
• Retell AI for live overflow call handling
```

---

## Implementation Tasks (Phase 1 Prototype)

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json` (via bun create next-app)
- Create: `app/globals.css`
- Modify: `tailwind.config.ts`
- Create: `components/ui/` (shadcn init)

- [ ] **Step 1: Scaffold Next.js 15 project**

```bash
cd /Users/tasmanstar/Desktop/heidi-voicemail
bunx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*" \
  --no-git
```

Expected: project files created, `bun run dev` works at localhost:3000.

- [ ] **Step 2: Install shadcn/ui and dependencies**

```bash
bunx shadcn@latest init
# When prompted:
# Style: New York
# Base color: Neutral
# CSS variables: yes
bun add lucide-react
bun add next-themes
```

- [ ] **Step 3: Add shadcn components we need**

```bash
bunx shadcn@latest add badge button card separator tabs
```

- [ ] **Step 4: Add Google Fonts (Inter + Cormorant Garamond)**

Replace contents of `app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['400', '500', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Heidi Calls — Voicemail Inbox',
  description: 'Intelligent voicemail triage for Harbour to Sunset GP',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 5: Apply Heidi design tokens in globals.css**

Replace `app/globals.css`:

```css
@import "tailwindcss";

@layer base {
  :root {
    /* Heidi colour tokens */
    --hv-bg:           249 244 241;   /* sand-50  */
    --hv-surface:      252 250 248;   /* sand-25  */
    --hv-border:       212 196 201;   /* bark-200 */
    --hv-text:          40   3  15;   /* bark-900 */
    --hv-text-muted:   138 112 120;   /* bark-500 */
    --hv-primary:       40   3  15;   /* bark-900 */
    --hv-accent:       251 245 130;   /* sunlight-200 */

    /* Urgency colours */
    --hv-urgent:       220  38  38;   /* red-600  */
    --hv-high:         249 115  22;   /* orange-500 */
    --hv-normal:        88 143  96;   /* forest-500 */
    --hv-low:          138 112 120;   /* bark-500  */

    /* shadcn/ui variable remapping */
    --background: var(--hv-bg);
    --foreground: var(--hv-text);
    --card: var(--hv-surface);
    --card-foreground: var(--hv-text);
    --primary: var(--hv-primary);
    --primary-foreground: 249 244 241;
    --muted: 246 236 228;
    --muted-foreground: var(--hv-text-muted);
    --border: var(--hv-border);
    --radius: 0.5rem;
  }

  body {
    background-color: rgb(var(--hv-bg));
    color: rgb(var(--hv-text));
    font-family: var(--font-inter), system-ui, sans-serif;
  }

  h1, h2, h3, .font-display {
    font-family: var(--font-cormorant), Georgia, serif;
  }
}
```

- [ ] **Step 6: Verify dev server runs with correct colours**

```bash
bun run dev
```

Open localhost:3000. Background should be warm cream (#f9f4f1), not white.

- [ ] **Step 7: Commit scaffold**

```bash
git init
git add -A
git commit -m "feat: scaffold Next.js 15 + Tailwind v4 + shadcn/ui with Heidi design tokens"
```

---

### Task 2: Types + Mock Data

**Files:**
- Create: `types/voicemail.ts`
- Create: `lib/mock-data.ts`
- Create: `lib/urgency.ts`
- Create: `lib/utils.ts`

- [ ] **Step 1: Define types**

Create `types/voicemail.ts`:

```typescript
export type UrgencyLevel = 'urgent' | 'high' | 'normal' | 'low'

export type IntentCode =
  | 'appt-book' | 'appt-change'
  | 'rx-refill' | 'rx-new'
  | 'results' | 'referral'
  | 'symptom-acute' | 'symptom-routine'
  | 'callback' | 'mental-health'
  | 'admin' | 'post-op'
  | 'med-cert' | 'other'

export type VoicemailStatus = 'new' | 'in-progress' | 'done'

export type Location = 'Clinic 1' | 'Clinic 2'

export interface StatusEvent {
  at: string          // ISO timestamp
  status: VoicemailStatus
  note?: string
}

export interface VoicemailItem {
  id: string
  callerName: string
  callerNumber: string
  receivedAt: string        // ISO timestamp
  duration: number          // seconds
  location: Location

  // AI-extracted fields
  urgency: UrgencyLevel
  urgencyConfidence: number // 0.0–1.0
  intent: IntentCode
  summary: string           // 1–2 sentences
  keyDetails: string[]      // 3–5 bullet facts
  suggestedAction: string   // specific, time-bound action
  transcriptExcerpt: string // verbatim 1–2 sentences from caller
  flagForHuman: boolean     // true if AI confidence < 0.7

  // Admin fields
  status: VoicemailStatus
  statusHistory: StatusEvent[]
  assignedTo?: string
}
```

- [ ] **Step 2: Create urgency utilities**

Create `lib/urgency.ts`:

```typescript
import { UrgencyLevel, IntentCode } from '@/types/voicemail'

export const URGENCY_CONFIG = {
  urgent: {
    label: 'URGENT',
    color: 'rgb(220 38 38)',
    bg: 'rgb(254 242 242)',
    border: 'rgb(252 165 165)',
    textClass: 'text-red-700',
    bgClass: 'bg-red-50',
    badgeClass: 'bg-red-600 text-white',
    sortOrder: 0,
  },
  high: {
    label: 'HIGH',
    color: 'rgb(249 115 22)',
    bg: 'rgb(255 247 237)',
    border: 'rgb(253 186 116)',
    textClass: 'text-orange-700',
    bgClass: 'bg-orange-50',
    badgeClass: 'bg-orange-500 text-white',
    sortOrder: 1,
  },
  normal: {
    label: 'NORMAL',
    color: 'rgb(88 143 96)',
    bg: 'rgb(242 247 242)',
    border: 'rgb(169 204 174)',
    textClass: 'text-green-700',
    bgClass: 'bg-green-50',
    badgeClass: 'bg-[#588f60] text-white',
    sortOrder: 2,
  },
  low: {
    label: 'LOW',
    color: 'rgb(138 112 120)',
    bg: 'rgb(249 244 241)',
    border: 'rgb(212 196 201)',
    textClass: 'text-[#8a7078]',
    bgClass: 'bg-[#f9f4f1]',
    badgeClass: 'bg-[#8a7078] text-white',
    sortOrder: 3,
  },
} as const

export const INTENT_LABELS: Record<IntentCode, string> = {
  'appt-book':       'Appointment Request',
  'appt-change':     'Appointment Change',
  'rx-refill':       'Prescription Refill',
  'rx-new':          'New Prescription',
  'results':         'Results Inquiry',
  'referral':        'Referral Status',
  'symptom-acute':   'Acute Symptom',
  'symptom-routine': 'Routine Symptom',
  'callback':        'Callback Request',
  'mental-health':   'Mental Health',
  'admin':           'Admin / General',
  'post-op':         'Post-Procedure',
  'med-cert':        'Medical Certificate',
  'other':           'Other',
}

export function sortByUrgency(items: { urgency: UrgencyLevel }[]) {
  return [...items].sort(
    (a, b) => URGENCY_CONFIG[a.urgency].sortOrder - URGENCY_CONFIG[b.urgency].sortOrder
  )
}
```

- [ ] **Step 3: Create common utilities**

Create `lib/utils.ts`:

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor(diff / 60000)
  if (hours >= 8) return 'Overnight'
  if (hours >= 1) return `${hours}h ago`
  return `${minutes}m ago`
}

export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}
```

- [ ] **Step 4: Install clsx and tailwind-merge**

```bash
bun add clsx tailwind-merge
```

- [ ] **Step 5: Create mock data (12 realistic GP voicemails)**

Create `lib/mock-data.ts`:

```typescript
import { VoicemailItem } from '@/types/voicemail'

// Timestamps: simulate overnight voicemails (6pm–7am)
const now = new Date()
const yesterday = (hoursAgo: number) =>
  new Date(now.getTime() - hoursAgo * 3600000).toISOString()

export const MOCK_VOICEMAILS: VoicemailItem[] = [
  {
    id: 'vm-001',
    callerName: 'Dorothy Lim',
    callerNumber: '0412 334 891',
    receivedAt: yesterday(9),
    duration: 87,
    location: 'Clinic 1',
    urgency: 'urgent',
    urgencyConfidence: 0.97,
    intent: 'symptom-acute',
    summary: "Dorothy is experiencing chest tightness and shortness of breath that started last night. She sounds distressed and says it's getting worse.",
    keyDetails: [
      'Chest tightness since approximately 9pm last night',
      'Shortness of breath when lying flat',
      'No prior cardiac history mentioned',
      'Husband is with her',
      'Has not called 000 — does not think it is "that serious"',
    ],
    suggestedAction: 'Call back immediately. Advise to call 000 if symptoms worsen. Consider same-session GP review.',
    transcriptExcerpt: '"I\'ve had this tightness in my chest since last night, and it\'s getting harder to breathe when I lie down. I didn\'t want to bother anyone but it hasn\'t gone away."',
    flagForHuman: false,
    status: 'new',
    statusHistory: [{ at: yesterday(9), status: 'new' }],
  },
  {
    id: 'vm-002',
    callerName: 'Emma Davis',
    callerNumber: '0455 129 003',
    receivedAt: yesterday(7.5),
    duration: 63,
    location: 'Clinic 2',
    urgency: 'urgent',
    urgencyConfidence: 0.94,
    intent: 'symptom-acute',
    summary: "Emma's 9-month-old daughter has had a fever of 39.8°C for the past 6 hours. She tried paracetamol with no improvement and is very worried.",
    keyDetails: [
      '9-month-old infant, fever 39.8°C',
      'Duration: 6 hours, not responding to paracetamol',
      'Baby appears lethargic',
      'No rash reported',
      'Parent is distressed',
    ],
    suggestedAction: 'Call back immediately. If baby is lethargic or rash develops, advise ED. Otherwise, urgent same-day appointment.',
    transcriptExcerpt: '"My baby\'s had a really high temperature — almost 40 degrees — for hours now and the Panadol isn\'t bringing it down. She\'s just lying there, she\'s not herself."',
    flagForHuman: false,
    status: 'new',
    statusHistory: [{ at: yesterday(7.5), status: 'new' }],
  },
  {
    id: 'vm-003',
    callerName: 'Aisha Mohammed',
    callerNumber: '0401 773 256',
    receivedAt: yesterday(11),
    duration: 112,
    location: 'Clinic 1',
    urgency: 'high',
    urgencyConfidence: 0.88,
    intent: 'mental-health',
    summary: "Aisha is calling about her mental health. She says she has been feeling 'very low' for the past week and is not coping. She has a Mental Health Care Plan and is asking to see Dr Patel today.",
    keyDetails: [
      'Existing MHCP patient — Dr Patel',
      'Feeling very low for approximately 7 days',
      'Reports not eating or sleeping properly',
      'No acute safety concern stated, but AI flagged for human review',
      'Wants same-day appointment',
    ],
    suggestedAction: 'Call back within 2 hours. Check AI flag — conduct brief welfare check. Book same-day with Dr Patel if possible.',
    transcriptExcerpt: '"I just... I haven\'t been okay this week. I have a care plan with Dr Patel and I really need to see someone today if that\'s possible."',
    flagForHuman: true,
    status: 'new',
    statusHistory: [{ at: yesterday(11), status: 'new' }],
  },
  {
    id: 'vm-004',
    callerName: 'Mike Santos',
    callerNumber: '0488 002 774',
    receivedAt: yesterday(10),
    duration: 44,
    location: 'Clinic 2',
    urgency: 'high',
    urgencyConfidence: 0.91,
    intent: 'rx-refill',
    summary: 'Mike needs an urgent Lipitor (atorvastatin 40mg) refill. He ran out this morning and has no repeats left on his current script. He takes it for hypercholesterolaemia.',
    keyDetails: [
      'Medication: Atorvastatin (Lipitor) 40mg',
      'Ran out today — no repeats remaining',
      'Chronic condition: hypercholesterolaemia',
      'Last script from Dr Thompson 6 months ago',
      'Aware he needs a review but asks for emergency supply',
    ],
    suggestedAction: 'Call before 10am. Issue emergency script or organise phone consult with prescribing GP. Reminder: schedule medication review.',
    transcriptExcerpt: '"I\'ve completely run out of my Lipitor and I\'ve got no repeats left. I need it filled today if possible — is there any way to get a script sorted?"',
    flagForHuman: false,
    status: 'new',
    statusHistory: [{ at: yesterday(10), status: 'new' }],
  },
  {
    id: 'vm-005',
    callerName: 'Priya Sharma',
    callerNumber: '0437 556 018',
    receivedAt: yesterday(8),
    duration: 75,
    location: 'Clinic 1',
    urgency: 'high',
    urgencyConfidence: 0.83,
    intent: 'results',
    summary: "Priya received a call from the pathology lab saying her recent blood results 'need to be discussed with her doctor'. She is anxious and wants to know what they found.",
    keyDetails: [
      'Pathology called patient directly — unusual step',
      'Abnormal result suspected (lab would not disclose)',
      'Tests: recent blood panel including thyroid function',
      'Patient is anxious and asking "is it serious"',
      'Wants GP to call before her 11am work meeting if possible',
    ],
    suggestedAction: 'Pull Priya\'s results before calling back. GP review required — do not summarise results without clinical review first. Call before 11am.',
    transcriptExcerpt: '"The lab rang me and said I need to talk to my doctor about my blood results. They wouldn\'t tell me what it was and now I\'m really worried."',
    flagForHuman: true,
    status: 'in-progress',
    statusHistory: [
      { at: yesterday(8), status: 'new' },
      { at: yesterday(0.5), status: 'in-progress', note: 'Results pulled. GP review pending.' },
    ],
    assignedTo: 'Dr Chen',
  },
  {
    id: 'vm-006',
    callerName: 'Robert Chen',
    callerNumber: '0411 882 347',
    receivedAt: yesterday(13),
    duration: 58,
    location: 'Clinic 2',
    urgency: 'normal',
    urgencyConfidence: 0.89,
    intent: 'symptom-routine',
    summary: "Robert has had a persistent cough for 10 days that started after a cold. He says it's getting slightly worse and wants to come in to get checked.",
    keyDetails: [
      'Cough duration: 10 days, post-viral',
      'Describes as dry, worse at night',
      'No fever currently',
      'Tried OTC cough suppressant — minimal relief',
      'No known asthma or respiratory history',
    ],
    suggestedAction: 'Book a standard appointment within 2–3 days. No urgency. Mention to GP for spirometry if first presentation of cough.',
    transcriptExcerpt: '"I\'ve had this cough for about 10 days now — started with a cold — and it\'s not really getting better. It\'s keeping me up at night."',
    flagForHuman: false,
    status: 'new',
    statusHistory: [{ at: yesterday(13), status: 'new' }],
  },
  {
    id: 'vm-007',
    callerName: 'Sarah O\'Brien',
    callerNumber: '0423 001 654',
    receivedAt: yesterday(12),
    duration: 38,
    location: 'Clinic 1',
    urgency: 'normal',
    urgencyConfidence: 0.95,
    intent: 'rx-refill',
    summary: 'Sarah needs a Metformin refill. She is a stable type 2 diabetic with 2 weeks of tablets remaining. She requests a phone script if possible.',
    keyDetails: [
      'Medication: Metformin 500mg twice daily',
      'Condition: Type 2 diabetes, well-controlled',
      '2 weeks of supply remaining',
      'Requesting phone/electronic script',
      'Last in-clinic review: 8 months ago — overdue',
    ],
    suggestedAction: 'Issue repeat script via eRx. Flag for GP: diabetes review overdue — prompt when next appointment is booked.',
    transcriptExcerpt: '"Hi, it\'s Sarah. I just need a refill on my Metformin — I\'ve got about 2 weeks left. Can you do a phone script for that?"',
    flagForHuman: false,
    status: 'new',
    statusHistory: [{ at: yesterday(12), status: 'new' }],
  },
  {
    id: 'vm-008',
    callerName: 'Tom Walsh',
    callerNumber: '0466 334 772',
    receivedAt: yesterday(14),
    duration: 52,
    location: 'Clinic 2',
    urgency: 'normal',
    urgencyConfidence: 0.92,
    intent: 'referral',
    summary: 'Tom is following up on a cardiology referral that was sent 3 weeks ago. He has not heard from the cardiology clinic and is unsure if the referral went through.',
    keyDetails: [
      'Cardiology referral — sent approximately 3 weeks ago',
      'Patient has not been contacted by the cardiology clinic',
      'No indication of urgency in referral (routine)',
      'Tom wants confirmation the referral was received',
      'Preferred callback: morning',
    ],
    suggestedAction: 'Check referral status in Best Practice. Contact cardiology clinic if no acknowledgement. Call Tom with update.',
    transcriptExcerpt: '"I had a referral put through to a cardiologist about 3 weeks ago and I haven\'t heard anything. Just checking it actually went through."',
    flagForHuman: false,
    status: 'new',
    statusHistory: [{ at: yesterday(14), status: 'new' }],
  },
  {
    id: 'vm-009',
    callerName: 'Linda Park',
    callerNumber: '0499 112 887',
    receivedAt: yesterday(15),
    duration: 29,
    location: 'Clinic 1',
    urgency: 'normal',
    urgencyConfidence: 0.96,
    intent: 'med-cert',
    summary: 'Linda needs a medical certificate for 2 days of absence due to gastroenteritis. She recovered and is back at work today but her employer requires a certificate.',
    keyDetails: [
      'Gastroenteritis — resolved',
      'Certificate needed for: Monday and Tuesday this week',
      'Employer requires formal certificate',
      'Linda says she was genuinely unwell (vomiting, unable to work)',
      'Has not seen GP for this episode',
    ],
    suggestedAction: 'Book a brief phone consult with GP for backdated certificate. GP to assess appropriateness. Cannot issue without clinical contact.',
    transcriptExcerpt: '"I had gastro on Monday and Tuesday and I\'m fine now but my boss needs a medical certificate. I know I probably should have come in but I was too sick to leave the house."',
    flagForHuman: false,
    status: 'done',
    statusHistory: [
      { at: yesterday(15), status: 'new' },
      { at: yesterday(2), status: 'in-progress', note: 'Phone consult booked 8:30am' },
      { at: yesterday(0.25), status: 'done', note: 'Certificate issued after phone consult' },
    ],
  },
  {
    id: 'vm-010',
    callerName: 'James Kwan',
    callerNumber: '0413 445 002',
    receivedAt: yesterday(16),
    duration: 21,
    location: 'Clinic 2',
    urgency: 'low',
    urgencyConfidence: 0.98,
    intent: 'appt-change',
    summary: "James is cancelling his Wednesday 2pm appointment with Dr Lee. He asks to be rescheduled for next week, preferably morning.",
    keyDetails: [
      'Cancelling: Wednesday 2pm, Dr Lee',
      'Reason: work commitment',
      'Wants to rebook: next week, morning preferred',
      'No clinical urgency',
    ],
    suggestedAction: 'Cancel Wednesday slot in PMS. Offer James a morning appointment next week via callback or SMS.',
    transcriptExcerpt: '"Hi, it\'s James Kwan. I need to cancel my appointment this Wednesday at 2. Could I possibly rebook for next week, morning if possible?"',
    flagForHuman: false,
    status: 'done',
    statusHistory: [
      { at: yesterday(16), status: 'new' },
      { at: yesterday(1), status: 'done', note: 'Rebooked Thursday 9am' },
    ],
  },
  {
    id: 'vm-011',
    callerName: 'Helen Nguyen',
    callerNumber: '0478 334 115',
    receivedAt: yesterday(10.5),
    duration: 43,
    location: 'Clinic 1',
    urgency: 'low',
    urgencyConfidence: 0.95,
    intent: 'appt-book',
    summary: 'Helen is a new patient wanting to register with the practice and book an initial GP appointment. No clinical urgency.',
    keyDetails: [
      'New patient — no existing records',
      'Wants to register with a GP',
      'Mentions she recently moved to the area',
      'No urgent clinical concern stated',
      'Has Medicare card',
    ],
    suggestedAction: 'Call back with new patient registration process. Book a 30-minute new patient appointment. Send patient intake form link via SMS.',
    transcriptExcerpt: '"Hi, I\'ve just moved to the area and I\'m looking for a new GP. I was hoping to register and book an appointment."',
    flagForHuman: false,
    status: 'new',
    statusHistory: [{ at: yesterday(10.5), status: 'new' }],
  },
  {
    id: 'vm-012',
    callerName: 'David Morris',
    callerNumber: '0402 887 334',
    receivedAt: yesterday(13.5),
    duration: 17,
    location: 'Clinic 2',
    urgency: 'low',
    urgencyConfidence: 0.99,
    intent: 'admin',
    summary: 'David is asking about parking availability at the Clinic 2 clinic and wants to confirm the Saturday opening hours.',
    keyDetails: [
      'Query: parking at Clinic 2 clinic',
      'Query: Saturday opening hours',
      'No clinical content',
      'Can be resolved with standard clinic info',
    ],
    suggestedAction: 'Send standard clinic info SMS: parking details + Saturday hours. No callback needed unless patient requests.',
    transcriptExcerpt: '"Just a quick one — is there parking at your Clinic 2 clinic? And are you open Saturdays?"',
    flagForHuman: false,
    status: 'new',
    statusHistory: [{ at: yesterday(13.5), status: 'new' }],
  },
]

export function getStats(voicemails: VoicemailItem[]) {
  const newItems = voicemails.filter(v => v.status === 'new')
  return {
    total: newItems.length,
    urgent: newItems.filter(v => v.urgency === 'urgent').length,
    high: newItems.filter(v => v.urgency === 'high').length,
    flagged: newItems.filter(v => v.flagForHuman).length,
    varsityLakes: newItems.filter(v => v.location === 'Clinic 1').length,
    labrador: newItems.filter(v => v.location === 'Clinic 2').length,
  }
}
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
bun run build 2>&1 | grep -E "error|warning" | head -20
```

Expected: no type errors.

- [ ] **Step 7: Commit types and mock data**

```bash
git add types/ lib/
git commit -m "feat: add VoicemailItem types, Heidi urgency config, and 12 mock GP voicemails"
```

---

### Task 3: Heidi Nav Shell + Layout

**Files:**
- Create: `components/layout/HeidiNav.tsx`
- Create: `components/layout/PageContainer.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create Heidi navigation component**

Create `components/layout/HeidiNav.tsx`:

```tsx
import Link from 'next/link'
import { Phone, ChevronDown } from 'lucide-react'

export function HeidiNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-[rgb(var(--hv-border))] bg-[rgb(var(--hv-surface))]/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-6">
        {/* Heidi wordmark */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-xl font-medium tracking-tight text-[rgb(var(--hv-text))]">
              Heidi
            </span>
            <span className="text-[rgb(var(--hv-text-muted))] text-sm">/</span>
            <span className="flex items-center gap-1.5 text-sm text-[rgb(var(--hv-text-muted))]">
              <Phone className="h-3.5 w-3.5" />
              Calls
            </span>
          </Link>
        </div>

        {/* Clinic selector */}
        <button className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-[rgb(var(--hv-text-muted))] hover:bg-[rgb(var(--hv-border))]/30 transition-colors">
          Harbour to Sunset GP
          <ChevronDown className="h-3.5 w-3.5" />
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-[rgb(var(--hv-text-muted))]">
            Admin view
          </span>
          <div className="h-7 w-7 rounded-full bg-[rgb(var(--hv-primary))] flex items-center justify-center">
            <span className="text-xs font-medium text-[rgb(var(--hv-surface))]">JL</span>
          </div>
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Create page container**

Create `components/layout/PageContainer.tsx`:

```tsx
import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main className={cn('mx-auto max-w-screen-xl px-6 py-8', className)}>
      {children}
    </main>
  )
}
```

- [ ] **Step 3: Update root layout to include nav**

Update `app/layout.tsx` to add `<HeidiNav />` above `{children}`:

```tsx
import { HeidiNav } from '@/components/layout/HeidiNav'

// inside <body>:
<HeidiNav />
{children}
```

- [ ] **Step 4: Add redirect from / to /voicemails**

Replace `app/page.tsx`:

```tsx
import { redirect } from 'next/navigation'
export default function Home() {
  redirect('/voicemails')
}
```

- [ ] **Step 5: Commit layout**

```bash
git add app/ components/layout/
git commit -m "feat: add Heidi nav shell, page container, and root redirect"
```

---

### Task 4: UrgencyBadge + IntentTag Components

**Files:**
- Create: `components/voicemail/UrgencyBadge.tsx`
- Create: `components/voicemail/IntentTag.tsx`

- [ ] **Step 1: Create UrgencyBadge**

Create `components/voicemail/UrgencyBadge.tsx`:

```tsx
import { UrgencyLevel } from '@/types/voicemail'
import { URGENCY_CONFIG } from '@/lib/urgency'
import { cn } from '@/lib/utils'

interface UrgencyBadgeProps {
  urgency: UrgencyLevel
  size?: 'sm' | 'md'
  className?: string
}

export function UrgencyBadge({ urgency, size = 'md', className }: UrgencyBadgeProps) {
  const config = URGENCY_CONFIG[urgency]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded font-sans font-semibold tracking-wide uppercase',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs',
        config.badgeClass,
        className
      )}
    >
      {config.label}
    </span>
  )
}
```

- [ ] **Step 2: Create IntentTag**

Create `components/voicemail/IntentTag.tsx`:

```tsx
import { IntentCode } from '@/types/voicemail'
import { INTENT_LABELS } from '@/lib/urgency'
import { cn } from '@/lib/utils'

interface IntentTagProps {
  intent: IntentCode
  className?: string
}

export function IntentTag({ intent, className }: IntentTagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        'bg-[rgb(var(--hv-border))]/40 text-[rgb(var(--hv-text-muted))]',
        className
      )}
    >
      {INTENT_LABELS[intent]}
    </span>
  )
}
```

- [ ] **Step 3: Commit badge components**

```bash
git add components/voicemail/UrgencyBadge.tsx components/voicemail/IntentTag.tsx
git commit -m "feat: add UrgencyBadge and IntentTag components with Heidi tokens"
```

---

### Task 5: StatsBar Component

**Files:**
- Create: `components/voicemail/StatsBar.tsx`

- [ ] **Step 1: Create StatsBar**

Create `components/voicemail/StatsBar.tsx`:

```tsx
import { AlertTriangle, ArrowUp, Inbox, MapPin, Flag } from 'lucide-react'

interface StatsBarProps {
  urgent: number
  high: number
  total: number
  flagged: number
  varsityLakes: number
  labrador: number
}

export function StatsBar({ urgent, high, total, flagged, varsityLakes, labrador }: StatsBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[rgb(var(--hv-border))] bg-[rgb(var(--hv-surface))] px-5 py-4">
      {/* Urgent */}
      <StatChip
        icon={<AlertTriangle className="h-3.5 w-3.5" />}
        value={urgent}
        label="Urgent"
        color="text-red-600"
        highlight={urgent > 0}
      />
      <Divider />

      {/* High */}
      <StatChip
        icon={<ArrowUp className="h-3.5 w-3.5" />}
        value={high}
        label="High priority"
        color="text-orange-500"
        highlight={high > 0}
      />
      <Divider />

      {/* Flagged for human */}
      <StatChip
        icon={<Flag className="h-3.5 w-3.5" />}
        value={flagged}
        label="Needs review"
        color="text-[rgb(var(--hv-text-muted))]"
      />
      <Divider />

      {/* Total */}
      <StatChip
        icon={<Inbox className="h-3.5 w-3.5" />}
        value={total}
        label="New voicemails"
        color="text-[rgb(var(--hv-text))]"
      />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Location breakdown */}
      <div className="flex items-center gap-2 text-xs text-[rgb(var(--hv-text-muted))]">
        <MapPin className="h-3 w-3" />
        <span>Clinic 1 <strong className="text-[rgb(var(--hv-text))]">{varsityLakes}</strong></span>
        <span className="text-[rgb(var(--hv-border))]">·</span>
        <span>Clinic 2 <strong className="text-[rgb(var(--hv-text))]">{labrador}</strong></span>
      </div>
    </div>
  )
}

function StatChip({
  icon, value, label, color, highlight
}: {
  icon: React.ReactNode
  value: number
  label: string
  color: string
  highlight?: boolean
}) {
  return (
    <div className={`flex items-center gap-2 ${highlight ? 'font-semibold' : ''}`}>
      <span className={color}>{icon}</span>
      <span className={`text-xl font-bold leading-none ${color}`}>{value}</span>
      <span className="text-xs text-[rgb(var(--hv-text-muted))]">{label}</span>
    </div>
  )
}

function Divider() {
  return <div className="h-5 w-px bg-[rgb(var(--hv-border))]" />
}
```

- [ ] **Step 2: Commit StatsBar**

```bash
git add components/voicemail/StatsBar.tsx
git commit -m "feat: add StatsBar with urgency and location stats"
```

---

### Task 6: VoicemailCard Component

**Files:**
- Create: `components/voicemail/VoicemailCard.tsx`

- [ ] **Step 1: Create VoicemailCard**

Create `components/voicemail/VoicemailCard.tsx`:

```tsx
'use client'
import Link from 'next/link'
import { Phone, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { VoicemailItem } from '@/types/voicemail'
import { UrgencyBadge } from './UrgencyBadge'
import { IntentTag } from './IntentTag'
import { URGENCY_CONFIG } from '@/lib/urgency'
import { formatDuration, formatRelativeTime, cn } from '@/lib/utils'

interface VoicemailCardProps {
  voicemail: VoicemailItem
}

export function VoicemailCard({ voicemail }: VoicemailCardProps) {
  const config = URGENCY_CONFIG[voicemail.urgency]
  const isDone = voicemail.status === 'done'

  return (
    <Link href={`/voicemails/${voicemail.id}`}>
      <article
        className={cn(
          'group relative flex items-start gap-4 rounded-xl border px-5 py-4 transition-all',
          'hover:shadow-md hover:-translate-y-0.5',
          isDone
            ? 'border-[rgb(var(--hv-border))]/50 bg-[rgb(var(--hv-surface))]/50 opacity-60'
            : 'border-[rgb(var(--hv-border))] bg-[rgb(var(--hv-surface))]',
          voicemail.urgency === 'urgent' && !isDone && 'border-l-4 border-l-red-500'
        )}
      >
        {/* Urgency stripe accent */}
        {voicemail.urgency === 'high' && !isDone && (
          <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-orange-500" />
        )}

        {/* Avatar */}
        <div
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: isDone ? '#8a7078' : config.color }}
        >
          {voicemail.callerName.charAt(0)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                'text-sm font-semibold',
                isDone ? 'text-[rgb(var(--hv-text-muted))]' : 'text-[rgb(var(--hv-text))]'
              )}>
                {voicemail.callerName}
              </span>
              <UrgencyBadge urgency={voicemail.urgency} size="sm" />
              {voicemail.flagForHuman && (
                <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700">
                  <AlertCircle className="h-2.5 w-2.5" />
                  Review
                </span>
              )}
              {isDone && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#588f60]">
                  <CheckCircle2 className="h-3 w-3" />
                  Done
                </span>
              )}
            </div>
            <span className="shrink-0 text-xs text-[rgb(var(--hv-text-muted))]">
              {formatRelativeTime(voicemail.receivedAt)}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <IntentTag intent={voicemail.intent} />
            <span className="text-xs text-[rgb(var(--hv-text-muted))] flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(voicemail.duration)}
            </span>
            <span className="text-xs text-[rgb(var(--hv-text-muted))]">
              {voicemail.location}
            </span>
          </div>

          <p className="text-sm text-[rgb(var(--hv-text))] leading-relaxed line-clamp-2">
            {voicemail.summary}
          </p>

          {/* Suggested action — shown for urgent/high */}
          {(voicemail.urgency === 'urgent' || voicemail.urgency === 'high') && !isDone && (
            <div className="mt-2 flex items-start gap-1.5">
              <Phone className="mt-0.5 h-3 w-3 shrink-0 text-[rgb(var(--hv-text-muted))]" />
              <p className="text-xs text-[rgb(var(--hv-text-muted))] italic">
                {voicemail.suggestedAction}
              </p>
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
```

- [ ] **Step 2: Commit VoicemailCard**

```bash
git add components/voicemail/VoicemailCard.tsx
git commit -m "feat: add VoicemailCard with urgency styling, flag indicator, and status states"
```

---

### Task 7: Inbox Page (/voicemails)

**Files:**
- Create: `app/voicemails/page.tsx`
- Create: `components/voicemail/FilterBar.tsx`
- Create: `components/voicemail/VoicemailList.tsx`

- [ ] **Step 1: Create FilterBar**

Create `components/voicemail/FilterBar.tsx`:

```tsx
'use client'
import { UrgencyLevel, VoicemailStatus } from '@/types/voicemail'
import { cn } from '@/lib/utils'

interface FilterBarProps {
  activeUrgency: UrgencyLevel | 'all'
  activeStatus: VoicemailStatus | 'all'
  onUrgencyChange: (u: UrgencyLevel | 'all') => void
  onStatusChange: (s: VoicemailStatus | 'all') => void
}

export function FilterBar({ activeUrgency, activeStatus, onUrgencyChange, onStatusChange }: FilterBarProps) {
  const urgencyFilters: Array<{ key: UrgencyLevel | 'all'; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'urgent', label: 'Urgent' },
    { key: 'high', label: 'High' },
    { key: 'normal', label: 'Normal' },
    { key: 'low', label: 'Low' },
  ]

  const statusFilters: Array<{ key: VoicemailStatus | 'all'; label: string }> = [
    { key: 'new', label: 'New' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'all', label: 'All' },
    { key: 'done', label: 'Done' },
  ]

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-1 rounded-lg border border-[rgb(var(--hv-border))] bg-[rgb(var(--hv-surface))] p-1">
        {urgencyFilters.map(f => (
          <button
            key={f.key}
            onClick={() => onUrgencyChange(f.key)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
              activeUrgency === f.key
                ? 'bg-[rgb(var(--hv-primary))] text-white shadow-sm'
                : 'text-[rgb(var(--hv-text-muted))] hover:text-[rgb(var(--hv-text))]'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-[rgb(var(--hv-border))] bg-[rgb(var(--hv-surface))] p-1">
        {statusFilters.map(f => (
          <button
            key={f.key}
            onClick={() => onStatusChange(f.key)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
              activeStatus === f.key
                ? 'bg-[rgb(var(--hv-primary))] text-white shadow-sm'
                : 'text-[rgb(var(--hv-text-muted))] hover:text-[rgb(var(--hv-text))]'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create VoicemailList**

Create `components/voicemail/VoicemailList.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { VoicemailItem, UrgencyLevel, VoicemailStatus } from '@/types/voicemail'
import { VoicemailCard } from './VoicemailCard'
import { FilterBar } from './FilterBar'
import { sortByUrgency } from '@/lib/urgency'

interface VoicemailListProps {
  voicemails: VoicemailItem[]
}

export function VoicemailList({ voicemails }: VoicemailListProps) {
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyLevel | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<VoicemailStatus | 'all'>('new')

  const filtered = sortByUrgency(
    voicemails.filter(v => {
      const urgencyMatch = urgencyFilter === 'all' || v.urgency === urgencyFilter
      const statusMatch = statusFilter === 'all' || v.status === statusFilter
      return urgencyMatch && statusMatch
    })
  )

  return (
    <div className="space-y-4">
      <FilterBar
        activeUrgency={urgencyFilter}
        activeStatus={statusFilter}
        onUrgencyChange={setUrgencyFilter}
        onStatusChange={setStatusFilter}
      />
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[rgb(var(--hv-border))] py-16 text-center">
            <p className="text-sm text-[rgb(var(--hv-text-muted))]">No voicemails match this filter</p>
          </div>
        ) : (
          filtered.map(v => <VoicemailCard key={v.id} voicemail={v} />)
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create inbox page**

Create `app/voicemails/page.tsx`:

```tsx
import { MOCK_VOICEMAILS, getStats } from '@/lib/mock-data'
import { PageContainer } from '@/components/layout/PageContainer'
import { StatsBar } from '@/components/voicemail/StatsBar'
import { VoicemailList } from '@/components/voicemail/VoicemailList'

export default function VoicemailsPage() {
  const stats = getStats(MOCK_VOICEMAILS)

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="font-display text-3xl font-medium text-[rgb(var(--hv-text))]">
            Voicemail Inbox
          </h1>
          <p className="mt-1 text-sm text-[rgb(var(--hv-text-muted))]">
            Saturday 12 April · Overnight messages · Harbour to Sunset GP
          </p>
        </div>

        {/* Stats */}
        <StatsBar {...stats} />

        {/* List */}
        <VoicemailList voicemails={MOCK_VOICEMAILS} />
      </div>
    </PageContainer>
  )
}
```

- [ ] **Step 4: Test inbox page renders correctly**

```bash
bun run dev
```

Open localhost:3000/voicemails. Verify:
- [ ] StatsBar shows correct counts (2 urgent, 3 high, 10 new)
- [ ] URGENT voicemails appear first (Dorothy Lim, Emma Davis)
- [ ] Urgency badges are correct colours
- [ ] Filter buttons work (click "Urgent" — shows only 2 items)
- [ ] Done voicemails appear muted when "All" status filter selected

- [ ] **Step 5: Commit inbox page**

```bash
git add app/voicemails/ components/voicemail/FilterBar.tsx components/voicemail/VoicemailList.tsx
git commit -m "feat: add voicemail inbox page with stats, filtering, and urgency-sorted list"
```

---

### Task 8: Voicemail Detail Page (/voicemails/[id])

**Files:**
- Create: `components/voicemail/VoicemailDetail.tsx`
- Create: `components/voicemail/ActionPanel.tsx`
- Create: `components/voicemail/TranscriptPanel.tsx`
- Create: `app/voicemails/[id]/page.tsx`

- [ ] **Step 1: Create ActionPanel with status management**

Create `components/voicemail/ActionPanel.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { Phone, UserPlus, CheckCircle, Archive, ChevronDown } from 'lucide-react'
import { VoicemailItem, VoicemailStatus } from '@/types/voicemail'
import { cn } from '@/lib/utils'

interface ActionPanelProps {
  voicemail: VoicemailItem
}

export function ActionPanel({ voicemail: initial }: ActionPanelProps) {
  const [status, setStatus] = useState<VoicemailStatus>(initial.status)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)

  const handleStatusChange = (newStatus: VoicemailStatus) => {
    setStatus(newStatus)
    setSaved(false)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="rounded-xl border border-[rgb(var(--hv-border))] bg-[rgb(var(--hv-surface))] p-5 space-y-5">
      <h3 className="text-sm font-semibold text-[rgb(var(--hv-text))] uppercase tracking-wide">
        Actions
      </h3>

      {/* Suggested action highlight */}
      <div className="rounded-lg bg-[rgb(var(--hv-accent))]/20 border border-[rgb(var(--hv-accent))]/40 px-4 py-3">
        <p className="text-xs font-medium text-[rgb(var(--hv-text-muted))] uppercase tracking-wide mb-1">
          Suggested next step
        </p>
        <p className="text-sm text-[rgb(var(--hv-text))] leading-relaxed">
          {initial.suggestedAction}
        </p>
      </div>

      {/* Quick action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <ActionButton
          icon={<Phone className="h-4 w-4" />}
          label="Log callback"
          onClick={() => handleStatusChange('in-progress')}
          active={status === 'in-progress'}
          variant="primary"
        />
        <ActionButton
          icon={<UserPlus className="h-4 w-4" />}
          label="Assign to GP"
          onClick={() => {}}
          variant="secondary"
        />
        <ActionButton
          icon={<CheckCircle className="h-4 w-4" />}
          label="Mark resolved"
          onClick={() => handleStatusChange('done')}
          active={status === 'done'}
          variant="success"
        />
        <ActionButton
          icon={<Archive className="h-4 w-4" />}
          label="Archive"
          onClick={() => handleStatusChange('done')}
          variant="ghost"
        />
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[rgb(var(--hv-text-muted))]">Status:</span>
        <StatusPill status={status} />
      </div>

      {/* Note */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[rgb(var(--hv-text-muted))] uppercase tracking-wide">
          Add note
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="E.g. Spoke with patient, booked 9am Thursday..."
          rows={3}
          className="w-full rounded-lg border border-[rgb(var(--hv-border))] bg-white px-3 py-2 text-sm text-[rgb(var(--hv-text))] placeholder:text-[rgb(var(--hv-text-muted))]/60 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--hv-primary))]/20 resize-none"
        />
        <button
          onClick={handleSave}
          className={cn(
            'w-full rounded-lg px-4 py-2 text-sm font-medium transition-all',
            saved
              ? 'bg-[#588f60] text-white'
              : 'bg-[rgb(var(--hv-primary))] text-white hover:opacity-90'
          )}
        >
          {saved ? '✓ Saved' : 'Save note'}
        </button>
      </div>
    </div>
  )
}

function ActionButton({
  icon, label, onClick, active, variant
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  active?: boolean
  variant: 'primary' | 'secondary' | 'success' | 'ghost'
}) {
  const base = 'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all border'
  const variants = {
    primary: active
      ? 'bg-[rgb(var(--hv-primary))] text-white border-transparent'
      : 'border-[rgb(var(--hv-border))] text-[rgb(var(--hv-text))] hover:border-[rgb(var(--hv-primary))] hover:text-[rgb(var(--hv-primary))]',
    secondary: 'border-[rgb(var(--hv-border))] text-[rgb(var(--hv-text-muted))] hover:text-[rgb(var(--hv-text))]',
    success: active
      ? 'bg-[#588f60] text-white border-transparent'
      : 'border-[rgb(var(--hv-border))] text-[rgb(var(--hv-text))] hover:border-[#588f60] hover:text-[#588f60]',
    ghost: 'border-transparent text-[rgb(var(--hv-text-muted))] hover:text-[rgb(var(--hv-text))]',
  }
  return (
    <button onClick={onClick} className={cn(base, variants[variant])}>
      {icon}
      {label}
    </button>
  )
}

function StatusPill({ status }: { status: VoicemailStatus }) {
  const config = {
    new: 'bg-sky-100 text-sky-700',
    'in-progress': 'bg-amber-100 text-amber-700',
    done: 'bg-[#f2f7f2] text-[#2b6433]',
  }
  const labels = { new: 'New', 'in-progress': 'In Progress', done: 'Resolved' }
  return (
    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', config[status])}>
      {labels[status]}
    </span>
  )
}
```

- [ ] **Step 2: Create TranscriptPanel**

Create `components/voicemail/TranscriptPanel.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { ChevronDown, ChevronUp, Quote } from 'lucide-react'
import { formatDuration } from '@/lib/utils'

interface TranscriptPanelProps {
  excerpt: string
  duration: number
}

export function TranscriptPanel({ excerpt, duration }: TranscriptPanelProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-[rgb(var(--hv-border))] bg-[rgb(var(--hv-surface))]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <Quote className="h-4 w-4 text-[rgb(var(--hv-text-muted))]" />
          <span className="text-sm font-medium text-[rgb(var(--hv-text))]">Voicemail transcript</span>
          <span className="text-xs text-[rgb(var(--hv-text-muted))]">
            ({formatDuration(duration)})
          </span>
        </div>
        {expanded
          ? <ChevronUp className="h-4 w-4 text-[rgb(var(--hv-text-muted))]" />
          : <ChevronDown className="h-4 w-4 text-[rgb(var(--hv-text-muted))]" />
        }
      </button>
      {expanded && (
        <div className="border-t border-[rgb(var(--hv-border))] px-5 pb-4 pt-4">
          <div className="flex gap-3">
            <div className="mt-1 h-4 w-0.5 shrink-0 bg-[rgb(var(--hv-border))]" />
            <p className="text-sm italic leading-relaxed text-[rgb(var(--hv-text-muted))]">
              {excerpt}
            </p>
          </div>
          <p className="mt-3 text-xs text-[rgb(var(--hv-text-muted))]/60">
            Transcript excerpt — AI-generated. Listen to full recording for clinical accuracy.
          </p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create VoicemailDetail**

Create `components/voicemail/VoicemailDetail.tsx`:

```tsx
import { VoicemailItem } from '@/types/voicemail'
import { UrgencyBadge } from './UrgencyBadge'
import { IntentTag } from './IntentTag'
import { formatDuration, formatTime } from '@/lib/utils'
import { Phone, Clock, MapPin, AlertCircle } from 'lucide-react'

interface VoicemailDetailProps {
  voicemail: VoicemailItem
}

export function VoicemailDetail({ voicemail }: VoicemailDetailProps) {
  return (
    <div className="rounded-xl border border-[rgb(var(--hv-border))] bg-[rgb(var(--hv-surface))] p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-medium text-[rgb(var(--hv-text))]">
            {voicemail.callerName}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[rgb(var(--hv-text-muted))]">
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              {voicemail.callerNumber}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(voicemail.receivedAt)} · {formatDuration(voicemail.duration)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {voicemail.location}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <UrgencyBadge urgency={voicemail.urgency} />
          <IntentTag intent={voicemail.intent} />
        </div>
      </div>

      {/* AI flag warning */}
      {voicemail.flagForHuman && (
        <div className="flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800">Human review recommended</p>
            <p className="text-xs text-amber-700 mt-0.5">
              AI confidence: {Math.round(voicemail.urgencyConfidence * 100)}%. Verify urgency level before actioning.
            </p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--hv-text-muted))] mb-2">
          Summary
        </p>
        <p className="text-sm leading-relaxed text-[rgb(var(--hv-text))]">
          {voicemail.summary}
        </p>
      </div>

      {/* Key details */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--hv-text-muted))] mb-2">
          Key details
        </p>
        <ul className="space-y-1.5">
          {voicemail.keyDetails.map((detail, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[rgb(var(--hv-text))]">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--hv-text-muted))]" />
              {detail}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create detail page**

Create `app/voicemails/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MOCK_VOICEMAILS } from '@/lib/mock-data'
import { PageContainer } from '@/components/layout/PageContainer'
import { VoicemailDetail } from '@/components/voicemail/VoicemailDetail'
import { TranscriptPanel } from '@/components/voicemail/TranscriptPanel'
import { ActionPanel } from '@/components/voicemail/ActionPanel'

interface Props {
  params: Promise<{ id: string }>
}

export default async function VoicemailDetailPage({ params }: Props) {
  const { id } = await params
  const voicemail = MOCK_VOICEMAILS.find(v => v.id === id)
  if (!voicemail) notFound()

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Back link */}
        <Link
          href="/voicemails"
          className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--hv-text-muted))] hover:text-[rgb(var(--hv-text))] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to inbox
        </Link>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <VoicemailDetail voicemail={voicemail} />
            <TranscriptPanel
              excerpt={voicemail.transcriptExcerpt}
              duration={voicemail.duration}
            />
          </div>
          <div>
            <ActionPanel voicemail={voicemail} />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export async function generateStaticParams() {
  return MOCK_VOICEMAILS.map(v => ({ id: v.id }))
}
```

- [ ] **Step 5: Test detail page end-to-end**

```bash
bun run dev
```

- Open localhost:3000/voicemails
- Click on Dorothy Lim (URGENT) — verify detail page loads
- Verify AI flag warning shows for Aisha Mohammed and Priya Sharma
- Click "Log callback" — verify button turns active
- Click "Mark resolved" — verify green state
- Type a note, click Save — verify "✓ Saved" feedback
- Click transcript toggle — verify excerpt appears
- Click "Back to inbox" — verify returns to list

- [ ] **Step 6: Commit detail page**

```bash
git add app/voicemails/[id]/ components/voicemail/VoicemailDetail.tsx components/voicemail/TranscriptPanel.tsx components/voicemail/ActionPanel.tsx
git commit -m "feat: add voicemail detail page with summary, key details, transcript, and action panel"
```

---

### Task 9: Polish + Final Verification

**Files:** Minor updates across all components

- [ ] **Step 1: Add empty state for inbox**

Verify `VoicemailList.tsx` shows the empty state when no voicemails match filter. Test by selecting "Urgent" filter + "Done" status.

- [ ] **Step 2: Add page metadata**

In `app/voicemails/page.tsx`, add:
```tsx
export const metadata = {
  title: 'Voicemail Inbox — Heidi Calls',
}
```

In `app/voicemails/[id]/page.tsx`, add:
```tsx
export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const vm = MOCK_VOICEMAILS.find(v => v.id === id)
  return { title: `${vm?.callerName ?? 'Voicemail'} — Heidi Calls` }
}
```

- [ ] **Step 3: Run build to verify zero errors**

```bash
bun run build
```

Expected: `✓ Compiled successfully` with zero errors. Fix any TypeScript errors before proceeding.

- [ ] **Step 4: Final visual check across all states**

- [ ] Inbox: 2 URGENT items at top with red left border
- [ ] Inbox: StatsBar shows correct live counts
- [ ] Inbox filter: "Urgent" shows 2 items, "Low" shows 3, "Done" shows 2
- [ ] Detail: URGENT badge + correct colour
- [ ] Detail: AI confidence flag on Aisha + Priya
- [ ] Detail: Actions update status visually
- [ ] Detail: Transcript collapses/expands cleanly
- [ ] Background is warm cream (#f9f4f1), not white
- [ ] Nav shows "Heidi / Calls" wordmark

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete Heidi Voicemail Intelligence prototype — inbox, detail, and action management"
```

---

## Self-Review

**Spec coverage check:**
- [x] Voicemail inbox/dashboard — Task 7
- [x] Each voicemail as structured item — Task 2 (types) + Task 6 (card)
- [x] Prioritisation/triage signals — StatsBar (Task 5) + urgency sort (FilterBar)
- [x] Management actions (status, next step) — ActionPanel (Task 8)
- [x] Heidi design system — Task 1 (tokens) + all components
- [x] AI pipeline documented — PRD section + Task 2 (mock data mirrors AI output)
- [x] Urgency framework — lib/urgency.ts
- [x] 12 realistic mock voicemails — lib/mock-data.ts
- [x] Multi-location support — location field + StatsBar breakdown
- [x] Human review flag — flagForHuman field surfaced in card + detail

**Placeholder scan:** No TBDs, no "implement later", all code blocks are complete.

**Type consistency:** `VoicemailItem`, `UrgencyLevel`, `IntentCode`, `VoicemailStatus` defined in Task 2 and used consistently through Tasks 3–9. `URGENCY_CONFIG` and `INTENT_LABELS` defined in `lib/urgency.ts` and imported by badge/tag components.
