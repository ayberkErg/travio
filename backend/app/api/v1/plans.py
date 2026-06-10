from fastapi import APIRouter, HTTPException, Header
from typing import List, Optional
from datetime import datetime
from app.schemas.travel import PlanGenerateRequest, PlanResponse, PersonaResponse, UserResponse
from app.services import ai_service
from app.core.config import settings
from app.core.auth import get_current_user
from supabase import create_client
import uuid

router = APIRouter(prefix="/plans", tags=["plans"])


def get_supabase():
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


def try_get_user(authorization: Optional[str]) -> Optional[UserResponse]:
    """Token varsa kullanıcıyı döner, yoksa None."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        from app.core.auth import get_supabase as _sb
        sb = _sb()
        token = authorization.split(" ")[1]
        res = sb.auth.get_user(token)
        if not res.user:
            return None
        db = sb.table("users").select("*").eq("id", res.user.id).single().execute()
        row = db.data or {}
        return UserResponse(
            id=res.user.id,
            email=res.user.email or "",
            full_name=row.get("full_name"),
            subscription_tier=row.get("subscription_tier", "free"),
            plans_generated_this_month=row.get("plans_generated_this_month", 0),
        )
    except Exception:
        return None


@router.post("/generate", response_model=PlanResponse)
async def generate_plan(
    data: PlanGenerateRequest,
    authorization: Optional[str] = Header(None),
):
    user = try_get_user(authorization)
    sb = get_supabase() if (user and settings.SUPABASE_URL and "xxx" not in settings.SUPABASE_URL) else None

    # Giriş yapmış + ücretsiz kullanıcı limit kontrolü
    if user and user.subscription_tier == "free" and user.plans_generated_this_month >= settings.PLAN_LIMIT_FREE:
        raise HTTPException(status_code=403, detail="plan_limit")

    # Persona al (giriş yapılmışsa)
    persona = None
    if user and sb:
        try:
            p = sb.table("user_personas").select("*").eq("user_id", user.id).single().execute()
            if p.data:
                persona = PersonaResponse(**p.data)
        except Exception:
            pass

    plan_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    # DB'ye kaydet (giriş yapılmışsa)
    if user and sb:
        try:
            sb.table("travel_plans").insert({
                "id": plan_id,
                "user_id": user.id,
                "origin_city": data.origin_city,
                "destination": data.destination,
                "start_date": data.start_date,
                "end_date": data.end_date,
                "travelers_count": data.travelers_count,
                "status": "generating",
                "created_at": now,
            }).execute()
        except Exception:
            pass

    try:
        generated = await ai_service.generate_plan(data, persona)
    except Exception as e:
        if user and sb:
            try:
                sb.table("travel_plans").update({"status": "error"}).eq("id", plan_id).execute()
            except Exception:
                pass
        raise HTTPException(status_code=500, detail=f"Plan üretilemedi: {str(e)}")

    # DB güncelle (giriş yapılmışsa)
    if user and sb:
        try:
            sb.table("travel_plans").update({
                "status": "completed",
                "plan_data": generated.model_dump(),
                "duration_days": generated.duration_days,
            }).eq("id", plan_id).execute()
            sb.table("users").update({
                "plans_generated_this_month": user.plans_generated_this_month + 1
            }).eq("id", user.id).execute()
        except Exception:
            pass

    return PlanResponse(
        id=plan_id,
        user_id=user.id if user else "guest",
        origin_city=data.origin_city,
        destination=data.destination,
        start_date=data.start_date,
        end_date=data.end_date,
        duration_days=generated.duration_days,
        travelers_count=data.travelers_count,
        status="completed",
        plan=generated,
        is_favorite=False,
        created_at=now,
    )


@router.get("", response_model=List[PlanResponse])
async def list_plans(authorization: Optional[str] = Header(None)):
    current_user = await get_current_user(authorization)
    sb = get_supabase()
    res = sb.table("travel_plans").select("*").eq("user_id", current_user.id).order("created_at", desc=True).execute()
    plans = []
    for row in (res.data or []):
        row = dict(row)
        plan_data = row.pop("plan_data", None)
        plans.append(PlanResponse(**row, plan=plan_data))
    return plans


@router.get("/{plan_id}", response_model=PlanResponse)
async def get_plan(plan_id: str, authorization: Optional[str] = Header(None)):
    user = try_get_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Bu planı görmek için giriş yapmalısın")
    sb = get_supabase()
    res = sb.table("travel_plans").select("*").eq("id", plan_id).eq("user_id", user.id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Plan bulunamadı")
    row = res.data
    plan_data = row.pop("plan_data", None)
    return PlanResponse(**row, plan=plan_data)


@router.delete("/{plan_id}")
async def delete_plan(plan_id: str, authorization: Optional[str] = Header(None)):
    current_user = await get_current_user(authorization)
    sb = get_supabase()
    sb.table("travel_plans").delete().eq("id", plan_id).eq("user_id", current_user.id).execute()
    return {"ok": True}


@router.put("/{plan_id}/favorite", response_model=PlanResponse)
async def toggle_favorite(plan_id: str, authorization: Optional[str] = Header(None)):
    current_user = await get_current_user(authorization)
    sb = get_supabase()
    res = sb.table("travel_plans").select("is_favorite").eq("id", plan_id).eq("user_id", current_user.id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Plan bulunamadı")
    new_val = not res.data["is_favorite"]
    sb.table("travel_plans").update({"is_favorite": new_val}).eq("id", plan_id).execute()
    fresh = sb.table("travel_plans").select("*").eq("id", plan_id).single().execute()
    row = dict(fresh.data)
    plan_data = row.pop("plan_data", None)
    return PlanResponse(**row, plan=plan_data)
