import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.db import init_db
from app.routes.api import router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("earthpulse")

app = FastAPI(
    title="EarthPulse AI - Scientific Earth Observation & Trend Detection API",
    description=(
        "Production backend for EarthPulse AI. Synthesizes real NASA POWER and satellite datasets, "
        "executes rigorous statistical trend detection (OLS, Mann-Kendall, Sen's slope, Seasonal MK), "
        "retrieves grounded scientific knowledge, and outputs downloadable PDF/CSV reports."
    ),
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    logger.info("Initializing EarthPulse AI SQLite database...")
    init_db()
    logger.info("Database initialized successfully.")

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
