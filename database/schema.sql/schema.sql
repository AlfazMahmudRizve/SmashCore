-- UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Licenses table
CREATE TABLE licenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('CC0', 'CC-BY', 'CC-BY-SA', 'Paid', 'Original')),
    url TEXT,
    attribution TEXT,
    commercial_allowed BOOLEAN DEFAULT false,
    derivative_allowed BOOLEAN DEFAULT false,
    expiry_date DATE,
    proof_document_path TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Audio assets table
CREATE TABLE audio_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    path TEXT NOT NULL,
    filename TEXT NOT NULL,
    title TEXT,
    artist TEXT,
    album TEXT,
    key TEXT,
    bpm REAL,
    duration REAL,
    sample_rate INTEGER,
    channels INTEGER,
    format TEXT,
    license_id UUID REFERENCES licenses(id),
    tags TEXT[],
    metadata JSONB,
    checksum TEXT UNIQUE,
    file_size BIGINT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Video assets table
CREATE TABLE video_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    path TEXT NOT NULL,
    filename TEXT NOT NULL,
    title TEXT,
    width INTEGER,
    height INTEGER,
    fps REAL,
    duration REAL,
    format TEXT,
    license_id UUID REFERENCES licenses(id),
    tags TEXT[],
    metadata JSONB,
    checksum TEXT UNIQUE,
    file_size BIGINT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'analyzing', 'mixing', 'rendering', 'uploading', 'completed', 'failed')),
    config JSONB,
    audio_assets UUID[],
    video_assets UUID[],
    audio_mix_path TEXT,
    video_path TEXT,
    youtube_url TEXT,
    metadata JSONB,
    analytics JSONB,
    error_log TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    completed_at TIMESTAMP
);

-- Audio analysis results
CREATE TABLE audio_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES audio_assets(id) ON DELETE CASCADE,
    key_detected TEXT,
    bpm_detected REAL,
    beats REAL[],
    downbeats REAL[],
    segments JSONB,
    lufs REAL,
    true_peak REAL,
    dynamic_range REAL,
    spectral_features JSONB,
    created_at TIMESTAMP DEFAULT now()
);

-- Compatibility scores between tracks
CREATE TABLE compatibility_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_a_id UUID REFERENCES audio_assets(id),
    asset_b_id UUID REFERENCES audio_assets(id),
    harmonic_score REAL,
    tempo_score REAL,
    energy_score REAL,
    overall_score REAL,
    suggested_key_shift INTEGER,
    suggested_tempo_change REAL,
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE(asset_a_id, asset_b_id)
);

-- YouTube uploads tracking
CREATE TABLE youtube_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id),
    video_id TEXT UNIQUE,
    title TEXT,
    description TEXT,
    tags TEXT[],
    thumbnail_url TEXT,
    upload_status TEXT,
    privacy_status TEXT,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    uploaded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now()
);

-- Indexes for fast search
CREATE INDEX idx_audio_assets_key ON audio_assets(key);
CREATE INDEX idx_audio_assets_bpm ON audio_assets(bpm);
CREATE INDEX idx_audio_assets_tags ON audio_assets USING GIN(tags);
CREATE INDEX idx_video_assets_tags ON video_assets USING GIN(tags);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- Insert some default licenses
INSERT INTO licenses (name, type, attribution, commercial_allowed, derivative_allowed) VALUES
('Creative Commons Zero', 'CC0', 'No attribution required', true, true),
('Creative Commons BY', 'CC-BY', 'Attribution required', true, true),
('Creative Commons BY-SA', 'CC-BY-SA', 'Attribution required, share-alike', true, true),
('Original Content', 'Original', 'Original creation', true, true);
