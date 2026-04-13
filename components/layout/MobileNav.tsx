'use client'

import { AudioLines, Phone, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

// Matches the sidebar custom icons
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

const NAV_ITEMS = [
  { id: 'scribe',   label: 'Scribe',   icon: AudioLines },
  { id: 'evidence', label: 'Evidence', icon: EvidenceIcon },
  { id: 'comms',    label: 'Comms',    icon: Phone },
  { id: 'tasks',    label: 'Tasks',    icon: TasksIcon },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const

type NavId = typeof NAV_ITEMS[number]['id']

interface MobileNavProps {
  active?: NavId
}

export function MobileNav({ active = 'comms' }: MobileNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#f7f1ee] border-t border-[#e2d3d8] flex items-stretch safe-bottom">
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
        const isActive = id === active
        return (
          <button
            key={id}
            aria-label={label}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors',
              isActive ? 'text-[#3d1520]' : 'text-[#a08090]',
            )}
          >
            <Icon
              className={cn('h-5 w-5', isActive ? 'text-[#3d1520]' : 'text-[#b09aa2]')}
              strokeWidth={isActive ? 2 : 1.5}
            />
            <span>{label}</span>
            {isActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-[#4c2934]" />
            )}
          </button>
        )
      })}
    </nav>
  )
}
