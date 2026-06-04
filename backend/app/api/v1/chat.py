from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from app.schemas.travel import ChatRequest, ChatResponse, ChatMessage, UserResponse
from app.services import ai_service
from app.core.config import settings
from app.core.auth import get_current_user
from supabase import create_client

router = APIRouter(prefix="/chat", tags=["chat"])


def get_supabase():
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


@router.post("", response_model=ChatResponse)
async def chat(data: ChatRequest, current_user: UserResponse = Depends(get_current_user)):
    plan_context = None
    if data.plan_id:
        sb = get_supabase()
        try:
            res = sb.table("travel_plans").select("plan_data, destination").eq("id", data.plan_id).eq("user_id", current_user.id).single().execute()
            if res.data and res.data.get("plan_data"):
                plan_context = f"Destinasyon: {res.data['destination']}\nPlan özeti mevcut."
        except Exception:
            pass

    reply = await ai_service.concierge_chat(data.message, data.history, plan_context)

    return ChatResponse(
        message=ChatMessage(
            role="assistant",
            content=reply,
            timestamp=datetime.utcnow().isoformat(),
        )
    )
