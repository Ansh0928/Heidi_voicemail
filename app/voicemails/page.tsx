import { getVoicemails } from '@/lib/voicemail-queries'
import VoicemailsClient from './VoicemailsClient'

export const dynamic = 'force-dynamic'

export type { ClinicFilter } from './VoicemailsClient'

export default async function VoicemailsPage({ searchParams }: { searchParams: Promise<{ vm?: string }> }) {
  let initialItems
  try {
    initialItems = await getVoicemails()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return (
      <div style={{ padding: 40, fontFamily: 'monospace' }}>
        <h2>DB Error</h2>
        <pre style={{ background: '#fee', padding: 16, borderRadius: 8 }}>{message}</pre>
        <p>DATABASE_URL set: {process.env.DATABASE_URL ? 'yes' : 'NO — missing env var'}</p>
      </div>
    )
  }

  const { vm } = await searchParams
  return <VoicemailsClient initialItems={initialItems} initialSelectedId={vm ?? null} />
}
