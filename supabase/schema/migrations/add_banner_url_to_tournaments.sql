-- Agregar columna banner_url a la tabla tournaments
-- Esta columna almacenará la URL del banner personalizado de cada torneo

ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Agregar comentario para documentar el campo
COMMENT ON COLUMN tournaments.banner_url IS 'URL del banner personalizado del torneo (imagen de header)';
