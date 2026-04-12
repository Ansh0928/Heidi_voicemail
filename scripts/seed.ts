import { neon } from '@neondatabase/serverless'
import { MOCK_VOICEMAILS } from '../lib/mock-data'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) throw new Error('DATABASE_URL not set — create .env.local first')

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
