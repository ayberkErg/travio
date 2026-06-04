'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore, usePersonaStore, useUIStore } from '@/store'
import { initials, isPlusUser } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Ana Sayfa', emoji: '🏠' },
  { href: '/plan/new', label: 'Yeni Plan', emoji: '✈️' },
  { href: '/dashboard/saved', label: 'Planlarım', emoji: '📁' },
  { href: '/explore', label: 'Keşfet', emoji: '🌍' },
  { href: '/flights', label: 'Uçuşlar', emoji: '🛫' },
  { href: '/hotels', label: 'Oteller', emoji: '🏨' },
  { href: '/budget', label: 'Bütçe', emoji: '💰' },
  { href: '/alerts', label: 'Alarmlar', emoji: '🔔' },
  { href: '/score', label: 'Travio Score', emoji: '⭐' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  usePersonaStore()
  const { openPlusModal } = useUIStore()

  function handleLogout() {
    logout()
    router.push('/auth/login')
  }

  const isPlus = user ? isPlusUser(user.subscription_tier) : false

  return (
    <aside className="w-64 bg-white border-r border-stone-200 flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-stone-100">
        <Link href="/dashboard">
          <span className="font-serif text-xl text-ink">travio</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-amber-light text-amber font-medium'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <span>{item.emoji}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Plus promo — sadece free kullanıcıya */}
      {!isPlus && (
        <div className="mx-4 mb-4 p-4 bg-amber-light rounded-xl">
          <p className="text-xs font-medium text-amber mb-1">Travio Plus</p>
          <p className="text-xs text-stone-700 mb-3">Sınırsız plan, fiyat alarmı ve daha fazlası.</p>
          <button
            onClick={() => openPlusModal('plan_limit')}
            className="w-full text-xs bg-amber text-white py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Yükselt →
          </button>
        </div>
      )}

      {/* Kullanıcı */}
      <div className="p-4 border-t border-stone-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-amber text-white flex items-center justify-center text-xs font-medium">
            {user ? initials(user.full_name || user.email) : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink truncate">{user?.full_name || user?.email}</p>
            <p className="text-xs text-stone-500 capitalize">{user?.subscription_tier || 'free'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/profile" className="flex-1 text-xs text-stone-500 hover:text-ink text-center py-1.5 rounded-lg hover:bg-stone-50 transition-colors">
            Profil
          </Link>
          <Link href="/settings" className="flex-1 text-xs text-stone-500 hover:text-ink text-center py-1.5 rounded-lg hover:bg-stone-50 transition-colors">
            Ayarlar
          </Link>
          <button
            onClick={handleLogout}
            className="flex-1 text-xs text-stone-500 hover:text-red-500 text-center py-1.5 rounded-lg hover:bg-stone-50 transition-colors"
          >
            Çıkış
          </button>
        </div>
      </div>
    </aside>
  )
}
