/**
 * Scene 3: Pipeline — frames 505-965 (460 local frames)
 * Animated horizontal flow: Phone → Deepgram → Claude → Card
 * Each step appears with a staggered delay
 */
import React from 'react'
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { HEIDI } from '../lib/colors'
import { AnimatedBlock } from '../components/AnimatedText'

interface StepProps {
  icon: string
  label: string
  sublabel: string
  delay: number
  color: string
  bg: string
}

const Step: React.FC<StepProps> = ({ icon, label, sublabel, delay, color, bg }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const localFrame = Math.max(0, frame - delay)
  const progress = spring({ frame: localFrame, fps, config: { damping: 20, stiffness: 100 }, durationInFrames: 30 })
  const opacity = interpolate(localFrame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })
  const translateY = interpolate(progress, [0, 1], [30, 0])
  const scale = interpolate(progress, [0, 1], [0.85, 1])

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: bg,
          border: `2px solid ${color}22`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
        }}
      >
        {icon}
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: HEIDI.darkText }}>{label}</div>
        <div style={{ fontSize: 12, color: HEIDI.muted, marginTop: 3, maxWidth: 100, lineHeight: 1.3 }}>
          {sublabel}
        </div>
      </div>
    </div>
  )
}

const Arrow: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame()
  const opacity = interpolate(Math.max(0, frame - delay), [0, 20], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <div
      style={{
        opacity,
        display: 'flex',
        alignItems: 'center',
        paddingBottom: 24,
      }}
    >
      <div
        style={{
          width: 48,
          height: 2,
          background: HEIDI.border,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -6,
            top: -4,
            width: 0,
            height: 0,
            borderTop: '5px solid transparent',
            borderBottom: '5px solid transparent',
            borderLeft: `8px solid ${HEIDI.border}`,
          }}
        />
      </div>
    </div>
  )
}

const STEPS: StepProps[] = [
  { icon: '📞', label: 'Voicemail', sublabel: 'Patient leaves message', delay: 20, color: HEIDI.muted, bg: '#f5f0ee' },
  { icon: '🎤', label: 'Deepgram', sublabel: 'Speech → text in seconds', delay: 70, color: HEIDI.routineBlue, bg: HEIDI.routineBg },
  { icon: '🧠', label: 'Claude AI', sublabel: 'Extract intent + urgency', delay: 130, color: HEIDI.highOrange, bg: HEIDI.highBg },
  { icon: '📋', label: 'Action Card', sublabel: 'Ready for your team', delay: 190, color: HEIDI.brand, bg: HEIDI.activeItem },
]

export const Pipeline: React.FC = () => {
  const frame = useCurrentFrame()

  const fadeOut = interpolate(frame, [420, 460], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: HEIDI.white,
        opacity: fadeIn * fadeOut,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        gap: 40,
      }}
    >
      <AnimatedBlock delay={0}>
        <div style={{ fontSize: 32, fontWeight: 700, color: HEIDI.darkText, textAlign: 'center' }}>
          From voicemail to action card
          <br />
          <span style={{ fontSize: 20, fontWeight: 400, color: HEIDI.muted }}>
            in under 10 seconds
          </span>
        </div>
      </AnimatedBlock>

      {/* Pipeline row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {STEPS.map((step, i) => (
          <React.Fragment key={step.label}>
            <Step {...step} />
            {i < STEPS.length - 1 && <Arrow delay={step.delay + 25} />}
          </React.Fragment>
        ))}
      </div>

      {/* Under-the-hood note */}
      <AnimatedBlock delay={240}>
        <div
          style={{
            background: HEIDI.sidebarBg,
            border: `1px solid ${HEIDI.border}`,
            borderRadius: 12,
            padding: '12px 24px',
            fontSize: 14,
            color: HEIDI.muted,
            textAlign: 'center',
            maxWidth: 560,
          }}
        >
          Deepgram transcribes audio · Claude reads the transcript · intent codes assign
          urgency, callback flag, and a plain-English summary
        </div>
      </AnimatedBlock>
    </div>
  )
}
