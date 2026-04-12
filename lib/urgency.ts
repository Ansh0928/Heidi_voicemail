import type { UrgencyLevel, IntentCode } from '@/types/voicemail'

export interface UrgencyConfig {
  label: string
  color: string
  bgColor: string
  borderColor: string
  textColor: string
  sortOrder: number
  pillClass: string
}

export const URGENCY_CONFIG: Record<UrgencyLevel, UrgencyConfig> = {
  urgent: {
    label: 'URGENT',
    color: '#dc2626',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
    textColor: '#991b1b',
    sortOrder: 0,
    pillClass: 'bg-red-100 text-red-800 border border-red-200',
  },
  high: {
    label: 'HIGH',
    color: '#f97316',
    bgColor: '#fff7ed',
    borderColor: '#fed7aa',
    textColor: '#9a3412',
    sortOrder: 1,
    pillClass: 'bg-orange-100 text-orange-800 border border-orange-200',
  },
  normal: {
    label: 'NORMAL',
    color: '#588f60',
    bgColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    textColor: '#166534',
    sortOrder: 2,
    pillClass: 'bg-green-100 text-green-800 border border-green-200',
  },
  low: {
    label: 'LOW',
    color: '#8a7078',
    bgColor: '#f9f4f1',
    borderColor: '#d4c4c9',
    textColor: '#6b5a60',
    sortOrder: 3,
    pillClass: 'bg-[#f9f4f1] text-[#6b5a60] border border-[#d4c4c9]',
  },
}

export const INTENT_LABELS: Record<IntentCode, string> = {
  'appt-book': 'Appointment — Book',
  'appt-change': 'Appointment — Change',
  'rx-refill': 'Prescription Refill',
  'rx-new': 'New Prescription',
  results: 'Test Results',
  referral: 'Referral',
  'symptom-acute': 'Acute Symptom',
  'symptom-routine': 'Routine Symptom',
  callback: 'Callback Request',
  'mental-health': 'Mental Health',
  admin: 'Admin / General',
  'post-op': 'Post-Op / Follow-up',
  'med-cert': 'Medical Certificate',
  other: 'Other',
}

export function sortByUrgency<T extends { urgency: UrgencyLevel; receivedAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const urgencyDiff = URGENCY_CONFIG[a.urgency].sortOrder - URGENCY_CONFIG[b.urgency].sortOrder
    if (urgencyDiff !== 0) return urgencyDiff
    return new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime()
  })
}
