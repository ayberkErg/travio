from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.core.config import settings

router = APIRouter(prefix="/search", tags=["search"])

MOCK_FLIGHTS = [
    {"airline": "Turkish Airlines", "airline_code": "TK", "departure": "08:00", "arrival": "10:30", "duration": "2s 30dk", "stops": "Direkt", "price": 4890, "currency": "TRY", "url": "https://www.skyscanner.com.tr"},
    {"airline": "Pegasus", "airline_code": "PC", "departure": "12:00", "arrival": "14:45", "duration": "2s 45dk", "stops": "Direkt", "price": 3290, "currency": "TRY", "url": "https://www.skyscanner.com.tr"},
    {"airline": "SunExpress", "airline_code": "XQ", "departure": "18:30", "arrival": "21:15", "duration": "2s 45dk", "stops": "1 aktarma", "price": 2850, "currency": "TRY", "url": "https://www.skyscanner.com.tr"},
]

MOCK_HOTELS = [
    {"name": "Grand Boutique Hotel", "stars": 4, "price_per_night": 1200, "currency": "TRY", "rating": 8.9, "url": "https://www.booking.com/?aid=travio-tr"},
    {"name": "City Center Suites", "stars": 3, "price_per_night": 750, "currency": "TRY", "rating": 8.2, "url": "https://www.booking.com/?aid=travio-tr"},
    {"name": "Luxury Palace Hotel", "stars": 5, "price_per_night": 3200, "currency": "TRY", "rating": 9.4, "url": "https://www.booking.com/?aid=travio-tr"},
]

# Yaygın şehir → IATA kodu haritası (API olmadan hızlı lookup)
CITY_TO_IATA = {
    "istanbul": "IST", "İstanbul": "IST", "ankara": "ESB", "izmir": "ADB",
    "antalya": "AYT", "bodrum": "BJV", "dalaman": "DLM",
    "london": "LON", "londra": "LON", "paris": "PAR", "barcelona": "BCN",
    "madrid": "MAD", "rome": "ROM", "roma": "ROM", "amsterdam": "AMS",
    "berlin": "BER", "vienna": "VIE", "viyana": "VIE", "prague": "PRG",
    "prag": "PRG", "budapest": "BUD", "dubrovnik": "DBV",
    "dubai": "DXB", "abu dhabi": "AUH", "doha": "DOH",
    "tokyo": "TYO", "osaka": "KIX", "bangkok": "BKK", "bali": "DPS",
    "singapore": "SIN", "singapur": "SIN", "hong kong": "HKG",
    "new york": "NYC", "los angeles": "LAX", "miami": "MIA",
    "cancun": "CUN", "meksika": "MEX",
    "cairo": "CAI", "kahire": "CAI", "marrakech": "RAK", "fas": "CMN",
    "athens": "ATH", "atina": "ATH", "thessaloniki": "SKG", "selanik": "SKG",
    "lisbon": "LIS", "lizbon": "LIS", "porto": "OPO",
    "zurich": "ZRH", "zürih": "ZRH", "geneva": "GVA", "cenevre": "GVA",
    "moscow": "MOW", "moskova": "MOW", "st. petersburg": "LED",
    "kyoto": "KIX", "seoul": "SEL", "seul": "SEL", "beijing": "BJS", "pekin": "BJS",
    "sydney": "SYD", "melbourne": "MEL",
    "nairobi": "NBO", "cape town": "CPT", "johannesburg": "JNB",
}


def _city_to_iata(city: str) -> str:
    return CITY_TO_IATA.get(city.strip(), CITY_TO_IATA.get(city.strip().lower(), city.upper()[:3]))


@router.get("/iata")
async def get_iata(city: str = Query(...)):
    """Şehir adından IATA kodu al (frontend autocomplete için)"""
    if not settings.AMADEUS_API_KEY:
        return {"iata": _city_to_iata(city), "source": "local"}
    try:
        from app.services.amadeus_service import get_iata_code
        code = await get_iata_code(city)
        if code:
            return {"iata": code, "source": "amadeus"}
    except Exception:
        pass
    return {"iata": _city_to_iata(city), "source": "local"}


@router.get("/flights")
async def search_flights(
    from_city: str = Query(..., alias="from"),
    to: str = Query(...),
    date: str = Query(...),
    return_date: Optional[str] = Query(None),
    passengers: int = Query(1),
):
    if not settings.AMADEUS_API_KEY:
        results = []
        for f in MOCK_FLIGHTS:
            results.append({**f, "origin": from_city, "destination": to, "date": date})
        return results

    try:
        from app.services.amadeus_service import search_flights as amadeus_search, get_iata_code

        # Şehir adı → IATA kodu
        origin_iata = CITY_TO_IATA.get(from_city.strip().lower()) or await get_iata_code(from_city) or _city_to_iata(from_city)
        dest_iata = CITY_TO_IATA.get(to.strip().lower()) or await get_iata_code(to) or _city_to_iata(to)

        results = await amadeus_search(
            origin=origin_iata,
            destination=dest_iata,
            departure_date=date,
            adults=passengers,
            return_date=return_date if return_date else None,
            currency="TRY",
            max_results=10,
        )
        return results
    except Exception as e:
        # Amadeus başarısız → mock döndür
        results = []
        for f in MOCK_FLIGHTS:
            results.append({**f, "origin": from_city, "destination": to, "date": date})
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
