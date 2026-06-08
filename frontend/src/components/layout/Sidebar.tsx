'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore, usePersonaStore, usePlansStore, useUIStore } from '@/store'
import { initials, isPlusUser, travioScoreLevel } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Ana Sayfa', icon: DashIcon },
  { href: '/plan/new', label: 'Yeni Plan', icon: PlanIcon, highlight: true },
  { href: '/dashboard/saved', label: 'Planlarım', icon: SavedIcon },
  { href: '/explore', label: 'Keşfet', icon: ExploreIcon },
  { href: '/flights', label: 'Uçuşlar', icon: FlightIcon },
  { href: '/hotels', label: 'Oteller', icon: HotelIcon },
  { href: '/budget', label: 'Bütçe', icon: BudgetIcon },
  { href: '/alerts', label: 'Alarmlar', icon: AlertIcon },
  { href: '/score', label: 'Travio Score', icon: ScoreIcon },
]

/* ── SVG Icons ────────────────────────────────────────────── */

function DashIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? 'white' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}
function PlanIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? 'white' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.5l-10-10-10 10" />
      <path d="M12 6.5V20" />
    </svg>
  )
}
function SavedIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? 'white' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  )
}
function ExploreIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? 'white' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
    </svg>
  )
}
function FlightIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? 'white' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19.5 2.5S18 2 16.5 3.5L13 7 4.8 6.2c-.5-.1-.9.1-1.1.5L3 8l6 3-2 3-4-1-1 1 4 3 3 4 1-1-1-4 3-2 3 6 1.5-.7c.4-.2.6-.6.5-1.1z" />
    </svg>
  )
}
function HotelIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? 'white' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 22V8l9-4 9 4v14" />
      <path d="M9 22V12h6v10" />
      <path d="M3 14h4M17 14h4M3 18h4M17 18h4" />
    </svg>
  )
}
function BudgetIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? 'white' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  )
}
function AlertIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? 'white' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  )
}
function ScoreIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? 'white' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

/* ── Sidebar ────────────────────────────────────────────────── */

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { persona } = usePersonaStore()
  const { plans } = usePlansStore()
  const { openPlusModal } = useUIStore()

  const isPlus = user ? isPlusUser(user.subscription_tier) : false
  const score = persona?.travio_score || 0
  const scoreInfo = travioScoreLevel(score)
  const completedCount = plans.filter(p => p.status === 'completed').length

  async function handleLogout() {
    try {
      const { signOut } = await import('@/lib/auth')
      await signOut()
    } catch {}
    logout()
    router.push('/auth/login')
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside
      className="w-60 flex flex-col h-full"
      style={{
        background: 'var(--cream)',
        borderRight: '1px solid var(--stone-100)',
      }}
    >

      {/* Logo */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid var(--stone-100)' }}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-serif text-2xl tracking-tight" style={{ color: 'var(--ink)' }}>travio</span>
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--amber)' }} />
          {isPlus && (
            <span
              className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--amber-light)', color: 'var(--amber-dark)' }}
            >
              Plus
            </span>
          )}
        </Link>
      </div>

      {/* New Plan CTA */}
      <div className="px-3 pt-3 pb-1">
        <Link
          href="/plan/new"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: 'var(--amber)',
            color: 'white',
            boxShadow: 'var(--shadow-amber)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--amber-bright)'
            ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--amber)'
            ;(e.currentTarget as HTMLElement).style.transform = 'none'
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Yeni Plan
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-0.5">
        {NAV_ITEMS.filter(item => item.href !== '/plan/new').map(item => {
          const active = isActive(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
              style={{
                background: active ? 'var(--ink)' : 'transparent',
                color: active ? 'white' : 'var(--stone-600)',
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--stone-100)'
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--ink)'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--stone-600)'
                }
              }}
            >
              <span className="shrink-0 transition-transform duration-150 group-hover:scale-110">
                <Icon active={active} />
              </span>
              <span className="flex-1">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Score widget */}
      {persona && (
        <Link
          href="/score"
          className="mx-3 mb-3 p-3 rounded-xl transition-all flex items-center gap-3"
          style={{ background: 'var(--stone-50)', border: '1px solid var(--stone-200)' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,130,10,0.35)'
            ;(e.currentTarget as HTMLElement).style.background = 'var(--amber-light)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--stone-200)'
            ;(e.currentTarget as HTMLElement).style.background = 'var(--stone-50)'
          }}
        >
          <span className="text-xl">{scoreInfo.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold" style={{ color: 'var(--ink)' }}>{score} puan</span>
              <span className="text-xs" style={{ color: 'var(--stone-400)' }}>{scoreInfo.name}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--stone-200)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${scoreInfo.percent}%`, background: 'var(--amber)' }}
              />
            </div>
          </div>
        </Link>
      )}

      {/* Plus promo */}
      {!isPlus && (
        <div className="mx-3 mb-3">
          <button
            onClick={() => openPlusModal('plan_limit')}
            className="w-full text-left p-4 rounded-xl transition-all relative overflow-hidden"
            style={{ background: 'var(--ink)' }}
          >
            <div
              className="absolute top-0 right-0 w-20 h-20 rounded-full"
              style={{ background: 'rgba(212,130,10,0.12)', filter: 'blur(16px)' }}
            />
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--amber)' }}>
                  Travio Plus
                </span>
                <span className="text-xs" style={{ color: 'var(--amber)' }}>→</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Sınırsız plan, fiyat alarmı, PDF export.
              </p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                ₺149/ay · İlk 7 gün ücretsiz
              </p>
            </div>
          </button>
        </div>
      )}

      {/* User */}
      <div className="p-3" style={{ borderTop: '1px solid var(--stone-100)' }}>
        <div
          className="flex items-center gap-3 p-2 rounded-xl transition-colors"
          style={{ cursor: 'default' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--amber) 0%, var(--coral) 100%)' }}
          >
            {user ? initials(user.full_name || user.email) : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>
              {user?.full_name || user?.email}
            </p>
            <p className="text-xs" style={{ color: 'var(--stone-400)' }}>
              {isPlus ? '✦ Plus' : 'Free'} · {completedCount} seyahat
            </p>
          </div>
        </div>

        <div className="flex gap-1 mt-1">
          <Link
            href="/profile"
            className="flex-1 text-xs text-center py-1.5 rounded-lg font-medium transition-colors"
            style={{ color: 'var(--stone-500)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--stone-100)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--ink)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--stone-500)'
            }}
          >
            Profil
          </Link>
          <Link
            href="/settings"
            className="flex-1 text-xs text-center py-1.5 rounded-lg font-medium transition-colors"
            style={{ color: 'var(--stone-500)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--stone-100)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--ink)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--stone-500)'
            }}
          >
            Ayarlar
          </Link>
          <button
            onClick={handleLogout}
            className="flex-1 text-xs text-center py-1.5 rounded-lg font-medium transition-colors"
            style={{ color: 'var(--stone-500)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#fef2f2'
              ;(e.currentTarget as HTMLElement).style.color = '#dc2626'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--stone-500)'
            }}
          >
            Çıkış
          </button>
        </div>
      </div>
    </aside>
  )
}
