import React from 'react'
import { HEIDI } from '../lib/colors'
import { UrgencyBadge } from './UrgencyBadge'

export interface VoicemailData {
  callerName: string
  callbackNumber: string
  urgency: 'urgent' | 'high' | 'routine'
  summary: string
  intentCode: string
  duration: string
  active?: boolean
}

interface VoicemailCardProps {
  data: VoicemailData
  style?: React.CSSProperties
}

export const VoicemailCard: React.FC<VoicemailCardProps> = ({ data, style }) => {
  return (
    <div
      style={{
        background: data.active ? HEIDI.activeItem : HEIDI.white,
        border: `1px solid ${data.active ? HEIDI.border : '#ede8e5'}`,
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        ...style,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: HEIDI.darkText, marginBottom: 2 }}>
            {data.callerName}
          </div>
          <div style={{ fontSize: 12, color: HEIDI.muted }}>
            {data.callbackNumber} · {data.duration}
          </div>
        </div>
        <UrgencyBadge urgency={data.urgency} size="sm" />
      </div>

      <div style={{ fontSize: 13, color: HEIDI.darkText, lineHeight: 1.45 }}>
        {data.summary}
      </div>

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 11,
          color: HEIDI.muted,
          fontWeight: 500,
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
        }}
      >
        <span>{data.intentCode}</span>
      </div>
    </div>
  )
}
