/**
 * Scene 5: Auto vs Human — frames 1630-1865 (235 local frames)
 * Split screen: left dark (Heidi handles) / right cream (your team focuses on)
 * Copy aligned to heidihealth.com/en-au/comms pillars.
 */
import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'
import { HEIDI } from '../lib/colors'
import { AnimatedBlock } from '../components/AnimatedText'

const AutoItem: React.FC<{ label: string; sub: string; delay: number }> = ({ label, sub, delay }) => (
  <AnimatedBlock delay={delay} direction="left">
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 18 }}>
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: '#22c55e22',
          border: '1.5px solid #22c55e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          color: '#22c55e',
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        ✓
      </div>
      <div>
        <div style={{ fontSize: 15, color: '#fff', fontWeight: 600, lineHeight: 1.3 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 3, lineHeight: 1.4 }}>{sub}</div>
      </div>
    </div>
  </AnimatedBlock>
)

const HumanItem: React.FC<{ label: string; sub: string; delay: number }> = ({ label, sub, delay }) => (
  <AnimatedBlock delay={delay} direction="left">
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 18 }}>
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: HEIDI.activeItem,
          border: `1.5px solid ${HEIDI.brand}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          color: HEIDI.brand,
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        ♥
      </div>
      <div>
        <div style={{ fontSize: 15, color: HEIDI.darkText, fontWeight: 600, lineHeight: 1.3 }}>{label}</div>
        <div style={{ fontSize: 12, color: HEIDI.muted, marginTop: 3, lineHeight: 1.4 }}>{sub}</div>
      </div>
    </div>
  </AnimatedBlock>
)

export const AutoVsHuman: React.FC = () => {
  const frame = useCurrentFrame()

  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })
  const fadeOut = interpolate(frame, [205, 235], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        opacity: fadeIn * fadeOut,
        display: 'flex',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Left: Heidi handles */}
      <div
        style={{
          flex: 1,
          background: HEIDI.brand,
          padding: '52px 52px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <AnimatedBlock delay={10}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
            Heidi Comms handles
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 28, lineHeight: 1.2 }}>
            The admin that
            <br />
            never stops
          </div>
        </AnimatedBlock>

        <AutoItem
          delay={30}
          label="Always within reach"
          sub="24/7 coverage across calls, texts, and chat — patients get answers even when your team is busy"
        />
        <AutoItem
          delay={55}
          label="Conversations turn into care actions"
          sub="Schedules appointments, sends reminders, follows up — no manual chasing required"
        />
        <AutoItem
          delay={80}
          label="Every call logged and summarised"
          sub="Teams get full clarity on every interaction without lifting a finger"
        />
        <AutoItem
          delay={105}
          label="50% fewer repetitive patient queries"
          sub="Heidi handles FAQs, routing, and booking confirmations at scale"
        />
      </div>

      {/* Right: Your team focuses on */}
      <div
        style={{
          flex: 1,
          background: HEIDI.sidebarBg,
          padding: '52px 52px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <AnimatedBlock delay={20}>
          <div style={{ fontSize: 11, fontWeight: 600, color: HEIDI.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
            Your team focuses on
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: HEIDI.darkText, marginBottom: 28, lineHeight: 1.2 }}>
            Care that
            <br />
            matters
          </div>
        </AnimatedBlock>

        <HumanItem
          delay={40}
          label="High-value patient interactions"
          sub="The calls your team takes are way more meaningful — not just answering the same questions"
        />
        <HumanItem
          delay={65}
          label="Clinical decisions, not admin"
          sub="Triage the urgent cases, escalate when needed, focus on what requires a human"
        />
        <HumanItem
          delay={90}
          label="25% more bookings, zero extra headcount"
          sub="Automate recalls and post-op check-ins to fill appointments without adding staff"
        />
        <HumanItem
          delay={115}
          label="Consistent care across every channel"
          sub="Patients get the right tone and next steps every time — building trust at scale"
        />
      </div>
    </div>
  )
}
