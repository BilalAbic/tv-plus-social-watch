from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.api.room_routes import router as room_router
from app.api.vote_routes import router as vote_router
from app.api.expense_routes import router as expense_router
from app.api.chat_routes import router as chat_router
from app.api import router as db_router
from app.core.config import settings
from app.websockets.room_manager import RoomManager


app = FastAPI(title=settings.app_name, debug=settings.debug)
manager = RoomManager()

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(room_router)
app.include_router(vote_router)
app.include_router(expense_router)
app.include_router(chat_router)
app.include_router(db_router)


@app.get("/")
def root():
    return FileResponse('static/index.html')


@app.get("/health")
def health():
    return {"status": "ok"}


@app.websocket("/ws/{room_id}/{user_id}")
async def ws_endpoint(websocket: WebSocket, room_id: str, user_id: str):
    await websocket.accept()
    await manager.join(room_id, user_id, websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)
                await manager.handle_message(room_id, user_id, message_data)
            except json.JSONDecodeError:
                # Invalid JSON, ignore
                pass
    except WebSocketDisconnect:
        await manager.leave(room_id, user_id)


