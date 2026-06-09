from fastapi import APIRouter, HTTPException, Header
from typing import Optional, List
from datetime import datetime
import httpx
import random
from pydantic import BaseModel
from app.core.config import settings
from app.core.auth import get_current_user, get_supabase

router = APIRouter(prefix="/alerts", tags=["alerts"])


# ── Schemas ────────────────────────────────────────────────────

class AlertCreate(BaseModel):
    from_iata: str
    to_iata: str
    from_city: str
    to_city: str
    target_price: int
    user_email: Optional[str] = None  # for notifications


class AlertResponse(BaseModel):
    id: str
    from_iata: str
    to_iata: str
    from_city: str
    to_city: str
    target_price: int
    current_price: Optional[int] = None
    is_triggered: bool = False
    created_at: str
    last_checked_at: Optional[str] = None


# ── Price fetching ─────────────────────────────────────────────

async def _get_amadeus_token() -> Optional[str]:
    if not settings.AMADEUS_API_KEY or not settings.AMADEUS_API_SECRET:
        return None
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            r = await client.post(
                "https://test.api.amadeus.com/v1/security/oauth2/token",
                data={
                    "grant_type": "client_credentials",
                    "client_id": settings.AMADEUS_API_KEY,
                    "client_secret": settings.AMADEUS_API_SECRET,
                },
            )
            return r.json().get("access_token")
    except Exception:
        return None


async def fetch_flight_price(from_iata: str, to_iata: str) -> Optional[int]:
    """Amadeus varsa gerçek fiyat, yoksa simüle edilmiş fiyat."""
    token = await _get_amadeus_token()
    if token:
        try:
            date = (datetime.utcnow()).strftime("%Y-%m-%d")
            async with httpx.AsyncClient(timeout=10) as client:
                r = await client.get(
                    "https://test.api.amadeus.com/v2/shopping/flight-offers",
                    headers={"Authorization": f"Bearer {token}"},
                    params={
                        "originLocationCode": from_iata,
                        "destinationLocationCode": to_iata,
                        "departureDate": date,
                        "adults": 1,
                        "max": 1,
                        "currencyCode": "TRY",
                    },
                )
                data = r.json()
                if data.get("data"):
                    price = float(data["data"][0]["price"]["total"])
                    return int(price)
        except Exception:
            pass

    # Amadeus yoksa: rota bazlı simülasyon
    base_prices = {
        ("IST", "TYO"): 18000, ("IST", "CDG"): 6500, ("IST", "DXB"): 4000,
        ("IST", "LHR"): 7000, ("IST", "JFK"): 14000, ("IST", "BKK"): 11000,
        ("IST", "SIN"): 13000, ("IST", "FCO"): 5500, ("IST", "BCN"): 6000,
    }
    key = (from_iata.upper(), to_iata.upper())
    rev_key = (to_iata.upper(), from_iata.upper())
    base = base_prices.get(key) or base_prices.get(rev_key) or 8000
    # ±15% volatilite
    fluctuation = random.uniform(0.85, 1.15)
    return int(base * fluctuation)


# ── Email ──────────────────────────────────────────────────────

async def send_price_alert_email(to_email: str, alert: dict, current_price: int):
    if not settings.RESEND_API_KEY:
        return
    try:
        import resend
        resend.api_key = settings.RESEND_API_KEY
        savings = alert["target_price"] - current_price
        resend.Emails.send({
            "from": f"Travio Alarmlar <{settings.ALERT_FROM_EMAIL}>",
            "to": [to_email],
            "subject": f"🎯 Fiyat Düştü: {alert['from_city']} → {alert['to_city']}",
            "html": f"""
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
              <h2 style="color:#d4820a">🔔 Fiyat Alarmın Tetiklendi!</h2>
              <p style="color:#666">Takip ettiğin uçuş hedef fiyatına ulaştı.</p>
              <div style="background:#f8f5f0;border-radius:12px;padding:20px;margin:16px 0">
                <p style="margin:0;font-size:18px;font-weight:bold;color:#12100e">
                  {alert['from_city']} → {alert['to_city']}
                </p>
                <p style="margin:8px 0 0;color:#888;font-size:14px">
                  {alert['from_iata']} → {alert['to_iata']}
                </p>
                <div style="margin-top:16px;display:flex;gap:16px">
                  <div>
                    <p style="margin:0;font-size:12px;color:#888">Şu Anki Fiyat</p>
                    <p style="margin:4px 0 0;font-size:24px;font-weight:bold;color:#0a8f94">
                      ₺{current_price:,}
                    </p>
                  </div>
                  <div>
                    <p style="margin:0;font-size:12px;color:#888">Hedef Fiyat</p>
                    <p style="margin:4px 0 0;font-size:24px;font-weight:bold;color:#12100e">
                      ₺{alert['target_price']:,}
                    </p>
                  </div>
                  <div>
                    <p style="margin:0;font-size:12px;color:#888">Tasarruf</p>
                    <p style="margin:4px 0 0;font-size:24px;font-weight:bold;color:#0a9958">
                      ₺{savings:,}
                    </p>
                  </div>
                </div>
              </div>
              <a href="https://www.skyscanner.com.tr/transport/flights/{alert['from_iata'].lower()}/{alert['to_iata'].lower()}/?adultsv2=1"
                 style="display:inline-block;background:#d4820a;color:white;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold;margin-top:8px">
                Bilet Al →
              </a>
              <p style="color:#aaa;font-size:12px;margin-top:24px">
                Bu alarmı <a href="{settings.FRONTEND_URL}/alerts" style="color:#d4820a">Travio</a> üzerinden yönetebilirsin.
              </p>
            </div>
            """,
        })
    except Exception:
        pass


# ── Endpoints ──────────────────────────────────────────────────

@router.post("", response_model=AlertResponse)
async def create_alert(
    data: AlertCreate,
    authorization: Optional[str] = Header(None),
):
    user = await get_current_user(authorization)
    sb = get_supabase()

    current_price = await fetch_flight_price(data.from_iata, data.to_iata)
    now = datetime.utcnow().isoformat()

    row = {
        "user_id": user.id,
        "from_iata": data.from_iata.upper(),
        "to_iata": data.to_iata.upper(),
        "from_city": data.from_city,
        "to_city": data.to_city,
        "target_price": data.target_price,
        "current_price": current_price,
        "is_triggered": False,
        "created_at": now,
        "last_checked_at": now,
        "user_email": user.email,
    }

    try:
        res = sb.table("price_alerts").insert(row).execute()
        saved = res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Alarm kaydedilemedi: {str(e)}")

    return AlertResponse(**{k: saved[k] for k in AlertResponse.model_fields if k in saved})


@router.get("", response_model=List[AlertResponse])
async def list_alerts(authorization: Optional[str] = Header(None)):
    user = await get_current_user(authorization)
    sb = get_supabase()

    try:
        res = sb.table("price_alerts").select("*").eq("user_id", user.id).order("created_at", desc=True).execute()
        return [AlertResponse(**{k: r[k] for k in AlertResponse.model_fields if k in r}) for r in res.data]
    except Exception:
        return []


@router.delete("/{alert_id}")
async def delete_alert(alert_id: str, authorization: Optional[str] = Header(None)):
    user = await get_current_user(authorization)
    sb = get_supabase()

    try:
        sb.table("price_alerts").delete().eq("id", alert_id).eq("user_id", user.id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"ok": True}


@router.post("/check-prices")
async def check_all_prices(x_cron_secret: Optional[str] = Header(None)):
    """Railway cron job bu endpoint'i her 6 saatte çağırır."""
    if x_cron_secret != settings.CRON_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")

    sb = get_supabase()
    try:
        res = sb.table("price_alerts").select("*").eq("is_triggered", False).execute()
        alerts = res.data
    except Exception:
        return {"checked": 0}

    triggered = 0
    for alert in alerts:
        current_price = await fetch_flight_price(alert["from_iata"], alert["to_iata"])
        if current_price is None:
            continue

        now = datetime.utcnow().isoformat()
        is_triggered = current_price <= alert["target_price"]

        update_data = {"current_price": current_price, "last_checked_at": now}
        if is_triggered:
            update_data["is_triggered"] = True
            triggered += 1
            if alert.get("user_email"):
                await send_price_alert_email(alert["user_email"], alert, current_price)

        try:
            sb.table("price_alerts").update(update_data).eq("id", alert["id"]).execute()
        except Exception:
            pass

    return {"checked": len(alerts), "triggered": triggered}
