'use client'

import { useAuthStore, usePersonaStore, useUIStore } from '@/store'
import { travioScoreLevel } from '@/lib/utils'

const LEVELS = [
  { level: 'beginner', name: 'Kaşif', emoji: '🗺️', min: 0, max: 49 },
  { level: 'explorer', name: 'Seyyah', emoji: '⛵', min: 50, max: 149 },
  { level: 'adventurer', name: 'Maceracı', emoji: '🧗', min: 150, max: 349 },
  { level: 'globetrotter', name: 'Gezgin', emoji: '✈️', min: 350, max: 699 },
  { level: 'legend', name: 'Efsane', emoji: '👑', min: 700, max: 999 },
]

export default function ScorePage() {
  useAuthStore()
  const { persona } = usePersonaStore()
  const { openPlusModal } = useUIStore()
  const score = persona?.travio_score || 0
  const scoreInfo = travioScoreLevel(score)

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-serif text-2xl text-ink mb-6">Travio Score</h1>

      {/* Ana kart */}
      <div className="card text-center mb-6 py-10">
        <span className="text-6xl block mb-4">{scoreInfo.emoji}</span>
        <p className="font-serif text-7xl text-ink mb-2">{score}</p>
        <p className="text-xl font-medium text-amber mb-1">{scoreInfo.name}</p>
        {scoreInfo.next && (
          <p className="text-stone-500 text-sm">Sonraki seviye: {scoreInfo.next}</p>
        )}
        <div className="mt-6 max-w-xs mx-auto">
          <div className="h-2 bg-stone-100 rounded-pill overflow-hidden">
            <div className="h-full bg-amber rounded-pill transition-all" style={{ width: `${scoreInfo.percent}%` }} />
          </div>
          <p className="text-xs text-stone-400 mt-1">%{scoreInfo.percent}</p>
        </div>
      </div>

      {/* Seviyeler */}
      <div className="card mb-6">
        <h2 className="font-medium text-ink mb-4">Seviyeler</h2>
        <div className="space-y-3">
          {LEVELS.map(l => {
            const active = l.level === persona?.traveler_level
            return (
              <div key={l.level} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${active ? 'bg-amber-light' : 'bg-stone-50'}`}>
                <span className="text-2xl">{l.emoji}</span>
                <div className="flex-1">
                  <p className={`font-medium text-sm ${active ? 'text-amber' : 'text-ink'}`}>{l.name}</p>
                  <p className="text-xs text-stone-400">{l.min}–{l.max} puan</p>
                </div>
                {active && <span className="text-xs text-amber font-medium">Şu an</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Puan kazanma */}
      <div className="card mb-6">
        <h2 className="font-medium text-ink mb-4">Nasıl Puan Kazanılır?</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Yeni ülke', pts: '+10' },
            { label: 'Yeni şehir', pts: '+3' },
            { label: 'Yerel deneyim', pts: '+5' },
            { label: 'Yeni mutfak', pts: '+4' },
            { label: 'Plan oluştur', pts: '+2' },
            { label: 'Seyahati tamamla', pts: '+15' },
          ].map(i => (
            <div key={i.label} className="flex justify-between items-center bg-stone-50 rounded-xl px-4 py-3">
              <span className="text-sm text-stone-600">{i.label}</span>
              <span className="text-sm font-medium text-amber">{i.pts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Paylaşım */}
      <button
        onClick={() => openPlusModal('score_share')}
        className="card w-full text-center py-6 hover:border-amber transition-colors cursor-pointer"
      >
        <span className="text-3xl block mb-2">🏆</span>
        <p className="font-medium text-ink">Skorunu Paylaş</p>
        <p className="text-stone-500 text-sm mt-1">Plus ile kişisel Travio kartını oluştur</p>
      </button>
    </div>
  )
}
