'use client'

import { useAuthStore, useUIStore } from '@/store'
import { isPlusUser } from '@/lib/utils'

const MOCK_ALERTS = [
  { id: '1', route: 'İstanbul → Tokyo', current: '₺18.400', drop: '₺15.200', pct: 17 },
  { id: '2', route: 'İstanbul → Paris', current: '₺6.800', drop: '₺5.100', pct: 25 },
]

export default function AlertsPage() {
  const { user } = useAuthStore()
  const { openPlusModal } = useUIStore()
  const isPlus = user ? isPlusUser(user.subscription_tier) : false

  if (!isPlus) {
    return (
      <div className="max-w-xl mx-auto">
        <h1 className="font-serif text-2xl text-ink mb-6">Fiyat Alarmları</h1>
        <div className="card text-center py-16">
          <span className="text-4xl block mb-4">🔔</span>
          <h2 className="font-serif text-xl text-ink mb-2">Plus özelliği</h2>
          <p className="text-stone-500 text-sm mb-6 max-w-xs mx-auto">
            Takip ettiğin uçuş ve otellerde fiyat düşünce anında bildirim al.
          </p>
          <button onClick={() => openPlusModal('price_drop')} className="btn-primary">
            Plus&apos;a Geç →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-ink">Fiyat Alarmları</h1>
        <button className="btn-primary text-sm py-2">+ Alarm Ekle</button>
      </div>

      <div className="space-y-4">
        {MOCK_ALERTS.map(a => (
          <div key={a.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-ink">{a.route}</p>
                <p className="text-sm text-stone-500 mt-1">
                  Mevcut: <span className="line-through">{a.current}</span> →{' '}
                  <span className="text-teal font-medium">{a.drop}</span>
                </p>
              </div>
              <span className="text-xs bg-teal-light text-teal px-2.5 py-1 rounded-pill font-medium">
                -%{a.pct}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
