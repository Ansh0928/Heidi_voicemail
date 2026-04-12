'use client'

import { cn, formatRelativeTime, formatDuration } from '@/lib/utils'
import { URGENCY_CONFIG } from '@/lib/urgency'
import { UrgencyBadge } from './UrgencyBadge'
import { IntentTag } from './IntentTag'
import type { VoicemailItem } from '@/types/voicemail'
import { Flag, MapPin, Clock, CheckCircle2, Circle, Loader2 } from 'lucide-react'

interface VoicemailCardProps {
  item: VoicemailItem
  isSelected: boolean
  onClick: () => void
}

const STATUS_ICONS = {
  new: Circle,
  'in-progress': Loader2,
  done: CheckCircle2,
}

const STATUS_COLORS = {
  new: 'text-[#8a7078]',
  'in-progress': 'text-orange-500',
  done: 'text-[#588f60]',
}

export function VoicemailCard({ item, isSelected, onClick }: VoicemailCardProps) {
  const config = URGENCY_CONFIG[item.urgency]
  const StatusIcon = STATUS_ICONS[item.status]
  const isDone = item.status === 'done'

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left border-l-[3px] rounded-r-lg transition-all',
        'bg-[#fcfaf8] border border-l-[3px] border-[#d4c4c9]',
        'hover:border-[#8a7078] hover:shadow-sm',
        isSelected && 'border-[#28030f] shadow-md ring-1 ring-[#28030f]',
        isDone && 'opacity-60',
      )}
      style={{ borderLeftColor: config.color }}
    >
      <div className="px-4 py-3.5">
        {/* Row 1: name + badges + time */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className={cn('font-semibold text-sm text-[#28030f] truncate', isDone && 'line-through')}>
              {item.callerName}
            </span>
            <UrgencyBadge urgency={item.urgency} size="sm" />
            {item.flagForHuman && (
              <Flag className="h-3.5 w-3.5 text-amber-500 shrink-0" strokeWidth={2} />
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-[#8a7078]">{formatRelativeTime(item.receivedAt)}</span>
            <StatusIcon className={cn('h-3.5 w-3.5', STATUS_COLORS[item.status])} strokeWidth={1.75} />
          </div>
        </div>

        {/* Row 2: summary */}
        <p className="mt-1.5 text-sm text-[#28030f] leading-snug line-clamp-2">
          {item.summary}
        </p>

        {/* Row 3: suggested action (urgent/high only) */}
        {(item.urgency === 'urgent' || item.urgency === 'high') && item.status === 'new' && (
          <div className="mt-2 flex items-start gap-1.5">
            <span className="mt-0.5 shrink-0 h-1.5 w-1.5 rounded-full bg-[#28030f]" />
            <p className="text-[12px] text-[#28030f] font-medium leading-snug line-clamp-1">
              {item.suggestedAction}
            </p>
          </div>
        )}

        {/* Row 4: meta */}
        <div className="mt-2.5 flex items-center gap-3 flex-wrap">
          <IntentTag intent={item.intent} />
          <div className="flex items-center gap-1 text-[11px] text-[#8a7078]">
            <MapPin className="h-3 w-3" strokeWidth={1.75} />
            <span>{item.location}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#8a7078]">
            <Clock className="h-3 w-3" strokeWidth={1.75} />
            <span>{formatDuration(item.duration)}</span>
          </div>
          {item.assignedTo && (
            <span className="text-[11px] text-[#8a7078]">→ {item.assignedTo}</span>
          )}
        </div>
      </div>
    </button>
  )
}
