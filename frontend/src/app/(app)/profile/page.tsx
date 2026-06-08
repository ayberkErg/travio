'use client'

import Link from 'next/link'
import { useAuthStore, usePersonaStore, usePlansStore } from '@/store'
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

const ACHIEVEMENTS = [
  { emoji: '✈️', name: 'İlk Uçuş', desc: 'İlk planı oluştur', done: true },
  { emoji: '🌍', name: 'Dünya Gezgini', desc: '5 farklı ülke', done: false },
  { emoji: '🍜', name: 'Gurme', desc: '3 farklı mutfak dene', done: false },
  { emoji: '📸', name: 'Fotoğrafçı', desc: '10 plan tamamla', done: false },
  { emoji: '👑', name: 'Efsane', desc: '700 Travio puan', done: false },
  { emoji: '⛵', name: 'Seyyah', desc: '50 Travio puan', done: false },
]

export default function ProfilePage() {
  const { user } = useAuthStore()
  const { persona } = usePersonaStore()
  const { plans } = usePlansStore()
  const score = persona?.travio_score || 0
  const scoreInfo = travioScoreLevel(score)

  const completedPlans = plans.filter(p => p.status === 'completed')
  const favoritePlans = plans.filter(p => p.is_favorite)

  const interestEntries = persona
    ? Object.entries(INTEREST_LABELS).map(([key, label]) => ({
        label,
        value: persona[key as keyof typeof persona] as number,
      })).sort((a, b) => (b.value as number) - (a.value as number)).slice(0, 6)
    : []

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Avatar & bilgi */}
      <div className="card">
        <div className="flex items-start gap-5">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber to-coral text-white flex items-center justify-center text-3xl font-bold shadow-amber">
              {user ? initials(user.full_name || user.email) : '?'}
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white rounded-xl shadow-card flex items-center justify-center text-sm">
              {scoreInfo.emoji}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-2xl text-ink">{user?.full_name || 'Gezgin'}</h1>
            <p className="text-stone-400 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm font-semibold text-amber">{scoreInfo.name}</span>
              <span className="text-stone-300">·</span>
              <span className="text-sm text-stone-500">{score} puan</span>
            </div>
            <div className="mt-2 w-full max-w-[200px]">
              <div className="h-1.5 bg-stone-100 rounded-pill overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber to-amber-mid rounded-pill" style={{ width: `${scoreInfo.percent}%` }} />
              </div>
            </div>
          </div>
          <Link href="/auth/onboarding" className="btn-secondary text-xs py-2 px-4 shrink-0">
            Güncelle
          </Link>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center" style={{ borderTopWidth: '3px', borderTopColor: 'var(--amber)' }}>
          <p className="font-serif text-2xl text-ink">{plans.length}</p>
          <p className="text-xs text-stone-500 mt-0.5 font-medium">Toplam Plan</p>
        </div>
        <div className="card p-4 text-center" style={{ borderTopWidth: '3px', borderTopColor: 'var(--teal)' }}>
          <p className="font-serif text-2xl text-ink">{completedPlans.length}</p>
          <p className="text-xs text-stone-500 mt-0.5 font-medium">Tamamlanan</p>
        </div>
        <div className="card p-4 text-center" style={{ borderTopWidth: '3px', borderTopColor: 'var(--coral)' }}>
          <p className="font-serif text-2xl text-ink">{favoritePlans.length}</p>
          <p className="text-xs text-stone-500 mt-0.5 font-medium">Favori</p>
        </div>
      </div>

      {/* AI Özeti */}
      {persona?.ai_summary && (
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 bg-amber-light rounded-lg flex items-center justify-center text-sm">✨</span>
            <h2 className="font-semibold text-ink text-sm">AI Seyahat Profilin</h2>
          </div>
          <p className="text-stone-600 text-sm leading-relaxed">{persona.ai_summary}</p>
        </div>
      )}

      {/* Seyahat Tarzı */}
      {persona && (
        <div className="card">
          <h2 className="font-semibold text-ink mb-4 text-sm">Seyahat Tarzı</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Stil', value: STYLE_LABELS[persona.travel_style] || persona.travel_style },
              { label: 'Beraberinde', value: COMPANION_LABELS[persona.companion_type] || persona.companion_type },
              { label: 'Tempo', value: persona.travel_tempo },
              { label: 'Günlük Bütçe', value: `$${persona.typical_daily_budget_usd}` },
            ].map(item => (
              <div key={item.label} className="bg-stone-50 rounded-xl p-3">
                <p className="text-2xs text-stone-400 uppercase tracking-wide mb-1">{item.label}</p>
                <p className="text-sm font-semibold text-ink capitalize">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* İlgi Alanları */}
      {interestEntries.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-ink mb-4 text-sm">İlgi Alanları</h2>
          <div className="space-y-3">
            {interestEntries.map(({ label, value }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-stone-700 font-medium">{label}</span>
                  <span className="text-amber font-bold">{value}/10</span>
                </div>
                <div className="h-1.5 bg-stone-100 rounded-pill overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber to-amber-mid rounded-pill transition-all"
                    style={{ width: `${((value as number) / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Başarımlar */}
      <div className="card">
        <h2 className="font-semibold text-ink mb-4 text-sm">Başarımlar</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {ACHIEVEMENTS.map(a => (
            <div key={a.name}
              className={`text-center p-3 rounded-xl border transition-all ${
                a.done ? 'bg-amber-light border-amber/20' : 'bg-stone-50 border-stone-100 opacity-50'
              }`}
            >
              <span className={`text-2xl block mb-1 ${!a.done ? 'grayscale' : ''}`}>{a.emoji}</span>
              <p className={`text-xs font-bold ${a.done ? 'text-amber' : 'text-stone-400'}`}>{a.name}</p>
              <p className="text-2xs text-stone-400 mt-0.5 leading-tight">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {!persona && (
        <div className="card text-center py-12">
          <span className="text-4xl block mb-3">✨</span>
          <h2 className="font-serif text-xl text-ink mb-2">Profil henüz oluşturulmamış</h2>
          <p className="text-stone-500 text-sm mb-5 max-w-xs mx-auto">
            5 soruyu yanıtla, AI sana özel seyahat planları üretsin.
          </p>
          <Link href="/auth/onboarding" className="btn-primary shadow-amber">Profil Oluştur →</Link>
        </div>
      )}
    </div>
  )
}
