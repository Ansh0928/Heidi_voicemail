import { URGENCY_CONFIG } from '@/lib/urgency'
import type { UrgencyLevel } from '@/types/voicemail'
import { cn } from '@/lib/utils'

interface UrgencyBadgeProps {
  urgency: UrgencyLevel
  className?: string
  size?: 'sm' | 'md'
}

export function UrgencyBadge({ urgency, className, size = 'md' }: UrgencyBadgeProps) {
  const config = URGENCY_CONFIG[urgency]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded font-mono font-semibold tracking-wider uppercase',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]',
        config.pillClass,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
