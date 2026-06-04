import type { SubscriptionTier, TravelerLevel, ActivityCategory } from '@/types'

export function formatDate(date: string | Date, locale = 'tr-TR'): string {
  return new Date(date).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatCurrency(amount: number, currency = 'TRY', locale = 'tr-TR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

interface CategoryConfig {
  label: string
  color: string
  dot: string
}

export function getCategoryConfig(category: ActivityCategory): CategoryConfig {
  const configs: Record<ActivityCategory, CategoryConfig> = {
    culture:   { label: 'Kültür',    color: 'bg-teal-light text-teal',        dot: 'bg-teal' },
    food:      { label: 'Yemek',     color: 'bg-amber-light text-amber',      dot: 'bg-amber' },
    nature:    { label: 'Doğa',      color: 'bg-green-100 text-green-700',    dot: 'bg-green-500' },
    nightlife: { label: 'Gece',      color: 'bg-purple-100 text-purple-700',  dot: 'bg-purple-500' },
    shopping:  { label: 'Alışveriş', color: 'bg-pink-100 text-pink-700',      dot: 'bg-pink-500' },
    transport: { label: 'Ulaşım',    color: 'bg-stone-100 text-stone-700',    dot: 'bg-stone-500' },
    hotel:     { label: 'Konaklama', color: 'bg-blue-100 text-blue-700',      dot: 'bg-blue-500' },
    activity:  { label: 'Aktivite',  color: 'bg-orange-100 text-orange-700',  dot: 'bg-orange-500' },
  }
  return configs[category] ?? { label: category, color: 'bg-stone-100 text-stone-700', dot: 'bg-stone-500' }
}

export function getSafetyColor(level: 'safe' | 'moderate' | 'caution'): string {
  return {
    safe:     'text-green-600',
    moderate: 'text-amber',
    caution:  'text-red-500',
  }[level]
}

export function isPlusUser(tier: SubscriptionTier): boolean {
  return tier === 'plus' || tier === 'family'
}

interface PlanPermission {
  allowed: boolean
  reason?: string
}

export function canGeneratePlan(tier: SubscriptionTier, count: number): PlanPermission {
  const limit = parseInt(process.env.NEXT_PUBLIC_PLAN_LIMIT_FREE ?? '3', 10)
  if (isPlusUser(tier)) return { allowed: true }
  if (count >= limit) {
    return {
      allowed: false,
      reason: `Bu senin ${limit}. planın — gerçek bir gezgin oluyorsun. Plus ile sınırsız devam et.`,
    }
  }
  return { allowed: true }
}

interface ScoreLevel {
  name: string
  emoji: string
  next: string | null
  percent: number
  level: TravelerLevel
}

const LEVELS: Array<{ level: TravelerLevel; name: string; emoji: string; min: number; max: number }> = [
  { level: 'beginner',     name: 'Kaşif',    emoji: '🗺️', min: 0,   max: 49 },
  { level: 'explorer',     name: 'Seyyah',   emoji: '⛵',  min: 50,  max: 149 },
  { level: 'adventurer',   name: 'Maceracı', emoji: '🧗',  min: 150, max: 349 },
  { level: 'globetrotter', name: 'Gezgin',   emoji: '✈️', min: 350, max: 699 },
  { level: 'legend',       name: 'Efsane',   emoji: '👑',  min: 700, max: 999 },
]

export function travioScoreLevel(score: number): ScoreLevel {
  const current = LEVELS.find((l) => score >= l.min && score <= l.max) ?? LEVELS[0]
  const nextLevel = LEVELS[LEVELS.indexOf(current) + 1] ?? null
  const percent = Math.round(((score - current.min) / (current.max - current.min)) * 100)

  return {
    name: current.name,
    emoji: current.emoji,
    next: nextLevel ? `${nextLevel.name} (${nextLevel.min} puan)` : null,
    percent: Math.min(percent, 100),
    level: current.level,
  }
}
