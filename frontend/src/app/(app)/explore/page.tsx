'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePersonaStore } from '@/store'

const CATEGORIES = ['Tümü', 'Kültür', 'Doğa', 'Gastronomi', 'Gece', 'Macera', 'Plaj']

const DESTINATIONS = [
  {
    name: 'Tokyo',
    country: 'Japonya',
    emoji: '🇯🇵',
    tags: ['Kültür', 'Gastronomi'],
    duration: '7 gün',
    budget: '$1.200 – $1.800',
    rating: 9.4,
    accent: '#e8532a',
    bestFor: 'Kültür & Gastronomi',
    highlights: ['Tsukiji Balık Pazarı', 'Shibuya Kavşağı', 'Senso-ji Tapınağı'],
    plan: [
      { day: 'Gün 1', title: 'Shinjuku & Varış', detail: 'Otele yerleş, Kabukicho sokakları, yakitori barları' },
      { day: 'Gün 2', title: 'Asakusa & Ueno', detail: 'Senso-ji sabah turu, Ueno parkı, Ameyoko pazarı' },
      { day: 'Gün 3', title: 'Tsukiji & Ginza', detail: 'Tsukiji sabah balık mezat, sushi omakase öğle, Ginza yürüyüşü' },
      { day: 'Gün 4', title: 'Yanaka & Gece', detail: 'Yanaka eski mahalle, Golden Gai yerel barlar turu' },
    ],
    tip: 'Suica kart al, taksi kullanma. Ramen için Ichiran kuyruğuna gir.',
  },
  {
    name: 'Barselona',
    country: 'İspanya',
    emoji: '🇪🇸',
    tags: ['Kültür', 'Gece', 'Plaj'],
    duration: '5 gün',
    budget: '$800 – $1.200',
    rating: 9.1,
    accent: '#d4820a',
    bestFor: 'Mimari & Plaj & Gece',
    highlights: ['Sagrada Família', 'La Boqueria', 'Gothic Quarter'],
    plan: [
      { day: 'Gün 1', title: 'Gothic Quarter', detail: 'Barri Gòtic labirenti, El Call, Las Ramblas sonu Barceloneta plajı' },
      { day: 'Gün 2', title: 'Gaudí Günü', detail: 'Sagrada Família sabah erken, Park Güell, Casa Batlló akşam turu' },
      { day: 'Gün 3', title: 'Boqueria & Eixample', detail: 'La Boqueria pazar alışverişi, Eixample modernist mimari' },
      { day: 'Gün 4', title: 'Gece & Tapas', detail: 'El Xampanyet cava barı, Poble Sec gece sahneleri' },
    ],
    tip: 'Sagrada Família biletini en az 2 hafta önce al. Öğle yemeği 14:00\'ten önce yeme.',
  },
  {
    name: 'Bali',
    country: 'Endonezya',
    emoji: '🇮🇩',
    tags: ['Doğa', 'Plaj', 'Macera'],
    duration: '10 gün',
    budget: '$600 – $1.000',
    rating: 9.0,
    accent: '#0a9958',
    bestFor: 'Doğa & Huzur & Macera',
    highlights: ['Ubud Pirinç Tarlaları', 'Uluwatu Tapınağı', 'Nusa Penida'],
    plan: [
      { day: 'Gün 1–2', title: 'Ubud', detail: 'Tegalalang terasları şafak turu, Monkey Forest, geleneksel dans gösterisi' },
      { day: 'Gün 3–4', title: 'Nusa Penida', detail: 'Kelingking Beach, Angel Billabong, dalış' },
      { day: 'Gün 5–6', title: 'Seminyak', detail: 'Ku De Ta gün batımı, Petitenget sahili, beach club' },
      { day: 'Gün 7–8', title: 'Uluwatu', detail: 'Uluwatu kecak ateş dansı, Single Fin sörf, Bingin plajı' },
    ],
    tip: 'Scooter kirala ($5/gün). Gojek uygulaması taksi için şart. Kovid sonrası Uluwatu kalabalık, sabah erken git.',
  },
  {
    name: 'Roma',
    country: 'İtalya',
    emoji: '🇮🇹',
    tags: ['Kültür', 'Gastronomi'],
    duration: '5 gün',
    budget: '$900 – $1.400',
    rating: 9.2,
    accent: '#d43a6e',
    bestFor: 'Tarih & Mutfak',
    highlights: ['Colosseum', 'Vatikan Müzeleri', 'Trastevere'],
    plan: [
      { day: 'Gün 1', title: 'Forum & Colosseum', detail: 'Roma Forumu sabah, Colosseum öğle, Palatine tepesi akşam' },
      { day: 'Gün 2', title: 'Vatikan', detail: 'Vatikan Müzeleri erken giriş, Sistine Şapeli, St. Peter\'s Bazilikası' },
      { day: 'Gün 3', title: 'Pantheon & Trastevere', detail: 'Pantheon, Campo de\' Fiori pazarı, Trastevere akşam yürüyüşü' },
      { day: 'Gün 4', title: 'Yerel Roma', detail: 'Testaccio pazarı, Cacio e pepe dersi, Pigneto mahallesi' },
    ],
    tip: 'Vatikan için mutlaka online bilet. Restoranlar için rezervasyon şart. Turistik bölgelerde su şişesi $5, 200m uzakta €0.50.',
  },
  {
    name: 'Kyoto',
    country: 'Japonya',
    emoji: '🇯🇵',
    tags: ['Kültür', 'Doğa'],
    duration: '6 gün',
    budget: '$900 – $1.400',
    rating: 9.3,
    accent: '#6d32e0',
    bestFor: 'Tarih & Huzur & Zen',
    highlights: ['Fushimi Inari', 'Arashiyama', 'Nishiki Pazarı'],
    plan: [
      { day: 'Gün 1', title: 'Fushimi Inari', detail: 'Sabah 06:00 Fushimi Inari (kalabalık yok), Nishiki Pazarı öğle' },
      { day: 'Gün 2', title: 'Arashiyama', detail: 'Bambu korusu gün doğumu, Tenryu-ji bahçesi, tekne turu' },
      { day: 'Gün 3', title: 'Gion & Geisha', detail: 'Gion mahallesi akşam yürüyüşü, Pontocho dar sokakları, kaiseki yemeği' },
      { day: 'Gün 4', title: 'Felsefe Yolu', detail: 'Philosopher\'s Path kiraz ağaçları, Nanzen-ji tapınağı' },
    ],
    tip: 'Nisan kiraz çiçeği dönemi için 3 ay önce otel ayarla. Gion\'da geishalara fotoğraf çekme.',
  },
  {
    name: 'Paris',
    country: 'Fransa',
    emoji: '🇫🇷',
    tags: ['Kültür', 'Gastronomi'],
    duration: '6 gün',
    budget: '$1.100 – $1.700',
    rating: 9.0,
    accent: '#0579c4',
    bestFor: 'Sanat & Mutfak & Romantizm',
    highlights: ['Louvre', 'Marais', 'Montmartre'],
    plan: [
      { day: 'Gün 1', title: 'Sol Yakası', detail: 'Saint-Germain kahvaltısı, Musée d\'Orsay, Luxembourg bahçesi' },
      { day: 'Gün 2', title: 'Louvre & Marais', detail: 'Louvre sabah erken, Le Marais Yahudi mahallesi, Place des Vosges' },
      { day: 'Gün 3', title: 'Montmartre', detail: 'Sacré-Cœur şafak, yerel ressamlar, Canal Saint-Martin' },
      { day: 'Gün 4', title: 'Pazar & Bistro', detail: 'Marché d\'Aligre, bistroda croque-monsieur, Palais Royal bahçesi' },
    ],
    tip: 'Velib bisiklet kiralama en iyi ulaşım. Brasserie\'lerde turistik olmayan için Google Maps\'te 4.5+ ara.',
  },
  {
    name: 'Santorini',
    country: 'Yunanistan',
    emoji: '🇬🇷',
    tags: ['Plaj', 'Gece'],
    duration: '5 gün',
    budget: '$1.000 – $1.600',
    rating: 9.1,
    accent: '#0a8f94',
    bestFor: 'Romantizm & Gün Batımı',
    highlights: ['Oia Gün Batımı', 'Kırmızı Plaj', 'Akrotiri'],
    plan: [
      { day: 'Gün 1', title: 'Fira & Varış', detail: 'Fira merkezi yürüyüş, kaldera manzarası, yerel taverna' },
      { day: 'Gün 2', title: 'Oia', detail: 'Oia sabah erken (kalabalık olmadan), mavi kubbeler, gün batımı seyri' },
      { day: 'Gün 3', title: 'Plajlar', detail: 'Kırmızı Plaj, Perivolos siyah plaj, beach bar' },
      { day: 'Gün 4', title: 'Akrotiri & Şarap', detail: 'Akrotiri arkeoloji alanı, Assyrtiko şarabı tadımı, volcano boat tour' },
    ],
    tip: 'Yaz aylarında Oia gün batımı için 2 saat önce yer kapl. Asıl plajlar güneyde, Oia\'dan ATV ile git.',
  },
  {
    name: 'Dubai',
    country: 'BAE',
    emoji: '🇦🇪',
    tags: ['Gece', 'Macera'],
    duration: '5 gün',
    budget: '$1.200 – $2.000',
    rating: 8.9,
    accent: '#d4820a',
    bestFor: 'Lüks & Modernite',
    highlights: ['Burj Khalifa', 'Dubai Frame', 'Deira Altın Çarşısı'],
    plan: [
      { day: 'Gün 1', title: 'Downtown', detail: 'Burj Khalifa 148. kat gün doğumu, Dubai Mall, çeşme gösterisi akşam' },
      { day: 'Gün 2', title: 'Eski Dubai', detail: 'Deira Altın Çarşısı, baharat pazarı, abra ile Dubai Creek geçişi' },
      { day: 'Gün 3', title: 'Çöl Safari', detail: 'Öğleden sonra dune bashing, deve binme, bedeviler çadırında akşam yemeği' },
      { day: 'Gün 4', title: 'Marina & Plaj', detail: 'JBR plajı, Dubai Marina yürüyüşü, Ain Dubai dönme dolabı' },
    ],
    tip: 'Ramazan\'da dışarıda yeme içme dikkat. Taksi ucuz, Uber var. Kıyafet kurallarına dikkat (tapınaklar, alışveriş merkezleri).',
  },
  {
    name: 'İstanbul',
    country: 'Türkiye',
    emoji: '🇹🇷',
    tags: ['Kültür', 'Gastronomi', 'Gece'],
    duration: '5 gün',
    budget: '$400 – $700',
    rating: 9.0,
    accent: '#e8532a',
    bestFor: 'Kültür & Yemek & Tarih',
    highlights: ['Kapalıçarşı', 'Boğaz Turu', 'Karaköy'],
    plan: [
      { day: 'Gün 1', title: 'Tarihi Yarımada', detail: 'Ayasofya sabah ezanı, Topkapı Sarayı, Kapalıçarşı gezisi' },
      { day: 'Gün 2', title: 'Boğaz & Balık', detail: 'Eminönü balık ekmek, Boğaz günlük tur, Rumeli Hisarı' },
      { day: 'Gün 3', title: 'Beyoğlu', detail: 'Karaköy kahvaltısı, Galata, İstiklal, Cihangir sokak kediileri' },
      { day: 'Gün 4', title: 'Kadıköy', detail: 'Kadıköy Çarşısı, meyve suyu, Moda sahili yürüyüşü, meyhane akşamı' },
    ],
    tip: 'İstanbulkart al. Sabah 08:30\'da Ayasofya\'da ol (kuyruk yok). Taksim\'de yeme, Karaköy\'de ye.',
  },
  {
    name: 'New York',
    country: 'ABD',
    emoji: '🇺🇸',
    tags: ['Kültür', 'Gastronomi', 'Gece'],
    duration: '7 gün',
    budget: '$1.500 – $2.500',
    rating: 9.2,
    accent: '#4a4038',
    bestFor: 'Şehir Hayatı & Kültür',
    highlights: ['Central Park', 'Brooklyn Bridge', 'MoMA'],
    plan: [
      { day: 'Gün 1', title: 'Manhattan', detail: 'High Line sabah yürüyüşü, Chelsea Market, Whitney Museum' },
      { day: 'Gün 2', title: 'Brooklyn', detail: "DUMBO'dan köprü fotoğrafı, Smorgasburg pazar yemeği, Williamsburg" },
      { day: 'Gün 3', title: 'Müzeler', detail: 'MoMA sabah erken, Central Park öğle, The Met akşam' },
      { day: 'Gün 4', title: 'Harlem & Greenwich', detail: 'Harlem gospel kilise servisi, Greenwich Village, West Village pastaneleri' },
    ],
    tip: 'Metro kartı al, Uber pahalı. Restoran için Resy uygulaması. Bodega\'dan kahvaltı en ucuz seçenek.',
  },
  {
    name: 'Reykjavik',
    country: 'İzlanda',
    emoji: '🇮🇸',
    tags: ['Doğa', 'Macera'],
    duration: '7 gün',
    budget: '$1.800 – $2.800',
    rating: 9.0,
    accent: '#0579c4',
    bestFor: 'Aurora & Doğa Harikası',
    highlights: ['Kuzey Işıkları', 'Golden Circle', 'Blue Lagoon'],
    plan: [
      { day: 'Gün 1–2', title: 'Reykjavik', detail: 'Hallgrímskirkja, Laugavegur alışveriş, balina izleme turu' },
      { day: 'Gün 3', title: 'Golden Circle', detail: 'Þingvellir milli parkı, Geysir patlama, Gullfoss şelalesi' },
      { day: 'Gün 4', title: 'Güney Sahili', detail: 'Seljalandsfoss (arkasından geçilebilir!), Skógafoss, siyah kum plajı' },
      { day: 'Gün 5–6', title: 'Aurora Turu', detail: 'Gece 22:00 aurora avı, mağara içi jeotermal yüzme' },
    ],
    tip: 'Ekim–Mart aurora sezonu. Süpermarket\'ten yemek al, restoranlar çok pahalı. Aurora uygulaması indir.',
  },
  {
    name: 'Bangkok',
    country: 'Tayland',
    emoji: '🇹🇭',
    tags: ['Gastronomi', 'Kültür', 'Gece'],
    duration: '6 gün',
    budget: '$500 – $800',
    rating: 8.8,
    accent: '#f0960c',
    bestFor: 'Sokak Yemeği & Tapınaklar',
    highlights: ['Wat Pho', 'Chatuchak Pazarı', 'Khao San Road'],
    plan: [
      { day: 'Gün 1', title: 'Tapınak Turu', detail: 'Wat Pho (dev Buda), Wat Arun nehir karşısı, Chao Phraya tekne turu' },
      { day: 'Gün 2', title: 'Sokak Yemeği', detail: 'Yaowarat Chinatown sabah dim sum, Jay Fai Michelin sokak yemeği (kuyruk!), Silom' },
      { day: 'Gün 3', title: 'Chatuchak', detail: 'Chatuchak hafta sonu pazarı, Or Tor Kor market, Lumphini Parkı' },
      { day: 'Gün 4', title: 'Rooftop & Gece', detail: 'Lebua Sky Bar (Hangover filmi), Khao San Road gece hayatı' },
    ],
    tip: 'BTS Skytrain ve MRT kullan. Tuk-tuk fiyat pazarlığı şart. Yemek için hep kalabalık yeri seç.',
  },
]

type ModalPlan = typeof DESTINATIONS[0] | null

export default function ExplorePage() {
  const router = useRouter()
  const { persona } = usePersonaStore()
  const [activeCategory, setActiveCategory] = useState('Tümü')
  const [hoveredCity, setHoveredCity] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalPlan>(null)

  const filtered = DESTINATIONS.filter(c =>
    activeCategory === 'Tümü' || c.tags.includes(activeCategory)
  )

  function handlePlan(cityName: string) {
    router.push(`/plan/new?destination=${encodeURIComponent(cityName)}`)
  }

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl mb-1" style={{ color: 'var(--ink)' }}>Keşfet</h1>
        <p className="text-sm" style={{ color: 'var(--stone-500)' }}>
          Hazır örnek planlarla ilham al, beğendiğine tıkla ve AI ile kişiselleştir.
        </p>
      </div>

      {/* AI suggestion */}
      {persona && (
        <div className="relative overflow-hidden rounded-2xl p-5 mb-6 flex items-center gap-4" style={{ background: 'var(--ink)' }}>
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(212,130,10,0.2)' }}>
            <span className="text-xl">✨</span>
          </div>
          <div className="relative flex-1">
            <p className="text-white font-semibold text-sm">Sana özel AI önerisi</p>
            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Profil analizine göre{' '}
              <span className="font-medium" style={{ color: 'var(--amber)' }}>Tokyo</span> veya{' '}
              <span className="font-medium" style={{ color: 'var(--amber)' }}>Kyoto</span> tam sana göre.
            </p>
          </div>
          <button
            onClick={() => handlePlan('Tokyo')}
            className="relative text-xs font-semibold px-3 py-1.5 rounded-full transition-all shrink-0"
            style={{ background: 'rgba(212,130,10,0.15)', border: '1px solid rgba(212,130,10,0.3)', color: 'var(--amber)' }}
          >
            Plan Yap →
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-150"
            style={activeCategory === cat
              ? { background: 'var(--amber)', color: 'white', boxShadow: 'var(--shadow-amber)' }
              : { background: 'white', border: '1px solid var(--stone-200)', color: 'var(--stone-600)' }
            }
          >
            {cat}
          </button>
        ))}
        <span className="text-xs self-center ml-1" style={{ color: 'var(--stone-400)' }}>{filtered.length} destinasyon</span>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(dest => {
          const isHovered = hoveredCity === dest.name
          return (
            <button
              key={dest.name}
              onClick={() => setModal(dest)}
              onMouseEnter={() => setHoveredCity(dest.name)}
              onMouseLeave={() => setHoveredCity(null)}
              className="group text-left rounded-2xl overflow-hidden transition-all duration-200"
              style={{
                background: 'white',
                border: '1px solid var(--stone-100)',
                boxShadow: isHovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                transform: isHovered ? 'translateY(-3px)' : 'none',
              }}
            >
              {/* Header */}
              <div
                className="h-28 relative flex items-end justify-between p-4 overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${dest.accent}30 0%, ${dest.accent}70 100%)` }}
              >
                <span className="text-4xl drop-shadow-lg" style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.2s' }}>
                  {dest.emoji}
                </span>
                <div className="flex flex-col items-end gap-1">
                  <div className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(255,255,255,0.9)', color: dest.accent }}>
                    ★ {dest.rating}
                  </div>
                  <div className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.85)', color: 'var(--stone-600)' }}>
                    {dest.duration}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-serif text-lg transition-colors duration-150" style={{ color: isHovered ? dest.accent : 'var(--ink)' }}>
                    {dest.name}
                  </h3>
                  <span className="text-xs mt-1 shrink-0 ml-2" style={{ color: 'var(--stone-400)' }}>{dest.country}</span>
                </div>

                {/* Budget */}
                <p className="text-xs font-semibold mb-2" style={{ color: dest.accent }}>{dest.budget} / kişi</p>

                {/* Highlights */}
                <div className="flex flex-col gap-1 mb-3">
                  {dest.highlights.map(h => (
                    <div key={h} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--stone-600)' }}>
                      <span style={{ color: dest.accent }}>•</span> {h}
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {dest.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--stone-100)', color: 'var(--stone-500)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-semibold transition-all duration-200"
                    style={{ color: dest.accent, opacity: isHovered ? 1 : 0 }}>
                    Planı Gör →
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Plan Detail Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(18,16,14,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setModal(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl overflow-hidden"
            style={{ background: 'white', boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              className="p-6 flex items-start justify-between"
              style={{ background: `linear-gradient(135deg, ${modal.accent}20 0%, ${modal.accent}50 100%)` }}
            >
              <div className="flex items-center gap-4">
                <span className="text-5xl">{modal.emoji}</span>
                <div>
                  <h2 className="font-serif text-2xl" style={{ color: 'var(--ink)' }}>{modal.name}</h2>
                  <p className="text-sm font-medium" style={{ color: 'var(--stone-500)' }}>{modal.country} · {modal.duration}</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: modal.accent }}>{modal.budget} / kişi</p>
                </div>
              </div>
              <button
                onClick={() => setModal(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg transition-colors"
                style={{ background: 'rgba(255,255,255,0.7)', color: 'var(--stone-600)' }}
              >
                ×
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-5">
              {/* Best for */}
              <div className="flex items-center gap-2 text-sm">
                <span className="font-bold" style={{ color: 'var(--stone-400)' }}>EN İYİ:</span>
                <span className="font-semibold" style={{ color: 'var(--ink)' }}>{modal.bestFor}</span>
              </div>

              {/* Sample itinerary */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--stone-400)' }}>Örnek Program</p>
                <div className="space-y-3">
                  {modal.plan.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div
                        className="shrink-0 px-2 py-1 rounded-lg text-xs font-bold w-16 text-center"
                        style={{ background: `${modal.accent}15`, color: modal.accent }}
                      >
                        {item.day}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{item.title}</p>
                        <p className="text-xs leading-relaxed mt-0.5" style={{ color: 'var(--stone-500)' }}>{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Local tip */}
              <div className="rounded-2xl p-4" style={{ background: 'var(--amber-light)', border: '1px solid rgba(212,130,10,0.2)' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--amber-dark)' }}>💡 Yerel İpucu</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--amber-dark)' }}>{modal.tip}</p>
              </div>

              {/* CTA */}
              <button
                onClick={() => handlePlan(modal.name)}
                className="w-full py-3.5 rounded-2xl text-base font-bold transition-all hover:-translate-y-0.5"
                style={{ background: modal.accent, color: 'white', boxShadow: `0 4px 16px ${modal.accent}40` }}
              >
                {modal.name} için AI Plan Oluştur →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
