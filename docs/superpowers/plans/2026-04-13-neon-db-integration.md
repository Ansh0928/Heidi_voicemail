# Neon DB Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace MOCK_VOICEMAILS with real data fetched from Neon Postgres, seeded with the 12 existing mocks.

**Architecture:** Use `@neondatabase/serverless` HTTP driver — no WebSocket config needed. `lib/db.ts` exports a `sql` tagged-template fn. `lib/voicemail-queries.ts` owns all SQL + table creation. `scripts/seed.ts` creates schema and inserts mocks. `app/voicemails/page.tsx` becomes an async server component.

**Tech Stack:** Next.js 15 App Router, @neondatabase/serverless, TypeScript, Bun

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `.env.local` | Create | DATABASE_URL secret |
| `lib/db.ts` | Create | Neon `sql` connection export |
| `lib/voicemail-queries.ts` | Create | `createSchema()` + `getVoicemails(clinic?)` |
| `scripts/seed.ts` | Create | Create tables + insert 12 mocks |
| `app/voicemails/page.tsx` | Modify | Async server component, call `getVoicemails` |

---

### Task 1: Install dependency + set env var

**Files:**
- Modify: `package.json` (via bun install)
- Create: `.env.local`

- [ ] **Step 1: Install Neon serverless driver**

```bash
cd /Users/tasmanstar/Desktop/heidi-voicemail
bun add @neondatabase/serverless
```

Expected output: `bun add v1.x ... + @neondatabase/serverless`

- [ ] **Step 2: Add DATABASE_URL to .env.local**

Create `.env.local` with:
```
DATABASE_URL=postgresql://neondb_owner:npg_4gBOQjhGM8Ss@ep-frosty-hall-amge01l6-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

- [ ] **Step 3: Verify .env.local is gitignored**

```bash
grep ".env.local" /Users/tasmanstar/Desktop/heidi-voicemail/.gitignore
```

Expected: `.env.local` appears in output. If not, add it.

- [ ] **Step 4: Commit**

```bash
cd /Users/tasmanstar/Desktop/heidi-voicemail
git add package.json bun.lockb
git commit -m "feat: add @neondatabase/serverless"
```

---

### Task 2: Create DB connection module

**Files:**
- Create: `lib/db.ts`

- [ ] **Step 1: Write lib/db.ts**

```typescript
import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

export const sql = neon(process.env.DATABASE_URL)
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/tasmanstar/Desktop/heidi-voicemail
bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/db.ts
git commit -m "feat: add Neon DB connection module"
```

---

### Task 3: Create schema + query module

**Files:**
- Create: `lib/voicemail-queries.ts`

- [ ] **Step 1: Write lib/voicemail-queries.ts**

```typescript
import { sql } from './db'
import type { VoicemailItem, VoicemailStatus, UrgencyLevel, IntentCode, Location } from '@/types/voicemail'

export async function createSchema(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS voicemails (
      id TEXT PRIMARY KEY,
      caller_name TEXT NOT NULL,
      caller_number TEXT NOT NULL,
      received_at TIMESTAMPTZ NOT NULL,
      duration INTEGER NOT NULL,
      location TEXT NOT NULL,
      urgency TEXT NOT NULL,
      urgency_confidence REAL NOT NULL,
      intent TEXT NOT NULL,
      summary TEXT NOT NULL,
      key_details TEXT[] NOT NULL,
      suggested_action TEXT NOT NULL,
      transcript_excerpt TEXT NOT NULL,
      flag_for_human BOOLEAN NOT NULL DEFAULT false,
      status TEXT NOT NULL DEFAULT 'new',
      assigned_to TEXT
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS status_events (
      id SERIAL PRIMARY KEY,
      voicemail_id TEXT NOT NULL REFERENCES voicemails(id) ON DELETE CASCADE,
      status TEXT NOT NULL,
      changed_at TIMESTAMPTZ NOT NULL,
      changed_by TEXT NOT NULL,
      note TEXT
    )
  `
}

export async function getVoicemails(clinic?: string): Promise<VoicemailItem[]> {
  const rows = clinic && clinic !== 'all'
    ? await sql`
        SELECT v.*, COALESCE(
          json_agg(
            json_build_object(
              'status', se.status,
              'changedAt', se.changed_at,
              'changedBy', se.changed_by,
              'note', se.note
            ) ORDER BY se.changed_at
          ) FILTER (WHERE se.id IS NOT NULL),
          '[]'
        ) AS status_history
        FROM voicemails v
        LEFT JOIN status_events se ON se.voicemail_id = v.id
        WHERE v.location = ${clinic}
        GROUP BY v.id
        ORDER BY
          CASE v.urgency WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'normal' THEN 3 ELSE 4 END,
          v.received_at DESC
      `
    : await sql`
        SELECT v.*, COALESCE(
          json_agg(
            json_build_object(
              'status', se.status,
              'changedAt', se.changed_at,
              'changedBy', se.changed_by,
              'note', se.note
            ) ORDER BY se.changed_at
          ) FILTER (WHERE se.id IS NOT NULL),
          '[]'
        ) AS status_history
        FROM voicemails v
        LEFT JOIN status_events se ON se.voicemail_id = v.id
        GROUP BY v.id
        ORDER BY
          CASE v.urgency WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'normal' THEN 3 ELSE 4 END,
          v.received_at DESC
      `

  return rows.map(row => ({
    id: row.id as string,
    callerName: row.caller_name as string,
    callerNumber: row.caller_number as string,
    receivedAt: (row.received_at as Date).toISOString(),
    duration: row.duration as number,
    location: row.location as Location,
    urgency: row.urgency as UrgencyLevel,
    urgencyConfidence: row.urgency_confidence as number,
    intent: row.intent as IntentCode,
    summary: row.summary as string,
    keyDetails: row.key_details as string[],
    suggestedAction: row.suggested_action as string,
    transcriptExcerpt: row.transcript_excerpt as string,
    flagForHuman: row.flag_for_human as boolean,
    status: row.status as VoicemailStatus,
    statusHistory: row.status_history as VoicemailItem['statusHistory'],
    assignedTo: row.assigned_to as string | undefined,
  }))
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/tasmanstar/Desktop/heidi-voicemail
bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/voicemail-queries.ts
git commit -m "feat: add voicemail DB schema and query fn"
```

---

### Task 4: Write seed script

**Files:**
- Create: `scripts/seed.ts`

- [ ] **Step 1: Write scripts/seed.ts**

```typescript
import { neon } from '@neondatabase/serverless'
import { MOCK_VOICEMAILS } from '../lib/mock-data'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) throw new Error('DATABASE_URL not set')

const sql = neon(DATABASE_URL)

async function seed() {
  console.log('Creating schema...')

  await sql`
    CREATE TABLE IF NOT EXISTS voicemails (
      id TEXT PRIMARY KEY,
      caller_name TEXT NOT NULL,
      caller_number TEXT NOT NULL,
      received_at TIMESTAMPTZ NOT NULL,
      duration INTEGER NOT NULL,
      location TEXT NOT NULL,
      urgency TEXT NOT NULL,
      urgency_confidence REAL NOT NULL,
      intent TEXT NOT NULL,
      summary TEXT NOT NULL,
      key_details TEXT[] NOT NULL,
      suggested_action TEXT NOT NULL,
      transcript_excerpt TEXT NOT NULL,
      flag_for_human BOOLEAN NOT NULL DEFAULT false,
      status TEXT NOT NULL DEFAULT 'new',
      assigned_to TEXT
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS status_events (
      id SERIAL PRIMARY KEY,
      voicemail_id TEXT NOT NULL REFERENCES voicemails(id) ON DELETE CASCADE,
      status TEXT NOT NULL,
      changed_at TIMESTAMPTZ NOT NULL,
      changed_by TEXT NOT NULL,
      note TEXT
    )
  `

  console.log('Clearing existing data...')
  await sql`DELETE FROM status_events`
  await sql`DELETE FROM voicemails`

  console.log('Inserting voicemails...')
  for (const vm of MOCK_VOICEMAILS) {
    await sql`
      INSERT INTO voicemails (
        id, caller_name, caller_number, received_at, duration, location,
        urgency, urgency_confidence, intent, summary, key_details,
        suggested_action, transcript_excerpt, flag_for_human, status, assigned_to
      ) VALUES (
        ${vm.id}, ${vm.callerName}, ${vm.callerNumber}, ${vm.receivedAt},
        ${vm.duration}, ${vm.location}, ${vm.urgency}, ${vm.urgencyConfidence},
        ${vm.intent}, ${vm.summary}, ${vm.keyDetails}, ${vm.suggestedAction},
        ${vm.transcriptExcerpt}, ${vm.flagForHuman}, ${vm.status},
        ${vm.assignedTo ?? null}
      )
    `

    for (const event of vm.statusHistory) {
      await sql`
        INSERT INTO status_events (voicemail_id, status, changed_at, changed_by, note)
        VALUES (${vm.id}, ${event.status}, ${event.changedAt}, ${event.changedBy}, ${event.note ?? null})
      `
    }
  }

  console.log(`Seeded ${MOCK_VOICEMAILS.length} voicemails.`)
}

seed().catch(err => { console.error(err); process.exit(1) })
```

- [ ] **Step 2: Commit**

```bash
git add scripts/seed.ts
git commit -m "feat: add DB seed script"
```

---

### Task 5: Run the seed

- [ ] **Step 1: Run seed script**

```bash
cd /Users/tasmanstar/Desktop/heidi-voicemail
bun run scripts/seed.ts
```

Expected output:
```
Creating schema...
Clearing existing data...
Inserting voicemails...
Seeded 12 voicemails.
```

If you see a connection error, verify `.env.local` DATABASE_URL is correct.

- [ ] **Step 2: Verify in Neon console or via query**

```bash
bun -e "
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);
sql\`SELECT count(*) FROM voicemails\`.then(r => console.log('Row count:', r[0].count));
"
```

Expected: `Row count: 12`

---

### Task 6: Wire page.tsx to DB

**Files:**
- Modify: `app/voicemails/page.tsx`

- [ ] **Step 1: Read current page.tsx**

Read `app/voicemails/page.tsx` to understand the current shape before modifying.

- [ ] **Step 2: Make page async and swap mock data for DB query**

Replace the import of `MOCK_VOICEMAILS` and initial state with a call to `getVoicemails`.

The page component signature changes from:
```typescript
export default function VoicemailsPage() {
```
to:
```typescript
export default async function VoicemailsPage() {
```

Add at the top of the file:
```typescript
import { getVoicemails } from '@/lib/voicemail-queries'
```

Replace whatever line initialises voicemails from `MOCK_VOICEMAILS` with:
```typescript
const initialVoicemails = await getVoicemails()
```

Then pass `initialVoicemails` to wherever `MOCK_VOICEMAILS` was used. The rest of the component (client state, handlers) stays unchanged — pass DB data as the initial prop.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/tasmanstar/Desktop/heidi-voicemail
bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Start dev server and verify**

```bash
node node_modules/.bin/next dev --port 3000
```

Open http://localhost:3000/voicemails — should see 12 voicemails loaded from Neon.

- [ ] **Step 5: Commit**

```bash
git add app/voicemails/page.tsx
git commit -m "feat: wire voicemails page to Neon Postgres"
```
