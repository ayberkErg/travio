from pydantic import BaseModel, field_validator
from typing import Optional, List
from enum import Enum


class SubscriptionTier(str, Enum):
    free = "free"
    plus = "plus"
    family = "family"


class TravelStyle(str, Enum):
    backpacker = "backpacker"
    budget = "budget"
    mid_range = "mid_range"
    comfort = "comfort"
    luxury = "luxury"


class CompanionType(str, Enum):
    solo = "solo"
    couple = "couple"
    friends = "friends"
    family_kids = "family_kids"
    family_adult = "family_adult"


class TravelTempo(str, Enum):
    slow = "slow"
    moderate = "moderate"
    intensive = "intensive"


class TravelerLevel(str, Enum):
    beginner = "beginner"
    explorer = "explorer"
    adventurer = "adventurer"
    globetrotter = "globetrotter"
    legend = "legend"


class SafetyLevel(str, Enum):
    safe = "safe"
    moderate = "moderate"
    caution = "caution"


class ActivityCategory(str, Enum):
    culture = "culture"
    food = "food"
    nature = "nature"
    nightlife = "nightlife"
    shopping = "shopping"
    transport = "transport"
    hotel = "hotel"
    activity = "activity"


# Persona
class PersonaCreate(BaseModel):
    travel_style: TravelStyle = TravelStyle.mid_range
    companion_type: CompanionType = CompanionType.solo
    travel_tempo: TravelTempo = TravelTempo.moderate
    interest_history_culture: int = 5
    interest_nightlife: int = 3
    interest_nature_outdoor: int = 5
    interest_gastronomy: int = 7
    interest_art_museums: int = 5
    interest_shopping: int = 4
    interest_wellness_spa: int = 3
    interest_sports_adventure: int = 4
    interest_photography: int = 5
    interest_local_experiences: int = 7
    food_preferences: List[str] = []
    accommodation_preference: str = "hotel_3star"
    typical_daily_budget_usd: int = 100


class PersonaResponse(PersonaCreate):
    id: str
    user_id: str
    ai_summary: Optional[str] = None
    travio_score: int = 0
    traveler_level: TravelerLevel = TravelerLevel.beginner

    model_config = {"from_attributes": True}


_CATEGORY_MAP = {
    "attraction": "culture", "museum": "culture", "historic": "culture",
    "history": "culture", "monument": "culture", "temple": "culture",
    "market": "shopping", "bazaar": "shopping", "store": "shopping",
    "beach": "nature", "park": "nature", "garden": "nature", "outdoor": "nature",
    "hike": "nature", "hiking": "nature", "lake": "nature", "mountain": "nature",
    "bar": "nightlife", "club": "nightlife", "pub": "nightlife", "concert": "nightlife",
    "restaurant": "food", "cafe": "food", "coffee": "food", "breakfast": "food",
    "lunch": "food", "dinner": "food", "street_food": "food",
    "neighborhood": "activity", "walk": "activity", "tour": "activity",
    "spa": "activity", "wellness": "activity", "sport": "activity",
}


# Plan
class ActivityItem(BaseModel):
    time: str
    name: str
    description: str
    category: ActivityCategory
    location: Optional[str] = None
    estimated_cost_try: Optional[float] = None
    booking_url: Optional[str] = None
    tips: Optional[str] = None
    google_rating: Optional[float] = None
    google_review_count: Optional[int] = None
    google_maps_url: Optional[str] = None

    @field_validator("category", mode="before")
    @classmethod
    def normalize_category(cls, v: str) -> str:
        valid = {"culture", "food", "nature", "nightlife", "shopping", "transport", "hotel", "activity"}
        if isinstance(v, str):
            normalized = v.lower().replace("-", "_").replace(" ", "_")
            if normalized in valid:
                return normalized
            if normalized in _CATEGORY_MAP:
                return _CATEGORY_MAP[normalized]
            return "activity"
        return v


class DayPlan(BaseModel):
    day_number: int
    title: str
    theme: str
    weather_note: Optional[str] = None
    activities: List[ActivityItem]


class AffiliateOffer(BaseModel):
    provider: str
    title: str
    description: str
    price_hint: Optional[str] = None
    url: str
    affiliate_tag: str = "travio-tr"
    offer_type: str


class PlanBudget(BaseModel):
    flights: Optional[float] = None
    accommodation: Optional[float] = None
    food: Optional[float] = None
    activities: Optional[float] = None
    transport_local: Optional[float] = None
    total_estimated: float
    currency: str = "TRY"


class GeneratedPlan(BaseModel):
    destination: str
    country: str
    flag_emoji: str
    summary: str
    duration_days: int
    visa_info: str
    currency: str
    language: str
    safety_level: SafetyLevel
    safety_tips: List[str]
    days: List[DayPlan]
    budget: PlanBudget
    ai_tips: List[str]
    local_insights: List[str]
    pre_trip_checklist: List[str]
    affiliate_offers: List[AffiliateOffer] = []


class PlanGenerateRequest(BaseModel):
    origin_city: str
    destination: str
    start_date: str
    end_date: str
    travelers_count: int = 1
    total_budget_try: Optional[float] = None
    currency: str = "TRY"
    accommodation_type: Optional[str] = None
    trip_purpose: Optional[str] = None
    special_requests: Optional[str] = None
    must_see_places: Optional[List[str]] = None
    tempo_override: Optional[TravelTempo] = None


class PlanResponse(BaseModel):
    id: str
    user_id: str
    origin_city: str
    destination: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    duration_days: Optional[int] = None
    travelers_count: int
    status: str
    plan: Optional[GeneratedPlan] = None
    is_favorite: bool = False
    created_at: str

    model_config = {"from_attributes": True}


# Chat
class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: str


class ChatRequest(BaseModel):
    message: str
    plan_id: Optional[str] = None
    history: List[ChatMessage] = []


class ChatResponse(BaseModel):
    message: ChatMessage


# Auth
class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    subscription_tier: SubscriptionTier = SubscriptionTier.free
    plans_generated_this_month: int = 0


class AuthResponse(BaseModel):
    user: UserResponse
    token: str
