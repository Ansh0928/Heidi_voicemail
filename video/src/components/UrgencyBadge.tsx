import React from 'react'
import { HEIDI } from '../lib/colors'

type Urgency = 'urgent' | 'high' | 'routine'

interface UrgencyBadgeProps {
  urgency: Urgency
  size?: 'sm' | 'md'
}

const CONFIG: Record<Urgency, { label: string; bg: string; color: string; dot: string }> = {
  urgent:  { label: 'Urgent',  bg: HEIDI.urgentBg,  color: HEIDI.urgentRed,   dot: HEIDI.urgentRed },
  high:    { label: 'High',    bg: HEIDI.highBg,    color: HEIDI.highOrange,  dot: HEIDI.highOrange },
  routine: { label: 'Routine', bg: HEIDI.routineBg, color: HEIDI.routineBlue, dot: HEIDI.routineBlue },
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ urgency, size = 'md' }) => {
  const c = CONFIG[urgency]
  const fontSize = size === 'sm' ? 11 : 13
  const padding = size === 'sm' ? '2px 8px' : '3px 10px'
  const dotSize = size === 'sm' ? 6 : 7

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: c.bg,
        color: c.color,
        fontSize,
        fontWeight: 600,
        borderRadius: 20,
        padding,
        letterSpacing: '0.02em',
      }}
    >
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          background: c.dot,
          flexShrink: 0,
        }}
      />
      {c.label}
    </span>
  )
}
