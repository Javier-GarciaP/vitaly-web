-- ==========================================================
-- SCRIPT DE VALORES DE REFERENCIA - LABORATORIO VITALY
-- ==========================================================

-- 1. TABLA: QUÍMICA CLÍNICA
DROP TABLE IF EXISTS quimica_valores_referencia;
CREATE TABLE quimica_valores_referencia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_examen TEXT NOT NULL UNIQUE,
    valor_referencia TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA: HEMATOLOGÍA
DROP TABLE IF EXISTS hematologia_valores_referencia;
CREATE TABLE hematologia_valores_referencia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_examen TEXT NOT NULL UNIQUE,
    valor_referencia TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA: COAGULACIÓN
DROP TABLE IF EXISTS coagulacion_valores_referencia;
CREATE TABLE coagulacion_valores_referencia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_examen TEXT NOT NULL UNIQUE,
    valor_referencia TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- INSERCIÓN DE VALORES DE REFERENCIA (Extraídos de ReportLayouts)
-- ==========================================================

-- INSERT QUÍMICA (Valores del componente QuimicaReport)
INSERT INTO quimica_valores_referencia (nombre_examen, valor_referencia) VALUES
('Glicemia', '70 - 110 mg/dL'),
('Urea', '15 - 45 mg/dL'),
('Creatinina', '0.6 - 1.4 mg/dL'),
('Ácido Úrico', 'M: 2.4-5.7 / H: 3.4-7.0'),
('Colesterol Total', 'Hasta 200 mg/dL'),
('Triglicéridos', 'Hasta 150 mg/dL'),
('Colesterol HDL', '> 45 mg/dL'),
('Colesterol LDL', 'Hasta 130 mg/dL'),
('Colesterol VLDL', 'Hasta 30 mg/dL'),
('T.G.O (AST)', 'Hasta 40 U/L'),
('T.G.P (ALT)', 'Hasta 41 U/L'),
('Fosfatasa Alcalina', '40 - 129 U/L'),
('Bilirrubina Total', 'Hasta 1.0 mg/dL'),
('Bilirrubina Directa', 'Hasta 0.25 mg/dL'),
('Bilirrubina Indirecta', 'Hasta 0.75 mg/dL'),
('Proteínas Totales', '6.4 - 8.3 g/dL'),
('Albúmina', '3.5 - 5.2 g/dL'),
('Globulinas', '2.3 - 3.4 g/dL'),
('Relación A/G', '1.1 - 2.2'),
('Calcio', '8.6 - 10.2 mg/dL'),
('Fósforo', '2.5 - 4.5 mg/dL'),
('LDH', '140 - 280 U/L'),
('Amilasa', 'Hasta 100 U/L');

-- INSERT HEMATOLOGÍA (Extraídos de HematologiaReport)
INSERT INTO hematologia_valores_referencia (nombre_examen, valor_referencia) VALUES
('Hematíes', '4.5 - 5.5 mill/mm³'),
('Hemoglobina', '12.0 - 16.0 g/dL'),
('Hematocrito', '37.0 - 47.0 %'),
('V.C.M', '80 - 100 fL'),
('H.C.M', '27 - 31 pg'),
('C.H.C.M', '32 - 36 g/dL'),
('Leucocitos', '5.000 - 10.000 /mm³'),
('Neutrófilos', '55 - 70 %'),
('Linfocitos', '20 - 40 %'),
('Monocitos', '2 - 8 %'),
('Eosinófilos', '1 - 4 %'),
('Basófilos', '0 - 1 %'),
('Plaquetas', '150.000 - 450.000 /mm³'),
('V.S.G Hombres', '< 15 mm/h'),
('V.S.G Mujeres', '< 20 mm/h');

-- INSERT COAGULACIÓN (Valores de referencia clínicos estándar para reportes)
INSERT INTO coagulacion_valores_referencia (nombre_examen, valor_referencia) VALUES
('T.P. Control', '11.0 - 13.0 seg'),
('T.P. Actividad', '70 - 100 %'),
('I.N.R.', '0.8 - 1.2'),
('T.P.T. Control', '28.0 - 32.0 seg'),
('T.P.T. Paciente', 'Hasta 35.0 seg'),
('Fibrinógeno', '200 - 400 mg/dL');

-- Crear índices para búsquedas rápidas
CREATE INDEX idx_quimica_nombre ON quimica_valores_referencia(nombre_examen);
CREATE INDEX idx_hematologia_nombre ON hematologia_valores_referencia(nombre_examen);
CREATE INDEX idx_coagulacion_nombre ON coagulacion_valores_referencia(nombre_examen);