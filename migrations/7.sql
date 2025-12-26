-- 1. Añadimos la columna uuid
ALTER TABLE examenes ADD COLUMN uuid TEXT;

-- 2. Creamos un índice para que la búsqueda por QR sea instantánea
CREATE INDEX idx_examenes_uuid ON examenes(uuid);

-- 3. (Opcional) Insertar el examen de prueba para validar que todo conecte
-- Sustituye el paciente_id por uno que ya exista en tu tabla pacientes
INSERT INTO examenes (paciente_id, tipo, fecha, resultados, estado, uuid) 
VALUES (1, 'Hematología Completa', '2025-05-20', '{}', 'completado', '56e0d334-9201-419e-81cf-d16b9968fee6');