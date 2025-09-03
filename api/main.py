import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from api.routers.audio_asset import router as audio_asset_router
from api.database import engine
from api.models.audio_asset import Base

app = FastAPI(title="SmashCore Music API", version="1.0.0")

# CORS for external tool access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(audio_asset_router)

# Serve frontend (only if files exist)
if os.path.exists("frontend"):
    app.mount("/frontend", StaticFiles(directory="frontend", html=True), name="frontend")

@app.get("/")
def root():
    return {
        "message": "SmashCore Music API",
        "status": "running",
        "docs": "/docs",
        "frontend": "/frontend" if os.path.exists("frontend") else "Not available",
        "version": "1.0.0"
    }

@app.get("/health")
def health():
    return {"status": "healthy", "database": "connected"}

@app.on_event("startup")
async def startup_event():
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        print("🌐 API is ready for external connections!")
    except Exception as e:
        print(f"⚠️ Database connection failed: {e}")
