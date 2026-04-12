import { INTENT_LABELS } from '@/lib/urgency'
import type { IntentCode } from '@/types/voicemail'
import { cn } from '@/lib/utils'

interface IntentTagProps {
  intent: IntentCode
  className?: string
}

export function IntentTag({ intent, className }: IntentTagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
        'bg-[#f9f4f1] text-[#8a7078] border border-[#d4c4c9]',
        className,
      )}
    >
      {INTENT_LABELS[intent]}
    </span>
  )
}
