'use client'

import { useState } from 'react'
import { HeiSidebar } from '@/components/layout/HeiSidebar'
import { VoicemailList } from '@/components/voicemail/VoicemailList'
import { MOCK_VOICEMAILS } from '@/lib/mock-data'
import type { Location } from '@/types/voicemail'

export type ClinicFilter = 'all' | Location

export default function VoicemailsPage() {
  const [clinic, setClinic] = useState<ClinicFilter>('all')

  return (
    <div className="flex h-screen bg-[#f9f4f1] overflow-hidden">
      <HeiSidebar />
      <main className="flex-1 overflow-hidden flex flex-col">
        <VoicemailList initialItems={MOCK_VOICEMAILS} selectedClinic={clinic} onClinicChange={setClinic} />
      </main>
    </div>
  )
}
