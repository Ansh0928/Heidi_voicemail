'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Menu,
  Plus,
  MapPin,
  ChevronDown,
  ChevronRight,
  Check,
  AudioLines,
  Phone,
  Settings,
  HelpCircle,
  Bell,
  Blocks,
  Globe,
  Building,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ClinicFilter } from '@/app/voicemails/page'

// Heidi brand mark — same as desktop sidebar
function HeidiMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 37 37" fill="currentColor" className={className} aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path d="M36.8261 11.0202C36.5807 5.52687 32.1015 1.06293 26.5656 0.794546C23.8556 0.662055 21.3502 1.52325 19.3867 3.04011C18.9674 3.36454 18.3726 3.36454 17.9516 3.04011C15.9881 1.52155 13.4827 0.662055 10.7727 0.794546C5.23676 1.06293 0.757592 5.52687 0.510453 11.0202C0.389441 13.7244 1.27914 16.2179 2.83526 18.1645C3.17102 18.5858 3.17102 19.1854 2.83526 19.6049C1.28084 21.5532 0.391145 24.0468 0.510453 26.751C0.755887 32.2443 5.23335 36.7082 10.771 36.9783C13.481 37.1108 15.9864 36.2496 17.9499 34.7327C18.3692 34.4083 18.964 34.4083 19.385 34.7327C21.3485 36.2496 23.8539 37.1091 26.5639 36.9783C32.0998 36.7099 36.579 32.2443 36.8244 26.751C36.9455 24.0468 36.0558 21.5532 34.4996 19.6066C34.1639 19.1854 34.1639 18.5858 34.4996 18.1662C36.0558 16.2213 36.9455 13.7261 36.8244 11.0219L36.8261 11.0202Z" />
      <path d="M26.521 6.22169C24.6632 6.22169 23.0287 7.15422 22.0402 8.77809C21.2596 10.0588 20.7482 11.4789 20.5846 14.3699C20.5488 14.9984 20.0307 15.4927 19.3983 15.5012C19.1614 15.5046 18.9194 15.5063 18.6672 15.5063C18.4149 15.5063 18.1712 15.5063 17.936 15.5012C17.3036 15.4927 16.7838 14.9984 16.7497 14.3699C16.5861 11.4772 16.0731 10.0571 15.2942 8.77809C14.3039 7.15422 12.6711 6.22169 10.8133 6.22169C8.63676 6.22169 6.19946 8.17848 6.19946 10.796C6.19946 12.9584 7.28687 14.8489 9.18217 15.9785C10.9888 17.0554 13.2046 17.723 18.6689 17.723C24.1332 17.723 26.3489 17.0554 28.1556 15.9785C30.0509 14.8489 31.1383 12.9601 31.1383 10.796C31.1383 8.17848 28.7027 6.22169 26.5245 6.22169H26.521Z" />
      <path d="M10.8147 31.5495C12.6725 31.5495 14.3071 30.6169 15.2956 28.9931C16.0762 27.7123 16.5875 26.2923 16.7512 23.4013C16.787 22.7728 17.3051 22.2785 17.9374 22.27C18.1743 22.2666 18.4164 22.2649 18.6686 22.2649C18.9209 22.2649 19.1629 22.2649 19.3998 22.27C20.0321 22.2785 20.552 22.7728 20.5861 23.4013C20.7497 26.294 21.2627 27.714 22.0416 28.9931C23.0319 30.6169 24.6647 31.5495 26.5225 31.5495C28.699 31.5495 31.1363 29.5927 31.1363 26.9751C31.1363 24.8128 30.0489 22.9222 28.1536 21.7927C26.3469 20.7158 24.1312 20.0482 18.6669 20.0482C13.2026 20.0482 10.9869 20.7158 9.18021 21.7927C7.28492 22.9222 6.19751 24.8111 6.19751 26.9751C6.19751 29.5927 8.6331 31.5495 10.8113 31.5495H10.8147Z" />
    </svg>
  )
}

function EvidenceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M8 5.5a3.5 3.5 0 1 0 0 7" />
      <circle cx="12" cy="9" r="3.5" />
    </svg>
  )
}

function TasksIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="6" width="5" height="5" rx="1" />
      <line x1="11" y1="8.5" x2="21" y2="8.5" />
      <rect x="3" y="14" width="5" height="5" rx="1" />
      <line x1="11" y1="16.5" x2="21" y2="16.5" />
    </svg>
  )
}

const CLINICS: { value: ClinicFilter; label: string }[] = [
  { value: 'all', label: 'All clinics' },
  { value: 'Clinic 1', label: 'Clinic 1' },
  { value: 'Clinic 2', label: 'Clinic 2' },
  { value: 'Clinic 3', label: 'Clinic 3' },
]

const PROFILE = {
  initials: 'SB',
  displayName: 'Shaz Brahmavar',
  email: 'shaz@harbourgp.com',
} as const

interface MobileHeaderProps {
  selectedClinic: ClinicFilter
  onClinicChange: (clinic: ClinicFilter) => void
}

export function MobileHeader({ selectedClinic, onClinicChange }: MobileHeaderProps) {
  const [open, setOpen] = useState(false)
  const [clinicOpen, setClinicOpen] = useState(false)
  const clinicRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  // Close clinic dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (clinicRef.current && !clinicRef.current.contains(e.target as Node)) {
        setClinicOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close sheet on back navigation / escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const currentClinic = CLINICS.find(c => c.value === selectedClinic) ?? CLINICS[0]

  function NavRow({
    icon,
    label,
    active,
    hasArrow,
    section,
  }: {
    icon?: React.ReactNode
    label: string
    active?: boolean
    hasArrow?: boolean
    section?: boolean
  }) {
    if (section) {
      return (
        <p className="px-1 pt-5 pb-1 text-[13px] font-medium text-[#a08090] select-none">{label}</p>
      )
    }
    return (
      <button
        className={cn(
          'w-full flex items-center gap-4 px-4 py-4 rounded-xl text-[17px] transition-colors text-left',
          active
            ? 'bg-[#f0e2d8] text-[#3d1520] font-medium'
            : 'text-[#3d1520] hover:bg-[#ede4df]',
        )}
      >
        <span className={cn('shrink-0', active ? 'text-[#3d1520]' : 'text-[#8a6470]')}>{icon}</span>
        <span className="flex-1">{label}</span>
        {hasArrow && <ChevronRight className="h-4 w-4 text-[#b09aa2] shrink-0" strokeWidth={1.75} />}
      </button>
    )
  }

  return (
    <>
      {/* ── Top bar (mobile only) ── */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 h-[52px] bg-[#f7f1ee] border-b border-[#e2d3d8] flex items-center px-4 gap-3">
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 -ml-1.5 rounded-lg text-[#5a3340] hover:bg-[#ede4df] transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <div className="flex items-center gap-2">
          <HeidiMark className="h-6 w-6 text-[#3d1520]" />
          <span className="text-[20px] font-semibold text-[#3d1520] tracking-normal" style={{ fontFamily: 'var(--font-brand, "Cormorant Garamond", Georgia, serif)' }}>Heidi</span>
        </div>
      </header>

      {/* ── Backdrop ── */}
      <div
        className={cn(
          'lg:hidden fixed inset-0 z-40 bg-black/40 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* ── Bottom sheet drawer ── */}
      <div
        ref={sheetRef}
        className={cn(
          'lg:hidden fixed inset-x-0 bottom-0 z-50 bg-[#f7f1ee] rounded-t-3xl transition-transform duration-300 ease-out',
          'max-h-[90dvh] flex flex-col',
          open ? 'translate-y-0' : 'translate-y-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Pill handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#d4c4c9]" />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5 py-4">
            <HeidiMark className="h-8 w-8 text-[#3d1520]" />
            <span className="text-[24px] font-semibold text-[#3d1520] tracking-normal" style={{ fontFamily: 'var(--font-brand, "Cormorant Garamond", Georgia, serif)' }}>Heidi</span>
          </div>

          {/* Clinic selector */}
          <div ref={clinicRef} className="relative mb-3">
            <button
              onClick={() => setClinicOpen(o => !o)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[15px] text-[#5a3340] bg-[#f0e8e4] hover:bg-[#ede4df] transition-colors"
            >
              <MapPin className="h-4 w-4 shrink-0 text-[#8a6470]" strokeWidth={1.75} />
              <span className="flex-1 text-left font-medium">{currentClinic.label}</span>
              <ChevronDown className={cn('h-4 w-4 text-[#b09aa2] shrink-0 transition-transform', clinicOpen && 'rotate-180')} strokeWidth={1.75} />
            </button>
            {clinicOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e2d3d8] rounded-xl shadow-lg z-10 py-1 overflow-hidden">
                {CLINICS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => { onClinicChange(c.value); setClinicOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-[15px] text-[#3d1520] hover:bg-[#f7f1ee] transition-colors text-left"
                  >
                    <span className="flex-1">{c.label}</span>
                    {c.value === selectedClinic && <Check className="h-4 w-4 text-[#4c2934] shrink-0" strokeWidth={2} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* New session button */}
          <button className="w-full flex items-center gap-3 bg-[#4c2934] hover:bg-[#3d1f28] text-[#f9f4f1] rounded-xl px-4 py-4 text-[17px] font-medium transition-colors mb-2">
            <Plus className="h-5 w-5 shrink-0" strokeWidth={2.25} />
            <span>New session</span>
          </button>

          {/* Primary nav */}
          <nav className="space-y-0.5">
            <NavRow icon={<AudioLines className="h-6 w-6" strokeWidth={1.5} />} label="Scribe" hasArrow />
            <NavRow icon={<EvidenceIcon className="h-6 w-6" />} label="Evidence" />
            <NavRow icon={<TasksIcon className="h-6 w-6" />} label="Tasks" />
            <NavRow icon={<Phone className="h-6 w-6" strokeWidth={1.5} />} label="Comms" active />
            <NavRow label="My Library" section />
            <NavRow icon={<Blocks className="h-6 w-6" strokeWidth={1.5} />} label="My Templates" />
            <NavRow label="Community" section />
            <NavRow icon={<Globe className="h-6 w-6" strokeWidth={1.5} />} label="Templates" />
            <NavRow icon={<Building className="h-6 w-6" strokeWidth={1.5} />} label="Team" />
            <NavRow icon={<Settings className="h-6 w-6" strokeWidth={1.5} />} label="Settings" />
          </nav>

          {/* Bottom items */}
          <div className="mt-2 pt-4 border-t border-[#e2d3d8] space-y-0.5">
            <NavRow icon={<HelpCircle className="h-6 w-6" strokeWidth={1.5} />} label="Help" />
            <NavRow icon={<Bell className="h-6 w-6" strokeWidth={1.5} />} label="Notifications" />
          </div>

          {/* Profile */}
          <button className="w-full flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-[#ede4df] transition-colors mt-1">
            <div className="h-9 w-9 rounded-full bg-[#4c2934] flex items-center justify-center shrink-0">
              <span className="text-[#f9f4f1] text-[11px] font-bold tracking-tight">{PROFILE.initials}</span>
            </div>
            <div className="text-left min-w-0">
              <p className="text-[15px] font-medium text-[#3d1520] truncate leading-tight">{PROFILE.displayName}</p>
              <p className="text-[13px] text-[#a08090] truncate">{PROFILE.email}</p>
            </div>
          </button>
        </div>
      </div>
    </>
  )
}
