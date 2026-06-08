'use client'

import { useAuthStore, usePersonaStore, useUIStore } from '@/store'
import { travioScoreLevel } from '@/lib/utils'

const LEVELS = [
  { level: 'beginner', name: 'Kaşif', emoji: '🗺️', min: 0, max: 49, color: 'from-stone-400 to-stone-500' },
  { level: 'explorer', name: 'Seyyah', emoji: '⛵', min: 50, max: 149, color: 'from-sky-400 to-blue-500' },
  { level: 'adventurer', name: 'Maceracı', emoji: '🧗', min: 150, max: 349, color: 'from-teal-400 to-emerald-500' },
  { level: 'globetrotter', name: 'Gezgin', emoji: '✈️', min: 350, max: 699, color: 'from-violet-400 to-purple-600' },
  { level: 'legend', name: 'Efsane', emoji: '👑', min: 700, max: 999, color: 'from-amber-400 to-orange-500' },
]

const ACTIONS = [
  { label: 'Seyahati tamamla', pts: '+15', emoji: '🏁', color: 'text-teal' },
  { label: 'Yeni ülke keşfet', pts: '+10', emoji: '🌍', color: 'text-violet' },
  { label: 'Yerel deneyim yaşa', pts: '+5', emoji: '🍜', color: 'text-amber' },
  { label: 'Yeni mutfak dene', pts: '+4', emoji: '🍽️', color: 'text-coral' },
  { label: 'Yeni şehir gez', pts: '+3', emoji: '🏙️', color: 'text-sky' },
  { label: 'Plan oluştur', pts: '+2', emoji: '📋', color: 'text-stone-500' },
]

export default function ScorePage() {
  useAuthStore()
  const { persona } = usePersonaStore()
  const { openPlusModal } = useUIStore()
  const score = persona?.travio_score || 0
  const scoreInfo = travioScoreLevel(score)

  const currentLevelIndex = LEVELS.findIndex(l => l.level === (persona?.traveler_level || 'beginner'))
  const nextLevel = LEVELS[currentLevelIndex + 1]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-ink">Travio Score</h1>
        <p className="text-stone-500 text-sm mt-0.5">Seyahat ettiğin ve deneyim yaşadığın her an puan kazan.</p>
      </div>

      {/* Ana skor kartı */}
      <div className="relative overflow-hidden bg-ink rounded-2xl p-8 mb-4 text-center">
        <div className="absolute inset-0 bg-dots-dark" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber/8 rounded-full blur-3xl" />

        <div className="relative">
          <span className="text-5xl block mb-4 drop-shadow-lg">{scoreInfo.emoji}</span>
          <p className="font-serif text-8xl text-white mb-1 leading-none">{score}</p>
          <p className="text-amber font-bold text-lg tracking-wide mb-1">{scoreInfo.name}</p>
          {scoreInfo.next && (
            <p className="text-stone-500 text-sm">Sonraki seviye: <span className="text-stone-400 font-medium">{scoreInfo.next}</span></p>
          )}

          {/* Progress bar */}
          <div className="mt-6 max-w-xs mx-auto">
            <div className="flex justify-between text-xs text-stone-500 mb-1.5">
              <span>{LEVELS[currentLevelIndex]?.min ?? 0} puan</span>
              {nextLevel && <span>{nextLevel.min} puan</span>}
            </div>
            <div className="h-2.5 bg-white/10 rounded-pill overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber to-amber-mid rounded-pill transition-all duration-1000"
                style={{ width: `${scoreInfo.percent}%` }}
              />
            </div>
            <p className="text-xs text-stone-500 mt-1.5">%{scoreInfo.percent} tamamlandı</p>
          </div>
        </div>
      </div>

      {/* Seviyeler */}
      <div className="card mb-4">
        <h2 className="font-semibold text-ink mb-4">Seviye Yolculuğu</h2>
        <div className="space-y-2">
          {LEVELS.map((l, i) => {
            const active = l.level === (persona?.traveler_level || 'beginner')
            const passed = i < currentLevelIndex
            return (
              <div
                key={l.level}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  active ? 'bg-amber-light border border-amber/20' : passed ? 'bg-stone-50' : 'bg-stone-50/50'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${l.color} flex items-center justify-center text-lg shrink-0 ${!passed && !active ? 'opacity-30 grayscale' : ''}`}>
                  {l.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${active ? 'text-amber' : passed ? 'text-ink' : 'text-stone-400'}`}>
                    {l.name}
                  </p>
                  <p className="text-xs text-stone-400">{l.min}–{l.max} puan</p>
                </div>
                {passed && (
                  <span className="text-teal text-sm">✓</span>
                )}
                {active && (
                  <span className="text-2xs font-bold text-amber bg-amber-mid/30 px-2 py-0.5 rounded-pill uppercase tracking-wide">Şu an</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Puan kazanma aksiyonları */}
      <div className="card mb-4">
        <h2 className="font-semibold text-ink mb-4">Nasıl Puan Kazanılır?</h2>
        <div className="grid grid-cols-2 gap-2.5">
          {ACTIONS.map(a => (
            <div key={a.label} className="flex items-center gap-3 bg-stone-50 rounded-xl px-4 py-3">
              <span className="text-xl shrink-0">{a.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-stone-600 font-medium truncate">{a.label}</p>
              </div>
              <span className={`text-sm font-bold ${a.color} shrink-0`}>{a.pts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Paylaşım — Plus */}
      <button
        onClick={() => openPlusModal('score_share')}
        className="w-full card text-center py-7 hover:border-amber hover:bg-amber-light/20 transition-all cursor-pointer group"
      >
        <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">🏆</span>
        <p className="font-semibold text-ink">Skorunu Paylaş</p>
        <p className="text-stone-500 text-sm mt-1">Plus ile kişisel Travio kartını oluştur ve arkadaşlarınla paylaş</p>
        <span className="inline-block mt-3 text-xs font-bold text-amber bg-amber-light px-3 py-1 rounded-pill">Plus Özelliği</span>
      </button>
    </div>
  )
}
