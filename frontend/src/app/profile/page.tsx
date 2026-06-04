'use client'

import Link from 'next/link'
import { useAuthStore, usePersonaStore } from '@/store'
import { initials, travioScoreLevel } from '@/lib/utils'

const INTEREST_LABELS: Record<string, string> = {
  interest_history_culture: 'Tarih & Kültür',
  interest_gastronomy: 'Gastronomi',
  interest_nature_outdoor: 'Doğa & Açık Hava',
  interest_nightlife: 'Gece Hayatı',
  interest_art_museums: 'Sanat & Müzeler',
  interest_shopping: 'Alışveriş',
  interest_sports_adventure: 'Spor & Macera',
  interest_photography: 'Fotoğrafçılık',
  interest_local_experiences: 'Yerel Deneyimler',
  interest_wellness_spa: 'Wellness & Spa',
}

const STYLE_LABELS: Record<string, string> = {
  backpacker: 'Sırt Çantalı 🎒',
  budget: 'Bütçe Dostu 💰',
  mid_range: 'Orta Segment 🏨',
  comfort: 'Konforlu ✨',
  luxury: 'Lüks 👑',
}

const COMPANION_LABELS: Record<string, string> = {
  solo: 'Yalnız 🧍',
  couple: 'Çift 👫',
  friends: 'Arkadaşlar 👥',
  family_kids: 'Çocuklu Aile 👨‍👩‍👧',
  family_adult: 'Yetişkin Aile 👨‍👩‍👦‍👦',
}

export default function ProfilePage() {
  const { user } = useAuthStore()
  const { persona } = usePersonaStore()
  const score = persona?.travio_score || 0
  const scoreInfo = travioScoreLevel(score)

  const interestEntries = persona
    ? Object.entries(INTEREST_LABELS).map(([key, label]) => ({
        label,
        value: persona[key as keyof typeof persona] as number,
      })).sort((a, b) => (b.value as number) - (a.value as number))
    : []

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Avatar & bilgi */}
      <div className="card flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-amber text-white flex items-center justify-center text-2xl font-medium shrink-0">
          {user ? initials(user.full_name || user.email) : '?'}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-2xl text-ink">{user?.full_name || 'Gezgin'}</h1>
          <p className="text-stone-500 text-sm">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg">{scoreInfo.emoji}</span>
            <span className="text-sm font-medium text-amber">{scoreInfo.name}</span>
            <span className="text-sm text-stone-400">· {score} puan</span>
          </div>
        </div>
        <Link href="/auth/onboarding" className="btn-secondary text-sm py-2 shrink-0">
          Güncelle
        </Link>
      </div>

      {/* AI Özeti */}
      {persona?.ai_summary && (
        <div className="card">
          <h2 className="font-medium text-ink mb-3">✨ AI Profilin</h2>
          <p className="text-stone-600 text-sm leading-relaxed">{persona.ai_summary}</p>
        </div>
      )}

      {/* Seyahat Tarzı */}
      {persona && (
        <div className="card">
          <h2 className="font-medium text-ink mb-4">Seyahat Tarzı</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-xs text-stone-400 mb-1">Stil</p>
              <p className="text-sm font-medium text-ink">{STYLE_LABELS[persona.travel_style] || persona.travel_style}</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-xs text-stone-400 mb-1">Beraberinde</p>
              <p className="text-sm font-medium text-ink">{COMPANION_LABELS[persona.companion_type] || persona.companion_type}</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-xs text-stone-400 mb-1">Tempo</p>
              <p className="text-sm font-medium text-ink capitalize">{persona.travel_tempo}</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-xs text-stone-400 mb-1">Günlük Bütçe</p>
              <p className="text-sm font-medium text-ink">${persona.typical_daily_budget_usd}</p>
            </div>
          </div>
        </div>
      )}

      {/* İlgi Alanları */}
      {interestEntries.length > 0 && (
        <div className="card">
          <h2 className="font-medium text-ink mb-4">İlgi Alanları</h2>
          <div className="space-y-3">
            {interestEntries.map(({ label, value }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-ink">{label}</span>
                  <span className="text-amber font-medium">{value}/10</span>
                </div>
                <div className="h-1.5 bg-stone-100 rounded-pill overflow-hidden">
                  <div className="h-full bg-amber rounded-pill" style={{ width: `${(value as number / 10) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!persona && (
        <div className="card text-center py-10">
          <p className="text-stone-500 mb-4">Profil henüz oluşturulmamış.</p>
          <Link href="/auth/onboarding" className="btn-primary">Profil Oluştur →</Link>
        </div>
      )}
    </div>
  )
}
