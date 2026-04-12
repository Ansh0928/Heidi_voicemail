'use client'

import { HeiSidebar } from '@/components/layout/HeiSidebar'
import { VoicemailList } from '@/components/voicemail/VoicemailList'
import { MOCK_VOICEMAILS } from '@/lib/mock-data'

export default function VoicemailsPage() {
  return (
    <div className="flex h-screen bg-[#f9f4f1] overflow-hidden">
      <HeiSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
          <VoicemailList initialItems={MOCK_VOICEMAILS} />
        </div>
      </main>
    </div>
  )
}
