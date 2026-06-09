from fastapi import HTTPException, Header
from typing import Optional
from app.core.config import settings
from app.schemas.travel import UserResponse


def get_supabase():
    from supabase import create_client
    # service key varsa onu, yoksa anon key kullan
    key = settings.SUPABASE_SERVICE_KEY or settings.SUPABASE_ANON_KEY
    return create_client(settings.SUPABASE_URL, key)


def _supabase_configured() -> bool:
    return bool(settings.SUPABASE_URL and "xxx" not in settings.SUPABASE_URL)


async def get_current_user(authorization: Optional[str] = Header(None)) -> UserResponse:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token gerekli")

    token = authorization.split(" ")[1]

    # Mock token (test modu)
    if token.startswith("mock-token-"):
        from app.api.v1.auth import DEMO_USERS
        user_id = token.replace("mock-token-", "")
        for u in DEMO_USERS.values():
            if u["id"] == user_id:
                return UserResponse(
                    id=u["id"], email=u["email"], full_name=u["full_name"],
                    subscription_tier=u["subscription_tier"],
                    plans_generated_this_month=u["plans_generated_this_month"],
                )
        raise HTTPException(status_code=401, detail="Geçersiz token")

    # Supabase token
    if not _supabase_configured():
        raise HTTPException(status_code=401, detail="Supabase yapılandırılmamış — SUPABASE_URL ekleyin")

    try:
        sb = get_supabase()
        auth_res = sb.auth.get_user(token)
        if not auth_res or not auth_res.user:
            raise HTTPException(status_code=401, detail="Geçersiz token")

        user_id = auth_res.user.id
        user_email = auth_res.user.email or ""

        # DB'den kullanıcı bilgilerini al
        try:
            db_res = sb.table("users").select("*").eq("id", user_id).execute()
            row = db_res.data[0] if db_res.data else None
        except Exception:
            row = None

        if not row:
            # DB kaydı yoksa Supabase auth bilgilerini kullan
            meta = auth_res.user.user_metadata or {}
            return UserResponse(
                id=user_id,
                email=user_email,
                full_name=meta.get("full_name") or meta.get("name") or "",
                subscription_tier="free",
                plans_generated_this_month=0,
            )

        return UserResponse(
            id=row["id"],
            email=row.get("email") or user_email,
            full_name=row.get("full_name"),
            subscription_tier=row.get("subscription_tier", "free"),
            plans_generated_this_month=row.get("plans_generated_this_month", 0),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Auth hatası: {str(e)}")
