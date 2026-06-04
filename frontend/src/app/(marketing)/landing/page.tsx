import Link from 'next/link'

const MARQUEE = [
  { icon: '🍜', text: 'Yerel ramen dükkanı' },
  { icon: '🎭', text: 'Yerli festival' },
  { icon: '🏘️', text: 'Mahalle pazarı' },
  { icon: '🎵', text: 'Underground konser' },
  { icon: '🍷', text: 'Şarap mahzeni' },
  { icon: '🌅', text: 'Gizli plaj' },
  { icon: '🏺', text: 'Esnaf çarşısı' },
  { icon: '🎨', text: 'Sokak sanatı turu' },
  { icon: '🫖', text: 'Çay seremonisi' },
  { icon: '🎸', text: 'Canlı müzik barı' },
]

const LOCAL_MOMENTS = [
  {
    emoji: '🍜', city: 'Tokyo',
    title: 'Balıkçıların gittiği dükkan',
    desc: 'Tsukiji\'de sabah 7\'de, menüde sadece Japonca var. Turistler rehberle, sen tek başına.',
    tag: 'Gastronomi', color: 'bg-amber-light text-amber',
    border: 'hover:border-amber',
  },
  {
    emoji: '🎵', city: 'Barselona',
    title: '1929\'dan beri aynı aile',
    desc: 'Bar el Xampanyet — Katalan cava, yerli müzisyenler, Tripadvisor\'da yeri yok.',
    tag: 'Gece Hayatı', color: 'bg-violet-light text-violet',
    border: 'hover:border-violet',
  },
  {
    emoji: '🏺', city: 'Marakeş',
    title: 'GPS\'ini kapat ve gir',
    desc: 'Derici mahallesi. Rehber götürmez, harita göstermez. Kaybol ve bul.',
    tag: 'Kültür', color: 'bg-coral-light text-coral',
    border: 'hover:border-coral',
  },
  {
    emoji: '🌅', city: 'Santorini',
    title: 'Oia değil, Pyrgos',
    desc: 'Gün batımını herkes Oia\'da izler. Turistlerin bilmediği köyde sadece sen varsın.',
    tag: 'Keşif', color: 'bg-teal-light text-teal',
    border: 'hover:border-teal',
  },
]

const SAMPLE_ACTIVITIES = [
  { time: '08:30', name: 'Tsukiji Dış Pazar', tag: 'Yemek 🍜', cost: '₺320', color: 'bg-amber-light text-amber' },
  { time: '11:00', name: 'Yanaka Ginza — 1923\'ten değişmedi', tag: 'Kültür 🏛️', cost: 'Ücretsiz', color: 'bg-teal-light text-teal' },
  { time: '19:00', name: 'Golden Gai\'da 5 kişilik bar', tag: 'Gece 🎵', cost: '₺480', color: 'bg-violet-light text-violet' },
]

const FEATURES = [
  { icon: '🧭', title: 'Locals only', desc: 'Tripadvisor listesi değil. Mahallelinin önerisi.', color: 'bg-amber-light', iconBg: 'text-amber' },
  { icon: '⚡', title: '30 saniye', desc: 'Form doldur, bekle. Plan gelir.', color: 'bg-coral-light', iconBg: 'text-coral' },
  { icon: '🎯', title: 'Sana özel', desc: 'AI seyahat tarzını öğrenir, ona göre planlar.', color: 'bg-violet-light', iconBg: 'text-violet' },
  { icon: '💬', title: 'Concierge', desc: '"En iyi ramen nerede?" — anlık cevap.', color: 'bg-teal-light', iconBg: 'text-teal' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#fafaf9' }}>

      {/* Sayfa geneli arka plan dokusu */}
      <div className="fixed inset-0 -z-20 pointer-events-none">
        {/* Ana gradient zemin */}
        <div className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% -10%, #fff7e6 0%, #fafaf9 60%)',
          }}
        />
        {/* Sol üst — amber blob */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #fcd97a 0%, transparent 70%)' }}
        />
        {/* Sağ orta — coral blob */}
        <div className="absolute top-1/3 -right-48 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #ff5c35 0%, transparent 70%)' }}
        />
        {/* Sol alt — violet blob */}
        <div className="absolute bottom-1/4 -left-24 w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
        />
        {/* Nokta desen */}
        <div className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(circle, #574f45 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* NAV */}
      <nav className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-stone-200/60">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="font-serif text-2xl text-ink tracking-tight">travio</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber mb-0.5 ml-0.5" />
          </div>

          <div className="hidden md:flex items-center gap-7">
            {[['#nasil', 'Nasıl çalışır?'], ['#ornek', 'Örnek Plan'], ['#fiyat', 'Fiyatlar']].map(([href, label]) => (
              <a key={href} href={href} className="text-sm font-medium text-stone-500 hover:text-ink transition-colors">{label}</a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="hidden sm:block text-sm font-medium text-stone-500 hover:text-ink px-4 py-2 transition-colors">
              Giriş
            </Link>
            <Link href="/auth/register" className="hidden sm:block text-sm font-semibold border-2 border-stone-200 text-ink px-4 py-2 rounded-pill hover:border-amber hover:text-amber transition-colors">
              Demo
            </Link>
            <Link href="/auth/register" className="btn-primary text-sm py-2.5 shadow-amber">
              Başla →
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative max-w-6xl mx-auto px-5 pt-16 pb-12">
        {/* Hero dekoratif çizgiler */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          {/* Konsantrik çemberler */}
          <svg className="absolute -top-20 -right-20 w-[600px] h-[600px] opacity-[0.06]" viewBox="0 0 600 600">
            <circle cx="500" cy="100" r="400" fill="none" stroke="#e8930a" strokeWidth="1.5"/>
            <circle cx="500" cy="100" r="310" fill="none" stroke="#e8930a" strokeWidth="1"/>
            <circle cx="500" cy="100" r="220" fill="none" stroke="#ff5c35" strokeWidth="0.8"/>
            <circle cx="500" cy="100" r="130" fill="none" stroke="#e8930a" strokeWidth="0.5"/>
          </svg>
          {/* Çapraz çizgi desen */}
          <div className="absolute inset-0 bg-lines opacity-60" />
          {/* Sol alt köşe dekor */}
          <svg className="absolute -bottom-10 -left-10 w-[300px] h-[300px] opacity-[0.05]" viewBox="0 0 300 300">
            <circle cx="0" cy="300" r="200" fill="none" stroke="#7c3aed" strokeWidth="1.5"/>
            <circle cx="0" cy="300" r="130" fill="none" stroke="#7c3aed" strokeWidth="1"/>
          </svg>
        </div>

        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-amber text-white text-xs font-bold px-4 py-2 rounded-pill mb-7 shadow-amber">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>Turistik değil — yerel deneyimler</span>
          </div>

          <h1 className="font-serif text-[3.5rem] md:text-[5rem] leading-[1.05] text-ink mb-6 tracking-tight">
            Gittiğin yerde<br />
            <span className="text-gradient-fire italic">yerli gibi</span><br />
            hisset.
          </h1>

          <p className="text-stone-500 text-xl font-medium max-w-xl leading-relaxed mb-10">
            AI asistanın profilini öğrenir, turistlerin bilmediği mekanları, doğru saatleri, yerel deneyimleri planlar.{' '}
            <strong className="text-ink">30 saniyede.</strong>
          </p>

          <div className="flex flex-wrap gap-3 mb-6">
            <Link href="/plan/new" className="btn-primary text-base px-8 py-4 shadow-amber">
              Ücretsiz Planla →
            </Link>
            <Link href="/auth/register" className="btn-secondary text-base px-8 py-4">
              Planlamaya Başla
            </Link>
          </div>
          <p className="text-xs text-stone-400 font-medium">Kayıt gerekmez · 3 plan ücretsiz · Kredi kartı yok</p>
        </div>

        {/* Hero floating badge'ler */}
        <div className="hidden lg:flex absolute right-0 top-16 flex-col gap-3">
          {[
            { emoji: '🇯🇵', city: 'Tokyo', info: '7 günlük plan', color: 'border-amber' },
            { emoji: '🇪🇸', city: 'Barselona', info: 'Gece hayatı odaklı', color: 'border-violet' },
            { emoji: '🇮🇩', city: 'Bali', info: 'Wellness & doğa', color: 'border-teal' },
          ].map((b) => (
            <div key={b.city} className={`bg-white border-2 ${b.color} rounded-2xl px-4 py-3 flex items-center gap-3 shadow-card animate-float`}
              style={{ animationDelay: `${['0', '0.8s', '1.6s'][['border-amber','border-violet','border-teal'].indexOf(b.color)]}` }}>
              <span className="text-2xl">{b.emoji}</span>
              <div>
                <p className="font-bold text-ink text-sm">{b.city}</p>
                <p className="text-xs text-stone-400">{b.info}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MARQUEE */}
      <div className="bg-ink py-4 overflow-hidden">
        <div className="flex gap-10 animate-marquee whitespace-nowrap">
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={i} className="text-stone-400 text-sm font-medium flex items-center gap-2">
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </span>
          ))}
        </div>
      </div>

      {/* LOCAL MOMENTS */}
      <section className="relative max-w-6xl mx-auto px-5 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs font-bold text-amber uppercase tracking-widest mb-3">Yerel Deneyimler</p>
            <h2 className="font-serif text-4xl md:text-5xl text-ink leading-tight">
              Herkesin gittiği yer değil.<br />
              <em className="text-gradient-amber">Gitmen gereken yer.</em>
            </h2>
          </div>
          <p className="text-stone-500 max-w-sm font-medium leading-relaxed">
            Tüm aktiviteler yerel kaynaklardan. Tripadvisor listesi değil — mahallelinin önerisi.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {LOCAL_MOMENTS.map((m) => (
            <div key={m.title} className={`bg-white rounded-2xl border-2 border-stone-100 p-5 transition-all hover:shadow-card-hover ${m.border} cursor-pointer`}>
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{m.emoji}</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-pill ${m.color}`}>{m.tag}</span>
              </div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">{m.city}</p>
              <h3 className="font-bold text-ink mb-2">{m.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DEMO PLAN — karanlık bölüm */}
      <section id="ornek" className="bg-ink py-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet/10 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto px-5 relative">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="badge-amber mb-4 inline-flex">Örnek Plan</span>
              <h2 className="font-serif text-4xl md:text-5xl text-white mt-3 mb-5 leading-tight">
                Tokyo, 7 gün —<br />
                <em className="text-gradient-amber">yerel rotası.</em>
              </h2>
              <p className="text-stone-400 font-medium mb-8 leading-relaxed text-lg">
                Turistik rehber değil. Gerçek lokal deneyimler, doğru saatler, pratik ipuçları. AI tarafından oluşturuldu.
              </p>
              <Link href="/auth/register" className="inline-flex items-center gap-2 bg-amber text-white px-7 py-3.5 rounded-pill font-bold hover:bg-amber-dark transition-colors shadow-amber">
                Hemen Başla →
              </Link>
            </div>

            {/* Timeline */}
            <div className="space-y-3">
              {SAMPLE_ACTIVITIES.map((a, i) => (
                <div key={i} className="bg-white/8 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/12 transition-colors">
                  <span className="text-stone-500 text-sm font-bold w-14 shrink-0">{a.time}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{a.name}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-pill ${a.color}`}>{a.tag}</span>
                    <span className="text-stone-400 text-xs font-medium">{a.cost}</span>
                  </div>
                </div>
              ))}
              <div className="text-center pt-2 text-stone-500 font-medium text-sm">
                + 18 aktivite daha ↓
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="nasil" className="max-w-6xl mx-auto px-5 py-20">
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-coral uppercase tracking-widest mb-3">Nasıl çalışır?</p>
          <h2 className="font-serif text-4xl md:text-5xl text-ink mb-4">Akıllı. Hızlı. Lokal.</h2>
          <p className="text-stone-500 font-medium max-w-md mx-auto">4 özellik, seyahatin tamamen değişir.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className={`${f.color} rounded-2xl p-6 border border-transparent`}>
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-ink text-lg mb-2">{f.title}</h3>
              <p className="text-stone-600 text-sm leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <div className="relative py-14 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a1714 0%, #2d2520 100%)' }}>
        {/* Desen */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle, #fafaf9 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="max-w-4xl mx-auto px-5">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { n: '12K+', label: 'Oluşturulan plan', color: 'text-gradient-fire' },
              { n: '%94', label: 'Lokal mekan oranı', color: 'text-gradient-ocean' },
              { n: '4.9★', label: 'Kullanıcı puanı', color: 'text-gradient-amber' },
            ].map(s => (
              <div key={s.label}>
                <p className={`font-serif text-5xl font-bold mb-2 ${s.color}`}>{s.n}</p>
                <p className="text-stone-400 text-sm font-semibold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRICING */}
      <section id="fiyat" className="max-w-4xl mx-auto px-5 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-violet uppercase tracking-widest mb-3">Fiyatlar</p>
          <h2 className="font-serif text-4xl md:text-5xl text-ink mb-4">Basit. Adil. Değerli.</h2>
          <p className="text-stone-500 font-medium">Günde ₺5 — bir kahve fiyatına kişisel seyahat asistanın.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Ücretsiz */}
          <div className="bg-white rounded-2xl border-2 border-stone-200 p-8">
            <p className="text-sm font-bold text-stone-400 mb-3 uppercase tracking-wider">Ücretsiz</p>
            <div className="flex items-end gap-1 mb-6">
              <span className="font-serif text-5xl text-ink font-bold">₺0</span>
            </div>
            <ul className="space-y-3 mb-8">
              {['3 plan/ay', 'Temel AI', 'Uçuş & otel arama', 'Travio Score'].map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm font-medium text-stone-600">
                  <span className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center text-xs text-amber font-bold">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/register" className="block text-center py-3 rounded-pill font-bold text-sm bg-stone-100 text-ink hover:bg-stone-200 transition-colors">
              Ücretsiz Başla
            </Link>
          </div>

          {/* Plus */}
          <div className="bg-ink rounded-2xl border-2 border-amber p-8 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="badge-amber text-xs font-bold">En Popüler</span>
            </div>
            <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-amber/10 rounded-full" />

            <p className="text-sm font-bold text-amber mb-3 uppercase tracking-wider">Plus</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="font-serif text-5xl text-white font-bold">₺99</span>
              <span className="text-stone-400 pb-2 font-medium">/ay</span>
            </div>
            <p className="text-xs text-stone-500 font-medium mb-6">Yıllık ödemede</p>
            <ul className="space-y-3 mb-8 relative z-10">
              {['Sınırsız plan', 'Gelişmiş AI (Claude)', 'Fiyat alarmları', 'PDF & paylaşım', 'Offline erişim', 'Grup planlama'].map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm font-medium text-stone-300">
                  <span className="w-5 h-5 rounded-full bg-amber/20 flex items-center justify-center text-xs text-amber font-bold">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/register?plan=plus" className="relative z-10 block text-center py-3 rounded-pill font-bold text-sm bg-amber text-white hover:bg-amber-dark transition-colors shadow-amber">
              Plus&apos;a Geç →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-5 pb-20">
        <div className="bg-gradient-to-br from-amber via-amber to-coral rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-10" />
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4 relative">
            İlk planın seni bekliyor.
          </h2>
          <p className="text-white/80 font-medium mb-8 text-lg relative">
            Kayıt ol, 5 soruyu cevapla. 30 saniyede planın hazır.
          </p>
          <div className="flex gap-3 justify-center flex-wrap relative">
            <Link href="/auth/register" className="bg-white/20 text-white border-2 border-white/30 px-6 py-3 rounded-pill font-bold text-sm hover:bg-white/30 transition-colors">
              Planlamaya Başla
            </Link>
            <Link href="/plan/new" className="bg-white text-amber px-8 py-3 rounded-pill font-bold text-sm hover:bg-off-white transition-colors shadow-card">
              Ücretsiz Başla →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-stone-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="font-serif text-xl text-ink">travio</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber mb-0.5 ml-0.5" />
          </div>
          <p className="text-stone-400 text-sm font-medium">© 2025 Travio. Tüm hakları saklıdır.</p>
          <div className="flex gap-6 text-sm font-medium text-stone-400">
            <a href="#" className="hover:text-ink transition-colors">Gizlilik</a>
            <a href="#" className="hover:text-ink transition-colors">Koşullar</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
