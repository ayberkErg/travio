// Auth
export type SubscriptionTier = 'free' | 'plus' | 'family'

export interface User {
  id: string
  email: string
  full_name?: string
  subscription_tier: SubscriptionTier
  plans_generated_this_month: number
}

// Persona
export type TravelStyle = 'backpacker' | 'budget' | 'mid_range' | 'comfort' | 'luxury'
export type CompanionType = 'solo' | 'couple' | 'friends' | 'family_kids' | 'family_adult'
export type TravelTempo = 'slow' | 'moderate' | 'intensive'
export type TravelerLevel = 'beginner' | 'explorer' | 'adventurer' | 'globetrotter' | 'legend'

export interface UserPersona {
  id: string
  user_id: string
  travel_style: TravelStyle
  companion_type: CompanionType
  travel_tempo: TravelTempo
  interest_history_culture: number
  interest_nightlife: number
  interest_nature_outdoor: number
  interest_gastronomy: number
  interest_art_museums: number
  interest_shopping: number
  interest_wellness_spa: number
  interest_sports_adventure: number
  interest_photography: number
  interest_local_experiences: number
  food_preferences: string[]
  accommodation_preference: string
  typical_daily_budget_usd: number
  ai_summary?: string
  travio_score: number
  traveler_level: TravelerLevel
}

// Plan
export type ActivityCategory =
  | 'culture'
  | 'food'
  | 'nature'
  | 'nightlife'
  | 'shopping'
  | 'transport'
  | 'hotel'
  | 'activity'

export interface ActivityItem {
  time: string
  name: string
  description: string
  category: ActivityCategory
  location?: string
  estimated_cost_try?: number
  booking_url?: string
  tips?: string
}

export interface DayPlan {
  day_number: number
  title: string
  theme: string
  weather_note?: string
  activities: ActivityItem[]
}

export interface AffiliateOffer {
  provider: 'skyscanner' | 'booking' | 'rentalcars' | 'getyourguide' | 'biletix'
  title: string
  description: string
  price_hint?: string
  url: string
  affiliate_tag: string
  offer_type: 'flight' | 'hotel' | 'car' | 'activity' | 'event'
}

export interface GeneratedPlan {
  destination: string
  country: string
  flag_emoji: string
  summary: string
  duration_days: number
  visa_info: string
  currency: string
  language: string
  safety_level: 'safe' | 'moderate' | 'caution'
  safety_tips: string[]
  days: DayPlan[]
  budget: {
    flights?: number
    accommodation?: number
    food?: number
    activities?: number
    transport_local?: number
    total_estimated: number
    currency: string
  }
  ai_tips: string[]
  local_insights: string[]
  pre_trip_checklist: string[]
  affiliate_offers: AffiliateOffer[]
}

export interface TravelPlan {
  id: string
  user_id: string
  origin_city: string
  destination: string
  start_date?: string
  end_date?: string
  duration_days?: number
  travelers_count: number
  status: 'generating' | 'completed' | 'error'
  plan?: GeneratedPlan
  is_favorite: boolean
  created_at: string
}

export interface PlanGenerateRequest {
  origin_city: string
  destination: string
  start_date: string
  end_date: string
  travelers_count: number
  total_budget_try?: number
  currency: string
  accommodation_type?: string
  trip_purpose?: string
  special_requests?: string
  must_see_places?: string[]
  tempo_override?: TravelTempo
}

// Chat
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ChatRequest {
  message: string
  plan_id?: string
  history: ChatMessage[]
}

// Search
export interface FlightResult {
  airline: string
  airline_code?: string
  departure: string
  arrival: string
  duration: string
  stops?: string
  price: number
  currency: string
  url: string
  origin?: string
  destination?: string
  date?: string
}

export interface HotelResult {
  name: string
  stars: number
  price_per_night: number
  currency: string
  rating: number
  url: string
  image?: string
}

// UI
export type PlusModalTrigger =
  | 'plan_limit'
  | 'price_drop'
  | 'pre_trip_night'
  | 'score_share'
  | 'memory_book'
  | 'group_plan'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

export interface PriceAlert {
  id: string
  from_iata: string
  to_iata: string
  from_city: string
  to_city: string
  target_price: number
  current_price?: number
  is_triggered: boolean
  created_at: string
  last_checked_at?: string
}
