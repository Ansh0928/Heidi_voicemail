'use client'

import { useState, useMemo } from 'react'
import type { VoicemailItem, VoicemailStatus } from '@/types/voicemail'
import type { ClinicFilter } from '@/app/voicemails/page'
import { sortByUrgency } from '@/lib/urgency'
import { getStats } from '@/lib/mock-data'
import { StatsBar } from './StatsBar'
import { FilterBar, type UrgencyFilter, type StatusFilter } from './FilterBar'
import { VoicemailCard } from './VoicemailCard'
import { VoicemailDetail } from './VoicemailDetail'
import { InboxIcon } from 'lucide-react'

interface VoicemailListProps {
  initialItems: VoicemailItem[]
  selectedClinic: ClinicFilter
  onClinicChange: (clinic: ClinicFilter) => void
}

export function VoicemailList({ initialItems, selectedClinic, onClinicChange }: VoicemailListProps) {
  const [items, setItems] = useState<VoicemailItem[]>(initialItems)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('new')

  const clinicItems = useMemo(
    () => selectedClinic === 'all' ? items : items.filter(v => v.location === selectedClinic),
    [items, selectedClinic]
  )
  const stats = useMemo(() => getStats(clinicItems), [clinicItems])

  const filtered = useMemo(() => {
    let list = items
    if (selectedClinic !== 'all') list = list.filter(v => v.location === selectedClinic)
    if (urgencyFilter !== 'all') list = list.filter(v => v.urgency === urgencyFilter)
    if (statusFilter !== 'all') list = list.filter(v => v.status === statusFilter)
    return sortByUrgency(list)
  }, [items, selectedClinic, urgencyFilter, statusFilter])

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
    <div className="flex gap-0 h-full overflow-hidden">
      {/* List panel */}
      <div className="flex flex-col w-full lg:w-[420px] xl:w-[460px] shrink-0 border-r border-[#e2d3d8] bg-[#f9f4f1]">
        <div className="px-4 pt-5 pb-3 space-y-3">
          <StatsBar stats={stats} selectedClinic={selectedClinic} onClinicChange={onClinicChange} />
          <FilterBar
            urgencyFilter={urgencyFilter}
            statusFilter={statusFilter}
            onUrgencyChange={setUrgencyFilter}
            onStatusChange={setStatusFilter}
          />
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
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
      <div className="hidden lg:flex flex-1 min-w-0 h-full bg-white">
        {selectedItem ? (
          <div className="w-full h-full">
            <VoicemailDetail
              item={selectedItem}
              onStatusChange={handleStatusChange}
              onClose={() => setSelectedId(null)}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full text-center">
            <p className="text-sm text-[#8a7078]">Select a voicemail to see details</p>
            <p className="text-xs text-[#d4c4c9] mt-1">Click any item in the list</p>
          </div>
        )}
      </div>
    </div>
  )
}
