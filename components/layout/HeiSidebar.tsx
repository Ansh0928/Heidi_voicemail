'use client'

import { useState } from 'react'
import { ChevronRight, PanelLeft, Plus, Globe, Settings, HelpCircle, Bell, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

// Real Heidi brand mark — approximates the infinity/knot logo
function HeidiMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
      {/* Left lobe */}
      <path d="M9 18 C9 12 14 9 18 12 C22 15 22 21 18 24 C14 27 9 24 9 18Z" stroke="currentColor" strokeWidth="2" fill="none"/>
      {/* Right lobe */}
      <path d="M27 18 C27 12 22 9 18 12 C14 15 14 21 18 24 C22 27 27 24 27 18Z" stroke="currentColor" strokeWidth="2" fill="none"/>
      {/* Centre crossings */}
      <circle cx="18" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  )
}

// Custom icons matching Heidi's stroke style
function ScribeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
      <rect x="2.5" y="11" width="1.5" height="5" rx=".75" fill="currentColor" opacity=".45"/>
      <rect x="5.75" y="8" width="1.5" height="8" rx=".75" fill="currentColor" opacity=".65"/>
      <rect x="9" y="4.5" width="1.5" height="11.5" rx=".75" fill="currentColor"/>
      <rect x="12.25" y="8" width="1.5" height="8" rx=".75" fill="currentColor" opacity=".65"/>
      <rect x="15.5" y="11" width="1.5" height="5" rx=".75" fill="currentColor" opacity=".45"/>
    </svg>
  )
}

function EvidenceIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}

function TasksIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
      {/* Check boxes */}
      <rect x="2.5" y="4.5" width="3.5" height="3.5" rx=".75" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M3.5 6.5l.8.8 1.6-1.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="2.5" y="10" width="3.5" height="3.5" rx=".75" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="2.5" y="15.5" width="3.5" height="3.5" rx=".75" stroke="currentColor" strokeWidth="1.4"/>
      {/* Lines */}
      <rect x="8.5" y="5.75" width="9" height="1.25" rx=".625" fill="currentColor" opacity=".5"/>
      <rect x="8.5" y="11.25" width="9" height="1.25" rx=".625" fill="currentColor" opacity=".5"/>
      <rect x="8.5" y="16.75" width="9" height="1.25" rx=".625" fill="currentColor" opacity=".5"/>
    </svg>
  )
}

function CommsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
      <path
        d="M4 5.5C4 4.672 4.672 4 5.5 4h9C15.328 4 16 4.672 16 5.5v7c0 .828-.672 1.5-1.5 1.5H7.5L4 15.5V5.5z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
      />
      <circle cx="7.5" cy="9" r="1" fill="currentColor"/>
      <circle cx="10" cy="9" r="1" fill="currentColor"/>
      <circle cx="12.5" cy="9" r="1" fill="currentColor"/>
    </svg>
  )
}

function TemplatesGridIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
      <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.25" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="11" y="2.5" width="6.5" height="6.5" rx="1.25" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.25" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="11" y="11" width="6.5" height="6.5" rx="1.25" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}

function TeamIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
      <rect x="1.5" y="3" width="17" height="3.5" rx=".75" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="1.5" y="8.25" width="17" height="3.5" rx=".75" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="1.5" y="13.5" width="17" height="3.5" rx=".75" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  )
}

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

interface SectionHeaderProps {
  label: string
  collapsed?: boolean
}

function SectionHeader({ label, collapsed }: SectionHeaderProps) {
  if (collapsed) return <div className="h-px bg-[#e4d5d9] mx-2 my-2" />
  return (
    <p className="px-3 pt-3 pb-0.5 text-[11.5px] font-medium text-[#a08090] select-none">
      {label}
    </p>
  )
}

export function HeiSidebar() {
  const [collapsed, setCollapsed] = useState(false)

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
            <span className="text-[17px] font-bold text-[#3d1520] tracking-tight">Heidi</span>
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
        <NavItem icon={<ScribeIcon />} label="Scribe" hasArrow collapsed={collapsed} />
        <NavItem icon={<EvidenceIcon />} label="Evidence" collapsed={collapsed} />
        <NavItem icon={<TasksIcon />} label="Tasks" collapsed={collapsed} />
        {/* Comms — active, expanded with Voicemail sub-item */}
        <NavItem icon={<CommsIcon />} label="Comms" active collapsed={collapsed} />
        {!collapsed && (
          <NavItem
            icon={null}
            label="Voicemail"
            active
            sub
            badge={3}
            collapsed={collapsed}
          />
        )}

        <SectionHeader label="My Library" collapsed={collapsed} />
        <NavItem icon={<TemplatesGridIcon />} label="My Templates" collapsed={collapsed} />

        <SectionHeader label="Community" collapsed={collapsed} />
        <NavItem icon={<Globe className="h-[18px] w-[18px]" strokeWidth={1.5} />} label="Templates" collapsed={collapsed} />
        <NavItem icon={<TeamIcon />} label="Team" collapsed={collapsed} />
        <NavItem icon={<Settings className="h-[18px] w-[18px]" strokeWidth={1.5} />} label="Settings" collapsed={collapsed} />
      </nav>

      {/* Bottom */}
      <div className="px-2 pt-2 pb-3 space-y-0.5 border-t border-[#e2d3d8]">
        <NavItem icon={<HelpCircle className="h-[18px] w-[18px]" strokeWidth={1.5} />} label="Help" collapsed={collapsed} />
        <NavItem icon={<Bell className="h-[18px] w-[18px]" strokeWidth={1.5} />} label="Notifications" collapsed={collapsed} />

        {/* User row */}
        <button
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#ede4df] transition-colors',
            collapsed && 'justify-center px-2'
          )}
        >
          <div className="h-7 w-7 rounded-full bg-[#4c2934] flex items-center justify-center shrink-0">
            <span className="text-[#f9f4f1] text-[11px] font-bold">S</span>
          </div>
          {!collapsed && (
            <div className="text-left min-w-0">
              <p className="text-[13px] font-medium text-[#3d1520] truncate leading-tight">Sarah Kim</p>
              <p className="text-[11px] text-[#a08090] truncate">sarah@harbourgp.com</p>
            </div>
          )}
        </button>
      </div>
    </aside>
  )
}
