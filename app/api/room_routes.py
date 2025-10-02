from fastapi import APIRouter
from pydantic import BaseModel
from app.services.room_service import list_rooms as svc_list_rooms, create_room as svc_create_room


router = APIRouter(prefix="/rooms", tags=["rooms"])


class CreateRoomBody(BaseModel):
    id: str
    title: str
    start_time_utc: str
    host_user_id: str


@router.get("")
async def get_rooms():
    return {"rooms": await svc_list_rooms()}


@router.post("")
async def post_room(body: CreateRoomBody):
    room = await svc_create_room(body.id, body.title, body.start_time_utc, body.host_user_id)
    return room


