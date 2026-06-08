'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePlansStore } from '@/store'
import { formatCurrency } from '@/lib/utils'
import api from '@/lib/api'

const CATEGORY_CONFIG = [
  { key: 'flights', label: 'Uçuş', emoji: '✈️', color: 'bg-amber', light: 'bg-amber-light', text: 'text-amber' },
  { key: 'accommodation', label: 'Konaklama', emoji: '🏨', color: 'bg-teal', light: 'bg-teal-light', text: 'text-teal' },
  { key: 'food', label: 'Yemek', emoji: '🍽️', color: 'bg-coral', light: 'bg-coral-light', text: 'text-coral' },
  { key: 'activities', label: 'Aktiviteler', emoji: '🎭', color: 'bg-violet', light: 'bg-violet-light', text: 'text-violet' },
  { key: 'transport', label: 'Ulaşım', emoji: '🚇', color: 'bg-sky', light: 'bg-sky-light', text: 'text-sky' },
]

export default function BudgetPage() {
  const { plans, setPlans } = usePlansStore()
  const [selectedPlanId, setSelectedPlanId] = useState<string | 'all'>('all')

  useEffect(() => {
    api.plans.list().then(setPlans).catch(() => {})
  }, [setPlans])

  const completed = plans.filter(p => p.status === 'completed' && p.plan)

  const sourcePlans = selectedPlanId === 'all'
    ? completed
    : completed.filter(p => p.id === selectedPlanId)

  const totals = sourcePlans.reduce(
    (acc, p) => {
      const b = p.plan!.budget
      acc.flights += b.flights || 0
      acc.accommodation += b.accommodation || 0
      acc.food += b.food || 0
      acc.activities += b.activities || 0
      acc.transport += b.transport_local || 0
      acc.total += b.total_estimated || 0
      return acc
    },
    { flights: 0, accommodation: 0, food: 0, activities: 0, transport: 0, total: 0 }
  )

  const categories = CATEGORY_CONFIG.map(c => ({
    ...c,
    value: totals[c.key as keyof typeof totals] as number,
    pct: totals.total > 0 ? Math.round(((totals[c.key as keyof typeof totals] as number) / totals.total) * 100) : 0,
  })).filter(c => c.value > 0)

  const avgPerDay = sourcePlans.length > 0
    ? Math.round(totals.total / sourcePlans.reduce((s, p) => s + (p.duration_days || 7), 0))
    : 0

  if (completed.length === 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="font-serif text-3xl text-ink mb-2">Bütçe Takibi</h1>
        <p className="text-stone-500 text-sm mb-8">Planlarının maliyet analizini buradan görüntüle.</p>
        <div className="card text-center py-20">
          <span className="text-5xl block mb-4">💰</span>
          <h2 className="font-serif text-xl text-ink mb-2">Henüz tamamlanmış plan yok</h2>
          <p className="text-stone-500 text-sm mb-6 max-w-xs mx-auto">
            Bir plan oluştur ve tamamla — bütçe analizi otomatik hesaplanacak.
          </p>
          <Link href="/plan/new" className="btn-primary shadow-amber">Plan Oluştur →</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-ink">Bütçe Takibi</h1>
          <p className="text-stone-500 text-sm mt-0.5">{completed.length} tamamlanan plan</p>
        </div>
        {completed.length > 1 && (
          <select
            className="input-field max-w-[180px] text-sm py-2"
            value={selectedPlanId}
            onChange={e => setSelectedPlanId(e.target.value as string | 'all')}
          >
            <option value="all">Tüm Planlar</option>
            {completed.map(p => (
              <option key={p.id} value={p.id}>{p.destination}</option>
            ))}
          </select>
        )}
      </div>

      {/* Özet istatistikler */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-5 text-center" style={{ borderTopWidth: '3px', borderTopColor: 'var(--amber)' }}>
          <p className="font-serif text-2xl text-ink">{formatCurrency(totals.total)}</p>
          <p className="text-xs text-stone-500 mt-1 font-medium">Toplam Harcama</p>
        </div>
        <div className="card p-5 text-center" style={{ borderTopWidth: '3px', borderTopColor: 'var(--teal)' }}>
          <p className="font-serif text-2xl text-ink">{formatCurrency(avgPerDay)}</p>
          <p className="text-xs text-stone-500 mt-1 font-medium">Günlük Ortalama</p>
        </div>
        <div className="card p-5 text-center" style={{ borderTopWidth: '3px', borderTopColor: 'var(--violet)' }}>
          <p className="font-serif text-2xl text-ink">{sourcePlans.length}</p>
          <p className="text-xs text-stone-500 mt-1 font-medium">Plan Sayısı</p>
        </div>
      </div>

      {/* Kategori dağılımı */}
      <div className="card mb-6">
        <h2 className="font-semibold text-ink mb-5">Harcama Dağılımı</h2>
        <div className="space-y-4">
          {categories.map(c => (
            <div key={c.key}>
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-lg ${c.light} flex items-center justify-center text-xs`}>{c.emoji}</span>
                  <span className="text-sm font-medium text-ink">{c.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${c.text}`}>%{c.pct}</span>
                  <span className="text-sm text-stone-500">{formatCurrency(c.value)}</span>
                </div>
              </div>
              <div className="h-2.5 bg-stone-100 rounded-pill overflow-hidden">
                <div
                  className={`h-full ${c.color} rounded-pill transition-all duration-700`}
                  style={{ width: `${c.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Yatay stacked bar */}
        <div className="mt-6 pt-5 border-t border-stone-100">
          <p className="text-xs text-stone-400 font-medium mb-2 uppercase tracking-wide">Toplam Dağılım</p>
          <div className="flex h-4 rounded-pill overflow-hidden gap-0.5">
            {categories.map(c => (
              <div
                key={c.key}
                className={`${c.color} transition-all duration-700`}
                style={{ width: `${c.pct}%` }}
                title={`${c.label}: %${c.pct}`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {categories.map(c => (
              <div key={c.key} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${c.color}`} />
                <span className="text-xs text-stone-500">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plan bazlı liste */}
      {selectedPlanId === 'all' && completed.length > 1 && (
        <>
          <h2 className="font-semibold text-ink mb-4">Plan Bazında</h2>
          <div className="space-y-3">
            {completed.map(plan => {
              const b = plan.plan!.budget
              const planTotal = b.total_estimated || 0
              const topCategory = CATEGORY_CONFIG
                .map(c => ({ label: c.label, value: b[c.key as keyof typeof b] as number || 0 }))
                .sort((a, b) => b.value - a.value)[0]
              return (
                <Link
                  key={plan.id}
                  href={`/plan/${plan.id}`}
                  className="bg-white rounded-2xl border border-stone-200 p-5 flex items-center gap-4 hover:border-amber hover:shadow-card transition-all group"
                >
                  <span className="text-3xl shrink-0">{plan.plan!.flag_emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink group-hover:text-amber transition-colors truncate">{plan.destination}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{plan.duration_days} gün · {plan.travelers_count} kişi · En çok: {topCategory?.label}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-serif text-xl text-ink">{formatCurrency(planTotal)}</p>
                    <p className="text-xs text-stone-400">{formatCurrency(Math.round(planTotal / (plan.duration_days || 7)))}/gün</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
