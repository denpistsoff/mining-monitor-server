from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from server.app.core.auth import get_current_user_ws
import json
import asyncio

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {}

    async def connect(self, websocket: WebSocket, farm_name: str):
        await websocket.accept()
        if farm_name not in self.active_connections:
            self.active_connections[farm_name] = []
        self.active_connections[farm_name].append(websocket)

    def disconnect(self, websocket: WebSocket, farm_name: str):
        if farm_name in self.active_connections:
            self.active_connections[farm_name].remove(websocket)
            if not self.active_connections[farm_name]:
                del self.active_connections[farm_name]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast_to_farm(self, message: str, farm_name: str):
        if farm_name in self.active_connections:
            disconnected = []
            for connection in self.active_connections[farm_name]:
                try:
                    await connection.send_text(message)
                except:
                    disconnected.append(connection)

            # Удаляем отключенные соединения
            for connection in disconnected:
                self.disconnect(connection, farm_name)


manager = ConnectionManager()


@router.websocket("/ws/farms/{farm_name}")
async def websocket_endpoint(
        websocket: WebSocket,
        farm_name: str,
        token: str
):
    # Аутентификация через WebSocket
    user = await get_current_user_ws(token)
    if not user:
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, farm_name)
    try:
        while True:
            # Поддерживаем соединение
            await asyncio.sleep(30)
            await websocket.send_json({"type": "ping", "message": "keepalive"})
    except WebSocketDisconnect:
        manager.disconnect(websocket, farm_name)


# Функция для отправки обновлений данных
async def send_farm_update(farm_name: str, data: dict):
    message = {
        "type": "farm_update",
        "farm": farm_name,
        "data": data,
        "timestamp": datetime.utcnow().isoformat()
    }
    await manager.broadcast_to_farm(json.dumps(message), farm_name)


# Функция для отправки оповещений
async def send_alert(farm_name: str, alert: dict):
    message = {
        "type": "alert",
        "farm": farm_name,
        "alert": alert,
        "timestamp": datetime.utcnow().isoformat()
    }
    await manager.broadcast_to_farm(json.dumps(message), farm_name)