import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  if (isToday(date)) {
    return formatDistanceToNow(date, { addSuffix: true })
  }
  if (isYesterday(date)) {
    return `Yesterday ${format(date, 'h:mm a')}`
  }
  return format(date, 'dd MMM, h:mm a')
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 4)}) ${digits.slice(4, 7)} ${digits.slice(7)}`
  }
  return phone
}
