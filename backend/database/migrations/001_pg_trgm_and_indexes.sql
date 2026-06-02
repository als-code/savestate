-- Mejora simple de rendimiento (PostgreSQL):
-- - Búsqueda ILIKE '%q%' en games.title con pg_trgm
-- - Índices para ORDER BY habituales

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Catálogo
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_title_trgm ON games USING gin (title gin_trgm_ops);

-- Backlog
CREATE INDEX IF NOT EXISTS idx_user_games_user_updated_at ON user_games(user_id, updated_at DESC);

-- Reseñas
CREATE INDEX IF NOT EXISTS idx_game_reviews_game_created_at ON game_reviews(game_id, created_at DESC);

