import React from 'react'
import { useCurrentFrame, staticFile } from 'remotion'
import captionsData from '../assets/captions.json'

interface CaptionEntry {
  word: string
  startTime: number
  endTime: number
  startFrame: number
  endFrame: number
}

const captions = captionsData as CaptionEntry[]

// Build sentence-level windows: group words into ~8-word chunks
// We display all words in the current chunk, highlighting the active one
const WINDOW = 8

interface CaptionProps {
  style?: React.CSSProperties
}

export const Caption: React.FC<CaptionProps> = ({ style }) => {
  const frame = useCurrentFrame()

  // Find which word is active
  const activeIdx = captions.findIndex(
    (c) => frame >= c.startFrame && frame <= c.endFrame
  )

  if (activeIdx === -1) return null

  // Window: show 8 words centered on active word
  const half = Math.floor(WINDOW / 2)
  const start = Math.max(0, activeIdx - half)
  const end = Math.min(captions.length - 1, start + WINDOW - 1)
  const windowWords = captions.slice(start, end + 1)

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 48,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        ...style,
      }}
    >
      <div
        style={{
          background: 'rgba(0,0,0,0.55)',
          borderRadius: 10,
          padding: '8px 18px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
          maxWidth: 700,
          justifyContent: 'center',
        }}
      >
        {windowWords.map((w, i) => {
          const isActive = start + i === activeIdx
          return (
            <span
              key={start + i}
              style={{
                fontSize: 22,
                fontWeight: isActive ? 700 : 400,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                transition: 'color 0.1s',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              {w.word}
            </span>
          )
        })}
      </div>
    </div>
  )
}
