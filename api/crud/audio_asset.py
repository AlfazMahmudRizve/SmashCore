from sqlalchemy.orm import Session
from api.models.audio_asset import AudioAsset
from api.schemas.audio_asset import AudioAssetCreate, AudioAssetUpdate
from typing import List, Optional
from uuid import UUID


def create_audio_asset(db: Session, asset: AudioAssetCreate) -> AudioAsset:
    db_asset = AudioAsset(
        path=asset.filename,  # You might want to change path logic later
        filename=asset.filename,
        title=asset.title,
        artist=asset.artist,
        bpm=asset.bpm,
        duration=asset.duration,
        key_signature=asset.key_signature,
        file_size=asset.file_size,
        format=asset.format
    )
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset


def get_audio_asset(db: Session, asset_id: UUID) -> Optional[AudioAsset]:
    return db.query(AudioAsset).filter(AudioAsset.id == asset_id).first()


def get_audio_assets(db: Session, skip: int = 0, limit: int = 100) -> List[AudioAsset]:
    return db.query(AudioAsset).offset(skip).limit(limit).all()


def update_audio_asset(db: Session, asset_id: UUID, updates: AudioAssetUpdate) -> Optional[AudioAsset]:
    db_asset = db.query(AudioAsset).filter(AudioAsset.id == asset_id).first()
    if not db_asset:
        return None
    for key, value in updates.model_dump(exclude_unset=True).items():
        setattr(db_asset, key, value)
    db.commit()
    db.refresh(db_asset)
    return db_asset


def delete_audio_asset(db: Session, asset_id: UUID) -> bool:
    db_asset = db.query(AudioAsset).filter(AudioAsset.id == asset_id).first()
    if not db_asset:
        return False
    db.delete(db_asset)
    db.commit()
    return True
