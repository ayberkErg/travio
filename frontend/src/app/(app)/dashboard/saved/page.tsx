'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePlansStore } from '@/store'
import { formatDate } from '@/lib/utils'
import api from '@/lib/api'
import type { TravelPlan } from '@/types'

type Filter = 'all' | 'favorite' | 'completed'

const STATUS_CONFIG = {
  completed: { label: 'Hazır', color: 'bg-teal-light text-teal' },
  generating: { label: 'Oluşturuluyor', color: 'bg-amber-light text-amber' },
  error: { label: 'Hata', color: 'bg-red-100 text-red-500' },
}

const ACCENT_COLORS = [
  '#e8930a', '#0d7377', '#ff5c35', '#7c3aed', '#0284c7', '#059669',
]

function PlanCard({ plan, idx }: { plan: TravelPlan; idx: number }) {
  const status = STATUS_CONFIG[plan.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.error
  const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length]

  return (
    <Link
      href={`/plan/${plan.id}`}
      className="group bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Renkli üst şerit */}
      <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <span className="text-3xl">{plan.plan?.flag_emoji || '🗺️'}</span>
          {plan.is_favorite && (
            <span className="text-amber">★</span>
          )}
        </div>
        <h3 className="font-semibold text-ink mb-0.5 group-hover:text-amber transition-colors truncate">
          {plan.destination}
        </h3>
        <p className="text-xs text-stone-400 mb-4">
          {plan.origin_city && `${plan.origin_city} · `}
          {plan.duration_days || '?'} gün · {plan.travelers_count} kişi
        </p>
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2.5 py-1 rounded-pill font-semibold ${status.color}`}>
            {status.label}
          </span>
          <span className="text-xs text-stone-400">{formatDate(plan.created_at)}</span>
        </div>
        {plan.plan?.budget?.total_estimated && (
          <div className="mt-3 pt-3 border-t border-stone-100">
            <p className="text-xs text-stone-400">Tahmini bütçe</p>
            <p className="text-sm font-semibold text-ink">
              ₺{plan.plan.budget.total_estimated.toLocaleString('tr-TR')}
            </p>
          </div>
        )}
      </div>
    </Link>
  )
}

export default function SavedPlansPage() {
  const { plans, setPlans } = usePlansStore()
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date')

  useEffect(() => {
    api.plans.list().then(setPlans).catch(() => {})
  }, [setPlans])

  const filtered = plans
    .filter(p => {
      if (filter === 'favorite' && !p.is_favorite) return false
      if (filter === 'completed' && p.status !== 'completed') return false
      if (search && !p.destination.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.destination.localeCompare(b.destination)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const completedCount = plans.filter(p => p.status === 'completed').length
  const favoriteCount = plans.filter(p => p.is_favorite).length

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-ink">Planlarım</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            {plans.length} plan · {completedCount} hazır · {favoriteCount} favori
          </p>
        </div>
        <Link href="/plan/new" className="btn-primary shadow-amber">+ Yeni Plan</Link>
      </div>

      {/* Filtreler & Arama */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">🔍</span>
          <input
            type="text"
            className="input-field pl-9 text-sm py-2.5"
            placeholder="Destinasyon ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {([
            { value: 'all', label: 'Tümü' },
            { value: 'favorite', label: '★ Favoriler' },
            { value: 'completed', label: '✓ Hazır' },
          ] as { value: Filter; label: string }[]).map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-pill text-sm font-semibold transition-all ${
                filter === f.value ? 'bg-amber text-white shadow-amber' : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          className="input-field py-2 text-sm max-w-[140px]"
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'date' | 'name')}
        >
          <option value="date">Tarihe göre</option>
          <option value="name">İsme göre</option>
        </select>
      </div>

      {/* Sonuç sayısı */}
      {search && (
        <p className="text-sm text-stone-400 mb-4">
          &quot;{search}&quot; için {filtered.length} sonuç
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="card text-center py-20">
          <span className="text-5xl block mb-4">🗺️</span>
          <h3 className="font-serif text-xl text-ink mb-2">
            {search ? 'Arama sonucu bulunamadı' : 'Henüz plan yok'}
          </h3>
          <p className="text-stone-500 text-sm mb-6 max-w-xs mx-auto">
            {search ? 'Farklı bir destinasyon dene.' : 'İlk planını oluştur, AI seyahat tarzını öğrensin.'}
          </p>
          {!search && (
            <Link href="/plan/new" className="btn-primary shadow-amber">İlk Planı Oluştur →</Link>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} idx={i} />
          ))}
        </div>
      )}
    </div>
  )
}
