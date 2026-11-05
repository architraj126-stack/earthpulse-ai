import os
import time
import logging
from collections import defaultdict
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.database.db import init_db
from app.routes.api import router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("earthpulse")

# 1. Lifespan event handler (replaces deprecated @app.on_event)
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing EarthPulse AI SQLite database...")
    init_db()
    logger.info("Database initialized successfully.")
    yield

app = FastAPI(
    title="EarthPulse AI - Scientific Earth Observation & Trend Detection API",
    description=(
        "Production backend for EarthPulse AI. Synthesizes real NASA POWER and satellite datasets, "
        "executes rigorous statistical trend detection (OLS, Mann-Kendall, Sen's slope, Seasonal MK), "
        "retrieves grounded scientific knowledge, and outputs downloadable PDF/CSV reports."
    ),
    version="1.0.0",
    lifespan=lifespan
)

# 2. Restrictive CORS configuration
env = os.getenv("ENVIRONMENT", "development")
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_env:
    allowed_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]
elif env == "development":
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:8000"
    ]
else:
    allowed_origins = ["https://earthpulse-ai.web.app", "https://earthpulse-ai.firebaseapp.com"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if env != "development" else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)

# 3. Sliding Window Rate Limiting Middleware
RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_PER_MINUTE", "120"))
client_request_history = defaultdict(list)

@app.middleware("http")
async def rate_limiting_middleware(request: Request, call_next):
    # Bypass rate limits for health checks and static docs
    path = request.url.path
    if path in ["/api/health", "/docs", "/openapi.json", "/"]:
        return await call_next(request)

    client_ip = request.client.host if request.client else "127.0.0.1"
    now = time.time()
    window_start = now - 60.0

    # Prune old timestamps
    timestamps = [t for t in client_request_history[client_ip] if t > window_start]
    if len(timestamps) >= RATE_LIMIT_REQUESTS:
        return JSONResponse(
            status_code=429,
            content={
                "detail": f"Rate limit exceeded: maximum {RATE_LIMIT_REQUESTS} requests per minute.",
                "retry_after_seconds": int(60.0 - (now - timestamps[0]))
            }
        )

    timestamps.append(now)
    client_request_history[client_ip] = timestamps

    response = await call_next(request)
    return response

app.include_router(router)

@app.get("/")
def root():
    return {
        "platform": "EarthPulse AI",
        "tagline": "Discover. Analyze. Understand Our Changing Earth.",
        "api_docs": "/docs",
        "health_check": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
