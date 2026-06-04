-- Travio veritabanı şeması
-- Supabase SQL editöründe çalıştır

-- Kullanıcı tablosu (auth.users'a bağlı)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'plus', 'family')),
  plans_generated_this_month INTEGER DEFAULT 0,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Persona tablosu
CREATE TABLE IF NOT EXISTS user_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  travel_style TEXT DEFAULT 'mid_range',
  companion_type TEXT DEFAULT 'solo',
  travel_tempo TEXT DEFAULT 'moderate',
  interest_history_culture INTEGER DEFAULT 5 CHECK (interest_history_culture BETWEEN 1 AND 10),
  interest_nightlife INTEGER DEFAULT 3 CHECK (interest_nightlife BETWEEN 1 AND 10),
  interest_nature_outdoor INTEGER DEFAULT 5 CHECK (interest_nature_outdoor BETWEEN 1 AND 10),
  interest_gastronomy INTEGER DEFAULT 7 CHECK (interest_gastronomy BETWEEN 1 AND 10),
  interest_art_museums INTEGER DEFAULT 5 CHECK (interest_art_museums BETWEEN 1 AND 10),
  interest_shopping INTEGER DEFAULT 4 CHECK (interest_shopping BETWEEN 1 AND 10),
  interest_wellness_spa INTEGER DEFAULT 3 CHECK (interest_wellness_spa BETWEEN 1 AND 10),
  interest_sports_adventure INTEGER DEFAULT 4 CHECK (interest_sports_adventure BETWEEN 1 AND 10),
  interest_photography INTEGER DEFAULT 5 CHECK (interest_photography BETWEEN 1 AND 10),
  interest_local_experiences INTEGER DEFAULT 7 CHECK (interest_local_experiences BETWEEN 1 AND 10),
  food_preferences TEXT[] DEFAULT '{}',
  accommodation_preference TEXT DEFAULT 'hotel_3star',
  typical_daily_budget_usd INTEGER DEFAULT 100,
  ai_summary TEXT,
  travio_score INTEGER DEFAULT 0,
  traveler_level TEXT DEFAULT 'beginner',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seyahat planları tablosu
CREATE TABLE IF NOT EXISTS travel_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  origin_city TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  duration_days INTEGER,
  travelers_count INTEGER DEFAULT 1,
  status TEXT DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'error')),
  plan_data JSONB,
  is_favorite BOOLEAN DEFAULT FALSE,
  is_shared BOOLEAN DEFAULT FALSE,
  share_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliate tıklamaları
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  plan_id UUID REFERENCES travel_plans(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  offer_type TEXT,
  destination TEXT,
  affiliate_tag TEXT DEFAULT 'travio-tr',
  converted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Abonelikler
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL,
  status TEXT,
  payment_provider TEXT,
  amount_try DECIMAL(10,2),
  billing_period TEXT,
  stripe_subscription_id TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Otomatik kullanıcı kaydı (auth.users'dan tetiklenir)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Aylık plan sayacını sıfırla (cron job için)
CREATE OR REPLACE FUNCTION reset_monthly_plan_counts()
RETURNS VOID AS $$
BEGIN
  UPDATE users SET plans_generated_this_month = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS politikaları
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcı kendi kaydını görür" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Kullanıcı kendi personasını yönetir" ON user_personas FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Kullanıcı kendi planlarını yönetir" ON travel_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Paylaşılan planlar herkese açık" ON travel_plans FOR SELECT USING (is_shared = TRUE);
CREATE POLICY "Kullanıcı kendi tıklamalarını görür" ON affiliate_clicks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Kullanıcı kendi aboneliğini görür" ON subscriptions FOR ALL USING (auth.uid() = user_id);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_travel_plans_user_id ON travel_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_plans_created_at ON travel_plans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_personas_user_id ON user_personas(user_id);
