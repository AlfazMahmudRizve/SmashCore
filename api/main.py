from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers.audio_asset import router as audio_asset_router

app = FastAPI(title="Music Mashup Agent API", version="1.0.0")

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(audio_asset_router)

@app.get("/")
def root():
    return {"message": "Music Mashup Agent API Running"}

@app.get("/health")
def health():
    return {"status": "ok"}

# Create tables on startup (with error handling)
@app.on_event("startup")
async def startup_event():
    try:
        from api.database import engine
        from api.models.audio_asset import Base
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
    except Exception as e:
        print(f"⚠️ Database connection failed: {e}")
        print("API will start but database features won't work until connection is fixed")

