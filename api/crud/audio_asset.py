from app.models.audio_asset import AudioAsset
from app.schemas.audio_asset import AudioAssetCreate
from sqlalchemy.orm import Session

def create_audio_asset(db: Session, asset: AudioAssetCreate):
    db_asset = AudioAsset(**asset.dict())
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset

def get_audio_assets(db: Session, skip=0, limit=100):
    return db.query(AudioAsset).offset(skip).limit(limit).all()
