from fastapi import FastAPI
from app.routers import audio_asset, license, project

app = FastAPI(title="Music Mashup Agent API", version="1.0.0")

app.include_router(audio_asset.router)
app.include_router(license.router)
app.include_router(project.router)

@app.get("/")
def root():
    return {"message": "Music Mashup Agent API Running"}
