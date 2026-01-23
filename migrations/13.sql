-- TABLA: PSA VALORES DE REFERENCIA
DROP TABLE IF EXISTS psa_valores_referencia;
CREATE TABLE psa_valores_referencia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_examen TEXT NOT NULL UNIQUE,
    valor_referencia TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- VALORES POR DEFECTO
INSERT INTO psa_valores_referencia (nombre_examen, valor_referencia) VALUES
('PSA Total', 'Hasta 4.0 ng/ml'),
('PSA Libre', 'Hasta 0.93 ng/ml');

-- ÍNDICE PARA BÚSQUEDAS RÁPIDAS
CREATE INDEX idx_psa_nombre ON psa_valores_referencia(nombre_examen);
