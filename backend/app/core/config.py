from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_ENV: str = "development"
    SECRET_KEY: str = "degistir"

    DATABASE_URL: str = "postgresql+asyncpg://user:pass@host:5432/travio"
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""

    REDIS_URL: str = "redis://localhost:6379"

    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]

    AI_MODE: str = "free"
    PLAN_LIMIT_FREE: int = 3

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
