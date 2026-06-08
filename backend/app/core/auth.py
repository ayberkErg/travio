from fastapi import HTTPException, Header
from typing import Optional
from app.core.config import settings
from app.schemas.travel import UserResponse


def get_supabase():
    from supabase import create_client
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


def _is_mock_mode() -> bool:
    return (
        not settings.SUPABASE_URL or
        "xxx" in settings.SUPABASE_URL or
        not settings.SUPABASE_SERVICE_KEY or
        settings.SUPABASE_SERVICE_KEY == "eyJ..."
    )


async def get_current_user(authorization: Optional[str] = Header(None)) -> UserResponse:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token gerekli")

    token = authorization.split(" ")[1]

    # Mock mod
    if _is_mock_mode() or token.startswith("mock-token-"):
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

    try:
        sb = get_supabase()
        auth_res = sb.auth.get_user(token)
        if not auth_res.user:
            raise HTTPException(status_code=401, detail="Geçersiz token")

        user_id = auth_res.user.id
        db_res = sb.table("users").select("*").eq("id", user_id).execute()
        row = db_res.data[0] if db_res.data else None

        if not row:
            return UserResponse(id=user_id, email=auth_res.user.email or "")

        return UserResponse(
            id=row["id"], email=row["email"],
            full_name=row.get("full_name"),
            subscription_tier=row.get("subscription_tier", "free"),
            plans_generated_this_month=row.get("plans_generated_this_month", 0),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Auth hatası: {str(e)}")
