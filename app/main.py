from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from auth.models import User
from database import engine, Base

from auth.router import router as auth_router, chat_router as ai_router

Base.metadata.create_all(bind=engine)
app = FastAPI()

import sys
print("=== STARTING APPLICATION ===", flush=True)
print(f"Python version: {sys.version}", flush=True)

try:
    from config import settings
    print(f"DATABASE_URL loaded: {settings.database_url[:20]}...", flush=True)
except Exception as e:
    print(f"ERROR loading config: {e}", flush=True)
    raise

# CORS middleware - must be added FIRST (before routers)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://192.168.29.46:5173",
        "http://192.168.29.46:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(ai_router)

@app.get("/")
def system_check():
    return JSONResponse(content={"status": "ok"})
