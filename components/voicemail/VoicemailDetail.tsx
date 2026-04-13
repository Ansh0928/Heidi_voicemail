'use client'

import { useState, useRef, useEffect } from 'react'
import type { VoicemailItem, VoicemailStatus } from '@/types/voicemail'
import { cn, formatRelativeTime, formatDuration, formatPhoneDisplay } from '@/lib/utils'
import { URGENCY_CONFIG, INTENT_LABELS } from '@/lib/urgency'
import { UrgencyBadge } from './UrgencyBadge'
import {
  Phone,
  Clock,
  MapPin,
  Flag,
  ChevronDown,
  ChevronUp,
  Check,
  PhoneCall,
  UserCheck,
  Archive,
  AlertCircle,
  Sparkles,
  Play,
  RotateCcw,
} from 'lucide-react'

const STAFF = ['Shaz B.', 'Marcus T.', 'Priya K.', 'Jess R.']
const CURRENT_USER = 'Shaz B.'

interface VoicemailDetailProps {
  item: VoicemailItem
  onStatusChange: (id: string, status: VoicemailStatus, note?: string, assignedTo?: string, claimedBy?: string) => void
  onClose: () => void
}

export function VoicemailDetail({ item, onStatusChange, onClose }: VoicemailDetailProps) {
  const [showTranscript, setShowTranscript] = useState(false)
  const [note, setNote] = useState('')
  const [showAssignDropdown, setShowAssignDropdown] = useState(false)
  const assignRef = useRef<HTMLDivElement>(null)
  const config = URGENCY_CONFIG[item.urgency]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (assignRef.current && !assignRef.current.contains(e.target as Node)) {
        setShowAssignDropdown(false)
      }
    }
    if (showAssignDropdown) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showAssignDropdown])

  const handleCallBack = () => {
    onStatusChange(item.id, 'in-progress', note || `Called back by ${CURRENT_USER}`, undefined, CURRENT_USER)
    setNote('')
  }

  const handleAssign = (staffMember: string) => {
    onStatusChange(item.id, 'in-progress', `Assigned to ${staffMember}`, staffMember)
    setShowAssignDropdown(false)
    setNote('')
  }

  const handleResolve = () => {
    onStatusChange(item.id, 'done', note || undefined)
    setNote('')
  }

  const handleArchive = () => {
    onStatusChange(item.id, 'done', 'Archived')
    setNote('')
  }

  const handleReopen = () => {
    onStatusChange(item.id, 'new', 'Reopened', undefined, undefined)
  }

  return (
    <div className="flex flex-col h-full bg-[#fcfaf8] rounded-lg border border-[#d4c4c9] overflow-hidden">
      {/* Header */}
      <div
        className="px-5 py-4 border-b border-[#d4c4c9]"
        style={{ borderLeftColor: config.color, borderLeftWidth: 3 }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-semibold text-[#28030f]">{item.callerName}</h2>
              <UrgencyBadge urgency={item.urgency} />
              {item.flagForHuman && (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium bg-amber-50 border border-amber-200 text-amber-700">
                  <Flag className="h-3 w-3" />
                  Needs GP review
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-3 flex-wrap text-sm text-[#8a7078]">
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" strokeWidth={1.75} />
                {formatPhoneDisplay(item.callerNumber)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
                {formatRelativeTime(item.receivedAt)} · {formatDuration(item.duration)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
                {item.location}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-[#8a7078] hover:text-[#28030f] text-sm shrink-0">
            ✕
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Suggested action — TOP, most actionable */}
        <div className="px-5 py-3.5 border-b border-[#d4c4c9] bg-[#f9f4f1]">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-[#28030f] mt-0.5 shrink-0" strokeWidth={1.75} />
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8a7078] block mb-0.5">
                Next step
              </span>
              <p className="text-sm font-medium text-[#28030f] leading-snug">{item.suggestedAction}</p>
            </div>
          </div>
        </div>

        {/* AI Summary block */}
        <div className="px-5 py-4 border-b border-[#d4c4c9]">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-[#8a7078]" strokeWidth={1.75} />
            <span className="text-xs text-[#8a7078] font-medium uppercase tracking-wider">AI Summary</span>
            <span className="ml-auto text-[10px] text-[#8a7078] bg-[#f9f4f1] border border-[#d4c4c9] rounded px-1.5 py-0.5">
              {Math.round(item.urgencyConfidence * 100)}% confidence
            </span>
          </div>
          <p className="text-sm text-[#28030f] leading-relaxed">{item.summary}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-[#8a7078]">Intent:</span>
            <span className="text-xs font-medium text-[#28030f]">{INTENT_LABELS[item.intent]}</span>
          </div>
        </div>

        {/* Key details */}
        <div className="px-5 py-4 border-b border-[#d4c4c9]">
          <h3 className="text-xs text-[#8a7078] font-medium uppercase tracking-wider mb-2">Key details</h3>
          <ul className="space-y-1.5">
            {item.keyDetails.map((detail, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#28030f]">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#d4c4c9] shrink-0" />
                {detail}
              </li>
            ))}
          </ul>
        </div>

        {/* Audio + Transcript (collapsible) */}
        <div className="px-5 py-3 border-b border-[#d4c4c9]">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex items-center gap-1.5 text-xs text-[#8a7078] hover:text-[#28030f] transition-colors w-full"
          >
            <Play className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span className="font-medium uppercase tracking-wider">Voicemail transcript</span>
            {showTranscript ? (
              <ChevronUp className="h-3.5 w-3.5 ml-auto" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 ml-auto" />
            )}
          </button>
          {showTranscript && (
            <div className="mt-3 space-y-3">
              {item.audioUrl && (
                <audio
                  controls
                  src={item.audioUrl}
                  className="w-full h-8 [&::-webkit-media-controls-panel]:bg-[#f9f4f1]"
                />
              )}
              <blockquote className="pl-3 border-l-2 border-[#d4c4c9] text-sm text-[#8a7078] leading-relaxed">
                {item.transcript ?? item.transcriptExcerpt}
              </blockquote>
            </div>
          )}
        </div>

        {/* Status history */}
        {item.statusHistory.length > 0 && (
          <div className="px-5 py-4 border-b border-[#d4c4c9]">
            <h3 className="text-xs text-[#8a7078] font-medium uppercase tracking-wider mb-2">History</h3>
            <div className="space-y-2">
              {item.statusHistory.map((event, i) => (
                <div key={i} className="text-xs text-[#8a7078]">
                  <span className="font-medium text-[#28030f]">{event.changedBy}</span>
                  {' · '}
                  <span>{event.status}</span>
                  {' · '}
                  <span>{formatRelativeTime(event.changedAt)}</span>
                  {event.note && <span className="block mt-0.5 text-[#8a7078]">{event.note}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action panel */}
      {item.status === 'done' ? (
        <div className="border-t border-[#d4c4c9] px-5 py-4 bg-[#fcfaf8] flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-[#8a7078]">
            <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2} />
            Resolved
          </span>
          <button
            onClick={handleReopen}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium bg-[#f9f4f1] border border-[#d4c4c9] text-[#28030f] hover:bg-[#f5ede8] transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
            Reopen
          </button>
        </div>
      ) : (
        <div className="border-t border-[#d4c4c9] px-5 py-4 bg-[#fcfaf8]">
          {/* Assignee / claimant indicator */}
          {(item.assignedTo || item.claimedBy) && (
            <div className="mb-2 text-xs text-[#8a7078] flex items-center gap-1.5">
              <UserCheck className="h-3 w-3" strokeWidth={1.75} />
              {item.assignedTo
                ? <span>Assigned to <span className="font-medium text-[#28030f]">{item.assignedTo}</span></span>
                : <span>Claimed by <span className="font-medium text-[#28030f]">{item.claimedBy}</span></span>
              }
            </div>
          )}
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add a note (optional)..."
            rows={2}
            className="w-full text-sm border border-[#d4c4c9] rounded-lg px-3 py-2 bg-[#f9f4f1] text-[#28030f] placeholder:text-[#8a7078] resize-none focus:outline-none focus:border-[#28030f] transition-colors mb-3"
          />
          <div className="flex gap-2 flex-wrap items-center">
            {item.status === 'new' && (
              <button
                onClick={handleCallBack}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium bg-[#f9f4f1] border border-[#d4c4c9] text-[#28030f] hover:bg-[#f5ede8] transition-colors"
              >
                <PhoneCall className="h-3.5 w-3.5" strokeWidth={1.75} />
                Calling back
              </button>
            )}
            {/* Assign with dropdown */}
            <div className="relative" ref={assignRef}>
              <button
                onClick={() => setShowAssignDropdown(v => !v)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium bg-[#f9f4f1] border border-[#d4c4c9] text-[#28030f] hover:bg-[#f5ede8] transition-colors"
              >
                <UserCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
                Assign
                <ChevronDown className="h-3 w-3 text-[#8a7078]" />
              </button>
              {showAssignDropdown && (
                <div className="absolute bottom-full mb-1 left-0 z-10 bg-white border border-[#d4c4c9] rounded-lg shadow-lg py-1 min-w-[140px]">
                  {STAFF.map(s => (
                    <button
                      key={s}
                      onClick={() => handleAssign(s)}
                      className={cn(
                        'w-full text-left px-3 py-2 text-sm hover:bg-[#f9f4f1] transition-colors',
                        item.assignedTo === s ? 'font-semibold text-[#28030f]' : 'text-[#28030f]',
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleResolve}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium bg-[#28030f] text-[#f9f4f1] hover:bg-[#3d0518] transition-colors"
            >
              <Check className="h-3.5 w-3.5" strokeWidth={2} />
              Resolve
            </button>
            <button
              onClick={handleArchive}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[#8a7078] hover:text-[#28030f] transition-colors ml-auto"
            >
              <Archive className="h-3.5 w-3.5" strokeWidth={1.75} />
              Archive
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
