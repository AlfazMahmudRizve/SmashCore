from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from api.schemas.audio_asset import AudioAssetCreate, AudioAssetResponse, AudioAssetUpdate
from api.crud.audio_asset import create_audio_asset, get_audio_assets, get_audio_asset, update_audio_asset, delete_audio_asset
from api.database import get_db

router = APIRouter(prefix="/audio-assets", tags=["Audio Assets"])

@router.post("/", response_model=AudioAssetResponse)
def create_asset(asset: AudioAssetCreate, db: Session = Depends(get_db)):
    return create_audio_asset(db, asset)

@router.get("/", response_model=List[AudioAssetResponse])
def list_assets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_audio_assets(db, skip=skip, limit=limit)

@router.get("/{asset_id}", response_model=AudioAssetResponse)
def get_asset(asset_id: UUID, db: Session = Depends(get_db)):
    asset = get_audio_asset(db, asset_id)
    if asset is None:
        raise HTTPException(status_code=404, detail="Audio asset not found")
    return asset

@router.put("/{asset_id}", response_model=AudioAssetResponse)
def update_asset(asset_id: UUID, updates: AudioAssetUpdate, db: Session = Depends(get_db)):
    asset = update_audio_asset(db, asset_id, updates)
    if asset is None:
        raise HTTPException(status_code=404, detail="Audio asset not found")
    return asset

@router.delete("/{asset_id}")
def delete_asset(asset_id: UUID, db: Session = Depends(get_db)):
    success = delete_audio_asset(db, asset_id)
    if not success:
        raise HTTPException(status_code=404, detail="Audio asset not found")
    return {"detail": "Deleted successfully"}
