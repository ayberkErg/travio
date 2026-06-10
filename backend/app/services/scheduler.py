from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()


async def _run_price_check():
    from app.core.config import settings
    from app.api.v1.alerts import fetch_flight_price, send_price_alert_email

    logger.info(f"[Scheduler] Fiyat kontrolü başladı — {datetime.utcnow().isoformat()}")

    try:
        from app.core.auth import get_supabase
        sb = get_supabase()
        res = sb.table("price_alerts").select("*").eq("is_triggered", False).execute()
        alerts = res.data or []
    except Exception as e:
        logger.error(f"[Scheduler] Alarm listesi alınamadı: {e}")
        return

    triggered = 0
    for alert in alerts:
        try:
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
                logger.info(f"[Scheduler] Alarm tetiklendi: {alert['from_iata']}→{alert['to_iata']} ₺{current_price}")

            sb.table("price_alerts").update(update_data).eq("id", alert["id"]).execute()
        except Exception as e:
            logger.error(f"[Scheduler] Alert {alert.get('id')} hatası: {e}")

    logger.info(f"[Scheduler] Bitti — {len(alerts)} kontrol, {triggered} tetiklendi")


def start_scheduler():
    scheduler.add_job(
        _run_price_check,
        trigger=IntervalTrigger(hours=6),
        id="price_check",
        replace_existing=True,
        misfire_grace_time=300,
    )
    scheduler.start()
    logger.info("[Scheduler] APScheduler başlatıldı — her 6 saatte fiyat kontrolü")


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
