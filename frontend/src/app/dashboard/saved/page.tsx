'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePlansStore } from '@/store'
import { formatDate } from '@/lib/utils'
import api from '@/lib/api'
type Filter = 'all' | 'favorite' | 'completed'

export default function SavedPlansPage() {
  const { plans, setPlans } = usePlansStore()
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.plans.list().then(setPlans).catch(() => {})
  }, [setPlans])

  const filtered = plans.filter(p => {
    if (filter === 'favorite' && !p.is_favorite) return false
    if (filter === 'completed' && p.status !== 'completed') return false
    if (search && !p.destination.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-ink">Planlarım</h1>
        <Link href="/plan/new" className="btn-primary text-sm py-2">+ Yeni Plan</Link>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text"
          className="input-field max-w-xs"
          placeholder="Ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          {(['all', 'favorite', 'completed'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-pill text-sm font-medium transition-colors ${
                filter === f ? 'bg-amber text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300'
              }`}
            >
              {f === 'all' ? 'Tümü' : f === 'favorite' ? '★ Favoriler' : '✅ Tamamlanan'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <span className="text-4xl block mb-4">🗺️</span>
          <p className="text-stone-500">
            {search ? 'Arama sonucu bulunamadı.' : 'Henüz plan yok.'}
          </p>
          {!search && (
            <Link href="/plan/new" className="btn-primary mt-4 inline-block">Plan Oluştur →</Link>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(plan => (
            <Link key={plan.id} href={`/plan/${plan.id}`} className="card hover:shadow-md hover:border-stone-300 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{plan.plan?.flag_emoji || '🗺️'}</span>
                {plan.is_favorite && <span className="text-amber">★</span>}
              </div>
              <h3 className="font-medium text-ink mb-1 group-hover:text-amber transition-colors">{plan.destination}</h3>
              <p className="text-xs text-stone-500 mb-3">{plan.duration_days || '?'} gün · {plan.travelers_count} kişi</p>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded-pill font-medium ${
                  plan.status === 'completed' ? 'bg-teal-light text-teal' : 'bg-amber-light text-amber'
                }`}>
                  {plan.status === 'completed' ? 'Hazır' : 'İşleniyor'}
                </span>
                <span className="text-xs text-stone-400">{formatDate(plan.created_at)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
