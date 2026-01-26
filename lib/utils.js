import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

export function formatDateTime(date) {
  return `${formatDate(date)} at ${formatTime(date)}`
}

export function calculatePercentage(made, attempted) {
  if (!attempted || attempted === 0) return 0
  return Math.round((made / attempted) * 100)
}

export function calculateWinPercentage(wins, losses) {
  const total = wins + losses
  if (total === 0) return 0
  return Math.round((wins / total) * 1000) / 1000
}
