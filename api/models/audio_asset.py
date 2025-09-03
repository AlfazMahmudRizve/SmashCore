from sqlalchemy import Column, String, Float, Integer, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
import uuid
from datetime import datetime

Base = declarative_base()

class AudioAsset(Base):
    __tablename__ = "audio_assets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    path = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    title = Column(String)
    artist = Column(String)
    bpm = Column(Float)
    duration = Column(Float)
    key_signature = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    file_size = Column(Integer)
    format = Column(String)  # mp3, wav, etc.
