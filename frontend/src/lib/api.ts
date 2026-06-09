import type {
  User,
  UserPersona,
  TravelPlan,
  PlanGenerateRequest,
  ChatRequest,
  ChatMessage,
  FlightResult,
  HotelResult,
} from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    // Zustand store'dan al
    const raw = localStorage.getItem('travio-auth')
    if (raw) {
      const token = JSON.parse(raw)?.state?.token
      if (token) return token
    }
    // Supabase session'dan al (fallback)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.includes('supabase') && key?.includes('auth-token')) {
        const val = localStorage.getItem(key)
        if (val) return JSON.parse(val)?.access_token ?? null
      }
    }
    return null
  } catch {
    return null
  }
}

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    throw new Error('Oturum süresi doldu')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Bir hata oluştu' }))
    throw new Error(err.detail ?? 'Bir hata oluştu')
  }

  return res.json() as Promise<T>
}

// Auth
export const auth = {
  register: (data: { email: string; password: string; full_name: string }) =>
    req<{ user: User; token: string }>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    req<{ user: User; token: string }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => req<User>('/api/v1/auth/me'),
}

// Persona
export const persona = {
  get: () => req<UserPersona>('/api/v1/persona/me'),

  create: (data: Partial<UserPersona>) =>
    req<UserPersona>('/api/v1/persona', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (data: Partial<UserPersona>) =>
    req<UserPersona>('/api/v1/persona', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// Plans
export const plans = {
  generate: (data: PlanGenerateRequest) =>
    req<TravelPlan>('/api/v1/plans/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  list: () => req<TravelPlan[]>('/api/v1/plans'),

  get: (id: string) => req<TravelPlan>(`/api/v1/plans/${id}`),

  delete: (id: string) =>
    req<void>(`/api/v1/plans/${id}`, { method: 'DELETE' }),

  toggleFavorite: (id: string) =>
    req<TravelPlan>(`/api/v1/plans/${id}/favorite`, { method: 'PUT' }),
}

// Chat
export const chat = {
  send: (data: ChatRequest) =>
    req<{ message: ChatMessage }>('/api/v1/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// Search
export const search = {
  flights: (params: { from: string; to: string; date: string; return_date?: string; passengers: number }) => {
    const qs = new URLSearchParams({
      from: params.from,
      to: params.to,
      date: params.date,
      passengers: String(params.passengers),
      ...(params.return_date ? { return_date: params.return_date } : {}),
    })
    return req<FlightResult[]>(`/api/v1/search/flights?${qs}`)
  },

  hotels: (params: { city: string; check_in: string; check_out: string; guests: number }) =>
    req<HotelResult[]>(
      `/api/v1/search/hotels?city=${params.city}&check_in=${params.check_in}&check_out=${params.check_out}&guests=${params.guests}`
    ),
}

// Affiliate
export const affiliate = {
  click: (data: { plan_id: string; provider: string; offer_type: string; destination: string }) =>
    req<void>('/api/v1/affiliate/click', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// Alerts
import type { PriceAlert } from '@/types'
export const alertsApi = {
  list: () => req<PriceAlert[]>('/api/v1/alerts'),
  create: (data: { from_iata: string; to_iata: string; from_city: string; to_city: string; target_price: number }) =>
    req<PriceAlert>('/api/v1/alerts', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => req<void>(`/api/v1/alerts/${id}`, { method: 'DELETE' }),
}

const api = { auth, persona, plans, chat, search, affiliate, alerts: alertsApi }
export default api
