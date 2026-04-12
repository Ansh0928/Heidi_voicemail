'use client'

import { useState, useRef, useEffect } from 'react'
import { AlertTriangle, ArrowUp, Flag, Inbox, MapPin, ChevronDown, Check } from 'lucide-react'
import type { VoicemailStats } from '@/lib/mock-data'
import type { ClinicFilter } from '@/app/voicemails/page'
import { cn } from '@/lib/utils'

const CLINICS: { value: ClinicFilter; label: string }[] = [
  { value: 'all', label: 'All clinics' },
  { value: 'Varsity Lakes', label: 'Varsity Lakes' },
  { value: 'Labrador', label: 'Labrador' },
  { value: 'Southport', label: 'Southport' },
]

interface StatsBarProps {
  stats: VoicemailStats
  selectedClinic: ClinicFilter
  onClinicChange: (clinic: ClinicFilter) => void
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

export function StatsBar({ stats, selectedClinic, onClinicChange }: StatsBarProps) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const now = new Date()
  const timeLabel = now.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: true })
  const currentClinic = CLINICS.find(c => c.value === selectedClinic) ?? CLINICS[0]

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="space-y-3">
      {/* Morning brief header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[#28030f] tracking-tight">Morning voicemail</h1>
          <p className="text-sm text-[#8a7078] mt-0.5">
            {stats.total} messages to action · As of {timeLabel}
          </p>
        </div>

        {/* Clinic dropdown */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e2d3d8] bg-white text-[12.5px] text-[#5a3340] hover:bg-[#f7f1ee] transition-colors"
          >
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#8a6470]" strokeWidth={1.75} />
            <span className="font-medium">{currentClinic.label}</span>
            <ChevronDown className={cn('h-3.5 w-3.5 text-[#b09aa2] transition-transform', open && 'rotate-180')} strokeWidth={1.75} />
          </button>

          {open && (
            <div className="absolute top-full right-0 mt-1 min-w-[140px] bg-white border border-[#e2d3d8] rounded-lg shadow-md z-50 py-1 overflow-hidden">
              {CLINICS.map(c => (
                <button
                  key={c.value}
                  onClick={() => { onClinicChange(c.value); setOpen(false) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[12.5px] text-[#3d1520] hover:bg-[#f7f1ee] transition-colors text-left"
                >
                  <span className="flex-1">{c.label}</span>
                  {c.value === selectedClinic && (
                    <Check className="h-3.5 w-3.5 text-[#4c2934] shrink-0" strokeWidth={2} />
                  )}
                </button>
              ))}
            </div>
          )}
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
