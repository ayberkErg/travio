'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import type { FlightResult } from '@/types'

export default function FlightsPage() {
  const [form, setForm] = useState({ from: 'İstanbul', to: '', date: '', passengers: 1 })
  const [results, setResults] = useState<FlightResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!form.to) return toast.error('Varış şehri gerekli')
    setLoading(true)
    try {
      const data = await api.search.flights(form)
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
      <h1 className="font-serif text-2xl text-ink mb-6">Uçuş Ara</h1>

      <form onSubmit={handleSearch} className="card mb-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-stone-700 mb-1.5">Nereden</label>
            <input className="input-field" value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm text-stone-700 mb-1.5">Nereye *</label>
            <input className="input-field" placeholder="Tokyo, Paris..." value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-stone-700 mb-1.5">Tarih</label>
            <input type="date" className="input-field" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm text-stone-700 mb-1.5">Yolcu</label>
            <input type="number" min={1} max={9} className="input-field" value={form.passengers} onChange={e => setForm(f => ({ ...f, passengers: parseInt(e.target.value) }))} />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? 'Aranıyor...' : 'Uçuş Ara 🛫'}
        </button>
      </form>

      {/* Skyscanner affiliate banner */}
      <a
        href="https://www.skyscanner.com.tr/?associateid=travio-tr"
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-blue-800 text-sm">Skyscanner ile karşılaştır</p>
            <p className="text-blue-600 text-xs mt-0.5">Yüzlerce havayolu arasından en ucuzu bul</p>
          </div>
          <span className="text-blue-500 text-sm">→</span>
        </div>
      </a>

      {searched && (
        <div className="space-y-3">
          <p className="text-sm text-stone-500">{results.length} sonuç bulundu</p>
          {results.map((r, i) => (
            <a
              key={i}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card flex items-center justify-between hover:border-amber hover:shadow-sm transition-all"
            >
              <div>
                <p className="font-medium text-ink">{r.airline}</p>
                <p className="text-sm text-stone-500">{r.departure} → {r.arrival} · {r.duration}</p>
              </div>
              <div className="text-right">
                <p className="font-serif text-xl text-ink">{formatCurrency(r.price, r.currency)}</p>
                <p className="text-xs text-amber">Rezervasyon →</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
