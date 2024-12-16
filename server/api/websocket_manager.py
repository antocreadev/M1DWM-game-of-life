from fastapi import WebSocket


class WebsocketManager:
    def __init__(self):
        self.connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.connections.append(websocket)

    async def disconnect(self, websocket: WebSocket):
        self.connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.connections:
            try:
                await connection.send_text(message)
            except Exception:
                await self.disconnect(connection)