'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import type { HotelResult } from '@/types'
import AirportInput from '@/components/ui/AirportInput'

const STAR_FILTERS = [
  { label: 'Tümü', value: 0 },
  { label: '3★', value: 3 },
  { label: '4★', value: 4 },
  { label: '5★', value: 5 },
]

export default function HotelsPage() {
  const [form, setForm] = useState({ city: '', check_in: '', check_out: '', guests: 1 })
  const [results, setResults] = useState<HotelResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [starFilter, setStarFilter] = useState(0)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!form.city) return toast.error('Şehir gerekli')
    setLoading(true)
    try {
      const data = await api.search.hotels(form)
      setResults(data)
      setSearched(true)
    } catch {
      toast.error('Arama başarısız')
    } finally {
      setLoading(false)
    }
  }

  const filteredResults = starFilter === 0 ? results : results.filter(h => h.stars === starFilter)

  const nights = form.check_in && form.check_out
    ? Math.max(1, Math.round((new Date(form.check_out).getTime() - new Date(form.check_in).getTime()) / 86400000))
    : null

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-ink">Otel Ara</h1>
        <p className="text-stone-500 text-sm mt-0.5">Binlerce otel arasından sana en uygununu bul.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSearch} className="card mb-5 space-y-4">
        <AirportInput
          cityOnly
          label="Şehir / Destinasyon"
          placeholder="Tokyo, Paris, Bali..."
          value={form.city}
          onChange={(val) => setForm(f => ({ ...f, city: val }))}
        />

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Check-in</label>
            <input type="date" className="input-field" value={form.check_in}
              onChange={e => setForm(f => ({ ...f, check_in: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Check-out</label>
            <input type="date" className="input-field" value={form.check_out}
              onChange={e => setForm(f => ({ ...f, check_out: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Misafir</label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setForm(f => ({ ...f, guests: Math.max(1, f.guests - 1) }))}
                className="w-9 h-9 rounded-xl border-2 border-stone-200 flex items-center justify-center text-stone-500 hover:border-amber hover:text-amber transition-colors font-bold shrink-0">
                −
              </button>
              <span className="text-ink font-semibold text-center w-5">{form.guests}</span>
              <button type="button" onClick={() => setForm(f => ({ ...f, guests: Math.min(10, f.guests + 1) }))}
                className="w-9 h-9 rounded-xl border-2 border-stone-200 flex items-center justify-center text-stone-500 hover:border-amber hover:text-amber transition-colors font-bold shrink-0">
                +
              </button>
            </div>
          </div>
        </div>

        {nights && (
          <p className="text-xs text-stone-400 -mt-1">
            {nights} gece · {form.guests} misafir
          </p>
        )}

        <button type="submit" disabled={loading}
          className="btn-primary w-full py-3.5 text-base disabled:opacity-60 shadow-amber">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Oteller aranıyor...
            </span>
          ) : '🏨 Otel Ara'}
        </button>
      </form>

      {/* Booking affiliate */}
      <a
        href="https://www.booking.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between bg-white border border-stone-200 rounded-2xl p-4 mb-6 hover:border-stone-300 hover:shadow-card transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#003580]/10 rounded-xl flex items-center justify-center text-lg">🏨</div>
          <div>
            <p className="font-semibold text-ink text-sm">Booking.com ile karşılaştır</p>
            <p className="text-stone-400 text-xs mt-0.5">Ücretsiz iptal · En iyi fiyat garantisi</p>
          </div>
        </div>
        <span className="text-stone-400 group-hover:text-amber group-hover:translate-x-0.5 transition-all text-sm">→</span>
      </a>

      {/* Sonuçlar */}
      {searched && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-stone-500">
              {filteredResults.length} otel bulundu {form.city && `· ${form.city}`}
            </p>
            {results.length > 0 && (
              <div className="flex gap-1.5">
                {STAR_FILTERS.map(f => (
                  <button key={f.value}
                    onClick={() => setStarFilter(f.value)}
                    className={`px-3 py-1 rounded-pill text-xs font-semibold transition-colors ${
                      starFilter === f.value ? 'bg-amber text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}>
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {filteredResults.map((h, i) => (
              <a key={i} href={h.url} target="_blank" rel="noopener noreferrer"
                className="bg-white rounded-2xl border border-stone-200 p-5 flex items-center gap-4 hover:border-amber hover:shadow-card transition-all group">
                <div className="w-14 h-14 bg-stone-100 rounded-xl flex items-center justify-center text-2xl shrink-0">🏨</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-ink truncate">{h.name}</p>
                    <span className="text-amber text-xs shrink-0">{'★'.repeat(Math.min(h.stars, 5))}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-pill ${
                      h.rating >= 9 ? 'bg-teal-light text-teal' : h.rating >= 8 ? 'bg-amber-light text-amber' : 'bg-stone-100 text-stone-500'
                    }`}>
                      {h.rating}/10
                    </span>
                    <span className="text-xs text-stone-400">
                      {h.rating >= 9 ? 'Mükemmel' : h.rating >= 8 ? 'Harika' : 'İyi'}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-serif text-2xl text-ink">{formatCurrency(h.price_per_night, h.currency)}</p>
                  <p className="text-xs text-stone-400">/gece</p>
                  {nights && (
                    <p className="text-xs text-stone-500 mt-0.5">Toplam: {formatCurrency(h.price_per_night * nights, h.currency)}</p>
                  )}
                  <p className="text-xs text-amber font-semibold group-hover:underline mt-1">Rezervasyon →</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {!searched && (
        <div className="text-center py-12 text-stone-400">
          <span className="text-5xl block mb-3">🏨</span>
          <p className="text-sm font-medium">Şehir gir ve ara — en iyi oteller listelenecek.</p>
        </div>
      )}
    </div>
  )
}
