'use client'

import { useState, useEffect } from 'react'
import { useUIStore } from '@/store'
import { alertsApi } from '@/lib/api'
import AirportInput from '@/components/ui/AirportInput'
import toast from 'react-hot-toast'
import type { PriceAlert } from '@/types'

const PLUS_FEATURES = [
  { icon: '📉', title: 'Fiyat Düşüş Bildirimi', desc: 'Takip ettiğin rotada fiyat düşünce anında bildirim' },
  { icon: '🎯', title: 'Hedef Fiyat Alarmı', desc: 'İstediğin fiyata ulaşınca hem email hem browser bildirimi' },
  { icon: '📊', title: 'Fiyat Geçmişi', desc: 'Güncel fiyatı hedef fiyatınla karşılaştır' },
  { icon: '🔁', title: 'Sınırsız Alarm', desc: 'İstediğin kadar rota takip et' },
]

function MiniBar({ current, target }: { current?: number; target: number }) {
  if (!current) return null
  const pct = Math.min(100, Math.round((current / target) * 100))
  const dropping = current <= target
  return (
    <div className="mt-2">
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--stone-100)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(pct, 100)}%`,
            background: dropping ? 'var(--teal)' : 'var(--amber)',
          }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-2xs text-stone-400">Hedef ₺{target.toLocaleString('tr-TR')}</span>
        <span className="text-2xs font-semibold" style={{ color: dropping ? 'var(--teal)' : 'var(--amber)' }}>
          {dropping ? '🎯 Hedefte!' : `%${Math.round(((current - target) / target) * 100)} uzakta`}
        </span>
      </div>
    </div>
  )
}

async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

function showBrowserNotification(alert: PriceAlert) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  new Notification('🎯 Fiyat Alarmı Tetiklendi!', {
    body: `${alert.from_city} → ${alert.to_city}: ₺${alert.current_price?.toLocaleString('tr-TR')} — Hedef fiyatına ulaştı!`,
    icon: '/favicon.ico',
    tag: `alert-${alert.id}`,
  })
}

export default function AlertsPage() {
  const { openPlusModal } = useUIStore()
  const isPlus = true // TODO: restore Plus check when billing is live

  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [notifGranted, setNotifGranted] = useState(false)

  useEffect(() => {
    if ('Notification' in window) {
      setNotifGranted(Notification.permission === 'granted')
    }
    if (!isPlus) { setLoading(false); return }
    alertsApi.list()
      .then(data => {
        setAlerts(data)
        // Tetiklenen alarmlar için browser notification göster
        data.filter(a => a.is_triggered).forEach(a => showBrowserNotification(a))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isPlus])

  async function handleRequestNotif() {
    const granted = await requestNotificationPermission()
    setNotifGranted(granted)
    if (granted) toast.success('Bildirimler açıldı!')
    else toast.error('Bildirim izni reddedildi.')
  }

  async function handleDelete(id: string) {
    try {
      await alertsApi.delete(id)
      setAlerts(prev => prev.filter(a => a.id !== id))
      toast.success('Alarm silindi')
    } catch {
      toast.error('Silinemedi')
    }
  }

  function handleCreated(alert: PriceAlert) {
    setAlerts(prev => [alert, ...prev])
    setAddOpen(false)
    toast.success('Alarm kuruldu! Fiyat düşünce bildirim alacaksın.')
    if (!notifGranted) requestNotificationPermission().then(setNotifGranted)
  }

  if (!isPlus) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="font-serif text-3xl text-ink mb-2">Fiyat Alarmları</h1>
        <p className="text-stone-500 text-sm mb-8">Uçuş fiyatları düşünce ilk sen haber al.</p>

        <div className="relative overflow-hidden bg-ink rounded-2xl p-7 mb-6">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl" style={{ background: 'rgba(212,130,10,0.08)' }} />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🔔</span>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest block" style={{ color: 'var(--amber)' }}>Travio Plus</span>
                <h2 className="font-serif text-2xl text-white">Fiyat Alarmlarını Aç</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {PLUS_FEATURES.map(f => (
                <div key={f.title} className="rounded-xl p-3 border border-white/10" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <span className="text-xl block mb-1.5">{f.icon}</span>
                  <p className="text-white text-sm font-semibold leading-tight">{f.title}</p>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--stone-500)' }}>{f.desc}</p>
                </div>
              ))}
            </div>
            <button onClick={() => openPlusModal('price_drop')} className="btn-primary shadow-amber">
              Plus&apos;a Geç — Aylık ₺149
            </button>
          </div>
        </div>
      </div>
    )
  }

  const triggered = alerts.filter(a => a.is_triggered)
  const active = alerts.filter(a => !a.is_triggered)

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-ink">Fiyat Alarmları</h1>
          <p className="text-stone-500 text-sm mt-0.5">{alerts.length} alarm · {triggered.length} tetiklendi</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn-primary text-sm py-2.5">+ Alarm Ekle</button>
      </div>

      {/* Browser notification banner */}
      {!notifGranted && alerts.length > 0 && (
        <div className="mb-4 flex items-center justify-between gap-3 p-3.5 rounded-xl border"
          style={{ background: 'var(--amber-light)', borderColor: 'rgba(212,130,10,0.2)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--amber-dark)' }}>
            🔔 Anlık bildirim almak için izin ver
          </p>
          <button onClick={handleRequestNotif}
            className="text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ background: 'var(--amber)', color: 'white' }}>
            İzin Ver
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-4 text-center">
          <p className="font-serif text-2xl text-ink">{alerts.length}</p>
          <p className="text-xs text-stone-500 mt-0.5 font-medium">Toplam</p>
        </div>
        <div className="card p-4 text-center">
          <p className="font-serif text-2xl" style={{ color: 'var(--teal)' }}>{triggered.length}</p>
          <p className="text-xs text-stone-500 mt-0.5 font-medium">Tetiklendi</p>
        </div>
        <div className="card p-4 text-center">
          <p className="font-serif text-2xl" style={{ color: 'var(--amber)' }}>{active.length}</p>
          <p className="text-xs text-stone-500 mt-0.5 font-medium">İzleniyor</p>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12 text-stone-400">Alarmlar yükleniyor...</div>
      )}

      {!loading && alerts.length === 0 && !addOpen && (
        <div className="text-center py-16">
          <span className="text-5xl block mb-4">🔕</span>
          <p className="font-semibold text-ink mb-1">Henüz alarm yok</p>
          <p className="text-sm text-stone-500 mb-6">Bir rota ekle, fiyat düşünce seni haberdar edelim.</p>
          <button onClick={() => setAddOpen(true)} className="btn-primary">İlk Alarmı Kur</button>
        </div>
      )}

      {/* Tetiklenen alarmlar */}
      {triggered.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--teal)' }}>🎯 Hedef Fiyata Ulaştı</p>
          <div className="space-y-3">
            {triggered.map(a => (
              <AlertCard key={a.id} alert={a} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Aktif alarmlar */}
      {active.length > 0 && (
        <div className="mb-4">
          {triggered.length > 0 && (
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--stone-400)' }}>● İzleniyor</p>
          )}
          <div className="space-y-3">
            {active.map(a => (
              <AlertCard key={a.id} alert={a} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Yeni alarm formu */}
      {addOpen && (
        <AddAlertForm onCreated={handleCreated} onClose={() => setAddOpen(false)} />
      )}

      {!addOpen && alerts.length > 0 && (
        <button
          onClick={() => setAddOpen(true)}
          className="w-full mt-2 border-2 border-dashed border-stone-200 rounded-2xl p-5 text-center hover:border-amber hover:bg-amber-light/30 transition-all"
        >
          <p className="text-sm font-medium text-stone-500">+ Yeni Alarm Ekle</p>
        </button>
      )}
    </div>
  )
}

function AlertCard({ alert, onDelete }: { alert: PriceAlert; onDelete: (id: string) => void }) {
  const dropping = alert.current_price !== undefined && alert.current_price <= alert.target_price
  return (
    <div className="bg-white rounded-2xl border p-5 transition-all"
      style={{ borderColor: dropping ? 'rgba(10,143,148,0.3)' : 'var(--stone-200)' }}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-ink">{alert.from_city} → {alert.to_city}</p>
            <span className="text-xs font-mono text-stone-400">{alert.from_iata}→{alert.to_iata}</span>
            {dropping && (
              <span className="text-2xs font-bold px-2 py-0.5 rounded-pill uppercase"
                style={{ background: 'var(--teal-light)', color: 'var(--teal)' }}>
                🎯 Tetiklendi
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-3 mt-2">
            <div>
              <p className="text-2xs text-stone-400">Şu An</p>
              <p className="font-semibold text-lg text-ink">
                {alert.current_price ? `₺${alert.current_price.toLocaleString('tr-TR')}` : '—'}
              </p>
            </div>
            <div className="text-stone-300 text-lg">→</div>
            <div>
              <p className="text-2xs text-stone-400">Hedef</p>
              <p className="font-semibold text-lg" style={{ color: 'var(--teal)' }}>
                ₺{alert.target_price.toLocaleString('tr-TR')}
              </p>
            </div>
          </div>
          <MiniBar current={alert.current_price} target={alert.target_price} />
          {alert.last_checked_at && (
            <p className="text-2xs text-stone-300 mt-2">
              Son kontrol: {new Date(alert.last_checked_at).toLocaleString('tr-TR')}
            </p>
          )}
        </div>
        <button onClick={() => onDelete(alert.id)}
          className="p-1.5 text-stone-300 hover:text-red-400 transition-colors ml-2 shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      {dropping && (
        <a
          href={`https://www.skyscanner.com.tr/transport/flights/${alert.from_iata.toLowerCase()}/${alert.to_iata.toLowerCase()}/`}
          target="_blank" rel="noopener noreferrer"
          className="mt-3 block text-center py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: 'var(--teal)', color: 'white' }}
        >
          Bilet Al →
        </a>
      )}
    </div>
  )
}

function AddAlertForm({ onCreated, onClose }: { onCreated: (a: PriceAlert) => void; onClose: () => void }) {
  const [form, setForm] = useState({ from: '', fromIata: '', to: '', toIata: '', targetPrice: '' })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.fromIata || !form.toIata || !form.targetPrice) return
    setSaving(true)
    try {
      const alert = await alertsApi.create({
        from_iata: form.fromIata,
        to_iata: form.toIata,
        from_city: form.from,
        to_city: form.to,
        target_price: parseInt(form.targetPrice),
      })
      onCreated(alert)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Alarm kurulamadı')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-ink">Yeni Fiyat Alarmı</p>
        <button type="button" onClick={onClose} className="text-stone-400 hover:text-ink text-xl leading-none">×</button>
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
        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
          Hedef Fiyat (TRY)
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-semibold">₺</span>
          <input
            type="number"
            className="input-field pl-8"
            placeholder="15.000"
            value={form.targetPrice}
            onChange={e => setForm(f => ({ ...f, targetPrice: e.target.value }))}
            required
          />
        </div>
        <p className="text-xs text-stone-400 mt-1">Fiyat bu değerin altına düşünce email + browser bildirimi alırsın.</p>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={!form.fromIata || !form.toIata || saving}
          className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-50">
          {saving ? 'Kuruluyor...' : '🔔 Alarmı Kur'}
        </button>
        <button type="button" onClick={onClose}
          className="px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-500 hover:bg-stone-50 transition-colors">
          İptal
        </button>
      </div>
    </form>
  )
}
