'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useAuthStore, usePlansStore, useUIStore } from '@/store'
import { formatDate, isPlusUser } from '@/lib/utils'
import api from '@/lib/api'
import type { TravelPlan } from '@/types'

function greeting(name: string) {
  const h = new Date().getHours()
  const prefix = h < 12 ? 'Günaydın' : h < 18 ? 'İyi günler' : 'İyi akşamlar'
  return `${prefix}, ${name.split(' ')[0]}`
}

const QUICK_LINKS = [
  { href: '/flights', emoji: '🛫', label: 'Uçuş Ara', color: '#0579c4' },
  { href: '/hotels', emoji: '🏨', label: 'Otel Ara', color: '#0a8f94' },
  { href: '/alerts', emoji: '🔔', label: 'Alarm Kur', color: '#e8532a' },
  { href: '/explore', emoji: '🌍', label: 'Keşfet', color: '#6d32e0' },
  { href: '/budget', emoji: '💰', label: 'Bütçe', color: '#0a9958' },
  { href: '/profile', emoji: '👤', label: 'Profil', color: '#4a4038' },
]

function PlanCard({ plan }: { plan: TravelPlan }) {
  const statusConfig = {
    completed: { label: 'Hazır', bg: 'rgba(10,153,88,0.1)', color: '#0a9958' },
    generating: { label: 'Oluşturuluyor...', bg: 'rgba(212,130,10,0.1)', color: '#d4820a' },
    error: { label: 'Hata', bg: 'rgba(220,38,38,0.1)', color: '#dc2626' },
  }
  const status = statusConfig[plan.status as keyof typeof statusConfig] || statusConfig.error

  return (
    <Link
      href={`/plan/${plan.id}`}
      className="group block rounded-2xl overflow-hidden transition-all duration-200"
      style={{ background: 'white', border: '1px solid var(--stone-100)' }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--stone-200)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'none'
        ;(e.currentTarget as HTMLElement).style.transform = 'none'
        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--stone-100)'
      }}
    >
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, var(--amber) 0%, var(--coral) 50%, var(--violet) 100%)', opacity: 0.5 }} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <span className="text-2xl">{plan.plan?.flag_emoji || '🗺️'}</span>
          {plan.is_favorite && <span style={{ color: 'var(--amber)' }}>★</span>}
        </div>
        <h3
          className="font-semibold mb-1 leading-snug transition-colors duration-150 group-hover:text-amber"
          style={{ color: 'var(--ink)', fontSize: '0.9375rem' }}
        >
          {plan.destination}
        </h3>
        <p className="text-xs mb-4" style={{ color: 'var(--stone-400)' }}>
          {plan.origin_city} · {plan.duration_days || '?'} gün · {plan.travelers_count} kişi
        </p>
        <div className="flex items-center justify-between">
          <span
            className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: status.bg, color: status.color }}
          >
            {status.label}
          </span>
          <span className="text-xs" style={{ color: 'var(--stone-400)' }}>{formatDate(plan.created_at)}</span>
        </div>
      </div>
    </Link>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { plans, setPlans } = usePlansStore()
  const { openPlusModal } = useUIStore()
  const isGuest = !user

  useEffect(() => {
    if (user) {
      api.plans.list().then(setPlans).catch(() => {})
    }
  }, [user, setPlans])

  const recentPlans = plans.slice(0, 4)
  const completedCount = plans.filter(p => p.status === 'completed').length
  const favoriteCount = plans.filter(p => p.is_favorite).length
  const isPlus = user ? isPlusUser(user.subscription_tier) : false

  const STATS = [
    { label: 'Toplam Plan', value: plans.length, icon: '📋', accent: 'var(--amber)' },
    { label: 'Tamamlanan', value: completedCount, icon: '✅', accent: 'var(--teal)' },
    { label: 'Favoriler', value: favoriteCount, icon: '★', accent: 'var(--amber)' },
    { label: 'Bu Ay', value: user?.plans_generated_this_month || 0, icon: '📅', accent: 'var(--violet)' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Guest banner */}
      {isGuest && (
        <div
          className="relative overflow-hidden rounded-2xl p-5 flex items-center justify-between gap-4"
          style={{ background: 'linear-gradient(135deg, var(--amber) 0%, var(--coral) 100%)' }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          />
          <div className="relative">
            <p className="text-white font-bold">Planlarını kaydetmek ister misin?</p>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Ücretsiz hesap aç — planların kaybolmasın.
            </p>
          </div>
          <div className="flex gap-2 shrink-0 relative">
            <Link href="/auth/login" className="text-sm font-semibold px-4 py-2 transition-colors" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Giriş
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-bold px-5 py-2 rounded-full transition-colors"
              style={{ background: 'white', color: 'var(--amber)' }}
            >
              Kayıt Ol →
            </Link>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl" style={{ color: 'var(--ink)' }}>
            {greeting(user?.full_name || user?.email || 'Gezgin')} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--stone-500)' }}>Bugün nereye gidiyoruz?</p>
        </div>
        <Link
          href="/plan/new"
          className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5"
          style={{ background: 'var(--amber)', color: 'white', boxShadow: 'var(--shadow-amber)' }}
        >
          + Yeni Plan
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5 transition-all"
            style={{
              background: 'white',
              border: `1px solid var(--stone-100)`,
              borderTop: `3px solid ${s.accent}`,
            }}
          >
            <span className="text-xl mb-3 block">{s.icon}</span>
            <p className="font-serif text-3xl mb-1" style={{ color: 'var(--ink)' }}>{s.value}</p>
            <p className="text-xs font-medium" style={{ color: 'var(--stone-500)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--stone-400)' }}>
          Hızlı Erişim
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {QUICK_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="group flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all duration-200"
              style={{ background: 'white', border: '1px solid var(--stone-100)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = `${l.color}12`
                ;(e.currentTarget as HTMLElement).style.borderColor = `${l.color}30`
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'white'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--stone-100)'
                ;(e.currentTarget as HTMLElement).style.transform = 'none'
              }}
            >
              <span className="text-2xl transition-transform duration-200 group-hover:scale-110">{l.emoji}</span>
              <span className="text-xs font-semibold" style={{ color: 'var(--stone-600)' }}>{l.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent plans */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--stone-400)' }}>Son Planlar</h2>
          {plans.length > 4 && (
            <Link href="/dashboard/saved" className="text-sm font-semibold transition-colors" style={{ color: 'var(--amber)' }}>
              Tümünü gör →
            </Link>
          )}
        </div>

        {recentPlans.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentPlans.map(plan => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        ) : (
          <div
            className="rounded-2xl p-12 text-center transition-colors"
            style={{ border: '2px dashed var(--stone-200)', background: 'var(--stone-50)' }}
          >
            <div className="text-5xl mb-4">🗺️</div>
            <h3 className="font-serif text-xl mb-2" style={{ color: 'var(--ink)' }}>Henüz planın yok.</h3>
            <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: 'var(--stone-500)' }}>
              İlk planını oluştur, AI seyahat tarzını öğrensin.
            </p>
            <Link
              href="/plan/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--amber)', color: 'white', boxShadow: 'var(--shadow-amber)' }}
            >
              İlk Planı Oluştur →
            </Link>
          </div>
        )}
      </div>

      {/* Plus banner */}
      {!isPlus && (
        <div
          className="relative overflow-hidden rounded-2xl p-6 flex items-center justify-between gap-4 cursor-pointer transition-colors"
          style={{ background: 'var(--ink)' }}
          onClick={() => openPlusModal('plan_limit')}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--stone-800)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--ink)')}
        >
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full"
            style={{ background: 'rgba(212,130,10,0.08)', filter: 'blur(30px)' }}
          />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--amber)' }}>
                Travio Plus
              </span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(212,130,10,0.15)', color: 'var(--amber-bright)' }}
              >
                En Popüler
              </span>
            </div>
            <p className="text-white font-semibold">Sınırsız plan, fiyat alarmı ve daha fazlası.</p>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Günde ₺5 — bir kahve fiyatına.</p>
          </div>
          <button
            className="relative text-sm font-bold px-6 py-3 rounded-full whitespace-nowrap transition-all shrink-0"
            style={{ background: 'var(--amber)', color: 'white', boxShadow: 'var(--shadow-amber)' }}
          >
            Yükselt →
          </button>
        </div>
      )}
    </div>
  )
}
