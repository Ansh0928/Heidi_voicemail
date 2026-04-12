'use client'

import { HeidiNav } from '@/components/layout/HeidiNav'
import { VoicemailList } from '@/components/voicemail/VoicemailList'
import { MOCK_VOICEMAILS } from '@/lib/mock-data'

export default function VoicemailsPage() {
  return (
    <div className="min-h-screen bg-[#f9f4f1]">
      <HeidiNav />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <VoicemailList initialItems={MOCK_VOICEMAILS} />
      </main>
    </div>
  )
}
