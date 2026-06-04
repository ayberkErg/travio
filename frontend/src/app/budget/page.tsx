'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePlansStore } from '@/store'
import { formatCurrency } from '@/lib/utils'
import api from '@/lib/api'

export default function BudgetPage() {
  const { plans, setPlans } = usePlansStore()

  useEffect(() => {
    api.plans.list().then(setPlans).catch(() => {})
  }, [setPlans])

  const completed = plans.filter(p => p.status === 'completed' && p.plan)

  const totals = completed.reduce(
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

  const categories = [
    { label: 'Uçuş', value: totals.flights, emoji: '✈️' },
    { label: 'Konaklama', value: totals.accommodation, emoji: '🏨' },
    { label: 'Yemek', value: totals.food, emoji: '🍽️' },
    { label: 'Aktiviteler', value: totals.activities, emoji: '🎭' },
    { label: 'Ulaşım', value: totals.transport, emoji: '🚇' },
  ].filter(c => c.value > 0)

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-serif text-2xl text-ink mb-6">Bütçe Takibi</h1>

      {completed.length === 0 ? (
        <div className="card text-center py-16">
          <span className="text-4xl block mb-4">💰</span>
          <p className="text-stone-500 mb-4">Tamamlanmış plan yok.</p>
          <Link href="/plan/new" className="btn-primary">Plan Oluştur →</Link>
        </div>
      ) : (
        <>
          {/* Özet */}
          <div className="card mb-6">
            <h2 className="font-medium text-ink mb-4">Toplam Harcama Özeti</h2>
            <div className="space-y-4">
              {categories.map(c => {
                const pct = totals.total > 0 ? Math.round((c.value / totals.total) * 100) : 0
                return (
                  <div key={c.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-ink">{c.emoji} {c.label}</span>
                      <span className="text-stone-500">{formatCurrency(c.value)} · %{pct}</span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-pill overflow-hidden">
                      <div className="h-full bg-amber rounded-pill transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-6 pt-4 border-t border-stone-200 flex justify-between items-center">
              <span className="font-medium text-ink">Toplam Tahmini Harcama</span>
              <span className="font-serif text-2xl text-ink">{formatCurrency(totals.total)}</span>
            </div>
          </div>

          {/* Plan bazlı */}
          <h2 className="font-medium text-ink mb-4">Plan Bazında</h2>
          <div className="space-y-3">
            {completed.map(plan => (
              <Link key={plan.id} href={`/plan/${plan.id}`} className="card flex items-center justify-between hover:border-amber transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{plan.plan!.flag_emoji}</span>
                  <div>
                    <p className="font-medium text-ink">{plan.destination}</p>
                    <p className="text-xs text-stone-500">{plan.duration_days} gün · {plan.travelers_count} kişi</p>
                  </div>
                </div>
                <p className="font-serif text-lg text-ink">{formatCurrency(plan.plan!.budget.total_estimated)}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
