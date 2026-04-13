/**
 * Scene 4: Dashboard — frames 945-1650 (705 local frames)
 * Real screenshots of the running app with animated callouts.
 *
 * Phase 1 (0-200):   Full inbox view fades in, Sunita card highlighted
 * Phase 2 (200-400): Cross-fade to Dorothy Lim detail view
 * Phase 3 (400-705): Detail view holds with callout annotations
 */
import React from 'react'
import { useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from 'remotion'
import { HEIDI } from '../lib/colors'

// ── Callout bubble ──────────────────────────────────────────────────────────
interface CalloutProps {
  x: number            // % from left
  y: number            // % from top
  text: string
  delay: number
  side?: 'left' | 'right'
}

const Callout: React.FC<CalloutProps> = ({ x, y, text, delay, side = 'right' }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const localFrame = Math.max(0, frame - delay)
  const progress = spring({ frame: localFrame, fps, config: { damping: 20, stiffness: 120 }, durationInFrames: 22 })
  const opacity = interpolate(localFrame, [0, 15], [0, 1], { extrapolateRight: 'clamp' })
  const scale = interpolate(progress, [0, 1], [0.7, 1])

  const offsetX = side === 'right' ? 12 : -12
  const translateX = interpolate(progress, [0, 1], [offsetX, 0])

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        opacity,
        transform: `translateX(${translateX}px) scale(${scale})`,
        transformOrigin: side === 'right' ? 'left center' : 'right center',
        pointerEvents: 'none',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexDirection: side === 'right' ? 'row' : 'row-reverse',
      }}
    >
      {/* dot */}
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: HEIDI.urgentRed,
          boxShadow: `0 0 0 4px ${HEIDI.urgentRed}44`,
          flexShrink: 0,
        }}
      />
      {/* bubble */}
      <div
        style={{
          background: HEIDI.brand,
          color: '#fff',
          fontSize: 14,
          fontWeight: 600,
          padding: '7px 14px',
          borderRadius: 8,
          whiteSpace: 'nowrap',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        }}
      >
        {text}
      </div>
    </div>
  )
}

// ── Highlight ring ─────────────────────────────────────────────────────────
interface HighlightProps {
  x: number; y: number; w: number; h: number; delay: number
}

const Highlight: React.FC<HighlightProps> = ({ x, y, w, h, delay }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const localFrame = Math.max(0, frame - delay)
  const progress = spring({ frame: localFrame, fps, config: { damping: 18, stiffness: 100 }, durationInFrames: 25 })
  const opacity = interpolate(localFrame, [0, 12], [0, 1], { extrapolateRight: 'clamp' })
  const scale = interpolate(progress, [0, 1], [1.04, 1])

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: `${w}%`,
        height: `${h}%`,
        opacity,
        transform: `scale(${scale})`,
        border: `2.5px solid ${HEIDI.urgentRed}`,
        borderRadius: 8,
        boxShadow: `0 0 0 3px ${HEIDI.urgentRed}22, inset 0 0 0 1px ${HEIDI.urgentRed}11`,
        pointerEvents: 'none',
        zIndex: 5,
      }}
    />
  )
}

// ── Main scene ─────────────────────────────────────────────────────────────
export const Dashboard: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })
  const fadeOut = interpolate(frame, [665, 705], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Phase 1 → 2 cross-fade: inbox fades out, detail fades in
  const inboxOpacity = interpolate(frame, [170, 220], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const detailOpacity = interpolate(frame, [190, 240], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Subtle zoom on the inbox to guide eye to Dorothy's card before crossfade
  const inboxScale = interpolate(frame, [0, 200], [1, 1.06], { extrapolateRight: 'clamp' })
  const inboxOriginY = 32  // % — roughly where Dorothy's card sits

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#000',
        opacity: fadeIn * fadeOut,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* ── Phase 1: Full inbox ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: inboxOpacity,
          transform: `scale(${inboxScale})`,
          transformOrigin: `50% ${inboxOriginY}%`,
        }}
      >
        <Img
          src={staticFile('screenshots/01-inbox.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left' }}
        />

        {/* Highlight Dorothy Lim's card */}
        <Highlight x={18.5} y={26} w={27.5} h={10.5} delay={30} />

        {/* Callouts */}
        <Callout x={47} y={27} text="Urgent — chest pain" delay={45} side="right" />
        <Callout x={47} y={12} text="4 urgent this morning" delay={80} side="right" />
        <Callout x={47} y={42} text="Auto-triaged by urgency" delay={110} side="right" />
      </div>

      {/* ── Phase 2: Dorothy Lim detail view ── */}
      <div style={{ position: 'absolute', inset: 0, opacity: detailOpacity }}>
        <Img
          src={staticFile('screenshots/02-dorothy-urgent.png')}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left' }}
        />

        {/* Highlight AI Summary section */}
        <Highlight x={37} y={23} w={36} h={13} delay={250} />
        <Callout x={74} y={25} text="AI-written summary" delay={265} side="right" />

        {/* Highlight next step */}
        <Highlight x={37} y={9} w={36} h={8} delay={320} />
        <Callout x={74} y={10} text="Recommended next action" delay={335} side="right" />

        {/* Highlight resolve / callback buttons */}
        <Highlight x={37} y={87} w={36} h={6} delay={390} />
        <Callout x={74} y={88} text="One-click resolve or callback" delay={405} side="right" />
      </div>
    </div>
  )
}
