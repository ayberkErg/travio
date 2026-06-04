from fastapi import APIRouter, HTTPException, Depends
from app.schemas.travel import PersonaCreate, PersonaResponse, UserResponse
from app.core.config import settings
from app.core.auth import get_current_user
from supabase import create_client
import uuid

router = APIRouter(prefix="/persona", tags=["persona"])


def get_supabase():
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


@router.get("/me", response_model=PersonaResponse)
async def get_persona(current_user: UserResponse = Depends(get_current_user)):
    sb = get_supabase()
    res = sb.table("user_personas").select("*").eq("user_id", current_user.id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Persona bulunamadı")
    return PersonaResponse(**res.data)


@router.post("", response_model=PersonaResponse)
async def create_persona(data: PersonaCreate, current_user: UserResponse = Depends(get_current_user)):
    sb = get_supabase()
    row = {"id": str(uuid.uuid4()), "user_id": current_user.id, **data.model_dump()}
    res = sb.table("user_personas").upsert(row, on_conflict="user_id").execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Persona oluşturulamadı")
    return PersonaResponse(**res.data[0])


@router.put("", response_model=PersonaResponse)
async def update_persona(data: PersonaCreate, current_user: UserResponse = Depends(get_current_user)):
    sb = get_supabase()
    res = sb.table("user_personas").update(data.model_dump()).eq("user_id", current_user.id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Persona bulunamadı")
    return PersonaResponse(**res.data[0])
