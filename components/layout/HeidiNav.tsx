'use client'

import { Phone, ChevronDown, Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeidiNavProps {
  clinicName?: string
}

export function HeidiNav({ clinicName = 'Harbour to Sunset GP' }: HeidiNavProps) {
  return (
    <nav className="sticky top-0 z-50 border-b bg-[#fcfaf8] border-[#d4c4c9]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Wordmark */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] font-semibold text-[#28030f] tracking-tight">heidi</span>
              <span className="text-[#d4c4c9] text-sm">/</span>
              <div className="flex items-center gap-1 text-[#28030f]">
                <Phone className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span className="text-[15px] font-semibold tracking-tight">calls</span>
              </div>
            </div>

            <div className="hidden sm:block h-4 w-px bg-[#d4c4c9]" />

            {/* Clinic selector */}
            <button className="hidden sm:flex items-center gap-1.5 text-sm text-[#8a7078] hover:text-[#28030f] transition-colors">
              <span>{clinicName}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1">
            <button className="relative p-2 rounded-md text-[#8a7078] hover:text-[#28030f] hover:bg-[#f5ede8] transition-colors">
              <Bell className="h-4 w-4" strokeWidth={1.75} />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#dc2626]" />
            </button>
            <button className="ml-1 flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-[#8a7078] hover:text-[#28030f] hover:bg-[#f5ede8] transition-colors">
              <div className="h-6 w-6 rounded-full bg-[#28030f] flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-[#f9f4f1]" strokeWidth={1.75} />
              </div>
              <span className="hidden sm:block">Shaz B.</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
