-- 1. Añadimos la columna uuid
ALTER TABLE examenes ADD COLUMN uuid TEXT;

-- 2. Creamos un índice para que la búsqueda por QR sea instantánea
CREATE INDEX idx_examenes_uuid ON examenes(uuid);