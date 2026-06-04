import uuid
import hashlib
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.travel import RegisterRequest, LoginRequest, AuthResponse, UserResponse
from app.core.config import settings
from app.core.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

# Demo kullanıcıları (Supabase olmadan test için)
DEMO_USERS: dict = {
    "demo@travio.app": {
        "id": "demo-user-001",
        "email": "demo@travio.app",
        "full_name": "Demo Kullanıcı",
        "password_hash": hashlib.sha256("demo1234".encode()).hexdigest(),
        "subscription_tier": "free",
        "plans_generated_this_month": 0,
    }
}

def _is_mock_mode() -> bool:
    return (
        not settings.SUPABASE_URL or
        "xxx" in settings.SUPABASE_URL or
        not settings.SUPABASE_SERVICE_KEY or
        settings.SUPABASE_SERVICE_KEY == "eyJ..."
    )

def _make_mock_token(user_id: str) -> str:
    return f"mock-token-{user_id}"


@router.post("/register", response_model=AuthResponse)
async def register(data: RegisterRequest):
    if _is_mock_mode():
        user_id = str(uuid.uuid4())
        token = _make_mock_token(user_id)
        DEMO_USERS[data.email] = {
            "id": user_id,
            "email": data.email,
            "full_name": data.full_name,
            "password_hash": hashlib.sha256(data.password.encode()).hexdigest(),
            "subscription_tier": "free",
            "plans_generated_this_month": 0,
        }
        user = UserResponse(id=user_id, email=data.email, full_name=data.full_name)
        return AuthResponse(user=user, token=token)

    from supabase import create_client
    sb = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    try:
        res = sb.auth.sign_up({
            "email": data.email,
            "password": data.password,
            "options": {"data": {"full_name": data.full_name}},
        })
        if not res.user:
            raise HTTPException(status_code=400, detail="Kayıt başarısız")
        sb.table("users").upsert({
            "id": res.user.id,
            "email": data.email,
            "full_name": data.full_name,
        }).execute()
        user = UserResponse(id=res.user.id, email=data.email, full_name=data.full_name)
        token = res.session.access_token if res.session else ""
        return AuthResponse(user=user, token=token)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=AuthResponse)
async def login(data: LoginRequest):
    if _is_mock_mode():
        u = DEMO_USERS.get(data.email)
        if not u:
            raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı")
        if u["password_hash"] != hashlib.sha256(data.password.encode()).hexdigest():
            raise HTTPException(status_code=401, detail="Şifre yanlış")
        token = _make_mock_token(u["id"])
        user = UserResponse(
            id=u["id"], email=u["email"], full_name=u["full_name"],
            subscription_tier=u["subscription_tier"],
            plans_generated_this_month=u["plans_generated_this_month"],
        )
        return AuthResponse(user=user, token=token)

    from supabase import create_client
    sb = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    try:
        res = sb.auth.sign_in_with_password({"email": data.email, "password": data.password})
        if not res.user or not res.session:
            raise HTTPException(status_code=401, detail="Geçersiz email veya şifre")
        db_res = sb.table("users").select("*").eq("id", res.user.id).single().execute()
        row = db_res.data or {}
        user = UserResponse(
            id=res.user.id, email=res.user.email or data.email,
            full_name=row.get("full_name"),
            subscription_tier=row.get("subscription_tier", "free"),
            plans_generated_this_month=row.get("plans_generated_this_month", 0),
        )
        return AuthResponse(user=user, token=res.session.access_token)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/me", response_model=UserResponse)
async def me(authorization: str = None, current_user: UserResponse = Depends(get_current_user)):
    return current_user
