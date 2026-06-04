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
  return `${prefix}, ${name.split(' ')[0]} 👋`
}

const QUICK_LINKS = [
  { href: '/plan/new', emoji: '✈️', label: 'Yeni Plan' },
  { href: '/flights', emoji: '🛫', label: 'Uçuş Ara' },
  { href: '/hotels', emoji: '🏨', label: 'Otel Ara' },
  { href: '/alerts', emoji: '🔔', label: 'Alarm Kur' },
  { href: '/explore', emoji: '🌍', label: 'Keşfet' },
  { href: '/profile', emoji: '👤', label: 'Profil' },
]

function PlanCard({ plan }: { plan: TravelPlan }) {
  return (
    <Link
      href={`/plan/${plan.id}`}
      className="card hover:shadow-md hover:border-stone-300 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{plan.plan?.flag_emoji || '🗺️'}</span>
        {plan.is_favorite && <span className="text-amber text-sm">★</span>}
      </div>
      <h3 className="font-medium text-ink mb-1 group-hover:text-amber transition-colors">
        {plan.destination}
      </h3>
      <p className="text-xs text-stone-500 mb-3">
        {plan.origin_city} · {plan.duration_days || '?'} gün · {plan.travelers_count} kişi
      </p>
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-pill font-medium ${
          plan.status === 'completed' ? 'bg-teal-light text-teal' :
          plan.status === 'generating' ? 'bg-amber-light text-amber' :
          'bg-red-100 text-red-600'
        }`}>
          {plan.status === 'completed' ? 'Hazır' : plan.status === 'generating' ? 'Oluşturuluyor' : 'Hata'}
        </span>
        <span className="text-xs text-stone-400">{formatDate(plan.created_at)}</span>
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
    // Sadece giriş yapmış kullanıcılar için DB'den çek
    if (user) {
      api.plans.list().then(setPlans).catch(() => {})
    }
  }, [user, setPlans])

  const recentPlans = plans.slice(0, 4)
  const completedCount = plans.filter(p => p.status === 'completed').length
  const favoriteCount = plans.filter(p => p.is_favorite).length
  const isPlus = user ? isPlusUser(user.subscription_tier) : false

  const STATS = [
    { label: 'Toplam Plan', value: plans.length, emoji: '📋' },
    { label: 'Tamamlanan', value: completedCount, emoji: '✅' },
    { label: 'Favoriler', value: favoriteCount, emoji: '★' },
    { label: 'Bu Ay', value: user?.plans_generated_this_month || 0, emoji: '📅' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Misafir banneri */}
      {isGuest && (
        <div className="bg-gradient-to-r from-amber to-coral rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-white font-bold">Planlarını kaydetmek ister misin?</p>
            <p className="text-white/80 text-sm mt-0.5">Ücretsiz hesap aç — planların kaybolmasın, AI concierge aktif olsun.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href="/auth/login" className="text-white/80 text-sm font-semibold px-4 py-2 hover:text-white transition-colors">Giriş</Link>
            <Link href="/auth/register" className="bg-white text-amber font-bold text-sm px-5 py-2 rounded-pill hover:bg-off-white transition-colors">Kayıt Ol →</Link>
          </div>
        </div>
      )}

      {/* Karşılama */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink">
            {greeting(user?.full_name || user?.email || 'Gezgin')}
          </h1>
          <p className="text-stone-500 text-sm mt-1">Bugün nereye gidiyoruz?</p>
        </div>
        <Link href="/plan/new" className="btn-primary hidden md:inline-flex">
          + Yeni Plan
        </Link>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map(s => (
          <div key={s.label} className="card text-center">
            <span className="text-2xl block mb-2">{s.emoji}</span>
            <p className="font-serif text-3xl text-ink">{s.value}</p>
            <p className="text-xs text-stone-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Hızlı Erişim */}
      <div>
        <h2 className="font-medium text-ink mb-4">Hızlı Erişim</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {QUICK_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-stone-200 hover:border-amber hover:bg-amber-light transition-all text-center"
            >
              <span className="text-2xl">{l.emoji}</span>
              <span className="text-xs text-stone-600 font-medium">{l.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Son Planlar */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium text-ink">Son Planlar</h2>
          {plans.length > 4 && (
            <Link href="/dashboard/saved" className="text-sm text-amber hover:underline">
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
          <div className="card text-center py-12">
            <span className="text-4xl block mb-4">🗺️</span>
            <h3 className="font-serif text-xl text-ink mb-2">Henüz planın yok.</h3>
            <p className="text-stone-500 text-sm mb-6">
              İlk planını oluştur, AI seni tanısın.
            </p>
            <Link href="/plan/new" className="btn-primary">
              İlk Planı Oluştur →
            </Link>
          </div>
        )}
      </div>

      {/* Plus Banner — free kullanıcıya */}
      {!isPlus && (
        <div
          className="bg-ink rounded-2xl p-6 flex items-center justify-between gap-4 cursor-pointer"
          onClick={() => openPlusModal('plan_limit')}
        >
          <div>
            <p className="text-amber text-xs font-medium mb-1">Travio Plus</p>
            <p className="text-white font-medium">Sınırsız plan, fiyat alarmı ve daha fazlası.</p>
            <p className="text-stone-400 text-sm mt-1">Günde ₺5 — bir kahve fiyatına.</p>
          </div>
          <button className="bg-amber text-white text-sm font-medium px-5 py-2.5 rounded-pill whitespace-nowrap hover:opacity-90 transition-opacity">
            Yükselt →
          </button>
        </div>
      )}
    </div>
  )
}
