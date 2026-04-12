export type UrgencyLevel = 'urgent' | 'high' | 'normal' | 'low'

export type IntentCode =
  | 'appt-book'
  | 'appt-change'
  | 'rx-refill'
  | 'rx-new'
  | 'results'
  | 'referral'
  | 'symptom-acute'
  | 'symptom-routine'
  | 'callback'
  | 'mental-health'
  | 'admin'
  | 'post-op'
  | 'med-cert'
  | 'other'

export type VoicemailStatus = 'new' | 'in-progress' | 'done'

export type Location = 'Varsity Lakes' | 'Labrador'

export interface StatusEvent {
  status: VoicemailStatus
  changedAt: string
  changedBy: string
  note?: string
}

export interface VoicemailItem {
  id: string
  callerName: string
  callerNumber: string
  receivedAt: string
  duration: number
  location: Location
  urgency: UrgencyLevel
  urgencyConfidence: number
  intent: IntentCode
  summary: string
  keyDetails: string[]
  suggestedAction: string
  transcriptExcerpt: string
  flagForHuman: boolean
  status: VoicemailStatus
  statusHistory: StatusEvent[]
  assignedTo?: string
}
