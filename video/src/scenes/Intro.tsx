/**
 * Scene 2: Intro — frames 325-525
 * Stat reveal: "Listening to every one takes 40 minutes."
 * Transition to: "What if you never had to listen to a single one?"
 */
import React from 'react'
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { HEIDI } from '../lib/colors'
import { AnimatedBlock } from '../components/AnimatedText'

export const Intro: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Fade in / out relative to this scene's local frame (offset applied by Sequence)
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })
  const fadeOut = interpolate(frame, [165, 200], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Counter animates from 0 → 40 over first 80 frames
  const countProgress = spring({ frame, fps, config: { damping: 30, stiffness: 60 }, durationInFrames: 80 })
  const minutes = Math.round(interpolate(countProgress, [0, 1], [0, 40]))

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: HEIDI.sidebarBg,
        opacity: opacity * fadeOut,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        gap: 0,
      }}
    >
      {/* Big stat */}
      <AnimatedBlock delay={10} direction="up">
        <div
          style={{
            fontSize: 130,
            fontWeight: 800,
            color: HEIDI.brand,
            lineHeight: 1,
            textAlign: 'center',
          }}
        >
          {minutes}
          <span style={{ fontSize: 48, fontWeight: 400, color: HEIDI.muted, marginLeft: 8 }}>min</span>
        </div>
      </AnimatedBlock>

      <AnimatedBlock delay={30}>
        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            color: HEIDI.darkText,
            textAlign: 'center',
            marginTop: 12,
            maxWidth: 520,
            lineHeight: 1.35,
          }}
        >
          to listen to 12 voicemails
          <br />
          <span style={{ color: HEIDI.muted, fontSize: 22 }}>before the first patient walks in</span>
        </div>
      </AnimatedBlock>

      {/* Divider + second question */}
      <AnimatedBlock delay={80}>
        <div
          style={{
            width: 48,
            height: 2,
            background: HEIDI.border,
            margin: '36px auto',
          }}
        />
      </AnimatedBlock>

      <AnimatedBlock delay={100}>
        <div
          style={{
            fontSize: 26,
            fontWeight: 600,
            color: HEIDI.darkText,
            textAlign: 'center',
            maxWidth: 560,
            lineHeight: 1.4,
          }}
        >
          What if you never had to listen
          <br />
          to a single one?
        </div>
      </AnimatedBlock>
    </div>
  )
}
