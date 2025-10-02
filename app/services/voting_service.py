from typing import Dict, List
from collections import Counter
from .db import get_cursor


async def list_candidates(room_id: str) -> List[Dict[str, str]]:
    async with get_cursor() as cur:
        await cur.execute(
            "SELECT c.content_id, cat.title, cat.type, cat.duration_min, cat.tags "
            "FROM candidates c "
            "JOIN catalog cat ON c.content_id = cat.content_id "
            "WHERE c.room_id = %s",
            (room_id,)
        )
        rows = await cur.fetchall()
        return [
            {
                "content_id": row["content_id"],
                "title": row["title"],
                "type": row["type"],
                "duration_min": str(row["duration_min"]),
                "tags": row["tags"]
            }
            for row in rows
        ]


async def record_vote(room_id: str, content_id: str, user_id: str) -> Dict[str, str]:
    async with get_cursor() as cur:
        # Delete existing vote for this user in this room
        await cur.execute(
            "DELETE FROM votes WHERE room_id = %s AND user_id = %s",
            (room_id, user_id)
        )
        # Insert new vote
        await cur.execute(
            "INSERT INTO votes (room_id, content_id, user_id) VALUES (%s, %s, %s)",
            (room_id, content_id, user_id)
        )
        await cur.connection.commit()
    
    return {"room_id": room_id, "content_id": content_id, "user_id": user_id}


async def tally_votes(room_id: str) -> List[Dict[str, str]]:
    async with get_cursor() as cur:
        await cur.execute(
            "SELECT content_id, COUNT(*) as vote_count "
            "FROM votes WHERE room_id = %s "
            "GROUP BY content_id "
            "ORDER BY vote_count DESC",
            (room_id,)
        )
        rows = await cur.fetchall()
        return [
            {"content_id": row["content_id"], "votes": str(row["vote_count"])}
            for row in rows
        ]



