import React from 'react'
import { Composition, Sequence, Audio, staticFile } from 'remotion'
import { Caption } from './components/Caption'

import { Before } from './scenes/Before'
import { Intro } from './scenes/Intro'
import { Pipeline } from './scenes/Pipeline'
import { Dashboard } from './scenes/Dashboard'
import { AutoVsHuman } from './scenes/AutoVsHuman'
import { Result } from './scenes/Result'

// Calibrated from actual ElevenLabs audio timestamps (68.83s = 2064 frames at 30fps)
// Scene boundaries matched to natural narration pauses in captions.json
//
//   Scene     | Global start | Duration | Notes
//   Before    |    0         |  350     | Dark inbox, fades out at 310
//   Intro     |  325         |  200     | 40 min stat, overlaps Before fadeout
//   Pipeline  |  505         |  460     | 4-step flow diagram
//   Dashboard |  945         |  705     | 3-panel UI money shot
//   AutoVsHuman| 1630        |  235     | Split screen
//   Result    | 1845         |  290     | Counter + hold, no fade-out
//
// Total: 2135 frames = 71.2 seconds

const TOTAL_FRAMES = 2135
const FPS = 30
const WIDTH = 1920
const HEIGHT = 1080

const VideoWalkthrough: React.FC = () => {
  return (
    <>
      {/* Voiceover — plays from frame 0, duration matches audio (2064 frames) */}
      <Audio src={staticFile('voiceover.mp3')} />

      {/* Scene 1: Before */}
      <Sequence from={0} durationInFrames={350} name="Before">
        <Before />
      </Sequence>

      {/* Scene 2: Intro */}
      <Sequence from={325} durationInFrames={200} name="Intro">
        <Intro />
      </Sequence>

      {/* Scene 3: Pipeline */}
      <Sequence from={505} durationInFrames={460} name="Pipeline">
        <Pipeline />
      </Sequence>

      {/* Scene 4: Dashboard */}
      <Sequence from={945} durationInFrames={705} name="Dashboard">
        <Dashboard />
      </Sequence>

      {/* Scene 5: AutoVsHuman */}
      <Sequence from={1630} durationInFrames={235} name="AutoVsHuman">
        <AutoVsHuman />
      </Sequence>

      {/* Scene 6: Result */}
      <Sequence from={1845} durationInFrames={290} name="Result">
        <Result />
      </Sequence>

      {/* Captions overlay — spans the full composition */}
      <Sequence from={0} durationInFrames={TOTAL_FRAMES} name="Captions">
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <Caption />
        </div>
      </Sequence>
    </>
  )
}

export const Root: React.FC = () => {
  return (
    <Composition
      id="VideoWalkthrough"
      component={VideoWalkthrough}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{}}
    />
  )
}
