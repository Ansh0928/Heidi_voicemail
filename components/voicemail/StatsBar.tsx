import { AlertTriangle, ArrowUp, Flag, Inbox, MapPin } from 'lucide-react'
import type { VoicemailStats } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface StatsBarProps {
  stats: VoicemailStats
}

function StatPill({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: number
  color: string
}) {
  return (
    <div className={cn('flex items-center gap-2 rounded-lg px-3 py-2 border', color)}>
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
      <div>
        <div className="text-xl font-bold leading-none">{value}</div>
        <div className="text-[11px] font-medium mt-0.5 opacity-75 uppercase tracking-wide">{label}</div>
      </div>
    </div>
  )
}

export function StatsBar({ stats }: StatsBarProps) {
  const now = new Date()
  const timeLabel = now.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: true })

  return (
    <div className="space-y-3">
      {/* Morning brief header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#28030f] tracking-tight">Morning voicemail</h1>
          <p className="text-sm text-[#8a7078] mt-0.5">
            {stats.total} messages to action · As of {timeLabel}
          </p>
        </div>
        {/* Location split */}
        <div className="hidden sm:flex items-center gap-3 text-sm text-[#8a7078]">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span className="font-medium text-[#28030f]">Varsity Lakes</span>
            <span className="font-semibold text-[#28030f]">{stats.varsityLakes}</span>
          </div>
          <span className="text-[#d4c4c9]">·</span>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span className="font-medium text-[#28030f]">Labrador</span>
            <span className="font-semibold text-[#28030f]">{stats.labrador}</span>
          </div>
        </div>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatPill
          icon={AlertTriangle}
          label="Urgent"
          value={stats.urgent}
          color={
            stats.urgent > 0
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-[#f9f4f1] border-[#d4c4c9] text-[#8a7078]'
          }
        />
        <StatPill
          icon={ArrowUp}
          label="High"
          value={stats.high}
          color={
            stats.high > 0
              ? 'bg-orange-50 border-orange-200 text-orange-700'
              : 'bg-[#f9f4f1] border-[#d4c4c9] text-[#8a7078]'
          }
        />
        <StatPill
          icon={Flag}
          label="Flagged"
          value={stats.flagged}
          color={
            stats.flagged > 0
              ? 'bg-amber-50 border-amber-200 text-amber-700'
              : 'bg-[#f9f4f1] border-[#d4c4c9] text-[#8a7078]'
          }
        />
        <StatPill
          icon={Inbox}
          label="Total"
          value={stats.total}
          color="bg-[#f9f4f1] border-[#d4c4c9] text-[#28030f]"
        />
      </div>
    </div>
  )
}
