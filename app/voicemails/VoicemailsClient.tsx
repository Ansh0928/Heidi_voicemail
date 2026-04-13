'use client'

import { useState, useEffect } from 'react'
import { HeiSidebar } from '@/components/layout/HeiSidebar'
import { MobileHeader } from '@/components/layout/MobileHeader'
import { VoicemailList } from '@/components/voicemail/VoicemailList'
import type { VoicemailItem, Location } from '@/types/voicemail'

export type ClinicFilter = 'all' | Location

interface VoicemailsClientProps {
  initialItems: VoicemailItem[]
  initialSelectedId?: string | null
}

export default function VoicemailsClient({ initialItems, initialSelectedId }: VoicemailsClientProps) {
  const [clinic, setClinic] = useState<ClinicFilter>('all')

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7546/ingest/7e31a13d-614d-4700-af67-b2ef74602912', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'b883d9' },
      body: JSON.stringify({
        sessionId: 'b883d9',
        hypothesisId: 'H4',
        location: 'VoicemailsClient.tsx:mount',
        message: 'voicemails shell mounted',
        data: { itemCount: initialItems.length, hasInitialSelectedId: initialSelectedId != null },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
  }, [initialItems.length, initialSelectedId])
  // #endregion

  return (
    <div className="flex h-screen bg-[#f9f4f1] overflow-hidden">
      <div className="hidden lg:flex shrink-0">
        <HeiSidebar selectedClinic={clinic} onClinicChange={setClinic} />
      </div>
      <main className="flex-1 overflow-hidden flex flex-col min-w-0 pt-[52px] lg:pt-0">
        <VoicemailList initialItems={initialItems} selectedClinic={clinic} onClinicChange={setClinic} initialSelectedId={initialSelectedId ?? null} />
      </main>
      <MobileHeader selectedClinic={clinic} onClinicChange={setClinic} />
    </div>
  )
}
