'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { useAuthStore, usePlansStore, useUIStore } from '@/store'
import { canGeneratePlan } from '@/lib/utils'
import type { TravelTempo } from '@/types'
import AirportInput from '@/components/ui/AirportInput'
import { useNearestAirport } from '@/lib/useNearestAirport'

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

const TEMPO_OPTIONS = [
  { value: 'slow', label: 'Yavaş', emoji: '🌿', desc: 'Az aktivite, derin deneyim' },
  { value: 'moderate', label: 'Dengeli', emoji: '⚖️', desc: 'Standart tempo' },
  { value: 'intensive', label: 'Yoğun', emoji: '⚡', desc: 'Her şeyi gör' },
] as const

export default function NewPlanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  const { addPlan } = usePlansStore()
  const { openPlusModal } = useUIStore()
  const { airport } = useNearestAirport()

  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const dest = searchParams.get('destination')
    if (dest) setForm(f => ({ ...f, destination: dest }))
  }, [searchParams])

  useEffect(() => {
    if (airport) {
      setForm(f => ({ ...f, origin_city: airport.city }))
    }
  }, [airport])

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
        <div className="relative inline-flex mb-8">
          <div className="w-20 h-20 rounded-full bg-amber-light flex items-center justify-center text-4xl animate-float">
            ✈️
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-amber/30 animate-pulse-ring" />
        </div>
        <h2 className="font-serif text-2xl text-ink mb-2">Planın hazırlanıyor</h2>
        <p className="text-stone-500 text-sm mb-8 font-medium">{LOADING_MESSAGES[loadingMsg]}</p>
        <div className="h-2 bg-stone-200 rounded-pill overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-amber to-coral rounded-pill transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-stone-400 font-medium">%{progress}</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Başlık */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-ink mb-1">Yeni Plan</h1>
        <p className="text-stone-500 text-sm font-medium">Nereye gitmek istiyorsun?</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Destinasyon */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">📍</span>
            <h2 className="font-semibold text-ink">Destinasyon</h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">Nereye? *</label>
            <AirportInput
              cityOnly
              required
              placeholder="Tokyo, Paris, Barcelona..."
              value={form.destination}
              onChange={(val) => setForm(f => ({ ...f, destination: val }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">Nereden?</label>
            <AirportInput
              cityOnly
              placeholder="İstanbul"
              value={form.origin_city}
              onChange={(val) => setForm(f => ({ ...f, origin_city: val }))}
            />
          </div>
        </div>

        {/* Tarih & Kişi */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">📅</span>
            <h2 className="font-semibold text-ink">Tarih & Kişi</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">Gidiş</label>
              <input type="date" className="input-field" value={form.start_date}
                onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">Dönüş</label>
              <input type="date" className="input-field" value={form.end_date}
                onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">Kişi Sayısı</label>
            <div className="flex items-center gap-3">
              <button type="button"
                className="w-10 h-10 rounded-xl border-2 border-stone-200 flex items-center justify-center text-stone-600 hover:border-amber hover:text-amber transition-colors font-bold text-lg"
                onClick={() => setForm(f => ({ ...f, travelers_count: Math.max(1, f.travelers_count - 1) }))}>
                −
              </button>
              <span className="font-serif text-2xl text-ink w-8 text-center">{form.travelers_count}</span>
              <button type="button"
                className="w-10 h-10 rounded-xl border-2 border-stone-200 flex items-center justify-center text-stone-600 hover:border-amber hover:text-amber transition-colors font-bold text-lg"
                onClick={() => setForm(f => ({ ...f, travelers_count: Math.min(20, f.travelers_count + 1) }))}>
                +
              </button>
              <span className="text-sm text-stone-400 font-medium ml-1">kişi</span>
            </div>
          </div>
        </div>

        {/* Bütçe & Konaklama */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">💰</span>
            <h2 className="font-semibold text-ink">Bütçe & Konaklama</h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">
              Toplam Bütçe <span className="text-stone-400">(TRY, isteğe bağlı)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold">₺</span>
              <input type="number" className="input-field pl-8" placeholder="25.000"
                value={form.total_budget_try}
                onChange={e => setForm(f => ({ ...f, total_budget_try: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">Konaklama Tercihi</label>
            <select className="input-field" value={form.accommodation_type}
              onChange={e => setForm(f => ({ ...f, accommodation_type: e.target.value }))}>
              {ACCOMMODATIONS.map(a => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Seyahat Amacı */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🎯</span>
            <h2 className="font-semibold text-ink">Seyahat Amacı</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {PURPOSES.map(p => (
              <button key={p} type="button"
                onClick={() => toggleChip([], p, 'trip_purpose')}
                className={`px-4 py-2 rounded-pill text-sm font-medium border-2 transition-all ${
                  form.trip_purpose === p
                    ? 'bg-amber text-white border-amber shadow-amber'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-amber/40'
                }`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* İlgi Alanları */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">✨</span>
            <h2 className="font-semibold text-ink">İlgi Alanları</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map(i => (
              <button key={i} type="button"
                onClick={() => toggleChip(form.interests, i, 'interests')}
                className={`px-4 py-2 rounded-pill text-sm font-medium border-2 transition-all ${
                  form.interests.includes(i)
                    ? 'bg-amber text-white border-amber shadow-amber'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-amber/40'
                }`}>
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* Tempo */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🕐</span>
            <h2 className="font-semibold text-ink">Seyahat Temposu</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {TEMPO_OPTIONS.map(t => (
              <button key={t.value} type="button"
                onClick={() => setForm(f => ({ ...f, tempo_override: t.value }))}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  form.tempo_override === t.value
                    ? 'border-amber bg-amber-light shadow-amber'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}>
                <span className="text-2xl">{t.emoji}</span>
                <span className="text-sm font-bold text-ink">{t.label}</span>
                <span className="text-xs text-stone-400 text-center leading-tight">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Özel Not */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">💬</span>
            <label className="font-semibold text-ink">Özel İstekler</label>
            <span className="text-xs text-stone-400 font-medium">(isteğe bağlı)</span>
          </div>
          <textarea
            className="input-field resize-none"
            rows={3}
            placeholder="Mutlaka görülecek yerler, özel istekler, kısıtlamalar..."
            value={form.special_requests}
            onChange={e => setForm(f => ({ ...f, special_requests: e.target.value }))}
          />
        </div>

        <button type="submit" className="btn-primary w-full text-base py-4 shadow-amber">
          Planı Oluştur ✈️
        </button>
      </form>
    </div>
  )
}
