from fastapi import APIRouter
from pydantic import BaseModel
from app.services.split_service import list_expenses, add_expense, calc_balances


router = APIRouter(prefix="/expenses", tags=["expenses"])


class ExpenseBody(BaseModel):
    expense_id: str
    room_id: str
    user_id: str
    amount: float
    description: str
    weight: float = 1.0


@router.get("/{room_id}")
async def get_expenses(room_id: str):
    return {"expenses": await list_expenses(room_id)}


@router.get("/{room_id}/balances")
async def get_balances(room_id: str):
    return {"balances": await calc_balances(room_id)}


@router.post("")
async def post_expense(body: ExpenseBody):
    return await add_expense(
        body.expense_id,
        body.room_id,
        body.user_id,
        body.amount,
        body.description,
        body.weight,
    )


