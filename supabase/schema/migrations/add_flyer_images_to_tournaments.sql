-- Agregar columna flyer_images a la tabla tournaments
-- Esta columna almacenará un array de URLs de imágenes para el carousel

ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS flyer_images TEXT[];

-- Agregar comentario para documentar el campo
COMMENT ON COLUMN tournaments.flyer_images IS 'Array de URLs de imágenes de flyers para mostrar en carousel estilo Instagram';
