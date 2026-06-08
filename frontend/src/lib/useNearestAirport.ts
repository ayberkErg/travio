import { useEffect, useState } from 'react'
import { AIRPORTS } from './airports'

// Büyük şehirler için koordinat → havalimanı eşlemesi (hızlı lookup)
const CITY_AIRPORTS: { lat: number; lon: number; iata: string; city: string }[] = [
  { lat: 41.275, lon: 28.751, iata: 'IST', city: 'İstanbul' },
  { lat: 40.128, lon: 32.995, iata: 'ESB', city: 'Ankara' },
  { lat: 38.292, lon: 27.157, iata: 'ADB', city: 'İzmir' },
  { lat: 36.900, lon: 30.800, iata: 'AYT', city: 'Antalya' },
  { lat: 37.002, lon: 35.280, iata: 'ADA', city: 'Adana' },
  { lat: 39.955, lon: 32.689, iata: 'ESB', city: 'Ankara' },
  { lat: 41.005, lon: 39.716, iata: 'TZX', city: 'Trabzon' },
  { lat: 37.868, lon: 40.201, iata: 'DIY', city: 'Diyarbakır' },
  { lat: 39.649, lon: 27.926, iata: 'BZI', city: 'Balıkesir' },
  { lat: 36.688, lon: 36.895, iata: 'HTY', city: 'Hatay' },
  // Dünyanın büyük havalimanları
  { lat: 51.477, lon: -0.461, iata: 'LHR', city: 'Londra' },
  { lat: 48.858, lon: 2.349, iata: 'CDG', city: 'Paris' },
  { lat: 52.378, lon: 4.900, iata: 'AMS', city: 'Amsterdam' },
  { lat: 50.033, lon: 8.570, iata: 'FRA', city: 'Frankfurt' },
  { lat: 41.294, lon: 2.083, iata: 'BCN', city: 'Barselona' },
  { lat: 40.472, lon: -3.561, iata: 'MAD', city: 'Madrid' },
  { lat: 41.800, lon: 12.239, iata: 'FCO', city: 'Roma' },
  { lat: 48.353, lon: 11.786, iata: 'MUC', city: 'Münih' },
  { lat: 40.641, lon: -73.778, iata: 'JFK', city: 'New York' },
  { lat: 33.942, lon: -118.408, iata: 'LAX', city: 'Los Angeles' },
  { lat: 35.549, lon: 139.779, iata: 'NRT', city: 'Tokyo' },
  { lat: 1.359, lon: 103.989, iata: 'SIN', city: 'Singapur' },
  { lat: 25.253, lon: 55.365, iata: 'DXB', city: 'Dubai' },
  { lat: 13.681, lon: 100.747, iata: 'BKK', city: 'Bangkok' },
  { lat: -8.748, lon: 115.167, iata: 'DPS', city: 'Bali' },
  { lat: 64.129, lon: -21.827, iata: 'KEF', city: 'Reykjavik' },
]

function deg2rad(deg: number) {
  return deg * (Math.PI / 180)
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function findNearest(lat: number, lon: number): { iata: string; city: string } {
  let best = CITY_AIRPORTS[0]
  let bestDist = Infinity
  for (const ap of CITY_AIRPORTS) {
    const d = haversine(lat, lon, ap.lat, ap.lon)
    if (d < bestDist) {
      bestDist = d
      best = ap
    }
  }
  return best
}

export interface NearestAirport {
  iata: string
  city: string
  label: string // "İstanbul (IST)"
}

export function useNearestAirport() {
  const [airport, setAirport] = useState<NearestAirport | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!navigator.geolocation) return

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        const nearest = findNearest(latitude, longitude)
        setAirport({ ...nearest, label: `${nearest.city} (${nearest.iata})` })
        setLoading(false)
      },
      () => {
        // İzin reddedildi veya hata — varsayılan İstanbul
        setAirport({ iata: 'IST', city: 'İstanbul', label: 'İstanbul (IST)' })
        setLoading(false)
      },
      { timeout: 5000, maximumAge: 300000 }
    )
  }, [])

  return { airport, loading }
}
