'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePersonaStore } from '@/store'

const CATEGORIES = ['Tümü', 'Kültür', 'Doğa', 'Gastronomi', 'Gece', 'Macera', 'Plaj']

const CITIES = [
  { name: 'Tokyo', country: 'Japonya', emoji: '🇯🇵', tags: ['Kültür', 'Gastronomi'], desc: 'Teknoloji, gelenekler ve eşsiz mutfak.' },
  { name: 'Barselona', country: 'İspanya', emoji: '🇪🇸', tags: ['Kültür', 'Gece', 'Plaj'], desc: 'Gaudí mimarisi, tapas ve Akdeniz.' },
  { name: 'Bali', country: 'Endonezya', emoji: '🇮🇩', tags: ['Doğa', 'Plaj', 'Macera'], desc: 'Tropikal cennet, pirinç tarlaları, tapınaklar.' },
  { name: 'New York', country: 'ABD', emoji: '🇺🇸', tags: ['Kültür', 'Gastronomi', 'Gece'], desc: 'Dünyanın şehri — hiç uyumayan.' },
  { name: 'Kyoto', country: 'Japonya', emoji: '🇯🇵', tags: ['Kültür', 'Doğa'], desc: 'Geleneksel Japonya\'nın kalbi.' },
  { name: 'Paris', country: 'Fransa', emoji: '🇫🇷', tags: ['Kültür', 'Gastronomi'], desc: 'Aşk şehri, sanat ve haute cuisine.' },
  { name: 'Queenstown', country: 'Yeni Zelanda', emoji: '🇳🇿', tags: ['Macera', 'Doğa'], desc: 'Macera başkenti, fjordlar, kayak.' },
  { name: 'Bangkok', country: 'Tayland', emoji: '🇹🇭', tags: ['Gastronomi', 'Kültür', 'Gece'], desc: 'Sokak yemeği cenneti, tapınaklar, gece pazarları.' },
  { name: 'Dubrovnik', country: 'Hırvatistan', emoji: '🇭🇷', tags: ['Kültür', 'Plaj'], desc: 'Adriyatik\'in incisi, surlarla çevrili şehir.' },
  { name: 'Marakeş', country: 'Fas', emoji: '🇲🇦', tags: ['Kültür', 'Gastronomi'], desc: 'Renkli çarşılar, köklü gelenekler, tagine.' },
  { name: 'Phuket', country: 'Tayland', emoji: '🇹🇭', tags: ['Plaj', 'Gece'], desc: 'Kristal berraklığında deniz, ada hayatı.' },
  { name: 'Reykjavik', country: 'İzlanda', emoji: '🇮🇸', tags: ['Doğa', 'Macera'], desc: 'Kuzey ışıkları, şelaleler, volkanlar.' },
]

export default function ExplorePage() {
  const router = useRouter()
  const { persona } = usePersonaStore()
  const [activeCategory, setActiveCategory] = useState('Tümü')

  const filtered = CITIES.filter(c =>
    activeCategory === 'Tümü' || c.tags.includes(activeCategory)
  )

  function handleCityClick(cityName: string) {
    router.push(`/plan/new?destination=${encodeURIComponent(cityName)}`)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-2xl text-ink mb-1">Keşfet</h1>
        <p className="text-stone-500 text-sm">Bir şehre tıkla, planlamaya başla.</p>
      </div>

      {/* AI önerisi */}
      {persona && (
        <div className="bg-ink rounded-2xl p-5 mb-6 flex items-center gap-4">
          <span className="text-3xl">✨</span>
          <div>
            <p className="text-white font-medium text-sm">Sana özel öneri</p>
            <p className="text-stone-400 text-xs mt-0.5">
              Profilini analiz ettim — gastronomi ve kültür ilgin yüksek.
              Tokyo veya Kyoto tam sana göre.
            </p>
          </div>
        </div>
      )}

      {/* Filtreler */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-pill text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-amber text-white'
                : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Şehir grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(city => (
          <button
            key={city.name}
            onClick={() => handleCityClick(city.name)}
            className="card text-left hover:border-amber hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{city.emoji}</span>
              <div className="flex gap-1 flex-wrap justify-end">
                {city.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-pill">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <h3 className="font-serif text-lg text-ink group-hover:text-amber transition-colors">{city.name}</h3>
            <p className="text-xs text-stone-400 mb-2">{city.country}</p>
            <p className="text-sm text-stone-500 leading-relaxed">{city.desc}</p>
            <p className="text-xs text-amber mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              Plan oluştur →
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
