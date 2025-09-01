from sqlalchemy import Column, String, Float, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
import uuid

Base = declarative_base()

class AudioAsset(Base):
    __tablename__ = "audio_assets"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    path = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    title = Column(String)
    bpm = Column(Float)
    duration = Column(Float)
    # Add other fields as needed
