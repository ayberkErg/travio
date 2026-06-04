# Travio — AI Seyahat Planlama Uygulaması

## Canlıya Almak İçin Ne Yapman Gerekiyor?

### 1. Supabase Projesi Kur (5 dakika)
1. [supabase.com](https://supabase.com) → New Project
2. **SQL Editor** → `backend/migrations/001_schema.sql` dosyasını yapıştır → Run
3. **Authentication → Settings** → Email Confirm'i kapat (geliştirme için)
4. **Project Settings → API** sekmesinden şunları kopyala:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_KEY`

### 2. AI API Keyleri Al (ücretsiz)

**Gemini (plan üretimi):**
- [aistudio.google.com](https://aistudio.google.com) → Get API Key
- Kopyala → `GEMINI_API_KEY`

**Groq (sohbet + fallback):**
- [console.groq.com](https://console.groq.com) → API Keys → Create
- Kopyala → `GROQ_API_KEY`

### 3. .env Dosyalarını Doldur

**`frontend/.env.local`** oluştur:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://PROJE_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**`backend/.env`** oluştur:
```env
APP_ENV=development
SECRET_KEY=rastgele_gizli_anahtar_yaz
DATABASE_URL=postgresql+asyncpg://postgres:SIFRE@db.PROJE_ID.supabase.co:5432/postgres
SUPABASE_URL=https://PROJE_ID.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
GEMINI_API_KEY=AIza...
GROQ_API_KEY=gsk_...
ANTHROPIC_API_KEY=
REDIS_URL=redis://localhost:6379
ALLOWED_ORIGINS=["http://localhost:3000"]
AI_MODE=free
PLAN_LIMIT_FREE=3
```

> `DATABASE_URL` için Supabase → Settings → Database → Connection String → URI'yı kopyala, `?sslmode=require` kısmını sil, başına `postgresql+asyncpg://` ekle.

### 4. Yerel Geliştirme

```bash
# Backend
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (yeni terminal)
cd frontend
npm install
npm run dev
```

Tarayıcıda `http://localhost:3000` → Kayıt ol → Onboarding → Plan oluştur.

### 5. Deploy

**Backend → Railway:**
1. [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. `backend/` klasörünü seç
3. Variables sekmesine `.env` değerlerini ekle
4. Deploy tamamlanınca URL'yi kopyala (ör: `https://travio-api.up.railway.app`)

**Frontend → Vercel:**
1. [vercel.com](https://vercel.com) → New Project → GitHub repo
2. `frontend/` klasörünü seç
3. Environment Variables ekle:
   - `NEXT_PUBLIC_API_URL` = Railway URL'in
   - `NEXT_PUBLIC_SUPABASE_URL` = Supabase URL'in
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Supabase anon key'in
4. Deploy

**Son adım — CORS güncelle:**
Railway'de `ALLOWED_ORIGINS=["https://VERCEL_URL.vercel.app"]` ekle.

---

## Ücretli AI'ya Geçmek İstersen (isteğe bağlı)

```env
# backend/.env veya Railway variables
AI_MODE=paid
ANTHROPIC_API_KEY=sk-ant-...
```

Bu kadar. Kod değişmez.

---

## Destek

Sorun olursa: `backend/app/main.py` → `/docs` endpoint'i (Swagger UI) ile API'yi test edebilirsin.
