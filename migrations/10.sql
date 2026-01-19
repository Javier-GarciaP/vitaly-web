-- Eliminar el registro antiguo genérico
DELETE FROM hematologia_valores_referencia 
WHERE nombre_examen = 'Hemoglobina';

-- Insertar los nuevos rangos detallados
INSERT INTO hematologia_valores_referencia (nombre_examen, valor_referencia) VALUES
('Hemoglobina mujer', '12.0 - 14.0 g/dL'),
('Hemoglobina hombre', '14.0 - 16.0 g/dL'),
('Niños 0-2 semanas', '13.5 - 28.5 g/dL'),
('Niños 2-6 meses', '9.5 - 13.5 g/dL'),
('Niños 6 meses a 6 años', '11.0 - 14.0 g/dL'), -- Corregido "6 a 6 años" a "6 meses"
('Niños 6 a 12 años', '12.0 - 15.5 g/dL');