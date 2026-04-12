'use client'

import { cn } from '@/lib/utils'
import type { UrgencyLevel, VoicemailStatus } from '@/types/voicemail'

export type UrgencyFilter = UrgencyLevel | 'all'
export type StatusFilter = VoicemailStatus | 'all'

interface FilterBarProps {
  urgencyFilter: UrgencyFilter
  statusFilter: StatusFilter
  onUrgencyChange: (v: UrgencyFilter) => void
  onStatusChange: (v: StatusFilter) => void
}

const URGENCY_OPTIONS: { value: UrgencyFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'normal', label: 'Normal' },
  { value: 'low', label: 'Low' },
]

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
]

function TabGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-[#f9f4f1] border border-[#d4c4c9] p-0.5">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
            value === opt.value
              ? 'bg-[#fcfaf8] text-[#28030f] shadow-sm border border-[#d4c4c9]'
              : 'text-[#8a7078] hover:text-[#28030f]',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function FilterBar({ urgencyFilter, statusFilter, onUrgencyChange, onStatusChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#8a7078] font-medium uppercase tracking-wider">Priority</span>
        <TabGroup options={URGENCY_OPTIONS} value={urgencyFilter} onChange={onUrgencyChange} />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#8a7078] font-medium uppercase tracking-wider">Status</span>
        <TabGroup options={STATUS_OPTIONS} value={statusFilter} onChange={onStatusChange} />
      </div>
    </div>
  )
}
