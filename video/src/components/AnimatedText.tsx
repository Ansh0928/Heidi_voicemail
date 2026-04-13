import React from 'react'
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion'

interface AnimatedTextProps {
  children: React.ReactNode
  delay?: number          // frame to start animation
  style?: React.CSSProperties
  direction?: 'up' | 'left' | 'fade'
  durationInFrames?: number
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  delay = 0,
  style,
  direction = 'up',
  durationInFrames = 20,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const localFrame = Math.max(0, frame - delay)

  const progress = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, stiffness: 120 },
    durationInFrames,
  })

  const opacity = interpolate(localFrame, [0, durationInFrames * 0.6], [0, 1], {
    extrapolateRight: 'clamp',
  })

  const translateY = direction === 'up'
    ? interpolate(progress, [0, 1], [24, 0])
    : 0

  const translateX = direction === 'left'
    ? interpolate(progress, [0, 1], [-30, 0])
    : 0

  return (
    <span
      style={{
        display: 'inline-block',
        opacity,
        transform: `translateY(${translateY}px) translateX(${translateX}px)`,
        ...style,
      }}
    >
      {children}
    </span>
  )
}

// Block version for full div elements
export const AnimatedBlock: React.FC<AnimatedTextProps> = ({
  children,
  delay = 0,
  style,
  direction = 'up',
  durationInFrames = 20,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const localFrame = Math.max(0, frame - delay)

  const progress = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, stiffness: 120 },
    durationInFrames,
  })

  const opacity = interpolate(localFrame, [0, durationInFrames * 0.6], [0, 1], {
    extrapolateRight: 'clamp',
  })

  const translateY = direction === 'up'
    ? interpolate(progress, [0, 1], [24, 0])
    : 0

  const translateX = direction === 'left'
    ? interpolate(progress, [0, 1], [-30, 0])
    : 0

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px) translateX(${translateX}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
