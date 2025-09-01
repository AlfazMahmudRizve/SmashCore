from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.audio_asset import AudioAssetCreate, AudioAssetOut
from app.crud.audio_asset import create_audio_asset, get_audio_assets
from app.dependencies import get_db

router = APIRouter(prefix="/audio-assets", tags=["Audio Assets"])

@router.post("/", response_model=AudioAssetOut)
def create(asset: AudioAssetCreate, db: Session = Depends(get_db)):
    return create_audio_asset(db, asset)

@router.get("/", response_model=list[AudioAssetOut])
def list_assets(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return get_audio_assets(db, skip=skip, limit=limit)
