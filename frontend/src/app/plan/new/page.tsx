'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuthStore, usePlansStore, useUIStore } from '@/store'
import { canGeneratePlan } from '@/lib/utils'
import type { TravelTempo } from '@/types'

const PURPOSES = ['Tatil', 'İş', 'Balayı', 'Aile', 'Macera', 'Kültür', 'Gastronomi', 'Festival']
const INTERESTS = ['Müzeler', 'Plaj', 'Doğa', 'Gece hayatı', 'Alışveriş', 'Tarih', 'Spor', 'Fotoğrafçılık']
const ACCOMMODATIONS = [
  { value: 'hostel', label: 'Hostel' },
  { value: 'hotel_3star', label: '3 Yıldız Otel' },
  { value: 'hotel_4star', label: '4 Yıldız Otel' },
  { value: 'hotel_5star', label: '5 Yıldız Otel' },
  { value: 'apartment', label: 'Apart / Airbnb' },
  { value: 'boutique', label: 'Butik Otel' },
]

const LOADING_MESSAGES = [
  'Profilin analiz ediliyor...',
  'Destinasyon araştırılıyor...',
  'Günlük rotalar oluşturuluyor...',
  'Plan tamamlanıyor...',
]

export default function NewPlanPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { addPlan } = usePlansStore()
  const { openPlusModal } = useUIStore()

  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState(0)
  const [progress, setProgress] = useState(0)

  const [form, setForm] = useState({
    destination: '',
    origin_city: '',
    start_date: '',
    end_date: '',
    travelers_count: 1,
    total_budget_try: '',
    currency: 'TRY',
    accommodation_type: 'hotel_3star',
    trip_purpose: '',
    special_requests: '',
    tempo_override: 'moderate' as TravelTempo,
    interests: [] as string[],
  })

  function toggleChip(list: string[], value: string, field: 'trip_purpose' | 'interests') {
    if (field === 'trip_purpose') {
      setForm(f => ({ ...f, trip_purpose: f.trip_purpose === value ? '' : value }))
    } else {
      setForm(f => ({
        ...f,
        interests: f.interests.includes(value)
          ? f.interests.filter(i => i !== value)
          : [...f.interests, value],
      }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.destination) return toast.error('Destinasyon gerekli')

    if (user) {
      const check = canGeneratePlan(user.subscription_tier, user.plans_generated_this_month)
      if (!check.allowed) {
        openPlusModal('plan_limit')
        return
      }
    }

    setLoading(true)
    setProgress(0)

    // Loading mesajlarını döndür
    const interval = setInterval(() => {
      setLoadingMsg(m => (m + 1) % LOADING_MESSAGES.length)
      setProgress(p => Math.min(p + 22, 88))
    }, 2000)

    try {
      const plan = await api.plans.generate({
        origin_city: form.origin_city || 'İstanbul',
        destination: form.destination,
        start_date: form.start_date || new Date().toISOString().split('T')[0],
        end_date: form.end_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        travelers_count: form.travelers_count,
        total_budget_try: form.total_budget_try ? parseFloat(form.total_budget_try) : undefined,
        currency: form.currency,
        accommodation_type: form.accommodation_type,
        trip_purpose: form.trip_purpose,
        special_requests: [form.special_requests, form.interests.join(', ')].filter(Boolean).join('. ') || undefined,
        tempo_override: form.tempo_override,
      })
      setProgress(100)
      addPlan(plan)
      clearInterval(interval)
      router.push(`/plan/${plan.id}`)
    } catch (err) {
      clearInterval(interval)
      toast.error(err instanceof Error ? err.message : 'Plan oluşturulamadı')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-24 text-center">
        <div className="text-5xl mb-6">✈️</div>
        <h2 className="font-serif text-2xl text-ink mb-2">Planın hazırlanıyor</h2>
        <p className="text-stone-500 text-sm mb-8">{LOADING_MESSAGES[loadingMsg]}</p>
        <div className="h-2 bg-stone-200 rounded-pill overflow-hidden">
          <div
            className="h-full bg-amber rounded-pill transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-stone-400 mt-3">%{progress}</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-ink mb-1">Yeni Plan</h1>
        <p className="text-stone-500 text-sm">Nereye gitmek istiyorsun?</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Destinasyon */}
        <div className="card space-y-4">
          <h2 className="font-medium text-ink">Destinasyon</h2>
          <div>
            <label className="block text-sm text-stone-700 mb-1.5">Nereye? *</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="Tokyo, Paris, Bali..."
              value={form.destination}
              onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm text-stone-700 mb-1.5">Nereden?</label>
            <input
              type="text"
              className="input-field"
              placeholder="İstanbul"
              value={form.origin_city}
              onChange={e => setForm(f => ({ ...f, origin_city: e.target.value }))}
            />
          </div>
        </div>

        {/* Tarih & Kişi */}
        <div className="card space-y-4">
          <h2 className="font-medium text-ink">Tarih & Kişi</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-stone-700 mb-1.5">Gidiş</label>
              <input
                type="date"
                className="input-field"
                value={form.start_date}
                onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm text-stone-700 mb-1.5">Dönüş</label>
              <input
                type="date"
                className="input-field"
                value={form.end_date}
                onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-stone-700 mb-1.5">Kişi Sayısı</label>
            <input
              type="number"
              min={1}
              max={20}
              className="input-field"
              value={form.travelers_count}
              onChange={e => setForm(f => ({ ...f, travelers_count: parseInt(e.target.value) }))}
            />
          </div>
        </div>

        {/* Bütçe & Konaklama */}
        <div className="card space-y-4">
          <h2 className="font-medium text-ink">Bütçe & Konaklama</h2>
          <div>
            <label className="block text-sm text-stone-700 mb-1.5">Toplam Bütçe (TRY)</label>
            <input
              type="number"
              className="input-field"
              placeholder="Örn: 25000"
              value={form.total_budget_try}
              onChange={e => setForm(f => ({ ...f, total_budget_try: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm text-stone-700 mb-1.5">Konaklama Tercihi</label>
            <select
              className="input-field"
              value={form.accommodation_type}
              onChange={e => setForm(f => ({ ...f, accommodation_type: e.target.value }))}
            >
              {ACCOMMODATIONS.map(a => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Amaç */}
        <div className="card space-y-4">
          <h2 className="font-medium text-ink">Seyahat Amacı</h2>
          <div className="flex flex-wrap gap-2">
            {PURPOSES.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => toggleChip([], p, 'trip_purpose')}
                className={`px-3 py-1.5 rounded-pill text-sm border transition-colors ${
                  form.trip_purpose === p
                    ? 'bg-amber text-white border-amber'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* İlgi Alanları */}
        <div className="card space-y-4">
          <h2 className="font-medium text-ink">İlgi Alanları</h2>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map(i => (
              <button
                key={i}
                type="button"
                onClick={() => toggleChip(form.interests, i, 'interests')}
                className={`px-3 py-1.5 rounded-pill text-sm border transition-colors ${
                  form.interests.includes(i)
                    ? 'bg-amber text-white border-amber'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* Tempo */}
        <div className="card space-y-4">
          <h2 className="font-medium text-ink">Seyahat Temposu</h2>
          <div className="grid grid-cols-3 gap-3">
            {([
              { value: 'slow', label: 'Yavaş', emoji: '🌿' },
              { value: 'moderate', label: 'Dengeli', emoji: '⚖️' },
              { value: 'intensive', label: 'Yoğun', emoji: '⚡' },
            ] as const).map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, tempo_override: t.value }))}
                className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all ${
                  form.tempo_override === t.value
                    ? 'border-amber bg-amber-light'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <span className="text-xl">{t.emoji}</span>
                <span className="text-sm font-medium text-ink">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Özel Not */}
        <div className="card">
          <label className="block text-sm font-medium text-ink mb-2">Özel İstekler</label>
          <textarea
            className="input-field resize-none"
            rows={3}
            placeholder="Mutlaka görülecek yerler, özel istekler, kısıtlamalar..."
            value={form.special_requests}
            onChange={e => setForm(f => ({ ...f, special_requests: e.target.value }))}
          />
        </div>

        <button type="submit" className="btn-primary w-full text-base py-4">
          Planı Oluştur ✈️
        </button>
      </form>
    </div>
  )
}
