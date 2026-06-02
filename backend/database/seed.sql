-- =============================================================================
-- Datos semilla — SaveState Retro Backlog
-- Ejecutar DESPUÉS de schema.sql (automático con Docker init, o manual en pgAdmin)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Plataformas retro (lista fija)
-- -----------------------------------------------------------------------------

INSERT INTO platforms (slug, name, sort_order) VALUES
  ('gb',       'Game Boy',              10),
  ('gbc',      'Game Boy Color',        20),
  ('gba',      'Game Boy Advance',      30),
  ('nes',      'NES',                   40),
  ('snes',     'Super Nintendo',        50),
  ('n64',      'Nintendo 64',           60),
  ('ngc',      'Nintendo GameCube',     65),
  ('wii',      'Wii',                   66),
  ('wiiu',     'Wii U',                 67),
  ('switch',   'Nintendo Switch',       68),
  ('nds',      'Nintendo DS',           69),
  ('3ds',      'Nintendo 3DS',          69),
  ('megadrive','Mega Drive / Genesis',  70),
  ('mastersystem', 'Master System',     80),
  ('gamegear', 'Game Gear',             90),
  ('dreamcast','Dreamcast',            100),
  ('saturn',   'Sega Saturn',          110),
  ('psx',      'PlayStation',          120),
  ('ps2',      'PlayStation 2',        121),
  ('ps3',      'PlayStation 3',        122),
  ('psp',      'PSP',                  123),
  ('psvita',   'PS Vita',              124),
  ('xbox',     'Xbox',                 125),
  ('x360',     'Xbox 360',             126),
  ('xone',     'Xbox One',             127),
  ('xsx',      'Xbox Series X|S',       128),
  ('pc',       'PC',                   129),
  ('pce',      'PC Engine',            130),
  ('neogeo',   'Neo Geo',              140),
  ('arcade',   'Arcade',               150)
ON CONFLICT (slug) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Géneros iniciales (admin puede añadir/editar después)
-- -----------------------------------------------------------------------------

INSERT INTO genres (name) VALUES
  ('Acción'),
  ('Aventura'),
  ('RPG'),
  ('Plataformas'),
  ('Puzzle'),
  ('Estrategia'),
  ('Beat ''em up'),
  ('Shoot ''em up'),
  ('Carreras'),
  ('Deportes'),
  ('Lucha'),
  ('Simulación')
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Tags sugeridos (opcionales para filtrar en catálogo)
-- -----------------------------------------------------------------------------

INSERT INTO tags (name) VALUES
  ('multijugador'),
  ('co-op'),
  ('metroidvania'),
  ('roguelike'),
  ('jrpg'),
  ('indie-retro'),
  ('corto'),
  ('largo'),
  ('difícil'),
  ('speedrun')
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Usuario admin (registro cerrado — crear solo tu cuenta)
-- -----------------------------------------------------------------------------
-- 1. Genera el hash en Node:
--    node -e "const b=require('bcryptjs'); b.hash('TU_PASSWORD',10).then(console.log)"
-- 2. Sustituye el hash y ejecuta:

-- INSERT INTO users (email, password_hash, display_name, role)
-- VALUES (
--   'tu@email.com',
--   '$2a$10$REEMPLAZA_CON_HASH_BCRYPT',
--   'Tu nombre',
--   'admin'
-- );
