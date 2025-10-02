from typing import List, Dict
from .db import get_cursor


async def list_rooms() -> List[Dict[str, str]]:
    async with get_cursor() as cur:
        await cur.execute("SELECT room_id, title, start_at, host_id FROM rooms ORDER BY start_at DESC")
        rows = await cur.fetchall()
        return [
            {
                "id": row["room_id"],
                "title": row["title"], 
                "start_time_utc": str(row["start_at"]),
                "host_user_id": row["host_id"]
            }
            for row in rows
        ]


async def create_room(room_id: str, title: str, start_time_utc: str, host_user_id: str) -> Dict[str, str]:
    async with get_cursor() as cur:
        await cur.execute(
            "INSERT INTO rooms (room_id, title, start_at, host_id) VALUES (%s, %s, %s, %s)",
            (room_id, title, start_time_utc, host_user_id)
        )
        await cur.connection.commit()
    
    return {
        "id": room_id,
        "title": title,
        "start_time_utc": start_time_utc,
        "host_user_id": host_user_id,
    }



