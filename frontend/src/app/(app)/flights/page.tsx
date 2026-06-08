'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { search } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import type { FlightResult } from '@/types'
import AirportInput from '@/components/ui/AirportInput'
import { useNearestAirport } from '@/lib/useNearestAirport'

const AIRLINE_LOGOS: Record<string, string> = {
  TK: '🇹🇷', PC: '🧡', XQ: '☀️', TF: '🔵',
  LH: '🇩🇪', BA: '🇬🇧', AF: '🇫🇷', KL: '🇳🇱',
  EK: '🇦🇪', QR: '🇶🇦', TG: '🇹🇭', SQ: '🇸🇬',
}

function AirlineBadge({ code }: { code?: string; name: string }) {
  const emoji = code ? AIRLINE_LOGOS[code] : '✈️'
  return (
    <div className="w-12 h-12 bg-stone-50 border border-stone-100 rounded-2xl flex items-center justify-center text-2xl shrink-0">
      {emoji || '✈️'}
    </div>
  )
}

export default function FlightsPage() {
  const { airport } = useNearestAirport()
  const [form, setForm] = useState({
    from: 'İstanbul (IST)', fromIata: 'IST',
    to: '', toIata: '',
    date: '', return_date: '', passengers: 1,
  })

  useEffect(() => {
    if (airport) {
      setForm(f => ({ ...f, from: airport.label, fromIata: airport.iata }))
    }
  }, [airport])
  const [results, setResults] = useState<FlightResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [sortBy, setSortBy] = useState<'price' | 'duration'>('price')

  function swapCities() {
    setForm(f => ({
      ...f,
      from: f.to, fromIata: f.toIata,
      to: f.from, toIata: f.fromIata,
    }))
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!form.toIata) return toast.error('Varış şehrini listeden seç')
    if (!form.date) return toast.error('Gidiş tarihi gerekli')
    setLoading(true)
    setSearched(false)
    try {
      const data = await search.flights({
        from: form.fromIata || form.from,
        to: form.toIata || form.to,
        date: form.date,
        return_date: form.return_date || undefined,
        passengers: form.passengers,
      })
      setResults(data)
      setSearched(true)
      if (data.length === 0) toast('Sonuç bulunamadı, tarihi değiştirmeyi dene', { icon: 'ℹ️' })
    } catch {
      toast.error('Arama başarısız, tekrar dene')
    } finally {
      setLoading(false)
    }
  }

  const sorted = [...results].sort((a, b) =>
    sortBy === 'price' ? a.price - b.price : a.duration.localeCompare(b.duration)
  )

  const cheapest = results.length ? Math.min(...results.map(r => r.price)) : 0

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-ink">Uçuş Ara</h1>
        <p className="text-stone-500 text-sm mt-0.5">Gerçek zamanlı fiyatlar, yüzlerce havayolu.</p>
      </div>

      {/* Arama Formu */}
      <form onSubmit={handleSearch} className="card mb-5">
        {/* Nereden → Nereye */}
        <div className="relative flex gap-3 mb-4">
          <div className="flex-1">
            <AirportInput
              label="Nereden"
              value={form.from}
              placeholder="İstanbul"
              onChange={(val, iata) => setForm(f => ({ ...f, from: val, fromIata: iata }))}
            />
          </div>
          <button
            type="button"
            onClick={swapCities}
            className="absolute left-1/2 top-1/2 translate-y-3 -translate-x-1/2 z-10 w-9 h-9 bg-white border-2 border-stone-200 rounded-xl flex items-center justify-center text-stone-400 hover:border-amber hover:text-amber transition-all shadow-card"
          >
            ⇄
          </button>
          <div className="flex-1">
            <AirportInput
              label="Nereye"
              value={form.to}
              placeholder="Barcelona, Tokyo, Dubai..."
              onChange={(val, iata) => setForm(f => ({ ...f, to: val, toIata: iata }))}
            />
          </div>
        </div>

        {/* Tarihler & Yolcu */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Gidiş</label>
            <input
              type="date"
              className="input-field"
              value={form.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
              Dönüş <span className="text-stone-300 font-normal">(opsiyonel)</span>
            </label>
            <input
              type="date"
              className="input-field"
              value={form.return_date}
              min={form.date || new Date().toISOString().split('T')[0]}
              onChange={e => setForm(f => ({ ...f, return_date: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Yolcu</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, passengers: Math.max(1, f.passengers - 1) }))}
                className="w-9 h-9 rounded-xl border-2 border-stone-200 flex items-center justify-center text-stone-500 hover:border-amber hover:text-amber transition-colors font-bold shrink-0"
              >−</button>
              <span className="text-ink font-semibold text-center w-5">{form.passengers}</span>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, passengers: Math.min(9, f.passengers + 1) }))}
                className="w-9 h-9 rounded-xl border-2 border-stone-200 flex items-center justify-center text-stone-500 hover:border-amber hover:text-amber transition-colors font-bold shrink-0"
              >+</button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3.5 text-base disabled:opacity-60 shadow-amber"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uçuşlar aranıyor...
            </span>
          ) : '🛫  Uçuş Ara'}
        </button>
      </form>

      {/* Sonuçlar */}
      {searched && results.length > 0 && (
        <div>
          {/* Özet bar */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-sm font-semibold text-ink">{results.length} uçuş bulundu</span>
              <span className="text-stone-400 text-xs ml-2">· En ucuz {formatCurrency(cheapest, 'TRY')}</span>
            </div>
            <div className="flex gap-1 bg-stone-100 rounded-xl p-1">
              {(['price', 'duration'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    sortBy === s ? 'bg-white text-ink shadow-sm' : 'text-stone-500 hover:text-ink'
                  }`}
                >
                  {s === 'price' ? 'Fiyat' : 'Süre'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {sorted.map((r, i) => (
              <a
                key={i}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl border border-stone-200 p-5 flex items-center gap-4 hover:border-amber hover:shadow-card transition-all group"
              >
                <AirlineBadge code={r.airline_code} name={r.airline} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-ink text-sm">{r.airline}</p>
                    {r.price === cheapest && (
                      <span className="badge-amber text-xs">En Ucuz</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-stone-500">
                    <span className="font-mono font-semibold text-ink">{r.departure}</span>
                    <span className="text-stone-300">──</span>
                    <span className="text-xs text-stone-400">{r.duration}</span>
                    <span className="text-stone-300">──</span>
                    <span className="font-mono font-semibold text-ink">{r.arrival}</span>
                  </div>
                  <p className={`text-xs mt-1 font-medium ${
                    r.stops === 'Direkt' ? 'text-teal' : 'text-stone-400'
                  }`}>
                    {r.stops || 'Direkt'}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-serif text-2xl text-ink">{formatCurrency(r.price, r.currency)}</p>
                  <p className="text-xs text-stone-400 mt-0.5">kişi başı</p>
                  <p className="text-xs text-amber font-semibold group-hover:underline mt-1">Rezervasyon →</p>
                </div>
              </a>
            ))}
          </div>

          {/* Affiliate banner */}
          <a
            href={`https://www.skyscanner.com.tr/transport/flights/${form.from.toLowerCase()}/${form.to.toLowerCase()}/${form.date.replace(/-/g, '')}/?adults=${form.passengers}&currency=TRY`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-[#0770e3]/5 border border-[#0770e3]/20 rounded-2xl p-4 mt-4 hover:bg-[#0770e3]/10 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#0770e3] rounded-xl flex items-center justify-center text-white text-sm font-bold">S</div>
              <div>
                <p className="font-semibold text-ink text-sm">Skyscanner&apos;da daha fazla uçuş gör</p>
                <p className="text-stone-400 text-xs">700+ havayolu · Fiyat garantisi</p>
              </div>
            </div>
            <span className="text-[#0770e3] font-semibold text-sm group-hover:translate-x-0.5 transition-transform">→</span>
          </a>
        </div>
      )}

      {searched && results.length === 0 && (
        <div className="text-center py-12">
          <span className="text-5xl block mb-3">🔍</span>
          <p className="font-semibold text-ink mb-1">Uçuş bulunamadı</p>
          <p className="text-stone-400 text-sm">Tarihi veya şehri değiştirip tekrar dene.</p>
        </div>
      )}

      {!searched && (
        <div className="text-center py-12 text-stone-400">
          <span className="text-5xl block mb-3">🛫</span>
          <p className="text-sm font-medium">Yukarıdan arama yap, uçuşlar listelenecek.</p>
          <p className="text-xs mt-1 text-stone-300">Amadeus gerçek zamanlı veri · 500+ havayolu</p>
        </div>
      )}
    </div>
  )
}
