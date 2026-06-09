from fastapi import APIRouter
from app.api.v1 import auth, persona, plans, chat, search, alerts

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(persona.router)
router.include_router(plans.router)
router.include_router(chat.router)
router.include_router(search.router)
router.include_router(alerts.router)
