'use client'

import { usePathname } from 'next/navigation'
import { useUIStore } from '@/store'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Ana Sayfa',
  '/dashboard/saved': 'Planlarım',
  '/plan/new': 'Yeni Plan',
  '/explore': 'Keşfet',
  '/flights': 'Uçuş Ara',
  '/hotels': 'Otel Ara',
  '/budget': 'Bütçe',
  '/alerts': 'Fiyat Alarmları',
  '/score': 'Travio Score',
  '/profile': 'Profil',
  '/settings': 'Ayarlar',
}

export default function AppHeader() {
  const pathname = usePathname()
  const { setSidebarOpen, sidebarOpen } = useUIStore()

  const title = PAGE_TITLES[pathname] ||
    (pathname.startsWith('/plan/') ? 'Plan Detayı' : 'Travio')

  return (
    <header className="h-14 bg-white border-b border-stone-200 flex items-center px-6 gap-4">
      {/* Mobil hamburger */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden text-stone-500 hover:text-ink"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round" />
        </svg>
      </button>

      <h1 className="font-serif text-lg text-ink flex-1">{title}</h1>

      {/* Bildirim ikonu */}
      <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-50 text-stone-500 hover:text-ink transition-colors">
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </button>
    </header>
  )
}
