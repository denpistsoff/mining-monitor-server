from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.config import settings
from app.database.database import init_db, get_db
from app.api.endpoints import auth, farms, miners, alerts
from app.api.websocket import router as ws_router
import os
from datetime import datetime

app = FastAPI(
    title="Mining Monitor API",
    description="Full-stack mining farm monitoring system",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене заменить на конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(farms.router, prefix="/api", tags=["farms"])
app.include_router(miners.router, prefix="/api", tags=["miners"])
app.include_router(alerts.router, prefix="/api", tags=["alerts"])
app.include_router(ws_router, prefix="/ws", tags=["websocket"])

# Serve frontend static files
frontend_dir = "/app/static"
if os.path.exists(frontend_dir):
    app.mount("/static", StaticFiles(directory=frontend_dir), name="static")
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")

@app.get("/")
async def serve_frontend():
    return FileResponse(os.path.join(frontend_dir, "index.html"))

@app.on_event("startup")
async def startup():
    init_db()
    print("✅ Mining Monitor API started")

@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)