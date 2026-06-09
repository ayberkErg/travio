import os
import json
from datetime import datetime
from typing import Optional
import httpx
from app.core.config import settings
from app.schemas.travel import GeneratedPlan, PersonaResponse, PlanGenerateRequest, ChatMessage


async def _fetch_weather(city: str, start_date: str) -> str:
    """wttr.in'den hava durumu çeker. API key gerekmez."""
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(f"https://wttr.in/{city}?format=j1")
            if r.status_code != 200:
                return ""
            data = r.json()
            current = data["current_condition"][0]
            temp_c = int(current["temp_C"])
            feels_c = int(current["FeelsLikeC"])
            desc = current["weatherDesc"][0]["value"]
            humidity = current["humidity"]

            # Tahmin (varsa ilk 3 gün)
            forecasts = []
            for day in data.get("weather", [])[:3]:
                date = day["date"]
                max_c = int(day["maxtempC"])
                min_c = int(day["mintempC"])
                day_desc = day["hourly"][4]["weatherDesc"][0]["value"] if day.get("hourly") else ""
                forecasts.append(f"{date}: {min_c}°C–{max_c}°C, {day_desc}")

            forecast_str = " | ".join(forecasts)
            return (
                f"Hava Durumu ({city}): Şu an {temp_c}°C (hissedilen {feels_c}°C), {desc}, nem %{humidity}. "
                f"Tahmin: {forecast_str}"
            )
    except Exception:
        return ""

PLAN_SYSTEM_PROMPT = """
Sen dünyanın en iyi seyahat editörüsün — Condé Nast Traveller + Time Out kalitesinde, o şehirde yıllarca yaşamış bir yerel gibi yazan uzman.
Turist rehberlerinde olmayan, o şehrin gerçek ruhunu yansıtan, unutulmaz bir plan üreteceksin.

TEMEL KURALLAR:
1. SADECE geçerli JSON döndür. Başka hiçbir şey yazma. Markdown code block kullanma.
2. Her aktivitenin "name" alanı gerçek, spesifik bir mekan/yer adı olacak.
3. Her "tips" alanı o mekan için tamamen özgün olacak — asla başka bir aktivitede aynı cümleyi tekrarlama.
4. Her gün EN AZ 6 aktivite içerecek (kahvaltı + öğle + akşam yemeği dahil).
5. Coğrafi mantık kur: aynı gün içindeki mekanlar birbirine yakın mahallelerde olsun.

ŞEHRE GÖRE YEREL DENEYİM YAKLAŞIMI:
Her şehrin kendi ritmi var, buna göre plan yap:
- İspanya şehirleri: 14:00-17:00 siesta, akşam yemeği 21:00+, tapas kültürü
- Japonya şehirleri: erken kapanma, konbini kültürü, izakaya geceleri
- İtalya şehirleri: aperitivo saati 18:00-20:00, köy meydanları, espresso kültürü
- Fransız şehirler: bistre vs brasserie farkı, pazar alışverişi, wine bar kültürü
- Asya şehirleri: gece pazarları, street food, tapınak sabah rutini
- Amerika şehirleri: brunch kültürü, neighborhood bar, food truck

GÜN YAPISI (bu sıraya göre):
- 07:30: Yerel kahvaltı — o şehrin spesifik sabah kültürü (croissant+café crème, churros+chocolate, dim sum vs)
- 09:30: Sabah aktivitesi 1 — az kalabalık saatte müze/tarihi alan
- 11:30: Mahalle keşfi veya pazar
- 13:30: Öğle yemeği — yerel halkın gittiği restoran, turistik değil
- 15:30: Öğleden sonra aktivitesi — dükkan, atölye, mahalle gezisi
- 17:30: Aperitif/happy hour — o şehrin akşam başlangıç kültürü
- 20:00: Gece yemeği veya gece aktivitesi

TIPS ALANI İÇİN ZORUNLU FORMAT:
Her tips şunlardan birini veya birkaçını içermeli:
- Sipariş edilecek spesifik yemek/içecek adı ("patatas bravas değil, croquetas de jamón ısmarlayın")
- Kaçınılacak spesifik tuzak ("pencere masaları fazla ücretli, barın karşısına oturun")
- O mekana özel yerel bilgi ("Pazar günleri kapanır, Çarşamba öğleden sonrası en sakin")
- Yerel fiyat ipucu ("Menü del día 12-15€, aynı yemekler à la carte 2x pahalı")
- Ulaşım ipucu ("Metro L3 Liceu durağından 3 dakika yürüyüş")

QUALITY KONTROL — BU TİPLERİ ASLA YAZMA:
✗ "Erken saatlerde ziyaret edin, kalabalık olmaz" (çok genel)
✗ "Yerel restoranları tercih edin" (anlamsız)
✗ "Dikkatli olun, çok büyük bir yer" (bilgi değeri yok)
✗ "Rezervasyon yaptırın" tek başına (neden, ne zaman, nasıl söyle)
✓ "Salı-Perşembe 10:00-12:00 arası kuyruğun en kısa olduğu saatler; giriş bileti online %15 ucuz"
✓ "Bar bölümünde ayakta içmek oturma masasının yarı fiyatı — yerel öğrencilerin sırrı"
✓ "2. kattaki arka bahçeyi mutlaka sorun, menüde yazmıyor ama her zaman açık"

YEREL MAHALLE ODAĞI:
Turistik bölgeler yerine şehrin gerçek mahallelerini keşfet:
- Barcelona: Gràcia, El Poblenou, Sant Pere, Horta
- Paris: Belleville, Oberkampf, Batignolles, Butte-aux-Cailles
- Tokyo: Shimokitazawa, Yanaka, Koenji, Nakameguro
- İstanbul: Karaköy, Balat, Arnavutköy, Moda
- Amsterdam: De Pijp, Jordaan, Oud-West, Noord
- Roma: Pigneto, Ostiense, Prati, Trastevere (arka sokaklar)
- New York: Ridgewood, Bed-Stuy, Astoria, Carroll Gardens

ÇIKTI ŞEMASI:

{
  "destination": "string",
  "country": "string",
  "flag_emoji": "string",
  "summary": "O şehrin ruhunu yakalayan, orada yaşayan biri gibi yazan 2-3 cümle. Klişelerden kaçın.",
  "duration_days": number,
  "visa_info": "Türk vatandaşları için net vize bilgisi ve e-vize varsa linki",
  "currency": "string",
  "language": "string",
  "safety_level": "safe|moderate|caution",
  "safety_tips": [
    "Spesifik uyarı — hangi mahalle, hangi saat, ne yapılmalı/yapılmamalı"
  ],
  "days": [
    {
      "day_number": 1,
      "title": "Yaratıcı, o günün karakterini yansıtan başlık",
      "theme": "string",
      "weather_note": "O ay o şehirde pratik hava bilgisi — ne giyilmeli, hangi saatte dışarı çıkılmalı",
      "activities": [
        {
          "time": "07:30",
          "name": "Spesifik mekan adı",
          "description": "2-3 cümle: ne görecek, neden özel, nasıl bir deneyim. O mekanın hikayesi ve atmosferi.",
          "category": "food",
          "location": "Mahalle, mümkünse sokak/adres",
          "estimated_cost_try": 150,
          "booking_url": "",
          "tips": "O mekana özel, başka hiçbir aktivitede tekrarlanmayan özgün bilgi"
        }
      ]
    }
  ],
  "budget": {
    "flights": 0,
    "accommodation": 0,
    "food": 0,
    "activities": 0,
    "transport_local": 0,
    "total_estimated": 0,
    "currency": "TRY"
  },
  "ai_tips": [
    "O şehre özgü, pratik ve spesifik 6-8 ipucu. 'Güvenli ol' gibi genel şeyler yazma."
  ],
  "local_insights": [
    "Turistlerin %90'ının bilmediği 6-8 yerel sır — gizli mekan, yanlış anlaşılan alışkanlık, para tasarrufu"
  ],
  "pre_trip_checklist": [
    "Spesifik hazırlık — hangi uygulamayı indir, hangi rezervasyonu önceden yap, hangi kartı getir"
  ],
  "affiliate_offers": [
    {
      "provider": "skyscanner",
      "title": "string",
      "description": "string",
      "price_hint": "string",
      "url": "string",
      "affiliate_tag": "travio-tr",
      "offer_type": "flight"
    }
  ]
}
"""

CHAT_SYSTEM_PROMPT = """
Sen Travio concierge'isin. Kullanıcının planını biliyorsun.
Kısa, pratik, kişisel cevaplar ver.
Kullanıcının dilinde konuş (otomatik algıla).
Gerektiğinde affiliate link öner — tavsiye tonu kullan.
"""


def _build_plan_prompt(request: PlanGenerateRequest, persona: Optional[PersonaResponse], weather: str = "") -> str:
    persona_info = ""
    if persona:
        persona_info = f"""
Kullanıcı Profili:
- Seyahat tarzı: {persona.travel_style}
- Beraberindekiler: {persona.companion_type}
- Tempo: {persona.travel_tempo}
- İlgi alanları (0-10): tarih/kültür={persona.interest_history_culture}, gastronomi={persona.interest_gastronomy}, gece hayatı={persona.interest_nightlife}, doğa={persona.interest_nature_outdoor}, sanat/müze={persona.interest_art_museums}
- Günlük bütçe: ${persona.typical_daily_budget_usd}
"""

    weather_section = f"\nGerçek Zamanlı Hava Durumu:\n{weather}\n⚠️ HAVA DURUMUNA GÖRE AKTİVİTE SEÇ: Soğuk/yağışlıysa plaj/dış mekan yerine müze/kafe/kapalı alan öner. Sıcaksa sabah erken/akşam geç açık hava aktiviteleri planla." if weather else ""

    return f"""
{persona_info}{weather_section}
Seyahat Detayları:
- Kalkış: {request.origin_city}
- Destinasyon: {request.destination}
- Tarihler: {request.start_date} → {request.end_date}
- Kişi sayısı: {request.travelers_count}
- Bütçe: {request.total_budget_try or 'belirtilmedi'} TRY
- Konaklama: {request.accommodation_type or 'belirtilmedi'}
- Amaç: {request.trip_purpose or 'belirtilmedi'}
- Özel istekler: {request.special_requests or 'yok'}
- Mutlaka görülecekler: {', '.join(request.must_see_places or []) or 'yok'}

ÖNEMLİ: Tüm metin Türkçe olacak. Başka dil karakteri (Japonca, Vietnamca, Çince vb.) KESİNLİKLE kullanma.
Yukarıdaki bilgilere göre tam seyahat planı JSON'u üret.
"""


async def generate_plan(request: PlanGenerateRequest, persona: Optional[PersonaResponse] = None) -> GeneratedPlan:
    weather = await _fetch_weather(request.destination, request.start_date)
    prompt = _build_plan_prompt(request, persona, weather)

    if settings.AI_MODE == "paid":
        return await _generate_plan_claude(prompt)
    else:
        try:
            return await _generate_plan_groq(prompt)
        except Exception:
            return await _generate_plan_gemini(prompt)


async def _generate_plan_gemini(prompt: str) -> GeneratedPlan:
    import google.generativeai as genai
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(
        PLAN_SYSTEM_PROMPT + "\n\n" + prompt,
        generation_config={"temperature": 0.7, "max_output_tokens": 8192},
    )
    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    data = json.loads(text)
    return GeneratedPlan(**data)


async def _generate_plan_groq(prompt: str) -> GeneratedPlan:
    from groq import Groq
    client = Groq(api_key=settings.GROQ_API_KEY)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": PLAN_SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=8192,
    )
    text = response.choices[0].message.content.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    data = json.loads(text)
    return GeneratedPlan(**data)


async def _generate_plan_claude(prompt: str) -> GeneratedPlan:
    import anthropic
    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=8192,
        system=PLAN_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )
    text = response.content[0].text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    data = json.loads(text)
    return GeneratedPlan(**data)


async def concierge_chat(message: str, history: list[ChatMessage], plan_context: Optional[str] = None) -> str:
    system = CHAT_SYSTEM_PROMPT
    if plan_context:
        system += f"\n\nKullanıcının mevcut planı:\n{plan_context}"

    messages = [{"role": m.role, "content": m.content} for m in history]
    messages.append({"role": "user", "content": message})

    if settings.AI_MODE == "paid":
        return await _chat_claude(system, messages)
    else:
        try:
            return await _chat_groq(system, messages)
        except Exception:
            return "Şu an AI asistana ulaşamıyorum. Lütfen daha sonra tekrar deneyin."


async def _chat_groq(system: str, messages: list) -> str:
    from groq import Groq
    client = Groq(api_key=settings.GROQ_API_KEY)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "system", "content": system}] + messages,
        temperature=0.8,
        max_tokens=1024,
    )
    return response.choices[0].message.content


async def _chat_claude(system: str, messages: list) -> str:
    import anthropic
    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=system,
        messages=messages,
    )
    return response.content[0].text
