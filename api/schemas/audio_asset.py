from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
import uuid

class AudioAssetBase(BaseModel):
    filename: str
    title: Optional[str] = None
    artist: Optional[str] = None
    bpm: Optional[float] = None
    duration: Optional[float] = None
    key_signature: Optional[str] = None
    file_size: Optional[int] = None
    format: Optional[str] = None

class AudioAssetCreate(AudioAssetBase):
    pass

class AudioAssetUpdate(BaseModel):
    title: Optional[str] = None
    artist: Optional[str] = None
    bpm: Optional[float] = None
    key_signature: Optional[str] = None

class AudioAssetResponse(AudioAssetBase):
    id: uuid.UUID
    path: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)  # Updated for Pydantic V2
