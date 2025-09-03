from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from api.routers.audio_asset import router as audio_asset_router
from api.database import engine
from api.models.audio_asset import Base

app = FastAPI(title="Music Mashup Agent API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve the frontend UI
app.mount("/frontend", StaticFiles(directory="frontend", html=True), name="frontend")

# API routes
app.include_router(audio_asset_router)

@app.get("/")
def root():
    return {"message": "Music Mashup Agent API Running"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.on_event("startup")
async def startup_event():
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
    except Exception as e:
        print(f"⚠️ Database connection failed: {e}")
