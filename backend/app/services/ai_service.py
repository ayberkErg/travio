import os
import json
from datetime import datetime
from typing import Optional
from app.core.config import settings
from app.schemas.travel import GeneratedPlan, PersonaResponse, PlanGenerateRequest, ChatMessage

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
3. Her aktivite için gerçekçi maliyet tahmin et (TRY)
4. "Locals only" — turistik değil yerel mekanlar

ÇIKTI ŞEMASI:
{
  "destination": "string",
  "country": "string",
  "flag_emoji": "string",
  "summary": "string",
  "duration_days": number,
  "visa_info": "string",
  "currency": "string",
  "language": "string",
  "safety_level": "safe|moderate|caution",
  "safety_tips": ["string"],
  "days": [{
    "day_number": number,
    "title": "string",
    "theme": "string",
    "weather_note": "string",
    "activities": [{
      "time": "09:00",
      "name": "string",
      "description": "string",
      "category": "culture|food|nature|nightlife|shopping|transport|hotel|activity",
      "location": "string",
      "estimated_cost_try": number,
      "booking_url": "string",
      "tips": "string"
    }]
  }],
  "budget": {
    "flights": number,
    "accommodation": number,
    "food": number,
    "activities": number,
    "transport_local": number,
    "total_estimated": number,
    "currency": "TRY"
  },
  "ai_tips": ["string"],
  "local_insights": ["string"],
  "pre_trip_checklist": ["string"],
  "affiliate_offers": [{
    "provider": "skyscanner|booking|getyourguide|rentalcars|biletix",
    "title": "string",
    "description": "string",
    "price_hint": "string",
    "url": "string",
    "affiliate_tag": "travio-tr",
    "offer_type": "flight|hotel|car|activity|event"
  }]
}
"""

CHAT_SYSTEM_PROMPT = """
Sen Travio concierge'isin. Kullanıcının planını biliyorsun.
Kısa, pratik, kişisel cevaplar ver.
Kullanıcının dilinde konuş (otomatik algıla).
Gerektiğinde affiliate link öner — tavsiye tonu kullan.
"""


def _build_plan_prompt(request: PlanGenerateRequest, persona: Optional[PersonaResponse]) -> str:
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

    return f"""
{persona_info}
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

Yukarıdaki bilgilere göre tam seyahat planı JSON'u üret.
"""


async def generate_plan(request: PlanGenerateRequest, persona: Optional[PersonaResponse] = None) -> GeneratedPlan:
    prompt = _build_plan_prompt(request, persona)

    if settings.AI_MODE == "paid":
        return await _generate_plan_claude(prompt)
    else:
        try:
            return await _generate_plan_gemini(prompt)
        except Exception:
            return await _generate_plan_groq(prompt)


async def _generate_plan_gemini(prompt: str) -> GeneratedPlan:
    import google.generativeai as genai
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
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
