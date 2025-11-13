-- Agregar columna logo_url a la tabla teams
-- Esta columna almacenará la URL del logo/foto del equipo

ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Agregar comentario para documentar el campo
COMMENT ON COLUMN teams.logo_url IS 'URL del logo o foto del equipo';
