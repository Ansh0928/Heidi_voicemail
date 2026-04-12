'use client'

import { useState, useMemo } from 'react'
import type { VoicemailItem, VoicemailStatus } from '@/types/voicemail'
import { sortByUrgency } from '@/lib/urgency'
import { getStats } from '@/lib/mock-data'
import { StatsBar } from './StatsBar'
import { FilterBar, type UrgencyFilter, type StatusFilter } from './FilterBar'
import { VoicemailCard } from './VoicemailCard'
import { VoicemailDetail } from './VoicemailDetail'
import { InboxIcon } from 'lucide-react'

interface VoicemailListProps {
  initialItems: VoicemailItem[]
}

export function VoicemailList({ initialItems }: VoicemailListProps) {
  const [items, setItems] = useState<VoicemailItem[]>(initialItems)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('new')

  const stats = useMemo(() => getStats(items), [items])

  const filtered = useMemo(() => {
    let list = items
    if (urgencyFilter !== 'all') list = list.filter(v => v.urgency === urgencyFilter)
    if (statusFilter !== 'all') list = list.filter(v => v.status === statusFilter)
    return sortByUrgency(list)
  }, [items, urgencyFilter, statusFilter])

  const selectedItem = items.find(v => v.id === selectedId) ?? null

  function handleStatusChange(id: string, status: VoicemailStatus, note?: string) {
    setItems(prev =>
      prev.map(v => {
        if (v.id !== id) return v
        const event = {
          status,
          changedAt: new Date().toISOString(),
          changedBy: 'Sarah K.',
          note,
        }
        return { ...v, status, statusHistory: [...v.statusHistory, event] }
      }),
    )
    if (status === 'done') setSelectedId(null)
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-10rem)] overflow-hidden">
      {/* List panel */}
      <div className="flex flex-col gap-3 w-full lg:w-[440px] xl:w-[480px] shrink-0">
        <StatsBar stats={stats} />
        <FilterBar
          urgencyFilter={urgencyFilter}
          statusFilter={statusFilter}
          onUrgencyChange={setUrgencyFilter}
          onStatusChange={setStatusFilter}
        />
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <InboxIcon className="h-8 w-8 text-[#d4c4c9] mb-3" strokeWidth={1.25} />
              <p className="text-sm text-[#8a7078]">No voicemails match this filter</p>
            </div>
          ) : (
            filtered.map(item => (
              <VoicemailCard
                key={item.id}
                item={item}
                isSelected={item.id === selectedId}
                onClick={() => setSelectedId(item.id === selectedId ? null : item.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Detail panel */}
      <div className="hidden lg:flex flex-1 min-w-0 h-full">
        {selectedItem ? (
          <div className="w-full h-full">
            <VoicemailDetail
              item={selectedItem}
              onStatusChange={handleStatusChange}
              onClose={() => setSelectedId(null)}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full rounded-lg border border-dashed border-[#d4c4c9] text-center">
            <p className="text-sm text-[#8a7078]">Select a voicemail to see details</p>
            <p className="text-xs text-[#d4c4c9] mt-1">Click any item in the list</p>
          </div>
        )}
      </div>
    </div>
  )
}
