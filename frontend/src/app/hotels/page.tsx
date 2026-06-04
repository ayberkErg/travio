'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import type { HotelResult } from '@/types'

export default function HotelsPage() {
  const [form, setForm] = useState({ city: '', check_in: '', check_out: '', guests: 1 })
  const [results, setResults] = useState<HotelResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

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

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-serif text-2xl text-ink mb-6">Otel Ara</h1>

      <form onSubmit={handleSearch} className="card mb-6 space-y-4">
        <div>
          <label className="block text-sm text-stone-700 mb-1.5">Şehir *</label>
          <input className="input-field" placeholder="Tokyo, Paris..." value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-stone-700 mb-1.5">Giriş</label>
            <input type="date" className="input-field" value={form.check_in} onChange={e => setForm(f => ({ ...f, check_in: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm text-stone-700 mb-1.5">Çıkış</label>
            <input type="date" className="input-field" value={form.check_out} onChange={e => setForm(f => ({ ...f, check_out: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="block text-sm text-stone-700 mb-1.5">Misafir</label>
          <input type="number" min={1} max={10} className="input-field" value={form.guests} onChange={e => setForm(f => ({ ...f, guests: parseInt(e.target.value) }))} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? 'Aranıyor...' : 'Otel Ara 🏨'}
        </button>
      </form>

      {/* Booking affiliate banner */}
      <a
        href="https://www.booking.com/?aid=travio-tr"
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-blue-800 text-sm">Booking.com ile karşılaştır</p>
            <p className="text-blue-600 text-xs mt-0.5">Ücretsiz iptal, en iyi fiyat garantisi</p>
          </div>
          <span className="text-blue-500 text-sm">→</span>
        </div>
      </a>

      {searched && (
        <div className="space-y-3">
          <p className="text-sm text-stone-500">{results.length} otel bulundu</p>
          {results.map((h, i) => (
            <a
              key={i}
              href={h.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card flex items-center justify-between hover:border-amber hover:shadow-sm transition-all"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-ink">{h.name}</p>
                  <span className="text-amber text-xs">{'★'.repeat(h.stars)}</span>
                </div>
                <p className="text-sm text-stone-500">Puan: {h.rating}/10</p>
              </div>
              <div className="text-right">
                <p className="font-serif text-xl text-ink">{formatCurrency(h.price_per_night, h.currency)}</p>
                <p className="text-xs text-stone-400">/gece</p>
                <p className="text-xs text-amber mt-1">Rezervasyon →</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
