/**
 * Scene 6: Result — frames 1845-2135 (290 local frames)
 * Real Heidi Comms stats. Counter lands on 50% call reduction.
 * Tagline: "Care beyond the visit."
 */
import React from 'react'
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { HEIDI } from '../lib/colors'
import { AnimatedBlock } from '../components/AnimatedText'

interface StatPillProps {
  value: string
  label: string
  sub: string
  delay: number
  accent: string
  accentBg: string
}

const StatPill: React.FC<StatPillProps> = ({ value, label, sub, delay, accent, accentBg }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const localFrame = Math.max(0, frame - delay)
  const progress = spring({ frame: localFrame, fps, config: { damping: 20, stiffness: 90 }, durationInFrames: 28 })
  const opacity = interpolate(localFrame, [0, 18], [0, 1], { extrapolateRight: 'clamp' })
  const translateY = interpolate(progress, [0, 1], [20, 0])

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 14,
        padding: '20px 24px',
        minWidth: 190,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div style={{ fontSize: 38, fontWeight: 800, color: accent, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginTop: 4 }}>{label}</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>{sub}</div>
    </div>
  )
}

export const Result: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })

  // "50%" animates as a counter 0→50 over frames 20-100
  const countProgress = spring({
    frame: Math.max(0, frame - 20),
    fps,
    config: { damping: 28, stiffness: 45 },
    durationInFrames: 80,
  })
  const percent = Math.round(interpolate(countProgress, [0, 1], [0, 50]))

  // Glow
  const glowOpacity = interpolate(countProgress, [0, 1], [0, 0.2])

  // Sub-copy
  const subOpacity = interpolate(Math.max(0, frame - 100), [0, 25], [0, 1], { extrapolateRight: 'clamp' })

  // Stats row
  const statsOpacity = interpolate(Math.max(0, frame - 120), [0, 20], [0, 1], { extrapolateRight: 'clamp' })

  // Tagline
  const taglineOpacity = interpolate(Math.max(0, frame - 185), [0, 25], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#0f0407',
        opacity: fadeIn,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        gap: 0,
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: '#22c55e',
          opacity: glowOpacity,
          filter: 'blur(140px)',
          pointerEvents: 'none',
        }}
      />

      {/* Label */}
      <AnimatedBlock delay={5}>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.35)', marginBottom: 10, letterSpacing: '0.05em', textAlign: 'center' }}>
          Clinics using Heidi Comms see
        </div>
      </AnimatedBlock>

      {/* Big counter */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, lineHeight: 1 }}>
        <span style={{ fontSize: 148, fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
          {percent}
        </span>
        <span style={{ fontSize: 72, fontWeight: 800, color: '#22c55e' }}>%</span>
      </div>

      {/* Sub label */}
      <div style={{ opacity: subOpacity, textAlign: 'center', marginTop: 6 }}>
        <div style={{ fontSize: 24, color: '#22c55e', fontWeight: 700 }}>
          reduction in call volumes
        </div>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
          Giving staff back time for patient care and reducing front-desk burnout
        </div>
      </div>

      {/* Stats grid */}
      <div
        style={{
          opacity: statsOpacity,
          display: 'flex',
          gap: 16,
          marginTop: 40,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <StatPill
          delay={125}
          value="25%"
          label="More new bookings"
          sub="Zero extra headcount"
          accent="#f97316"
          accentBg=""
        />
        <StatPill
          delay={148}
          value="45%"
          label="Less routine admin"
          sub="Team freed for high-value care"
          accent="#3b82f6"
          accentBg=""
        />
        <StatPill
          delay={171}
          value="24/7"
          label="Always-on coverage"
          sub="Calls, texts, and chat"
          accent="#a78bfa"
          accentBg=""
        />
        <StatPill
          delay={194}
          value="20%+"
          label="More revenue"
          sub="From automated follow-ups"
          accent="#22c55e"
          accentBg=""
        />
      </div>

      {/* Tagline */}
      <div
        style={{
          opacity: taglineOpacity,
          marginTop: 44,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '-0.01em',
          }}
        >
          Care beyond the visit.
        </div>
        <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
          heidihealth.com/en-au/comms
        </div>
      </div>

      {/* Testimonial bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 32,
          left: 0,
          right: 0,
          opacity: interpolate(Math.max(0, frame - 220), [0, 30], [0, 1], { extrapolateRight: 'clamp' }),
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
          "The calls our team takes now are way more meaningful, resulting in high-value patient care."
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>
          Dr. Max Mollenkopf · Practice Owner · Whitebridge Medical Centre
        </div>
      </div>
    </div>
  )
}
