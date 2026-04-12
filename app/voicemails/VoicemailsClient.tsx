'use client'

import { useState } from 'react'
import { HeiSidebar } from '@/components/layout/HeiSidebar'
import { VoicemailList } from '@/components/voicemail/VoicemailList'
import type { VoicemailItem, Location } from '@/types/voicemail'

export type ClinicFilter = 'all' | Location

interface VoicemailsClientProps {
  initialItems: VoicemailItem[]
}

export default function VoicemailsClient({ initialItems }: VoicemailsClientProps) {
  const [clinic, setClinic] = useState<ClinicFilter>('all')

  return (
    <div className="flex h-screen bg-[#f9f4f1] overflow-hidden">
      <HeiSidebar selectedClinic={clinic} onClinicChange={setClinic} />
      <main className="flex-1 overflow-hidden flex flex-col">
        <VoicemailList initialItems={initialItems} selectedClinic={clinic} onClinicChange={setClinic} />
      </main>
    </div>
  )
}
