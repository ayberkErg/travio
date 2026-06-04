'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuthStore, useUIStore } from '@/store'
import { isPlusUser } from '@/lib/utils'

export default function SettingsPage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { openPlusModal } = useUIStore()
  const [name, setName] = useState(user?.full_name || '')
  const [currency, setCurrency] = useState('TRY')
  const [notifications, setNotifications] = useState(true)
  const isPlus = user ? isPlusUser(user.subscription_tier) : false

  function handleLogout() {
    logout()
    router.push('/auth/login')
  }

  function handleSave() {
    toast.success('Ayarlar kaydedildi')
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="font-serif text-2xl text-ink">Ayarlar</h1>

      {/* Hesap */}
      <div className="card space-y-4">
        <h2 className="font-medium text-ink">Hesap Bilgileri</h2>
        <div>
          <label className="block text-sm text-stone-700 mb-1.5">Ad Soyad</label>
          <input className="input-field" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-stone-700 mb-1.5">E-posta</label>
          <input className="input-field opacity-60 cursor-not-allowed" value={user?.email || ''} disabled />
        </div>
        <button onClick={handleSave} className="btn-primary text-sm py-2">Kaydet</button>
      </div>

      {/* Tercihler */}
      <div className="card space-y-4">
        <h2 className="font-medium text-ink">Tercihler</h2>
        <div>
          <label className="block text-sm text-stone-700 mb-1.5">Para Birimi</label>
          <select className="input-field" value={currency} onChange={e => setCurrency(e.target.value)}>
            <option value="TRY">₺ Türk Lirası</option>
            <option value="USD">$ Dolar</option>
            <option value="EUR">€ Euro</option>
          </select>
        </div>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-stone-700">Bildirimler</span>
          <button
            onClick={() => setNotifications(n => !n)}
            className={`w-11 h-6 rounded-pill transition-colors relative ${notifications ? 'bg-amber' : 'bg-stone-300'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </label>
      </div>

      {/* Abonelik */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium text-ink">Abonelik</h2>
            <p className="text-sm text-stone-500 mt-0.5 capitalize">{user?.subscription_tier || 'free'}</p>
          </div>
          {!isPlus && (
            <button onClick={() => openPlusModal('plan_limit')} className="btn-primary text-sm py-2">
              Plus&apos;a Geç
            </button>
          )}
          {isPlus && (
            <span className="text-xs bg-amber-light text-amber px-3 py-1.5 rounded-pill font-medium">Aktif ✓</span>
          )}
        </div>
      </div>

      {/* Çıkış */}
      <button
        onClick={handleLogout}
        className="w-full card text-center text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors py-4 font-medium"
      >
        Çıkış Yap
      </button>
    </div>
  )
}
