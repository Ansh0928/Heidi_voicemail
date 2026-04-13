'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronRight, ChevronDown, PanelLeft, Plus, Globe, Settings, HelpCircle, Bell, Phone, AudioLines, Blocks, Building, MapPin, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ClinicFilter } from '@/app/voicemails/page'

// Heidi brand mark — exact SVG paths from heidihealth.com
function HeidiMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 37 37" fill="currentColor" className={className} width="32" height="32" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path d="M36.8261 11.0202C36.5807 5.52687 32.1015 1.06293 26.5656 0.794546C23.8556 0.662055 21.3502 1.52325 19.3867 3.04011C18.9674 3.36454 18.3726 3.36454 17.9516 3.04011C15.9881 1.52155 13.4827 0.662055 10.7727 0.794546C5.23676 1.06293 0.757592 5.52687 0.510453 11.0202C0.389441 13.7244 1.27914 16.2179 2.83526 18.1645C3.17102 18.5858 3.17102 19.1854 2.83526 19.6049C1.28084 21.5532 0.391145 24.0468 0.510453 26.751C0.755887 32.2443 5.23335 36.7082 10.771 36.9783C13.481 37.1108 15.9864 36.2496 17.9499 34.7327C18.3692 34.4083 18.964 34.4083 19.385 34.7327C21.3485 36.2496 23.8539 37.1091 26.5639 36.9783C32.0998 36.7099 36.579 32.2443 36.8244 26.751C36.9455 24.0468 36.0558 21.5532 34.4996 19.6066C34.1639 19.1854 34.1639 18.5858 34.4996 18.1662C36.0558 16.2213 36.9455 13.7261 36.8244 11.0219L36.8261 11.0202ZM31.9055 19.3875C34.1775 21.5006 35.345 24.7704 34.4519 28.2509C33.6594 31.3287 31.2136 33.7544 28.1115 34.5391C24.6005 35.4258 21.3059 34.2673 19.1754 32.0099C18.901 31.7194 18.4391 31.7194 18.1646 32.0099C16.0341 34.2656 12.7395 35.4258 9.22847 34.5391C6.12475 33.7561 3.67894 31.3287 2.88809 28.2509C1.99328 24.7704 3.1625 21.5023 5.43447 19.3875C5.72763 19.1157 5.72763 18.6571 5.43447 18.3853C3.1625 16.2723 1.99499 13.0024 2.88809 9.522C3.68064 6.44412 6.12646 4.01851 9.22847 3.23375C12.7395 2.34707 16.0341 3.50553 18.1646 5.76298C18.4391 6.05344 18.901 6.05344 19.1754 5.76298C21.3059 3.50722 24.6005 2.34707 28.1115 3.23375C31.2153 4.01681 33.6611 6.44412 34.4519 9.522C35.3467 13.0024 34.1775 16.2723 31.9055 18.3853C31.6124 18.6571 31.6124 19.1157 31.9055 19.3875Z" />
      <path d="M26.521 6.22169C24.6632 6.22169 23.0287 7.15422 22.0402 8.77809C21.2596 10.0588 20.7482 11.4789 20.5846 14.3699C20.5488 14.9984 20.0307 15.4927 19.3983 15.5012C19.1614 15.5046 18.9194 15.5063 18.6672 15.5063C18.4149 15.5063 18.1712 15.5063 17.936 15.5012C17.3036 15.4927 16.7838 14.9984 16.7497 14.3699C16.5861 11.4772 16.0731 10.0571 15.2942 8.77809C14.3039 7.15422 12.6711 6.22169 10.8133 6.22169C8.63676 6.22169 6.19946 8.17848 6.19946 10.796C6.19946 12.9584 7.28687 14.8489 9.18217 15.9785C10.9888 17.0554 13.2046 17.723 18.6689 17.723C24.1332 17.723 26.3489 17.0554 28.1556 15.9785C30.0509 14.8489 31.1383 12.9601 31.1383 10.796C31.1383 8.17848 28.7027 6.22169 26.5245 6.22169H26.521ZM10.3275 14.0795C8.67425 13.0943 8.42882 11.5995 8.42882 10.7977C8.42882 9.52718 9.7361 8.44007 10.8082 8.44007C11.8802 8.44007 12.7853 8.95305 13.3767 9.92635C13.9869 10.9302 14.3908 12.0972 14.5221 14.606C14.5408 14.9865 14.2067 15.2872 13.8267 15.2311C11.9757 14.9593 11.0706 14.5228 10.3292 14.0812H10.3275V14.0795ZM27.0017 14.0795C26.2603 14.5228 25.3535 14.9593 23.5043 15.2294C23.1242 15.2838 22.7901 14.9831 22.8089 14.6043C22.9401 12.0972 23.3423 10.9285 23.9542 9.92466C24.5456 8.95305 25.4336 8.43837 26.5227 8.43837C27.6119 8.43837 28.9021 9.52718 28.9021 10.796C28.9021 11.5995 28.655 13.0926 27.0034 14.0778L27.0017 14.0795Z" />
      <path d="M10.8147 31.5495C12.6725 31.5495 14.3071 30.6169 15.2956 28.9931C16.0762 27.7123 16.5875 26.2923 16.7512 23.4013C16.787 22.7728 17.3051 22.2785 17.9374 22.27C18.1743 22.2666 18.4164 22.2649 18.6686 22.2649C18.9209 22.2649 19.1629 22.2649 19.3998 22.27C20.0321 22.2785 20.552 22.7728 20.5861 23.4013C20.7497 26.294 21.2627 27.714 22.0416 28.9931C23.0319 30.6169 24.6647 31.5495 26.5225 31.5495C28.699 31.5495 31.1363 29.5927 31.1363 26.9751C31.1363 24.8128 30.0489 22.9222 28.1536 21.7927C26.3469 20.7158 24.1312 20.0482 18.6669 20.0482C13.2026 20.0482 10.9869 20.7158 9.18021 21.7927C7.28492 22.9222 6.19751 24.8111 6.19751 26.9751C6.19751 29.5927 8.6331 31.5495 10.8113 31.5495H10.8147ZM27.01 23.6917C28.6632 24.6769 28.9087 26.1717 28.9087 26.9734C28.9087 28.244 27.6014 29.3311 26.5293 29.3311C25.4572 29.3311 24.5522 28.8181 23.9608 27.8448C23.3506 26.8409 22.9467 25.6723 22.8154 23.1651C22.7967 22.7847 23.1307 22.484 23.5108 22.5401C25.3618 22.8118 26.2668 23.2484 27.0083 23.69H27.01V23.6917ZM10.3358 23.6917C11.0772 23.2484 11.984 22.8118 13.8332 22.5418C14.2133 22.4874 14.5474 22.7881 14.5286 23.1668C14.3974 25.674 13.9951 26.8426 13.3833 27.8465C12.7918 28.8181 11.9038 29.3345 10.8147 29.3345C9.72562 29.3345 8.43539 28.2457 8.43539 26.9768C8.43539 26.1734 8.68253 24.6803 10.3341 23.6951H10.3358V23.6917Z" />
    </svg>
  )
}

// Custom icon matching the "co" Evidence icon — a C-arc beside a full circle
function EvidenceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {/* "c" — open arc on the left */}
      <path d="M8 5.5a3.5 3.5 0 1 0 0 7" />
      {/* "o" — full circle on the right */}
      <circle cx="12" cy="9" r="3.5" />
    </svg>
  )
}

// Custom icon matching the "□≡" Tasks icon — small square checkbox + line, two rows
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

/** Demo shell user — single source for sidebar profile + debug audit */
const SIDEBAR_PROFILE = {
  initials: 'SB',
  displayName: 'Shaz Brahmavar',
  email: 'shaz@harbourgp.com',
} as const

let __heiSidebarMountSeq = 0

interface NavItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  hasArrow?: boolean
  collapsed?: boolean
  badge?: number
  sub?: boolean
}

function NavItem({ icon, label, active, hasArrow, collapsed, badge, sub }: NavItemProps) {
  return (
    <button
      className={cn(
        'w-full flex items-center gap-2.5 rounded-lg text-[13.5px] transition-colors',
        sub ? 'pl-8 pr-3 py-2' : 'px-3 py-2.5',
        active
          ? 'bg-[#f0e2d8] text-[#3d1520] font-medium'
          : 'text-[#5a3340] hover:bg-[#ede4df] hover:text-[#3d1520]',
        collapsed && 'justify-center px-2'
      )}
    >
      {!sub && <span className={cn('shrink-0', active ? 'text-[#3d1520]' : 'text-[#8a6470]')}>{icon}</span>}
      {sub && !collapsed && <Phone className="h-3.5 w-3.5 shrink-0 text-[#8a6470]" strokeWidth={1.5}/>}
      {!collapsed && (
        <>
          <span className="flex-1 text-left leading-none">{label}</span>
          {badge !== undefined && (
            <span className="ml-auto shrink-0 rounded-full bg-[#4c2934] text-[#f9f4f1] text-[10px] font-semibold px-1.5 py-0.5 leading-none">
              {badge}
            </span>
          )}
          {hasArrow && !badge && (
            <ChevronRight className="h-3.5 w-3.5 text-[#b09aa2] shrink-0" strokeWidth={1.75} />
          )}
        </>
      )}
    </button>
  )
}

function SectionHeader({ label, collapsed }: { label: string; collapsed?: boolean }) {
  if (collapsed) return <div className="h-px bg-[#e4d5d9] mx-2 my-2" />
  return (
    <p className="px-3 pt-3 pb-0.5 text-[11.5px] font-medium text-[#a08090] select-none">
      {label}
    </p>
  )
}

interface HeiSidebarProps {
  selectedClinic: ClinicFilter
  onClinicChange: (clinic: ClinicFilter) => void
}

export function HeiSidebar({ selectedClinic, onClinicChange }: HeiSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [clinicOpen, setClinicOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setClinicOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // #region agent log
  useEffect(() => {
    __heiSidebarMountSeq += 1
    const seq = __heiSidebarMountSeq
    const profile = SIDEBAR_PROFILE
    const raf = requestAnimationFrame(() => {
      const el = document.querySelector('[data-audit="sidebar-profile"]') as HTMLElement | null
      const domSnapshot = el?.innerText?.replace(/\s+/g, ' ').trim() ?? null
      fetch('http://127.0.0.1:7546/ingest/7e31a13d-614d-4700-af67-b2ef74602912', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'b883d9' },
        body: JSON.stringify({
          sessionId: 'b883d9',
          hypothesisId: 'H1-H3-H5',
          location: 'HeiSidebar.tsx:audit',
          message: 'sidebar profile runtime audit',
          data: {
            mountSeq: seq,
            collapsed,
            sourceProfile: profile,
            domSnapshot,
            domIncludesExpectedName: domSnapshot?.includes(profile.displayName) ?? false,
            domIncludesInitials: domSnapshot?.includes(profile.initials) ?? false,
            auditNote: collapsed
              ? 'H3: collapsed — DOM may omit full name/email'
              : 'expanded — expect full name in DOM snapshot',
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {})
    })
    return () => cancelAnimationFrame(raf)
  }, [collapsed])
  // #endregion

  const currentClinic = CLINICS.find(c => c.value === selectedClinic) ?? CLINICS[0]

  return (
    <aside
      className={cn(
        'flex flex-col h-screen sticky top-0 border-r border-[#e2d3d8] transition-all duration-200 shrink-0 overflow-hidden',
        'bg-[#f7f1ee]',
        collapsed ? 'w-[56px]' : 'w-[220px]'
      )}
    >
      {/* Logo row */}
      <div className={cn(
        'flex items-center px-3 pt-4 pb-2',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <HeidiMark className="h-8 w-8 text-[#3d1520]" />
            <span className="text-[20px] font-semibold text-[#3d1520] tracking-normal" style={{ fontFamily: 'var(--font-brand, "Cormorant Garamond", Georgia, serif)' }}>Heidi</span>
          </div>
        )}
        {collapsed && <HeidiMark className="h-7 w-7 text-[#3d1520]" />}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 rounded-md text-[#a08090] hover:text-[#3d1520] hover:bg-[#ede4df] transition-colors"
            aria-label="Collapse sidebar"
          >
            <PanelLeft className="h-4 w-4" strokeWidth={1.75} />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto mb-1 p-1.5 rounded-md text-[#a08090] hover:text-[#3d1520] hover:bg-[#ede4df] transition-colors"
          aria-label="Expand sidebar"
        >
          <PanelLeft className="h-4 w-4 rotate-180" strokeWidth={1.75} />
        </button>
      )}

      {/* Clinic selector */}
      {!collapsed && (
        <div className="px-2 pb-1" ref={dropdownRef}>
          <div className="relative">
            <button
              onClick={() => setClinicOpen(o => !o)}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12.5px] text-[#5a3340] hover:bg-[#ede4df] transition-colors"
            >
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#8a6470]" strokeWidth={1.75} />
              <span className="flex-1 text-left truncate font-medium">{currentClinic.label}</span>
              <ChevronDown className={cn('h-3.5 w-3.5 text-[#b09aa2] shrink-0 transition-transform', clinicOpen && 'rotate-180')} strokeWidth={1.75} />
            </button>

            {clinicOpen && (
              <div className="absolute top-full left-0 right-0 mt-0.5 bg-white border border-[#e2d3d8] rounded-lg shadow-md z-50 py-1 overflow-hidden">
                {CLINICS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => { onClinicChange(c.value); setClinicOpen(false) }}
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
      )}

      {/* New session button */}
      <div className="px-2 pb-2 pt-1">
        <button
          className={cn(
            'w-full flex items-center gap-2 bg-[#4c2934] hover:bg-[#3d1f28] text-[#f9f4f1] rounded-lg text-[13.5px] font-medium transition-colors',
            collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'
          )}
        >
          <Plus className="h-4 w-4 shrink-0" strokeWidth={2.25} />
          {!collapsed && <span>New session</span>}
        </button>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        <NavItem icon={<AudioLines className="h-[18px] w-[18px]" strokeWidth={1.5} />} label="Scribe" hasArrow collapsed={collapsed} />
        <NavItem icon={<EvidenceIcon className="h-[18px] w-[18px]" />} label="Evidence" collapsed={collapsed} />
        <NavItem icon={<TasksIcon className="h-[18px] w-[18px]" />} label="Tasks" collapsed={collapsed} />
        <NavItem icon={<Phone className="h-[18px] w-[18px]" strokeWidth={1.5} />} label="Comms" active collapsed={collapsed} />

        <SectionHeader label="My Library" collapsed={collapsed} />
        <NavItem icon={<Blocks className="h-[18px] w-[18px]" strokeWidth={1.5} />} label="My Templates" collapsed={collapsed} />

        <SectionHeader label="Community" collapsed={collapsed} />
        <NavItem icon={<Globe className="h-[18px] w-[18px]" strokeWidth={1.5} />} label="Templates" collapsed={collapsed} />
        <NavItem icon={<Building className="h-[18px] w-[18px]" strokeWidth={1.5} />} label="Team" collapsed={collapsed} />
        <NavItem icon={<Settings className="h-[18px] w-[18px]" strokeWidth={1.5} />} label="Settings" collapsed={collapsed} />
      </nav>

      {/* Bottom */}
      <div className="px-2 pt-2 pb-3 space-y-0.5 border-t border-[#e2d3d8]">
        <NavItem icon={<HelpCircle className="h-[18px] w-[18px]" strokeWidth={1.5} />} label="Help" collapsed={collapsed} />
        <NavItem icon={<Bell className="h-[18px] w-[18px]" strokeWidth={1.5} />} label="Notifications" collapsed={collapsed} />

        <button
          type="button"
          data-audit="sidebar-profile"
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#ede4df] transition-colors',
            collapsed && 'justify-center px-2'
          )}
        >
          <div className="h-7 w-7 rounded-full bg-[#4c2934] flex items-center justify-center shrink-0">
            <span className="text-[#f9f4f1] text-[10px] font-bold tracking-tight">{SIDEBAR_PROFILE.initials}</span>
          </div>
          {!collapsed && (
            <div className="text-left min-w-0">
              <p className="text-[13px] font-medium text-[#3d1520] truncate leading-tight">{SIDEBAR_PROFILE.displayName}</p>
              <p className="text-[11px] text-[#a08090] truncate">{SIDEBAR_PROFILE.email}</p>
            </div>
          )}
        </button>
      </div>
    </aside>
  )
}
