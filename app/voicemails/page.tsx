import { getVoicemails } from '@/lib/voicemail-queries'
import { MOCK_VOICEMAILS } from '@/lib/mock-data'
import VoicemailsClient from './VoicemailsClient'

export const dynamic = 'force-dynamic'

export type { ClinicFilter } from './VoicemailsClient'

export default async function VoicemailsPage({ searchParams }: { searchParams: Promise<{ vm?: string }> }) {
  let initialItems
  try {
    initialItems = await getVoicemails()
  } catch {
    initialItems = MOCK_VOICEMAILS
  }

  const { vm } = await searchParams
  return <VoicemailsClient initialItems={initialItems} initialSelectedId={vm ?? null} />
}
