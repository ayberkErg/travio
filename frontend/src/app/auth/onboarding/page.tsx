'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { usePersonaStore } from '@/store'
import type { TravelStyle, CompanionType, TravelTempo } from '@/types'

const STEPS = 5

const TRAVEL_STYLES: { value: TravelStyle; label: string; emoji: string; desc: string }[] = [
  { value: 'backpacker', label: 'Sırt Çantalı', emoji: '🎒', desc: 'Hostel, lokal deneyim' },
  { value: 'budget', label: 'Bütçe Dostu', emoji: '💰', desc: 'Uygun fiyat, kaliteli' },
  { value: 'mid_range', label: 'Orta Segment', emoji: '🏨', desc: '3-4 yıldız, konfor' },
  { value: 'comfort', label: 'Konforlu', emoji: '✨', desc: '4-5 yıldız, rahat' },
  { value: 'luxury', label: 'Lüks', emoji: '👑', desc: '5 yıldız, özel hizmet' },
]

const COMPANIONS: { value: CompanionType; label: string; emoji: string }[] = [
  { value: 'solo', label: 'Yalnız', emoji: '🧍' },
  { value: 'couple', label: 'Çift', emoji: '👫' },
  { value: 'friends', label: 'Arkadaşlar', emoji: '👥' },
  { value: 'family_kids', label: 'Çocuklu Aile', emoji: '👨‍👩‍👧' },
  { value: 'family_adult', label: 'Yetişkin Aile', emoji: '👨‍👩‍👦‍👦' },
]

const TEMPOS: { value: TravelTempo; label: string; emoji: string; desc: string }[] = [
  { value: 'slow', label: 'Yavaş', emoji: '🌿', desc: 'Az yer, derin deneyim' },
  { value: 'moderate', label: 'Dengeli', emoji: '⚖️', desc: 'Orta hız, iyi denge' },
  { value: 'intensive', label: 'Yoğun', emoji: '⚡', desc: 'Çok yer, maksimum keşif' },
]

const INTERESTS = [
  { key: 'interest_history_culture', label: 'Tarih & Kültür', emoji: '🏛️' },
  { key: 'interest_gastronomy', label: 'Gastronomi', emoji: '🍽️' },
  { key: 'interest_nature_outdoor', label: 'Doğa & Açık Hava', emoji: '🏕️' },
  { key: 'interest_nightlife', label: 'Gece Hayatı', emoji: '🎉' },
  { key: 'interest_art_museums', label: 'Sanat & Müzeler', emoji: '🎨' },
  { key: 'interest_shopping', label: 'Alışveriş', emoji: '🛍️' },
  { key: 'interest_sports_adventure', label: 'Spor & Macera', emoji: '🧗' },
  { key: 'interest_photography', label: 'Fotoğrafçılık', emoji: '📷' },
  { key: 'interest_local_experiences', label: 'Yerel Deneyimler', emoji: '🏘️' },
  { key: 'interest_wellness_spa', label: 'Wellness & Spa', emoji: '🧘' },
]

interface PersonaForm {
  travel_style: TravelStyle
  companion_type: CompanionType
  travel_tempo: TravelTempo
  interests: Record<string, number>
  typical_daily_budget_usd: number
}

export default function OnboardingPage() {
  const router = useRouter()
  const { setPersona } = usePersonaStore()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<PersonaForm>({
    travel_style: 'mid_range',
    companion_type: 'solo',
    travel_tempo: 'moderate',
    interests: Object.fromEntries(INTERESTS.map(i => [i.key, 5])),
    typical_daily_budget_usd: 100,
  })

  const progress = (step / STEPS) * 100

  async function handleFinish() {
    setLoading(true)
    try {
      const payload = {
        travel_style: form.travel_style,
        companion_type: form.companion_type,
        travel_tempo: form.travel_tempo,
        typical_daily_budget_usd: form.typical_daily_budget_usd,
        ...form.interests,
      }
      const persona = await api.persona.create(payload)
      setPersona(persona)
      router.push('/dashboard')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="font-serif text-2xl text-ink">travio</span>
          <p className="text-stone-500 text-sm mt-1">Seni tanıyalım</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-stone-500 mb-2">
            <span>Adım {step} / {STEPS}</span>
            <span>%{Math.round(progress)}</span>
          </div>
          <div className="h-1.5 bg-stone-200 rounded-pill overflow-hidden">
            <div
              className="h-full bg-amber rounded-pill transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step 1 — Seyahat Tarzı */}
        {step === 1 && (
          <div>
            <h2 className="font-serif text-2xl text-ink mb-2">Nasıl seyahat edersin?</h2>
            <p className="text-stone-500 text-sm mb-6">Konaklama ve harcama tarzını seç.</p>
            <div className="space-y-3">
              {TRAVEL_STYLES.map(s => (
                <button
                  key={s.value}
                  onClick={() => setForm(f => ({ ...f, travel_style: s.value }))}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    form.travel_style === s.value
                      ? 'border-amber bg-amber-light'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <span className="text-2xl">{s.emoji}</span>
                  <div>
                    <div className="font-medium text-ink">{s.label}</div>
                    <div className="text-xs text-stone-500">{s.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Kimlerle */}
        {step === 2 && (
          <div>
            <h2 className="font-serif text-2xl text-ink mb-2">Kimlerle seyahat edersin?</h2>
            <p className="text-stone-500 text-sm mb-6">Genellikle nasıl bir grup olur?</p>
            <div className="grid grid-cols-2 gap-3">
              {COMPANIONS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setForm(f => ({ ...f, companion_type: c.value }))}
                  className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all ${
                    form.companion_type === c.value
                      ? 'border-amber bg-amber-light'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <span className="text-3xl">{c.emoji}</span>
                  <span className="text-sm font-medium text-ink">{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Tempo */}
        {step === 3 && (
          <div>
            <h2 className="font-serif text-2xl text-ink mb-2">Seyahat tempon ne?</h2>
            <p className="text-stone-500 text-sm mb-6">Günde kaç yer görmek istersin?</p>
            <div className="space-y-3">
              {TEMPOS.map(t => (
                <button
                  key={t.value}
                  onClick={() => setForm(f => ({ ...f, travel_tempo: t.value }))}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    form.travel_tempo === t.value
                      ? 'border-amber bg-amber-light'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <span className="text-2xl">{t.emoji}</span>
                  <div>
                    <div className="font-medium text-ink">{t.label}</div>
                    <div className="text-xs text-stone-500">{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4 — İlgi Alanları */}
        {step === 4 && (
          <div>
            <h2 className="font-serif text-2xl text-ink mb-2">İlgi alanların?</h2>
            <p className="text-stone-500 text-sm mb-6">Kaydırarak önem sırasını ayarla (1–10).</p>
            <div className="space-y-4">
              {INTERESTS.map(i => (
                <div key={i.key}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-ink">{i.emoji} {i.label}</span>
                    <span className="text-amber font-medium">{form.interests[i.key]}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={form.interests[i.key]}
                    onChange={e => setForm(f => ({
                      ...f,
                      interests: { ...f.interests, [i.key]: parseInt(e.target.value) },
                    }))}
                    className="w-full accent-amber"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5 — Bütçe */}
        {step === 5 && (
          <div>
            <h2 className="font-serif text-2xl text-ink mb-2">Günlük bütçen ne kadar?</h2>
            <p className="text-stone-500 text-sm mb-6">Konaklama hariç, kişi başı günlük harcama (USD).</p>
            <div className="space-y-4">
              {[50, 100, 150, 250, 500].map(b => (
                <button
                  key={b}
                  onClick={() => setForm(f => ({ ...f, typical_daily_budget_usd: b }))}
                  className={`w-full flex justify-between items-center p-4 rounded-xl border-2 transition-all ${
                    form.typical_daily_budget_usd === b
                      ? 'border-amber bg-amber-light'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <span className="font-medium text-ink">${b}/gün</span>
                  <span className="text-xs text-stone-500">
                    {b <= 50 ? 'Çok bütçeli' : b <= 100 ? 'Bütçeli' : b <= 150 ? 'Orta' : b <= 250 ? 'Konforlu' : 'Lüks'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="btn-secondary flex-1"
            >
              ← Geri
            </button>
          )}
          {step < STEPS ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="btn-primary flex-1"
            >
              Devam →
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-60"
            >
              {loading ? 'Profil oluşturuluyor...' : 'Başla →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
