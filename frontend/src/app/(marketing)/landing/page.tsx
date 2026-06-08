'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

/* ── Flight Map ─────────────────────────────────────────────── */

const CITIES = [
  { x: 48, y: 38, name: 'Londra' },
  { x: 52, y: 40, name: 'Paris' },
  { x: 57, y: 42, name: 'Roma' },
  { x: 56, y: 38, name: 'Berlin' },
  { x: 60, y: 38, name: 'İstanbul', highlight: true },
  { x: 65, y: 48, name: 'Dubai' },
  { x: 75, y: 34, name: 'Delhi' },
  { x: 82, y: 40, name: 'Bangkok' },
  { x: 86, y: 37, name: 'Singapur' },
  { x: 88, y: 30, name: 'Tokyo' },
  { x: 84, y: 44, name: 'Bali' },
  { x: 88, y: 58, name: 'Sydney' },
  { x: 22, y: 42, name: 'New York' },
  { x: 16, y: 48, name: 'Miami' },
  { x: 33, y: 60, name: 'Rio' },
  { x: 50, y: 55, name: 'Nairobi' },
  { x: 53, y: 30, name: 'İzlanda' },
]

const ROUTES = [
  [4, 5], [4, 3], [4, 1], [4, 0],
  [5, 6], [6, 7], [7, 8], [8, 9],
  [7, 10], [10, 11],
  [12, 0], [12, 4],
  [13, 12], [13, 14],
  [4, 15], [15, 5],
  [16, 0], [16, 2],
  [5, 8], [6, 9],
]

function bezierPath(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.sqrt(dx * dx + dy * dy)
  const curve = dist * 0.28
  const nx = -dy / dist
  const ny = dx / dist
  return `M ${x1} ${y1} Q ${mx + nx * curve} ${my + ny * curve} ${x2} ${y2}`
}

function FlightMap() {
  const [active, setActive] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setActive(true), 500)
    return () => clearTimeout(t)
  }, [])

  return (
    <svg
      viewBox="0 0 100 70"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <filter id="city-glow-light">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="route-glow-light">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.4" />
        </filter>
      </defs>

      {ROUTES.map(([a, b], i) => {
        const c1 = CITIES[a], c2 = CITIES[b]
        const d = bezierPath(c1.x, c1.y, c2.x, c2.y)
        const dur = 3.5 + (i % 4) * 0.7
        const delay = i * 0.35

        return (
          <g key={i}>
            {/* glow */}
            <path d={d} fill="none" stroke="rgba(212,130,10,0.12)" strokeWidth="0.9" filter="url(#route-glow-light)" />
            {/* dashed line */}
            <path
              d={d}
              fill="none"
              stroke="rgba(212,130,10,0.28)"
              strokeWidth="0.25"
              strokeLinecap="round"
              strokeDasharray="0.6 0.6"
              style={{
                strokeDashoffset: active ? 0 : 100,
                transition: `stroke-dashoffset ${dur}s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
              }}
            />
            {/* traveling dot */}
            {active && (
              <circle r="0.5" fill="#d4820a">
                <animateMotion
                  dur={`${7 + (i % 5) * 1.8}s`}
                  begin={`${delay + 1.5}s`}
                  repeatCount="indefinite"
                  path={d}
                />
                <animate
                  attributeName="opacity"
                  values="0;1;1;1;0"
                  keyTimes="0;0.05;0.5;0.95;1"
                  dur={`${7 + (i % 5) * 1.8}s`}
                  begin={`${delay + 1.5}s`}
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </g>
        )
      })}

      {CITIES.map((city) => (
        <g key={city.name}>
          {city.highlight && (
            <>
              <circle cx={city.x} cy={city.y} r="3" fill="rgba(212,130,10,0.10)">
                <animate attributeName="r" values="2;4.5;2" dur="3.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.10;0;0.10" dur="3.5s" repeatCount="indefinite" />
              </circle>
              <circle cx={city.x} cy={city.y} r="1.6" fill="rgba(212,130,10,0.20)" />
            </>
          )}
          <circle
            cx={city.x}
            cy={city.y}
            r={city.highlight ? 0.9 : 0.5}
            fill={city.highlight ? '#d4820a' : 'rgba(168,100,8,0.55)'}
            filter={city.highlight ? 'url(#city-glow-light)' : undefined}
          />
          <circle
            cx={city.x}
            cy={city.y}
            r={city.highlight ? 0.4 : 0.22}
            fill="white"
            opacity={city.highlight ? 0.9 : 0.7}
          />
        </g>
      ))}
    </svg>
  )
}

/* ── Data ───────────────────────────────────────────────────── */

const FEATURES = [
  { icon: '🧠', title: 'AI Seyahat Profili', desc: 'Zevklerini, bütçeni ve seyahat tarzını öğrenir. Her plan sana özel.', accent: '#d4820a' },
  { icon: '📍', title: 'Yerel Deneyimler', desc: 'Turistik klişelerden uzak, yerel mekanlar ve saklı köşeler.', accent: '#0a8f94' },
  { icon: '⚡', title: '30 Saniyede Hazır', desc: 'Destinasyonu seç, tarih belirle. Gün gün detaylı plan anında.', accent: '#6d32e0' },
  { icon: '✈️', title: 'Gerçek Uçuş Fiyatları', desc: 'Amadeus ile canlı fiyatlar. Skyscanner affiliatesiyle rezervasyon.', accent: '#e8532a' },
  { icon: '💰', title: 'Bütçe Takibi', desc: 'Her aktivite için tahmini maliyet. Bütçeni aşmadan ideal rota.', accent: '#0a9958' },
  { icon: '🔔', title: 'Fiyat Alarmları', desc: 'Hedef fiyatı belirle, fiyat düşünce anında bildirim al.', accent: '#d43a6e' },
]

const MARQUEE = [
  '🗼 Paris', '🏯 Kyoto', '🌴 Bali', '🏛️ Roma', '🌆 Dubai', '🗽 New York',
  '🏔️ İzlanda', '🌊 Santorini', '🦁 Safari', '🎰 Las Vegas', '🌸 Tokyo', '🏝️ Maldivler',
  '🎭 Barcelona', '🌅 Phuket', '🏰 Prag', '🌺 Hawaii', '🎪 İstanbul', '🦜 Rio',
]

/* ── Page ───────────────────────────────────────────────────── */

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const navScrolled = scrollY > 40

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'var(--cream)', color: 'var(--ink)' }}>

      {/* NAV */}
      <nav
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 transition-all duration-300"
        style={{
          background: navScrolled ? 'rgba(250,247,242,0.92)' : 'transparent',
          backdropFilter: navScrolled ? 'blur(16px)' : 'none',
          borderBottom: navScrolled ? '1px solid var(--stone-100)' : 'none',
        }}
      >
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-2xl tracking-tight" style={{ color: 'var(--ink)' }}>travio</span>
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--amber)' }} />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className="hidden sm:block text-sm font-medium px-4 py-2 transition-colors"
            style={{ color: 'var(--stone-600)' }}
          >
            Giriş
          </Link>
          <Link
            href="/auth/register"
            className="text-sm font-semibold px-5 py-2.5 rounded-full transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--amber)', color: 'white', boxShadow: 'var(--shadow-amber)' }}
          >
            Ücretsiz Başla →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

        {/* Soft warm orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/4 right-1/4 w-[700px] h-[700px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(212,130,10,0.07) 0%, transparent 70%)',
              filter: 'blur(80px)',
              animation: 'aurora 14s ease-in-out infinite',
            }}
          />
          <div
            className="absolute bottom-1/3 left-1/4 w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(109,50,224,0.05) 0%, transparent 70%)',
              filter: 'blur(80px)',
              animation: 'aurora 18s ease-in-out infinite reverse',
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{
              background: 'radial-gradient(circle, rgba(10,143,148,0.04) 0%, transparent 70%)',
              filter: 'blur(60px)',
              animation: 'aurora 20s ease-in-out infinite 4s',
            }}
          />
        </div>

        {/* Flight map — very subtle on light bg */}
        <div className="absolute inset-0" style={{ opacity: 0.45 }}>
          <FlightMap />
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 inset-x-0 h-48 pointer-events-none"
          style={{ background: 'linear-gradient(to top, var(--cream) 0%, transparent 100%)' }}
        />

        {/* Hero content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6 pt-24">

          <div
            className="anim-1 inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-bold tracking-widest uppercase"
            style={{
              background: 'var(--amber-light)',
              border: '1px solid rgba(212,130,10,0.25)',
              color: 'var(--amber-dark)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--amber)' }} />
            AI Destekli Seyahat Planlama
          </div>

          <h1
            className="anim-2 font-serif text-white leading-[0.93] mb-6"
            style={{ fontSize: 'clamp(3.2rem, 8vw, 6.5rem)', color: 'var(--ink)' }}
          >
            Dünyanın her<br />
            <em className="text-gradient-amber not-italic">köşesine</em> git.
          </h1>

          <p
            className="anim-3 text-lg md:text-xl max-w-lg mx-auto mb-10 leading-relaxed"
            style={{ color: 'var(--stone-500)' }}
          >
            Seyahat tarzını öğrenen AI ile yerel deneyimler, kişisel rotalar ve 30 saniyede hazır plan.
          </p>

          <div className="anim-4 flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-semibold transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--amber)', color: 'white', boxShadow: '0 8px 28px rgba(212,130,10,0.35)' }}
            >
              Ücretsiz Plan Oluştur <span>→</span>
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-semibold transition-all hover:-translate-y-0.5"
              style={{ background: 'white', border: '1.5px solid var(--stone-200)', color: 'var(--ink)', boxShadow: 'var(--shadow-sm)' }}
            >
              Destinasyonları Keşfet
            </Link>
          </div>

          {/* Stats */}
          <div className="anim-5 flex items-center justify-center gap-10 md:gap-16">
            {[
              { val: '3', lbl: 'Plan Ücretsiz' },
              { val: '30sn', lbl: 'Plan Süresi' },
              { val: '200+', lbl: 'Destinasyon' },
            ].map((s, i) => (
              <div key={s.lbl} className="flex items-center gap-10 md:gap-16">
                {i > 0 && <div className="w-px h-8" style={{ background: 'var(--stone-200)' }} />}
                <div className="text-center">
                  <p className="font-serif text-3xl mb-0.5" style={{ color: 'var(--ink)' }}>{s.val}</p>
                  <p className="text-xs font-medium" style={{ color: 'var(--stone-400)' }}>{s.lbl}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ color: 'var(--stone-300)' }}>
          <div className="w-px h-10" style={{ background: 'linear-gradient(to bottom, transparent, var(--stone-300))' }} />
          <span className="text-[10px] font-semibold tracking-widest uppercase">Keşfet</span>
        </div>
      </section>

      {/* MARQUEE */}
      <div
        className="py-5 overflow-hidden"
        style={{ borderTop: '1px solid var(--stone-100)', borderBottom: '1px solid var(--stone-100)', background: 'var(--parchment)' }}
      >
        <div className="flex gap-10 animate-marquee whitespace-nowrap">
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={i} className="text-sm font-medium" style={{ color: 'var(--stone-400)' }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 py-28">
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--amber)' }}>
            Özellikler
          </p>
          <h2 className="font-serif text-4xl md:text-5xl mb-4" style={{ color: 'var(--ink)', lineHeight: 1.1 }}>
            Seyahati yeniden<br />
            <em className="text-gradient-amber not-italic">hayal et.</em>
          </h2>
          <p className="max-w-md mx-auto leading-relaxed" style={{ color: 'var(--stone-500)' }}>
            Her özellik, seyahat deneyimini daha kişisel ve daha unutulmaz yapmak için tasarlandı.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group p-6 rounded-2xl cursor-default transition-all duration-300"
              style={{ background: 'white', border: '1px solid var(--stone-100)', boxShadow: 'var(--shadow-sm)' }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.boxShadow = 'var(--shadow-md)'
                el.style.transform = 'translateY(-3px)'
                el.style.borderColor = 'var(--stone-200)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.boxShadow = 'var(--shadow-sm)'
                el.style.transform = 'none'
                el.style.borderColor = 'var(--stone-100)'
              }}
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl mb-5 transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${f.accent}14`, boxShadow: `0 0 24px ${f.accent}18` }}
              >
                {f.icon}
              </div>
              <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--ink)' }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--stone-500)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-28" style={{ background: 'var(--parchment)', borderTop: '1px solid var(--stone-100)' }}>
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl" style={{ color: 'var(--ink)' }}>3 adımda plan hazır.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Profilini Oluştur', desc: 'Seyahat tarzın, ilgi alanların ve bütçen hakkında 5 soru. Bir dakika bile sürmez.' },
              { step: '02', title: 'Destinasyon Seç', desc: 'Nereye, ne zaman, kaç kişiyle. Gerisini AI halleder.' },
              { step: '03', title: 'Planını Yaşa', desc: 'Gün gün detaylı program, yerel öneriler, rezervasyon linkleri.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="font-mono text-5xl font-medium mb-6" style={{ color: 'rgba(212,130,10,0.20)' }}>
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-3" style={{ color: 'var(--ink)' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--stone-500)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="max-w-5xl mx-auto px-6 md:px-12 py-28">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl mb-3" style={{ color: 'var(--ink)' }}>Basit fiyatlandırma.</h2>
          <p style={{ color: 'var(--stone-500)' }}>İlk 3 plan tamamen ücretsiz. Kredi kartı gerekmez.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">

          {/* Free */}
          <div
            className="p-8 rounded-3xl"
            style={{ background: 'white', border: '1.5px solid var(--stone-200)', boxShadow: 'var(--shadow-sm)' }}
          >
            <p className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--stone-400)' }}>Ücretsiz</p>
            <p className="font-serif text-5xl mb-1" style={{ color: 'var(--ink)' }}>₺0</p>
            <p className="text-sm mb-8" style={{ color: 'var(--stone-400)' }}>sonsuza kadar</p>
            <ul className="space-y-3 mb-8">
              {['3 AI seyahat planı', 'Uçuş & otel arama', 'Destinasyon keşif', 'Bütçe takibi'].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm" style={{ color: 'var(--stone-600)' }}>
                  <span style={{ color: 'var(--amber)' }}>✓</span> {item}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/register"
              className="block text-center py-3 rounded-full font-semibold text-sm transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--stone-100)', border: '1px solid var(--stone-200)', color: 'var(--ink)' }}
            >
              Ücretsiz Başla
            </Link>
          </div>

          {/* Plus */}
          <div className="p-8 rounded-3xl relative overflow-hidden" style={{ background: 'var(--amber)' }}>
            <div
              className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.25)', color: 'white' }}
            >
              Popüler
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="relative">
              <p className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.75)' }}>Plus</p>
              <p className="font-serif text-5xl text-white mb-1">
                ₺149<span className="text-2xl font-sans font-normal" style={{ color: 'rgba(255,255,255,0.65)' }}>/ay</span>
              </p>
              <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.65)' }}>İlk 7 gün ücretsiz</p>
              <ul className="space-y-3 mb-8">
                {['Sınırsız AI planı', 'Fiyat alarmları', 'PDF export', 'Offline erişim', 'Grup planlama', 'Claude Sonnet AI'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
                    <span className="text-white font-bold">✓</span> {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className="block text-center py-3 rounded-full font-semibold text-sm transition-all hover:-translate-y-0.5"
                style={{ background: 'white', color: 'var(--amber-dark)' }}
              >
                Plus&apos;ı Dene →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        className="py-28 text-center px-6"
        style={{ background: 'var(--parchment)', borderTop: '1px solid var(--stone-100)' }}
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-5xl md:text-6xl mb-6" style={{ color: 'var(--ink)', lineHeight: 1.05 }}>
            Bir sonraki seyahatin<br />
            <em className="text-gradient-amber not-italic">seni bekliyor.</em>
          </h2>
          <p className="text-lg mb-10 leading-relaxed" style={{ color: 'var(--stone-500)' }}>
            Kayıt ol, profilini doldur ve 30 saniyede ilk planını oluştur.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-full text-lg font-semibold transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--amber)', color: 'white', boxShadow: '0 8px 32px rgba(212,130,10,0.4)' }}
          >
            Ücretsiz Başla →
          </Link>
          <p className="text-sm mt-5" style={{ color: 'var(--stone-400)' }}>
            Kredi kartı gerekmez · İlk 3 plan ücretsiz
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-6 md:px-12" style={{ borderTop: '1px solid var(--stone-100)', background: 'var(--cream)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl" style={{ color: 'var(--ink)' }}>travio</span>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--amber)' }} />
          </div>
          <p className="text-xs" style={{ color: 'var(--stone-400)' }}>© 2025 Travio · AI ile seyahat et</p>
          <div className="flex gap-6">
            {['Gizlilik', 'Koşullar', 'İletişim'].map(label => (
              <a
                key={label}
                href="#"
                className="text-xs transition-colors"
                style={{ color: 'var(--stone-400)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--stone-400)')}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
