from fastapi import APIRouter, Query
from typing import List
from app.schemas.travel import ActivityCategory

router = APIRouter(prefix="/search", tags=["search"])

# Mock data — Oturum sonrası gerçek API entegrasyonu yapılabilir
MOCK_FLIGHTS = [
    {"airline": "Turkish Airlines", "departure": "08:00", "arrival": "10:30", "duration": "2s 30dk", "price": 1890, "currency": "TRY", "url": "https://www.skyscanner.com.tr/?associateid=travio-tr"},
    {"airline": "Pegasus", "departure": "12:00", "arrival": "14:15", "duration": "2s 15dk", "price": 1290, "currency": "TRY", "url": "https://www.skyscanner.com.tr/?associateid=travio-tr"},
    {"airline": "SunExpress", "departure": "18:30", "arrival": "20:45", "duration": "2s 15dk", "price": 1450, "currency": "TRY", "url": "https://www.skyscanner.com.tr/?associateid=travio-tr"},
]

MOCK_HOTELS = [
    {"name": "Grand Boutique Hotel", "stars": 4, "price_per_night": 1200, "currency": "TRY", "rating": 8.9, "url": "https://www.booking.com/?aid=travio-tr"},
    {"name": "City Center Suites", "stars": 3, "price_per_night": 750, "currency": "TRY", "rating": 8.2, "url": "https://www.booking.com/?aid=travio-tr"},
    {"name": "Luxury Palace Hotel", "stars": 5, "price_per_night": 3200, "currency": "TRY", "rating": 9.4, "url": "https://www.booking.com/?aid=travio-tr"},
]


@router.get("/flights")
async def search_flights(
    from_city: str = Query(..., alias="from"),
    to: str = Query(...),
    date: str = Query(...),
    passengers: int = Query(1),
):
    results = []
    for f in MOCK_FLIGHTS:
        results.append({**f, "from": from_city, "to": to, "date": date, "passengers": passengers})
    return results


@router.get("/hotels")
async def search_hotels(
    city: str = Query(...),
    check_in: str = Query(...),
    check_out: str = Query(...),
    guests: int = Query(1),
):
    results = []
    for h in MOCK_HOTELS:
        results.append({**h, "city": city, "check_in": check_in, "check_out": check_out, "guests": guests})
    return results
