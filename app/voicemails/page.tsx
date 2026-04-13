import { getVoicemails } from '@/lib/voicemail-queries'
import VoicemailsClient from './VoicemailsClient'

export const dynamic = 'force-dynamic'

export type { ClinicFilter } from './VoicemailsClient'

export default async function VoicemailsPage() {
  const initialItems = await getVoicemails()

  return <VoicemailsClient initialItems={initialItems} />
}
