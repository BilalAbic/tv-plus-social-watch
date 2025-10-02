from fastapi import APIRouter
from pydantic import BaseModel
from app.services.voting_service import list_candidates, record_vote, tally_votes


router = APIRouter(prefix="/votes", tags=["votes"])


class VoteBody(BaseModel):
    room_id: str
    content_id: str
    user_id: str


@router.get("/{room_id}/candidates")
async def get_candidates(room_id: str):
    return {"candidates": await list_candidates(room_id)}


@router.get("/{room_id}/tally")
async def get_tally(room_id: str):
    return {"tally": await tally_votes(room_id)}


@router.post("")
async def post_vote(body: VoteBody):
    return await record_vote(body.room_id, body.content_id, body.user_id)


