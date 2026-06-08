'use client'

import { useState } from 'react'
import { useAuthStore, useUIStore } from '@/store'
import { isPlusUser } from '@/lib/utils'
import AirportInput from '@/components/ui/AirportInput'

const MOCK_ALERTS = [
  {
    id: '1',
    route: 'İstanbul → Tokyo',
    airline: 'Turkish Airlines',
    current: 18400,
    target: 15200,
    drop: 17,
    trend: [-3, -1, 2, -5, -8, -12, -17],
    status: 'dropping' as const,
    lastCheck: '2 saat önce',
  },
  {
    id: '2',
    route: 'İstanbul → Paris',
    airline: 'Air France',
    current: 6800,
    target: 5100,
    drop: 25,
    trend: [2, 5, 1, -4, -10, -18, -25],
    status: 'dropping' as const,
    lastCheck: '45 dk önce',
  },
  {
    id: '3',
    route: 'İstanbul → Dubai',
    airline: 'Emirates',
    current: 4200,
    target: 3800,
    drop: 10,
    trend: [1, 0, -2, 1, -3, -5, -10],
    status: 'watching' as const,
    lastCheck: '1 saat önce',
  },
]

const PLUS_FEATURES = [
  { icon: '📉', title: 'Fiyat Düşüş Bildirimi', desc: 'Takip ettiğin rotada fiyat düşünce anında bildirim' },
  { icon: '🎯', title: 'Hedef Fiyat Alarmı', desc: 'İstediğin fiyata ulaşınca bildir' },
  { icon: '📊', title: 'Fiyat Geçmişi', desc: '30 günlük fiyat trendini görüntüle' },
  { icon: '🔁', title: 'Sınırsız Alarm', desc: 'İstediğin kadar rota ve otel takip et' },
]

function MiniTrend({ data, dropping }: { data: number[]; dropping: boolean }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 60
    const y = 20 - ((v - min) / range) * 16
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width="64" height="24" viewBox="0 0 64 24" className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={dropping ? 'var(--teal)' : 'var(--amber)'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function AlertsPage() {
  const { user } = useAuthStore()
  const { openPlusModal } = useUIStore()
  const isPlus = user ? isPlusUser(user.subscription_tier) : false
  const [alerts] = useState(MOCK_ALERTS)

  if (!isPlus) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="font-serif text-3xl text-ink mb-2">Fiyat Alarmları</h1>
        <p className="text-stone-500 text-sm mb-8">Uçuş ve otel fiyatları düşünce ilk sen haber al.</p>

        {/* Plus upsell */}
        <div className="relative overflow-hidden bg-ink rounded-2xl p-7 mb-6">
          <div className="absolute inset-0 bg-dots-dark" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber/6 rounded-full blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🔔</span>
              <div>
                <span className="text-amber text-xs font-bold uppercase tracking-widest block">Travio Plus</span>
                <h2 className="font-serif text-2xl text-white">Fiyat Alarmlarını Aç</h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {PLUS_FEATURES.map(f => (
                <div key={f.title} className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <span className="text-xl block mb-1.5">{f.icon}</span>
                  <p className="text-white text-sm font-semibold leading-tight">{f.title}</p>
                  <p className="text-stone-500 text-xs mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => openPlusModal('price_drop')}
                className="btn-primary shadow-amber"
              >
                Plus&apos;a Geç — Aylık ₺149
              </button>
              <p className="text-stone-500 text-xs">İlk 7 gün ücretsiz dene</p>
            </div>
          </div>
        </div>

        {/* Teaser preview */}
        <div className="relative">
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-off-white to-transparent z-10 rounded-b-2xl pointer-events-none" />
          <div className="opacity-40 pointer-events-none space-y-3">
            {MOCK_ALERTS.slice(0, 2).map(a => (
              <div key={a.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink">{a.route}</p>
                  <p className="text-sm text-stone-500 mt-0.5">{a.airline} · {a.lastCheck}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-teal-light text-teal px-2.5 py-1 rounded-pill font-bold">-%{a.drop}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-ink">Fiyat Alarmları</h1>
          <p className="text-stone-500 text-sm mt-0.5">{alerts.length} aktif alarm</p>
        </div>
        <button className="btn-primary text-sm py-2.5">
          + Alarm Ekle
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-4 text-center">
          <p className="font-serif text-2xl text-ink">{alerts.length}</p>
          <p className="text-xs text-stone-500 mt-0.5 font-medium">Aktif Alarm</p>
        </div>
        <div className="card p-4 text-center">
          <p className="font-serif text-2xl text-teal">{alerts.filter(a => a.status === 'dropping').length}</p>
          <p className="text-xs text-stone-500 mt-0.5 font-medium">Düşüyor</p>
        </div>
        <div className="card p-4 text-center">
          <p className="font-serif text-2xl text-amber">₺{Math.round(alerts.reduce((s, a) => s + a.current * a.drop / 100, 0) / 1000)}k+</p>
          <p className="text-xs text-stone-500 mt-0.5 font-medium">Potansiyel Tasarruf</p>
        </div>
      </div>

      {/* Alert kartları */}
      <div className="space-y-3">
        {alerts.map(a => (
          <div key={a.id} className="bg-white rounded-2xl border border-stone-200 p-5 hover:border-stone-300 hover:shadow-card transition-all">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-ink">{a.route}</p>
                  <span className={`text-2xs font-bold px-2 py-0.5 rounded-pill uppercase tracking-wide ${
                    a.status === 'dropping'
                      ? 'bg-teal-light text-teal'
                      : 'bg-amber-light text-amber'
                  }`}>
                    {a.status === 'dropping' ? '↓ Düşüyor' : '● İzleniyor'}
                  </span>
                </div>
                <p className="text-xs text-stone-400">{a.airline} · Son kontrol: {a.lastCheck}</p>
              </div>
              <button className="text-stone-300 hover:text-red-400 transition-colors p-1 -mr-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-stone-400 text-sm line-through">₺{a.current.toLocaleString('tr-TR')}</span>
                  <span className="font-serif text-xl text-teal font-medium">₺{a.target.toLocaleString('tr-TR')}</span>
                </div>
                <p className="text-2xs text-stone-400 mt-0.5">Hedef fiyat · %{a.drop} tasarruf</p>
              </div>
              <div className="flex items-center gap-3">
                <MiniTrend data={a.trend} dropping={a.status === 'dropping'} />
                <a href="#" className="text-xs font-semibold text-amber hover:underline">Rezervasyon →</a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Yeni Alarm Formu */}
      <AddAlertForm />
    </div>
  )
}

function AddAlertForm() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ from: '', fromIata: '', to: '', toIata: '', targetPrice: '' })

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.fromIata || !form.toIata) return
    setOpen(false)
    setForm({ from: '', fromIata: '', to: '', toIata: '', targetPrice: '' })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full mt-4 border-2 border-dashed border-stone-200 rounded-2xl p-6 text-center hover:border-amber hover:bg-amber-light/30 transition-all group"
      >
        <span className="text-2xl block mb-1 group-hover:scale-110 transition-transform">+</span>
        <p className="text-sm font-medium text-stone-500 group-hover:text-amber transition-colors">Yeni Alarm Ekle</p>
        <p className="text-xs text-stone-400 mt-0.5">Rota veya otel takibi başlat</p>
      </button>
    )
  }

  return (
    <form
      onSubmit={handleAdd}
      className="mt-4 bg-white border border-stone-200 rounded-2xl p-5 space-y-4"
    >
      <div className="flex items-center justify-between mb-1">
        <p className="font-semibold text-ink">Yeni Fiyat Alarmı</p>
        <button type="button" onClick={() => setOpen(false)} className="text-stone-400 hover:text-ink transition-colors text-lg leading-none">×</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <AirportInput
          label="Nereden"
          placeholder="İstanbul"
          value={form.from}
          onChange={(val, iata) => setForm(f => ({ ...f, from: val, fromIata: iata }))}
        />
        <AirportInput
          label="Nereye"
          placeholder="Tokyo, Paris..."
          value={form.to}
          onChange={(val, iata) => setForm(f => ({ ...f, to: val, toIata: iata }))}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Hedef Fiyat (TRY)</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-semibold">₺</span>
          <input
            type="number"
            className="input-field pl-8"
            placeholder="15.000"
            value={form.targetPrice}
            onChange={e => setForm(f => ({ ...f, targetPrice: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={!form.fromIata || !form.toIata}
          className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-50"
        >
          Alarmı Kaydet
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-500 hover:bg-stone-50 transition-colors">
          İptal
        </button>
      </div>
    </form>
  )
}
