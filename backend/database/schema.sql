-- =============================================================================
-- SaveState Retro Backlog — PostgreSQL (Supabase)
-- =============================================================================
-- Decisiones de diseño:
--   - Registro cerrado: usuarios creados por admin o INSERT manual (sin registro público).
--   - Solo juegos retro; plataformas en tabla fija (slug: gb, gba, snes...).
--   - Un género por juego; géneros con semilla + CRUD admin.
--   - Backlog: ENUM de estados; notas opcionales; sin started_at/completed_at en v1.
--   - Favoritos aparte del backlog.
--   - Reseñas: rating 1-10, una por usuario/juego, editable (updated_at).
--   - Tags many-to-many en juegos.
--   - Auth y permisos en Express + JWT (sin RLS en Supabase).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tipos ENUM
-- -----------------------------------------------------------------------------

-- Extensiones útiles (búsqueda por similitud / contains)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- Password hashing helpers (bcrypt via pgcrypto's crypt/gen_salt)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('usuario', 'admin');

CREATE TYPE backlog_status AS ENUM (
  'pending',
  'playing',
  'tested',
  'completed',
  'abandoned'
);

-- -----------------------------------------------------------------------------
-- Función: actualizar updated_at automáticamente
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Plataformas retro (lista fija; admin no crea plataformas en v1)
-- -----------------------------------------------------------------------------

CREATE TABLE platforms (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(80) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

-- -----------------------------------------------------------------------------
-- Géneros (semilla + CRUD admin)
-- -----------------------------------------------------------------------------

CREATE TABLE genres (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER genres_updated_at
  BEFORE UPDATE ON genres
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------------
-- Etiquetas (tags); relación N:M con juegos en game_tags (tras crear games)
-- -----------------------------------------------------------------------------

CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Usuarios
-- -----------------------------------------------------------------------------

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(80) NOT NULL,
  role user_role NOT NULL DEFAULT 'usuario',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- -----------------------------------------------------------------------------
-- Juegos (catálogo; creación solo vía API admin)
-- -----------------------------------------------------------------------------

CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  platform_id INT NOT NULL REFERENCES platforms(id) ON DELETE RESTRICT,
  genre_id INT REFERENCES genres(id) ON DELETE SET NULL,
  release_year INT CHECK (release_year IS NULL OR (release_year >= 1970 AND release_year <= 2100)),
  cover VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_games_platform ON games(platform_id);
CREATE INDEX idx_games_genre ON games(genre_id);
CREATE INDEX idx_games_title ON games(title);
CREATE INDEX idx_games_release_year ON games(release_year);
CREATE INDEX idx_games_created_at ON games(created_at DESC);

-- Acelera búsquedas tipo ILIKE '%q%' sobre title
CREATE INDEX idx_games_title_trgm ON games USING gin (title gin_trgm_ops);

-- -----------------------------------------------------------------------------
-- Tags ↔ juegos (tras crear games)
-- -----------------------------------------------------------------------------

CREATE TABLE game_tags (
  game_id INT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  tag_id INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (game_id, tag_id)
);

CREATE INDEX idx_game_tags_tag ON game_tags(tag_id);

-- -----------------------------------------------------------------------------
-- Backlog personal (user_games)
-- -----------------------------------------------------------------------------

CREATE TABLE user_games (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id INT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  owned BOOLEAN NOT NULL DEFAULT FALSE,
  status backlog_status NOT NULL DEFAULT 'pending',
  hours_played INT NOT NULL DEFAULT 0 CHECK (hours_played >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, game_id)
);

CREATE TRIGGER user_games_updated_at
  BEFORE UPDATE ON user_games
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_user_games_user ON user_games(user_id);
CREATE INDEX idx_user_games_status ON user_games(user_id, status);
CREATE INDEX idx_user_games_user_updated_at ON user_games(user_id, updated_at DESC);

-- -----------------------------------------------------------------------------
-- Favoritos (independiente del backlog)
-- -----------------------------------------------------------------------------

CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id INT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, game_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);

-- -----------------------------------------------------------------------------
-- Reseñas (1 por usuario y juego; rating 1-10; editable)
-- -----------------------------------------------------------------------------

CREATE TABLE game_reviews (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id INT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 10),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, game_id)
);

CREATE TRIGGER game_reviews_updated_at
  BEFORE UPDATE ON game_reviews
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_game_reviews_game ON game_reviews(game_id);
CREATE INDEX idx_game_reviews_rating ON game_reviews(game_id, rating);
CREATE INDEX idx_game_reviews_game_created_at ON game_reviews(game_id, created_at DESC);
