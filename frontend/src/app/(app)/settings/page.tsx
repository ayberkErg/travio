'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuthStore, useUIStore } from '@/store'
import { isPlusUser } from '@/lib/utils'

const CURRENCIES = [
  { value: 'TRY', label: '₺ Türk Lirası' },
  { value: 'USD', label: '$ Dolar' },
  { value: 'EUR', label: '€ Euro' },
  { value: 'GBP', label: '£ Pound' },
]

const LANGUAGES = [
  { value: 'tr', label: 'Türkçe' },
  { value: 'en', label: 'English' },
]

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-11 h-6 rounded-pill transition-colors duration-200 ${enabled ? 'bg-amber' : 'bg-stone-200'}`}
    >
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card space-y-4">
      <h2 className="font-semibold text-ink text-sm uppercase tracking-wide text-stone-500">{title}</h2>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { openPlusModal } = useUIStore()
  const isPlus = user ? isPlusUser(user.subscription_tier) : false

  const [name, setName] = useState(user?.full_name || '')
  const [currency, setCurrency] = useState('TRY')
  const [language, setLanguage] = useState('tr')
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    priceAlerts: true,
    weeklyDigest: false,
  })

  function handleLogout() {
    logout()
    router.push('/auth/login')
  }

  function handleSave() {
    toast.success('Ayarlar kaydedildi')
  }

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-ink">Ayarlar</h1>
        <p className="text-stone-500 text-sm mt-0.5">Hesap ve uygulama tercihlerini yönet.</p>
      </div>

      {/* Hesap bilgileri */}
      <Section title="Hesap">
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-1.5">Ad Soyad</label>
          <input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="Adın Soyadın" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-1.5">E-posta</label>
          <input className="input-field opacity-50 cursor-not-allowed" value={user?.email || ''} disabled />
          <p className="text-xs text-stone-400 mt-1">E-posta değiştirmek için destek ile iletişime geç.</p>
        </div>
        <button onClick={handleSave} className="btn-primary text-sm py-2.5">
          Kaydet
        </button>
      </Section>

      {/* Tercihler */}
      <Section title="Tercihler">
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-1.5">Para Birimi</label>
          <select className="input-field" value={currency} onChange={e => setCurrency(e.target.value)}>
            {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-1.5">Dil</label>
          <select className="input-field" value={language} onChange={e => setLanguage(e.target.value)}>
            {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
      </Section>

      {/* Bildirimler */}
      <Section title="Bildirimler">
        {[
          { key: 'email' as const, label: 'E-posta bildirimleri', desc: 'Plan hazır, özet ve güncellemeler' },
          { key: 'push' as const, label: 'Push bildirimleri', desc: 'Tarayıcı bildirimleri' },
          { key: 'priceAlerts' as const, label: 'Fiyat alarmları', desc: 'Takip ettiğin fiyatlar düştüğünde' },
          { key: 'weeklyDigest' as const, label: 'Haftalık özet', desc: 'Her Pazartesi seyahat önerileri' },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink">{item.label}</p>
              <p className="text-xs text-stone-400 mt-0.5">{item.desc}</p>
            </div>
            <Toggle
              enabled={notifications[item.key]}
              onChange={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key] }))}
            />
          </div>
        ))}
      </Section>

      {/* Abonelik */}
      <div className="card">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-stone-500 mb-4">Abonelik</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-ink capitalize">{isPlus ? 'Travio Plus' : 'Travio Free'}</p>
            <p className="text-xs text-stone-400 mt-0.5">
              {isPlus ? 'Tüm özelliklere erişiminiz var' : 'Aylık 3 plan limiti'}
            </p>
          </div>
          {!isPlus ? (
            <button onClick={() => openPlusModal('plan_limit')} className="btn-primary text-sm py-2">
              Plus&apos;a Geç
            </button>
          ) : (
            <span className="text-xs bg-amber-light text-amber px-3 py-1.5 rounded-pill font-bold">Aktif ✓</span>
          )}
        </div>
        {isPlus && (
          <button className="w-full mt-4 text-xs text-stone-400 hover:text-red-400 text-center py-2 transition-colors">
            Aboneliği iptal et
          </button>
        )}
      </div>

      {/* Gizlilik & Güvenlik */}
      <Section title="Gizlilik & Güvenlik">
        <div className="space-y-2">
          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors text-left">
            <div>
              <p className="text-sm font-medium text-ink">Şifre Değiştir</p>
              <p className="text-xs text-stone-400">Hesap güvenliğini güncelle</p>
            </div>
            <span className="text-stone-300 text-sm">→</span>
          </button>
          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors text-left">
            <div>
              <p className="text-sm font-medium text-ink">Verilerimi İndir</p>
              <p className="text-xs text-stone-400">Tüm plan ve profil verilerini dışa aktar</p>
            </div>
            <span className="text-stone-300 text-sm">→</span>
          </button>
          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50 transition-colors text-left">
            <div>
              <p className="text-sm font-medium text-red-500">Hesabı Sil</p>
              <p className="text-xs text-stone-400">Tüm veriler kalıcı olarak silinir</p>
            </div>
            <span className="text-red-300 text-sm">→</span>
          </button>
        </div>
      </Section>

      {/* Çıkış */}
      <button
        onClick={handleLogout}
        className="w-full bg-white border border-stone-200 rounded-2xl text-center text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors py-4 font-semibold"
      >
        Çıkış Yap
      </button>

      <p className="text-center text-xs text-stone-300 pb-4">Travio v1.0 · Gizlilik Politikası · Kullanım Koşulları</p>
    </div>
  )
}
