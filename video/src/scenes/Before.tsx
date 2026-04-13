/**
 * Scene 1: Before — frames 0-350
 * Dark, unstructured. Simulates the clinic receptionist's overwhelmed inbox:
 * a wall of unlabelled voicemails, no urgency signal.
 */
import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'
import { HEIDI } from '../lib/colors'
import { AnimatedBlock } from '../components/AnimatedText'

const MOCK_VOICEMAILS = [
  { time: '7:02 AM', caller: 'Unknown', duration: '1:43' },
  { time: '7:14 AM', caller: '+61 7 3XXX XXXX', duration: '0:58' },
  { time: '7:29 AM', caller: 'Unknown', duration: '2:11' },
  { time: '7:31 AM', caller: '+61 7 4XXX XXXX', duration: '1:07' },
  { time: '7:44 AM', caller: 'Unknown', duration: '0:44' },
  { time: '7:52 AM', caller: '+61 4XX XXX XXX', duration: '3:02' },
  { time: '8:00 AM', caller: 'Unknown', duration: '1:21' },
  { time: '8:05 AM', caller: '+61 7 3XXX XXXX', duration: '0:37' },
  { time: '8:09 AM', caller: 'Unknown', duration: '2:48' },
  { time: '8:11 AM', caller: '+61 4XX XXX XXX', duration: '1:14' },
  { time: '8:19 AM', caller: 'Unknown', duration: '0:55' },
  { time: '8:23 AM', caller: '+61 7 4XXX XXXX', duration: '1:39' },
]

export const Before: React.FC = () => {
  const frame = useCurrentFrame()

  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })
  const fadeOut = interpolate(frame, [310, 350], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#0f0407',
        opacity: opacity * fadeOut,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: 60,
      }}
    >
      <AnimatedBlock delay={10} style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 28, fontWeight: 300, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
          Monday morning, 8:23 AM
        </div>
        <div style={{ fontSize: 42, fontWeight: 700, color: '#fff' }}>
          12 voicemails are waiting.
        </div>
      </AnimatedBlock>

      <AnimatedBlock delay={30} style={{ width: '100%', maxWidth: 600 }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr 60px',
              padding: '10px 18px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              fontSize: 12,
              color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            <span>Time</span>
            <span>Caller</span>
            <span>Length</span>
          </div>
          {MOCK_VOICEMAILS.map((vm, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 60px',
                padding: '11px 18px',
                borderBottom: i < MOCK_VOICEMAILS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                fontSize: 14,
                color: 'rgba(255,255,255,0.55)',
                alignItems: 'center',
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>{vm.time}</span>
              <span>{vm.caller}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>{vm.duration}</span>
            </div>
          ))}
        </div>
      </AnimatedBlock>

      <AnimatedBlock delay={60} style={{ marginTop: 24 }}>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
          No urgency. No context. No summary.
        </div>
      </AnimatedBlock>
    </div>
  )
}
