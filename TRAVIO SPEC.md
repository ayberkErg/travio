# TRAVIO_SPEC.md — Detaylı Teknik Referans

> Bu dosyayı Claude Code’a sadece gerektiğinde okut.
> Örnek: “TRAVIO_SPEC.md Bölüm 3’ü oku, veritabanı şemasına bak”
> Her oturumda okutma — CLAUDE.md yeterli.

-----

## 1. ENV DEĞİŞKENLERİ

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Backend (.env)

```env
APP_ENV=development
SECRET_KEY=degistir
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/travio
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
GEMINI_API_KEY=AIza...
GROQ_API_KEY=gsk_...
ANTHROPIC_API_KEY=sk-ant-...
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
ALLOWED_ORIGINS=["http://localhost:3000"]
AI_MODE=free
PLAN_LIMIT_FREE=3
```

-----

## 2. TİPLER (frontend/src/types/index.ts)

```typescript
// Auth
type SubscriptionTier = 'free' | 'plus' | 'family'
interface User {
  id: string; email: string; full_name?: string;
  subscription_tier: SubscriptionTier;
  plans_generated_this_month: number;
}

// Persona
type TravelStyle = 'backpacker'|'budget'|'mid_range'|'comfort'|'luxury'
type CompanionType = 'solo'|'couple'|'friends'|'family_kids'|'family_adult'
type TravelTempo = 'slow'|'moderate'|'intensive'
interface UserPersona {
  id: string; user_id: string;
  travel_style: TravelStyle;
  companion_type: CompanionType;
  travel_tempo: TravelTempo;
  interest_history_culture: number;  // 0-10
  interest_nightlife: number;
  interest_nature_outdoor: number;
  interest_gastronomy: number;
  interest_art_museums: number;
  interest_shopping: number;
  interest_wellness_spa: number;
  interest_sports_adventure: number;
  interest_photography: number;
  interest_local_experiences: number;
  food_preferences: string[];
  accommodation_preference: string;
  typical_daily_budget_usd: number;
  ai_summary?: string;
  travio_score: number;
  traveler_level: 'beginner'|'explorer'|'adventurer'|'globetrotter'|'legend';
}

// Plan
type ActivityCategory = 'culture'|'food'|'nature'|'nightlife'|'shopping'|'transport'|'hotel'|'activity'
interface ActivityItem {
  time: string; name: string; description: string;
  category: ActivityCategory;
  location?: string; estimated_cost_try?: number;
  booking_url?: string; tips?: string;
}
interface DayPlan {
  day_number: number; title: string; theme: string;
  weather_note?: string; activities: ActivityItem[];
}
interface GeneratedPlan {
  destination: string; country: string; flag_emoji: string;
  summary: string; duration_days: number;
  visa_info: string; currency: string; language: string;
  safety_level: 'safe'|'moderate'|'caution';
  safety_tips: string[];
  days: DayPlan[];
  budget: { flights?:number; accommodation?:number; food?:number;
            activities?:number; transport_local?:number;
            total_estimated:number; currency:string; }
  ai_tips: string[]; local_insights: string[];
  pre_trip_checklist: string[];
  affiliate_offers: AffiliateOffer[];
}
interface AffiliateOffer {
  provider: 'skyscanner'|'booking'|'rentalcars'|'getyourguide'|'biletix';
  title: string; description: string; price_hint?: string;
  url: string; affiliate_tag: string;
  offer_type: 'flight'|'hotel'|'car'|'activity'|'event';
}
interface TravelPlan {
  id: string; user_id: string;
  origin_city: string; destination: string;
  start_date?: string; end_date?: string;
  duration_days?: number; travelers_count: number;
  status: 'generating'|'completed'|'error';
  plan?: GeneratedPlan; is_favorite: boolean;
  created_at: string;
}
interface PlanGenerateRequest {
  origin_city: string; destination: string;
  start_date: string; end_date: string;
  travelers_count: number;
  total_budget_try?: number; currency: string;
  accommodation_type?: string; trip_purpose?: string;
  special_requests?: string; must_see_places?: string[];
  tempo_override?: TravelTempo;
}
```

-----

## 3. VERİTABANI ŞEMASI

```sql
-- Ana tablolar
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  subscription_tier TEXT DEFAULT 'free',
  plans_generated_this_month INTEGER DEFAULT 0,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE,
  travel_style TEXT, companion_type TEXT,
  travel_tempo TEXT DEFAULT 'moderate',
  interest_history_culture INTEGER DEFAULT 5,
  interest_nightlife INTEGER DEFAULT 3,
  interest_nature_outdoor INTEGER DEFAULT 5,
  interest_gastronomy INTEGER DEFAULT 7,
  interest_art_museums INTEGER DEFAULT 5,
  interest_shopping INTEGER DEFAULT 4,
  interest_wellness_spa INTEGER DEFAULT 3,
  interest_sports_adventure INTEGER DEFAULT 4,
  interest_photography INTEGER DEFAULT 5,
  interest_local_experiences INTEGER DEFAULT 7,
  food_preferences TEXT[] DEFAULT '{}',
  accommodation_preference TEXT DEFAULT 'hotel_3star',
  typical_daily_budget_usd INTEGER DEFAULT 100,
  ai_summary TEXT,
  travio_score INTEGER DEFAULT 0,
  traveler_level TEXT DEFAULT 'beginner',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE travel_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  origin_city TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE, end_date DATE,
  duration_days INTEGER, travelers_count INTEGER DEFAULT 1,
  status TEXT DEFAULT 'generating',
  plan_data JSONB,
  is_favorite BOOLEAN DEFAULT FALSE,
  is_shared BOOLEAN DEFAULT FALSE,
  share_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  plan_id UUID REFERENCES travel_plans(id),
  provider TEXT NOT NULL,
  offer_type TEXT, destination TEXT,
  affiliate_tag TEXT DEFAULT 'travio-tr',
  converted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  tier TEXT NOT NULL,
  status TEXT, payment_provider TEXT,
  amount_try DECIMAL(10,2), billing_period TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "own" ON user_personas FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own" ON travel_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "shared" ON travel_plans FOR SELECT USING (is_shared = TRUE);
```

-----

## 4. API ENDPOİNTLERİ

```
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me

GET  /api/v1/persona/me
POST /api/v1/persona
PUT  /api/v1/persona

POST /api/v1/plans/generate
GET  /api/v1/plans
GET  /api/v1/plans/{id}
DELETE /api/v1/plans/{id}
PUT  /api/v1/plans/{id}/favorite

POST /api/v1/chat

GET  /api/v1/search/flights
GET  /api/v1/search/hotels

POST /api/v1/affiliate/click
POST /api/v1/payments/create-session
POST /api/v1/payments/webhook
```

-----

## 5. AI SİSTEM PROMPTU

```python
PLAN_SYSTEM_PROMPT = """
Sen Travio seyahat planlama AI'sısın.
Kullanıcı profiline göre JSON plan üret.

KURALLAR:
1. SADECE geçerli JSON döndür, başka metin ekleme
2. Persona skorlarına göre ağırlıklandır:
   - gastronomy ≥7 → lokal restoran, pazar, yemek turu
   - nightlife ≥7 → bar, club, etkinlik
   - history_culture ≥7 → müze, tarihi alan, tur
   - family_kids → güvenli, çocuk dostu, rahat tempo
3. Tarihteki gerçek etkinlikleri (konser, festival, maç) dahil et
4. Her aktivite için gerçekçi maliyet tahmin et (TRY)
5. Affiliate URL'lerde gerçek platformları kullan
6. "Locals only" — turistik değil yerel mekanlar

ÇIKTI ŞEMASI: GeneratedPlan tipine uygun JSON
"""

CHAT_SYSTEM_PROMPT = """
Sen Travio concierge'isin. Kullanıcının planını biliyorsun.
Kısa, pratik, kişisel cevaplar ver.
Kullanıcının dilinde konuş (otomatik algıla).
Gerektiğinde affiliate link öner — tavsiye tonu kullan.
"""
```

-----

## 6. TRAVIO SCORE

```python
LEVELS = {
  'beginner':    (0, 49,   '🗺️', 'Kaşif'),
  'explorer':    (50, 149,  '⛵', 'Seyyah'),
  'adventurer':  (150, 349, '🧗', 'Maceracı'),
  'globetrotter':(350, 699, '✈️', 'Gezgin'),
  'legend':      (700, 999, '👑', 'Efsane'),
}
POINTS = {
  'new_country': 10, 'new_city': 3,
  'local_experience': 5, 'new_cuisine': 4,
  'plan_created': 2, 'event_attended': 8,
  'trip_completed': 15, 'feedback_given': 3,
}
```

-----

## 7. TASARIM TOKEN’LARI

```css
/* Renkler */
--white: #ffffff; --off-white: #fafaf9; --stone-50: #f8f7f4;
--stone-100: #f0ede7; --stone-200: #e3ded5; --stone-500: #9b9285;
--stone-700: #574f45; --ink: #1a1714;
--amber: #e8930a; --amber-light: #fef3d7; --amber-mid: #fcd97a;
--teal: #0d7377; --teal-light: #d9f0f1;

/* Fontlar */
--font-serif: 'Instrument Serif', Georgia, serif;
--font-sans: 'Geist', system-ui, sans-serif;

/* Spacing (4px bazlı) */
/* 4 8 12 16 24 28 32 40 48 64 80 96 */

/* Border radius */
/* sm:6 md:10 lg:16 xl:20 2xl:24 pill:9999 */
```

-----

## 8. COPY METİNLERİ

```
Hero: "Seyahatin kişisel asistanı."
Sub:  "Zevklerini öğrenen bir AI asistan. Konser, maç,
       festival, lokal lezzetler — hepsi sana özel, 30 saniyede."
CTA:  "Planlamaya Başla →"
Pricing note: "Günde ₺5 — bir kahve fiyatına kişisel seyahat asistanın."

Plus tetikleyiciler:
- Limit: "Bu senin 3. planın — gerçek bir gezgin oluyorsun. Plus ile sınırsız devam et."
- Fiyat: "Paris uçuşu €289 → €201 oldu. ₺99 abonelikle €88 tasarruf ederdin."
- Gece:  "Yarın uçuşun var. Offline erişim ister misin?"
- Anı:   "Paris hikayen hazır. PDF olarak indirmek ister misin?"
```

-----

## 9. AFFILIATE PARTNER’LAR

```python
PARTNERS = {
  'skyscanner': {'tag': 'travio-tr', 'commission': '2-4%', 'type': 'flight'},
  'booking':    {'tag': 'travio-tr', 'commission': '4-8%', 'type': 'hotel'},
  'getyourguide':{'tag':'travio-tr', 'commission': '8-12%','type': 'activity'},
  'rentalcars': {'tag': 'travio-tr', 'commission': '5-8%', 'type': 'car'},
  'biletix':    {'tag': 'travio-tr', 'commission': '3-6%', 'type': 'event'},
}
# Ton: "Bu rota için en ucuz gün Salı — tarihi değiştir mi?" (tavsiye, reklam değil)
```

-----

## 10. DEVOPS

```
Frontend → Vercel (git push = otomatik deploy)
Backend  → Railway (git push = otomatik deploy)
DB       → Supabase cloud
Cache    → Upstash (ücretsiz tier)
Email    → Resend (ücretsiz 3000/ay)

Aylık maliyet MVP: ~$6
  Vercel Free: $0
  Railway Starter: $5
  Supabase Free: $0
  Domain: ~$1/ay
  AI (Gemini+Groq): $0
```

-----

## 11. MCP KURULUMU

```json
// ~/.claude/claude_desktop_config.json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "/Users/sen/travio"]
    },
    "supabase": {
      "command": "npx",
      "args": ["@supabase/mcp-server-supabase"],
      "env": {"SUPABASE_URL": "...", "SUPABASE_SERVICE_KEY": "..."}
    },
    "github": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": {"GITHUB_TOKEN": "ghp_..."}
    },
    "browsertools": {
      "command": "npx",
      "args": ["@agentdeskai/browser-tools-mcp"]
    }
  }
}
```

-----

## 12. YETKİ MATRİSİ

```
Sayfa/Özellik          Ziyaretçi  Ücretsiz  Plus
─────────────────────────────────────────────────
Landing, Blog              ✓         ✓        ✓
Login/Register             ✓         –        –
Dashboard, Explore         –         ✓        ✓
Plan oluşturma             –       3/ay    sınırsız
AI Chat                    –         ✓        ✓
PDF indirme (Anı Def.)     –         –        ✓
Fiyat alarmı               –         –        ✓
Offline erişim             –         –        ✓
Uçuş/Otel arama            –         ✓        ✓
Bütçe takibi               –         ✓        ✓
Grup planlama              –         –        ✓
```