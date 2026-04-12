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
      assigned_to TEXT,
      transcript TEXT,
      audio_url TEXT
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
    transcript: row.transcript as string | undefined,
    audioUrl: row.audio_url as string | undefined,
  }))
}
