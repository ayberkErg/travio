'use client'

import { useUIStore } from '@/store'

const TRIGGER_COPY: Record<string, { title: string; subtitle: string }> = {
  plan_limit: {
    title: 'Gerçek bir gezgin oluyorsun.',
    subtitle: 'Bu senin 3. planın. Plus ile sınırsız devam et.',
  },
  price_drop: {
    title: 'Fiyat düştü!',
    subtitle: '₺99 abonelikle fiyat alarmlarından ilk sen haberdar ol.',
  },
  pre_trip_night: {
    title: 'Yarın uçuşun var.',
    subtitle: 'Offline erişim için Plus\'a geç — internet olmasa da planın yanında.',
  },
  score_share: {
    title: 'Skorunu paylaş.',
    subtitle: 'Travio kartını oluştur ve arkadaşlarınla paylaş.',
  },
  memory_book: {
    title: 'Anı kitabın hazır.',
    subtitle: 'Paris hikayen PDF olarak indir ve sakla.',
  },
  group_plan: {
    title: 'Grup planlaması.',
    subtitle: 'Arkadaşlarınla birlikte plan yap — herkese özel öneri.',
  },
}

const FEATURES = [
  'Sınırsız seyahat planı',
  'Fiyat alarmları (uçuş & otel)',
  'PDF olarak indir & paylaş',
  'Offline erişim',
  'Grup planlama',
  'Öncelikli AI modeli (Claude Sonnet)',
]

export default function PlusModal() {
  const { plusModalOpen, plusModalTrigger, closePlusModal } = useUIStore()

  if (!plusModalOpen) return null

  const copy = TRIGGER_COPY[plusModalTrigger || 'plan_limit']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={closePlusModal} />
      <div className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        {/* Kapat */}
        <button
          onClick={closePlusModal}
          className="absolute top-4 right-4 text-stone-400 hover:text-ink"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        {/* Başlık */}
        <div className="mb-6">
          <span className="text-xs font-medium text-amber bg-amber-light px-2.5 py-1 rounded-pill">
            Travio Plus
          </span>
          <h2 className="font-serif text-2xl text-ink mt-3 mb-1">{copy.title}</h2>
          <p className="text-stone-500 text-sm">{copy.subtitle}</p>
        </div>

        {/* Özellikler */}
        <ul className="space-y-2.5 mb-6">
          {FEATURES.map(f => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-ink">
              <span className="text-amber">✓</span>
              {f}
            </li>
          ))}
        </ul>

        {/* Fiyatlar */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="border-2 border-stone-200 rounded-xl p-4 text-center">
            <p className="text-xs text-stone-500 mb-1">Aylık</p>
            <p className="font-serif text-2xl text-ink">₺149</p>
            <p className="text-xs text-stone-400">/ay</p>
          </div>
          <div className="border-2 border-amber rounded-xl p-4 text-center relative">
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs bg-amber text-white px-2 py-0.5 rounded-pill">
              İndirim
            </span>
            <p className="text-xs text-stone-500 mb-1">Yıllık</p>
            <p className="font-serif text-2xl text-ink">₺99</p>
            <p className="text-xs text-stone-400">/ay · ₺1188/yıl</p>
          </div>
        </div>

        <p className="text-xs text-stone-400 text-center mb-4">
          Günde ₺5 — bir kahve fiyatına kişisel seyahat asistanın.
        </p>

        <button className="btn-primary w-full text-center">
          Plus&apos;a Geç →
        </button>
      </div>
    </div>
  )
}
