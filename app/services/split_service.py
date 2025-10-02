from typing import List, Dict
from collections import defaultdict
from .db import get_cursor


async def list_expenses(room_id: str) -> List[Dict[str, str]]:
    async with get_cursor() as cur:
        await cur.execute(
            "SELECT expense_id, room_id, user_id, amount, note, weight FROM expenses WHERE room_id = %s ORDER BY expense_id",
            (room_id,)
        )
        rows = await cur.fetchall()
        return [
            {
                "expense_id": row["expense_id"],
                "room_id": row["room_id"],
                "user_id": row["user_id"],
                "amount": str(row["amount"]),
                "note": row["note"],
                "weight": str(row["weight"])
            }
            for row in rows
        ]


async def add_expense(expense_id: str, room_id: str, user_id: str, amount: float, description: str, weight: float) -> Dict[str, str]:
    async with get_cursor() as cur:
        await cur.execute(
            "INSERT INTO expenses (expense_id, room_id, user_id, amount, note, weight) VALUES (%s, %s, %s, %s, %s, %s)",
            (expense_id, room_id, user_id, amount, description, weight)
        )
        await cur.connection.commit()
    
    return {
        "expense_id": expense_id,
        "room_id": room_id,
        "user_id": user_id,
        "amount": str(amount),
        "note": description,
        "weight": str(weight)
    }


async def calc_balances(room_id: str) -> List[Dict[str, str]]:
    async with get_cursor() as cur:
        await cur.execute(
            "SELECT user_id, amount, weight FROM expenses WHERE room_id = %s",
            (room_id,)
        )
        rows = await cur.fetchall()
    
    if not rows:
        return []
    
    total_weight_by_user = defaultdict(float)
    total_amount = 0.0
    for row in rows:
        user_id = row["user_id"]
        amount = float(row["amount"])
        weight = float(row["weight"])
        total_weight_by_user[user_id] += weight
        total_amount += amount
    
    total_weight = sum(total_weight_by_user.values()) or 1.0
    share_per_weight = total_amount / total_weight

    paid_by_user = defaultdict(float)
    for row in rows:
        paid_by_user[row["user_id"]] += float(row["amount"])

    balances = []
    for user_id, w in total_weight_by_user.items():
        owed = share_per_weight * w
        paid = paid_by_user.get(user_id, 0.0)
        balances.append({
            "user_id": user_id, 
            "paid": f"{paid:.2f}", 
            "owed": f"{owed:.2f}", 
            "net": f"{paid - owed:.2f}"
        })
    return balances



