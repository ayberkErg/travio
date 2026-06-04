# TRAVIO — CLAUDE CODE REHBERİ

## PROJE

AI destekli kişisel seyahat planlama uygulaması.
Kullanıcı profilini öğrenir, gün-gün seyahat planı üretir.
Gelir: affiliate (Skyscanner/Booking) + reklam + Plus abonelik.

## STACK

```
Frontend:  Next.js 14 App Router + TypeScript + Tailwind CSS
Backend:   FastAPI (Python 3.11)
DB + Auth: Supabase (PostgreSQL + RLS)
AI Free:   Gemini 1.5 Flash (plan) + Groq Llama (chat)
AI Paid:   Claude Haiku (plan) + Claude Sonnet (chat)
Cache:     Redis (Upstash)
Deploy:    Vercel (FE) + Railway (BE)
```

## KLASÖR YAPISI

```
travio/
├── CLAUDE.md                ← bu dosya
├── TRAVIO_SPEC.md           ← detaylı referans
├── travio_v3_final.html     ← görsel referans
├── frontend/
│   └── src/
│       ├── app/             ← sayfalar
│       ├── components/      ← bileşenler
│       ├── lib/             ← api.ts, utils.ts, supabase.ts
│       ├── store/           ← zustand (index.ts)
│       └── types/           ← index.ts
└── backend/
    └── app/
        ├── api/v1/          ← endpoint'ler
        ├── services/        ← ai_service.py
        ├── schemas/         ← pydantic modeller
        └── core/            ← config.py, database.py
```

## TASARIM KURALLARI

- Referans: `travio_v3_final.html` — birebir uygula
- Fontlar: `Instrument Serif` (başlık) + `Geist` (body)
- Renkler: `globals.css` CSS variables — asla hardcode etme
- Ana vurgu: `--amber: #e8930a`
- Zemin: `--off-white: #fafaf9`
- Yazı: `--ink: #1a1714`

## KOD KURALLARI

- TypeScript strict — `any` kullanma
- Import: `@/` path alias kullan
- API çağrıları: `src/lib/api.ts` üzerinden
- State: Zustand store — prop drilling yapma
- Async: her zaman try/catch
- Bileşen: her dosya tek sorumluluk
- Stil: Tailwind utility class + globals.css @layer

## AI SERVİSİ

```python
AI_MODE = os.getenv("AI_MODE", "free")
# free  → Gemini 1.5 Flash + Groq Llama 3.3
# paid  → Claude Haiku + Claude Sonnet
```

Geçiş: Railway’de sadece AI_MODE değiştir, kod değişmez.

## SAYFA YAPISI

```
/ (landing)           → herkese açık
/auth/login           → giriş
/auth/register        → kayıt
/auth/onboarding      → 5 soruluk persona wizard (ilk kez)
/dashboard            → ana panel (login gerekli)
/dashboard/saved      → kayıtlı planlar
/plan/new             → yeni plan formu
/plan/[id]            → plan detay (4 sekme)
/explore              → destinasyon keşif
/score                → travio score
/flights              → uçuş arama (affiliate)
/hotels               → otel arama (affiliate)
/budget               → bütçe takibi
/alerts               → fiyat alarmları (Plus)
/profile              → kullanıcı profili
/settings             → ayarlar
/settings/billing     → abonelik
```

## AUTH KURALLARI

- Supabase Auth kullan
- Login yoksa `/auth/login`’e yönlendir
- `middleware.ts` ile sayfa koruması
- Token: Supabase session otomatik yönetir

## PLUS ÖZELLİKLERİ

Plus gerektiren: fiyat alarmı, PDF export, offline, grup planlama
Plus modal: sadece 6 tetikleyicide açılır — asla zorla açma
Tetikleyiciler: plan_limit | price_drop | pre_trip_night |
score_share | memory_book | group_plan

## MEVCUT DURUM

→ Production-ready. Kullanıcının yapması gereken sadece env doldurma.
  - Auth: Supabase tabanlı login/register (token Zustand'a sync)
  - Demo kaldırıldı, tüm CTA'lar /auth/register'a
  - Deploy dosyaları: backend/Procfile, railway.json, frontend/vercel.json
  - README.md: Supabase kurulum + API key alma + deploy adımları
  - npm run build → 0 hata ✓

## SIRADAKI ADIM

→ Kullanıcının yapması gerekenler (README.md'ye bakın):
  1. Supabase proje kur → SQL şemasını çalıştır
  2. Gemini API key al (aistudio.google.com)
  3. Groq API key al (console.groq.com)
  4. frontend/.env.local + backend/.env doldur
  5. Railway (backend) + Vercel (frontend) deploy

-----

Detay için: TRAVIO_SPEC.md
Görsel için: travio_v3_final.html