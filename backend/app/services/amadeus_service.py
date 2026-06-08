import httpx
import time
from typing import Optional
from app.core.config import settings

AMADEUS_BASE = "https://test.api.amadeus.com"  # sandbox; prod: api.amadeus.com

_token: Optional[str] = None
_token_expires_at: float = 0.0


async def _get_token() -> str:
    global _token, _token_expires_at
    if _token and time.time() < _token_expires_at - 60:
        return _token
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{AMADEUS_BASE}/v1/security/oauth2/token",
            data={
                "grant_type": "client_credentials",
                "client_id": settings.AMADEUS_API_KEY,
                "client_secret": settings.AMADEUS_API_SECRET,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        _token = data["access_token"]
        _token_expires_at = time.time() + data.get("expires_in", 1799)
        return _token


async def get_iata_code(city_name: str) -> Optional[str]:
    """City/airport name → IATA code"""
    token = await _get_token()
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{AMADEUS_BASE}/v1/reference-data/locations",
            params={"keyword": city_name, "subType": "CITY,AIRPORT", "page[limit]": 1},
            headers={"Authorization": f"Bearer {token}"},
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        locations = data.get("data", [])
        if locations:
            return locations[0]["iataCode"]
    return None


def _parse_duration(iso: str) -> str:
    """PT2H30M → 2s 30dk"""
    iso = iso.replace("PT", "")
    hours = minutes = 0
    if "H" in iso:
        parts = iso.split("H")
        hours = int(parts[0])
        iso = parts[1]
    if "M" in iso:
        minutes = int(iso.replace("M", ""))
    if hours and minutes:
        return f"{hours}s {minutes}dk"
    elif hours:
        return f"{hours}s"
    return f"{minutes}dk"


def _airline_name(code: str, carriers: dict) -> str:
    return carriers.get(code, code)


async def search_flights(
    origin: str,
    destination: str,
    departure_date: str,
    adults: int = 1,
    return_date: Optional[str] = None,
    currency: str = "TRY",
    max_results: int = 10,
) -> list[dict]:
    token = await _get_token()
    params: dict = {
        "originLocationCode": origin,
        "destinationLocationCode": destination,
        "departureDate": departure_date,
        "adults": adults,
        "currencyCode": currency,
        "max": max_results,
        "nonStop": "false",
    }
    if return_date:
        params["returnDate"] = return_date

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{AMADEUS_BASE}/v2/shopping/flight-offers",
            params=params,
            headers={"Authorization": f"Bearer {token}"},
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()

    carriers = data.get("dictionaries", {}).get("carriers", {})
    results = []

    for offer in data.get("data", []):
        try:
            price = float(offer["price"]["grandTotal"])
            currency_code = offer["price"]["currency"]
            itineraries = offer.get("itineraries", [])
            if not itineraries:
                continue

            first_itin = itineraries[0]
            segments = first_itin.get("segments", [])
            if not segments:
                continue

            first_seg = segments[0]
            last_seg = segments[-1]

            airline_code = first_seg["carrierCode"]
            airline = _airline_name(airline_code, carriers)
            departure_time = first_seg["departure"]["at"][11:16]
            arrival_time = last_seg["arrival"]["at"][11:16]
            duration = _parse_duration(first_itin.get("duration", "PT0H"))
            stops = len(segments) - 1
            stop_label = "Direkt" if stops == 0 else f"{stops} aktarma"

            booking_url = (
                f"https://www.skyscanner.com.tr/transport/flights/"
                f"{origin.lower()}/{destination.lower()}/{departure_date.replace('-', '')}/"
                f"?adults={adults}&currency=TRY"
            )

            results.append({
                "airline": airline,
                "airline_code": airline_code,
                "departure": departure_time,
                "arrival": arrival_time,
                "duration": duration,
                "stops": stop_label,
                "price": price,
                "currency": currency_code,
                "url": booking_url,
                "origin": origin,
                "destination": destination,
                "date": departure_date,
            })
        except (KeyError, ValueError, IndexError):
            continue

    return results
