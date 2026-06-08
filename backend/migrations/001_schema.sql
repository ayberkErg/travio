-- ============================================================
-- TRAVIO — Supabase Veritabanı Şeması
-- ============================================================
-- Kurulum:
--   1. Supabase dashboard → SQL Editor
--   2. Bu dosyanın tamamını yapıştır → Run
--   3. Her tablo için RLS (Row Level Security) otomatik aktif olur
-- ============================================================


-- ============================================================
-- TABLO 1: users
-- ============================================================
-- Supabase'in kendi auth.users tablosuna bağlıdır.
-- Kullanıcı kayıt olduğunda aşağıdaki trigger otomatik doldurur.
-- subscription_tier: 'free' | 'plus' | 'family'
-- plans_generated_this_month: aylık plan limiti için sayaç (free: 3, plus: sınırsız)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id                          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                       TEXT UNIQUE NOT NULL,
  full_name                   TEXT,
  avatar_url                  TEXT,
  subscription_tier           TEXT NOT NULL DEFAULT 'free'
                                CHECK (subscription_tier IN ('free', 'plus', 'family')),
  plans_generated_this_month  INTEGER NOT NULL DEFAULT 0,
  stripe_customer_id          TEXT,
  onboarding_completed        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.users IS 'Uygulama kullanıcıları. auth.users ile 1:1 ilişkili.';
COMMENT ON COLUMN public.users.subscription_tier IS 'free: 3 plan/ay | plus: sınırsız + alarmlar | family: çoklu kullanıcı';
COMMENT ON COLUMN public.users.plans_generated_this_month IS 'Her ayin 1inde sifirlanir (reset_monthly_plan_counts fonksiyonu ile)';
COMMENT ON COLUMN public.users.onboarding_completed IS 'İlk giriş sonrası /auth/onboarding sihirbazı tamamlandı mı?';


-- ============================================================
-- TABLO 2: user_personas
-- ============================================================
-- Kullanıcının seyahat karakterini tanımlayan profil.
-- /auth/onboarding'de 5 soruluk wizard ile doldurulur.
-- AI bu bilgileri kullanarak kişiselleştirilmiş plan üretir.
-- Her kullanıcının en fazla 1 personası vardır (UNIQUE user_id).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_personas (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,

  -- Temel seyahat tercihleri
  travel_style                TEXT NOT NULL DEFAULT 'mid_range'
                                CHECK (travel_style IN ('backpacker', 'budget', 'mid_range', 'comfort', 'luxury')),
  companion_type              TEXT NOT NULL DEFAULT 'solo'
                                CHECK (companion_type IN ('solo', 'couple', 'friends', 'family_kids', 'family_adult')),
  travel_tempo                TEXT NOT NULL DEFAULT 'moderate'
                                CHECK (travel_tempo IN ('slow', 'moderate', 'intensive')),
  accommodation_preference    TEXT NOT NULL DEFAULT 'hotel_3star',
  typical_daily_budget_usd    INTEGER NOT NULL DEFAULT 100,

  -- İlgi alanları (1–10 arası puan, AI prompt'una eklenir)
  interest_history_culture    SMALLINT NOT NULL DEFAULT 5 CHECK (interest_history_culture BETWEEN 1 AND 10),
  interest_nightlife          SMALLINT NOT NULL DEFAULT 3 CHECK (interest_nightlife BETWEEN 1 AND 10),
  interest_nature_outdoor     SMALLINT NOT NULL DEFAULT 5 CHECK (interest_nature_outdoor BETWEEN 1 AND 10),
  interest_gastronomy         SMALLINT NOT NULL DEFAULT 7 CHECK (interest_gastronomy BETWEEN 1 AND 10),
  interest_art_museums        SMALLINT NOT NULL DEFAULT 5 CHECK (interest_art_museums BETWEEN 1 AND 10),
  interest_shopping           SMALLINT NOT NULL DEFAULT 4 CHECK (interest_shopping BETWEEN 1 AND 10),
  interest_wellness_spa       SMALLINT NOT NULL DEFAULT 3 CHECK (interest_wellness_spa BETWEEN 1 AND 10),
  interest_sports_adventure   SMALLINT NOT NULL DEFAULT 4 CHECK (interest_sports_adventure BETWEEN 1 AND 10),
  interest_photography        SMALLINT NOT NULL DEFAULT 5 CHECK (interest_photography BETWEEN 1 AND 10),
  interest_local_experiences  SMALLINT NOT NULL DEFAULT 7 CHECK (interest_local_experiences BETWEEN 1 AND 10),

  -- Yemek tercihleri (örn: ['vegetarian', 'halal', 'seafood'])
  food_preferences            TEXT[] NOT NULL DEFAULT '{}',

  -- AI tarafından üretilen özet ve skor
  ai_summary                  TEXT,
  travio_score                INTEGER NOT NULL DEFAULT 0,
  traveler_level              TEXT NOT NULL DEFAULT 'beginner'
                                CHECK (traveler_level IN ('beginner', 'explorer', 'adventurer', 'globetrotter', 'legend')),

  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.user_personas IS 'Kullanıcının seyahat karakteri. Onboarding sihirbazında oluşturulur, AI plan prompt''una eklenir.';
COMMENT ON COLUMN public.user_personas.travio_score IS '/score sayfasında gösterilen gamification puanı (0–1000)';
COMMENT ON COLUMN public.user_personas.traveler_level IS 'Skor aralığına göre: 0-199 beginner, 200-399 explorer, 400-599 adventurer, 600-799 globetrotter, 800+ legend';


-- ============================================================
-- TABLO 3: travel_plans
-- ============================================================
-- Kullanıcıların oluşturduğu seyahat planları.
-- plan_data: AI'ın ürettiği tam JSON (GeneratedPlan şemasına uygun).
-- share_token: sosyal paylaşım için benzersiz token (opsiyonel).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.travel_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Rota bilgileri
  origin_city     TEXT NOT NULL,
  destination     TEXT NOT NULL,
  start_date      DATE,
  end_date        DATE,
  duration_days   INTEGER,
  travelers_count INTEGER NOT NULL DEFAULT 1,

  -- Durum: generating (AI üretiyor) | completed (hazır) | error (hata)
  status          TEXT NOT NULL DEFAULT 'generating'
                    CHECK (status IN ('generating', 'completed', 'error')),

  -- AI'ın ürettiği tam plan verisi (JSON)
  -- Şema: { destination, country, flag_emoji, summary, days[], budget{}, affiliate_offers[], ... }
  plan_data       JSONB,

  -- Kullanıcı eylemleri
  is_favorite     BOOLEAN NOT NULL DEFAULT FALSE,
  is_shared       BOOLEAN NOT NULL DEFAULT FALSE,
  share_token     TEXT UNIQUE,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.travel_plans IS 'AI tarafından üretilen seyahat planları.';
COMMENT ON COLUMN public.travel_plans.plan_data IS 'GeneratedPlan JSON: days[], budget{flights, accommodation, food, activities, transport_local, total_estimated}, affiliate_offers[]';
COMMENT ON COLUMN public.travel_plans.share_token IS 'Paylaşım linki için token. NULL ise plan özel. /plan/share/[token] rotasında kullanılır.';


-- ============================================================
-- TABLO 4: price_alerts
-- ============================================================
-- Kullanıcıların oluşturduğu fiyat alarmları (/alerts sayfası).
-- Sadece Plus kullanıcılara açık özellik.
-- alert_type: 'flight' | 'hotel'
-- status: 'active' | 'triggered' | 'paused'
-- ============================================================
CREATE TABLE IF NOT EXISTS public.price_alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  alert_type      TEXT NOT NULL DEFAULT 'flight'
                    CHECK (alert_type IN ('flight', 'hotel')),

  -- Uçuş alanları
  origin          TEXT,                          -- Kalkış şehri (örn: 'İstanbul')
  destination     TEXT NOT NULL,                 -- Varış (örn: 'Tokyo')
  airline         TEXT,                          -- Tercih edilen havayolu (opsiyonel)

  -- Fiyat takibi
  current_price   INTEGER,                       -- Son bilinen fiyat (TRY)
  target_price    INTEGER NOT NULL,              -- Kullanıcının hedef fiyatı (TRY)
  currency        TEXT NOT NULL DEFAULT 'TRY',

  -- Durum
  status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'triggered', 'paused')),
  last_checked_at TIMESTAMPTZ,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.price_alerts IS 'Fiyat alarmları. Sadece Plus kullanıcılara açık. Cron job her saat kontrol eder.';
COMMENT ON COLUMN public.price_alerts.status IS 'active: izleniyor | triggered: hedef fiyata ulaşıldı | paused: kullanıcı durdurdu';


-- ============================================================
-- TABLO 5: affiliate_clicks
-- ============================================================
-- Kullanıcıların affiliate linklerine tıklamalarını kaydeder.
-- Gelir takibi ve dönüşüm analizi için kullanılır.
-- provider: 'skyscanner' | 'booking' | 'airbnb' vb.
-- offer_type: 'flight' | 'hotel' | 'activity'
-- ============================================================
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES public.users(id) ON DELETE SET NULL,   -- NULL: misafir kullanıcı
  plan_id       UUID REFERENCES public.travel_plans(id) ON DELETE SET NULL,

  provider      TEXT NOT NULL,                   -- örn: 'skyscanner', 'booking.com'
  offer_type    TEXT,                            -- 'flight' | 'hotel' | 'activity'
  destination   TEXT,
  affiliate_tag TEXT NOT NULL DEFAULT 'travio-tr',
  converted     BOOLEAN NOT NULL DEFAULT FALSE,  -- satın alma tamamlandı mı (webhook ile güncellenir)

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.affiliate_clicks IS 'Affiliate link tıklamaları. Gelir analitiği için. converted=true → komisyon kazanıldı.';


-- ============================================================
-- TABLO 6: subscriptions
-- ============================================================
-- Kullanıcı abonelik geçmişi.
-- Stripe webhook'ları bu tabloyu günceller.
-- users.subscription_tier ile senkronize tutulmalıdır.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  tier                    TEXT NOT NULL CHECK (tier IN ('plus', 'family')),
  status                  TEXT CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  payment_provider        TEXT DEFAULT 'stripe',
  amount_try              DECIMAL(10,2),
  billing_period          TEXT CHECK (billing_period IN ('monthly', 'yearly')),

  stripe_subscription_id  TEXT UNIQUE,
  trial_ends_at           TIMESTAMPTZ,
  expires_at              TIMESTAMPTZ,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.subscriptions IS 'Abonelik kayıtları. Stripe webhook''ları ile güncellenir. Her kullanıcının birden fazla (geçmiş) kaydı olabilir.';
COMMENT ON COLUMN public.subscriptions.stripe_subscription_id IS 'Stripe dashboard ile eşleşme için. NULL ise manuel abonelik.';


-- ============================================================
-- FONKSİYON: handle_new_user
-- ============================================================
-- Trigger: Supabase Auth'a yeni kullanıcı kayıt olduğunda
-- otomatik olarak public.users tablosuna kayıt ekler.
-- full_name: kayıt formunda gönderilen raw_user_meta_data'dan alınır.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user IS 'Auth kullanıcısı oluşunca public.users''a otomatik kayıt açar.';


-- ============================================================
-- FONKSİYON: reset_monthly_plan_counts
-- ============================================================
-- Her ayın 1'inde çalıştırılacak.
-- Free kullanıcıların plan sayacını sıfırlar.
-- Supabase'de: Database → Extensions → pg_cron aktif et,
-- sonra: SELECT cron.schedule('0 0 1 * *', 'SELECT reset_monthly_plan_counts()');
-- ============================================================
CREATE OR REPLACE FUNCTION public.reset_monthly_plan_counts()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.users SET plans_generated_this_month = 0;
END;
$$;

COMMENT ON FUNCTION public.reset_monthly_plan_counts IS 'Aylık plan sayacını sıfırlar. Cron: her ayın 1''inde çalışır.';


-- ============================================================
-- FONKSİYON: update_updated_at
-- ============================================================
-- updated_at sütununu otomatik günceller.
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- updated_at triggerları
CREATE OR REPLACE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE TRIGGER trg_personas_updated_at
  BEFORE UPDATE ON public.user_personas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE TRIGGER trg_plans_updated_at
  BEFORE UPDATE ON public.travel_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE TRIGGER trg_alerts_updated_at
  BEFORE UPDATE ON public.price_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
-- Her kullanıcı sadece kendi verilerini okuyabilir/yazabilir.
-- Servis rolü (backend) tüm verilere erişebilir.
-- ============================================================
ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_personas     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_plans      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions     ENABLE ROW LEVEL SECURITY;

-- users: sadece kendi satırını görür/düzenler
CREATE POLICY "users: kendi kaydı" ON public.users
  FOR ALL USING (auth.uid() = id);

-- user_personas: sadece kendi personasını yönetir
CREATE POLICY "personas: kendi personası" ON public.user_personas
  FOR ALL USING (auth.uid() = user_id);

-- travel_plans: sadece kendi planlarını yönetir
CREATE POLICY "plans: kendi planları" ON public.travel_plans
  FOR ALL USING (auth.uid() = user_id);

-- travel_plans: paylaşılan planlar herkese açık (okuma)
CREATE POLICY "plans: paylaşılan planlar herkese açık" ON public.travel_plans
  FOR SELECT USING (is_shared = TRUE);

-- price_alerts: sadece kendi alarmlarını yönetir
CREATE POLICY "alerts: kendi alarmları" ON public.price_alerts
  FOR ALL USING (auth.uid() = user_id);

-- affiliate_clicks: sadece kendi tıklamalarını görür
CREATE POLICY "clicks: kendi tıklamaları" ON public.affiliate_clicks
  FOR ALL USING (auth.uid() = user_id);

-- subscriptions: sadece kendi aboneliğini görür
CREATE POLICY "subscriptions: kendi aboneliği" ON public.subscriptions
  FOR ALL USING (auth.uid() = user_id);


-- ============================================================
-- İNDEKSLER
-- ============================================================
-- Sık sorgulanan sütunlar için performans optimizasyonu.

-- travel_plans: kullanıcının planlarını listelerken kullanılır
CREATE INDEX IF NOT EXISTS idx_plans_user_id      ON public.travel_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_created_at   ON public.travel_plans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_plans_is_favorite  ON public.travel_plans(user_id, is_favorite) WHERE is_favorite = TRUE;

-- user_personas: user_id ile doğrudan erişim
CREATE INDEX IF NOT EXISTS idx_personas_user_id   ON public.user_personas(user_id);

-- price_alerts: aktif alarmları cron job'ı sorgular
CREATE INDEX IF NOT EXISTS idx_alerts_user_id     ON public.price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status      ON public.price_alerts(status) WHERE status = 'active';

-- affiliate_clicks: analitik sorgular için
CREATE INDEX IF NOT EXISTS idx_clicks_user_id     ON public.affiliate_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_clicks_created_at  ON public.affiliate_clicks(created_at DESC);

-- subscriptions: aktif abonelik kontrolü
CREATE INDEX IF NOT EXISTS idx_subs_user_id       ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subs_status        ON public.subscriptions(status) WHERE status = 'active';
