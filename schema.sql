CREATE TABLE IF NOT EXISTS pacientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cedula TEXT UNIQUE,
  nombre TEXT NOT NULL,
  edad TEXT,
  sexo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pacientes_cedula ON pacientes(cedula);
CREATE INDEX IF NOT EXISTS idx_pacientes_nombre ON pacientes(nombre);

CREATE TABLE IF NOT EXISTS facturas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  paciente_id INTEGER NOT NULL,
  examenes TEXT NOT NULL,
  total REAL NOT NULL,
  fecha DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_facturas_paciente ON facturas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha ON facturas(fecha);

CREATE TABLE IF NOT EXISTS examenes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  paciente_id INTEGER NOT NULL,
  tipo TEXT NOT NULL,
  fecha DATE NOT NULL,
  resultados TEXT,
  estado TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uuid TEXT
);
CREATE INDEX IF NOT EXISTS idx_examenes_paciente ON examenes(paciente_id);
CREATE INDEX IF NOT EXISTS idx_examenes_fecha ON examenes(fecha);
CREATE INDEX IF NOT EXISTS idx_examenes_estado ON examenes(estado);
CREATE INDEX IF NOT EXISTS idx_examenes_uuid ON examenes(uuid);

CREATE TABLE IF NOT EXISTS examenes_predefinidos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE,
  precio REAL NOT NULL,
  categoria TEXT,
  parametros TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT OR IGNORE INTO examenes_predefinidos (nombre, precio, categoria) VALUES
('Hemograma Completo', 150.00, 'Hematología'),
('Glicemia', 80.00, 'Química Clínica'),
('Urea', 80.00, 'Química Clínica'),
('Creatinina', 80.00, 'Química Clínica'),
('Ácido Úrico', 90.00, 'Química Clínica'),
('Colesterol Total', 85.00, 'Química Clínica'),
('Colesterol HDL', 90.00, 'Química Clínica'),
('Triglicéridos', 85.00, 'Química Clínica'),
('TGO', 95.00, 'Química Clínica'),
('TGP', 95.00, 'Química Clínica'),
('Examen de Orina', 120.00, 'Orina'),
('Examen de Heces', 110.00, 'Heces'),
('Tiempo de Protrombina', 130.00, 'Coagulación'),
('TPT', 130.00, 'Coagulación'),
('Grupo Sanguíneo', 100.00, 'Grupo Sanguíneo'),
('Cultivo de Orina', 200.00, 'Bacteriología'),
('Antibiograma', 180.00, 'Bacteriología');
CREATE INDEX IF NOT EXISTS idx_examenes_predefinidos_categoria ON examenes_predefinidos(categoria);

CREATE TABLE IF NOT EXISTS plantillas_miscelaneos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_examen TEXT NOT NULL,
  metodo TEXT,
  muestra TEXT,
  contenido_plantilla TEXT,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  usuario_id INTEGER
);

CREATE TABLE IF NOT EXISTS plantillas_bacteriologia (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_plantilla TEXT,
  muestra_default TEXT,
  observacion_directa TEXT,
  tincion_gram TEXT,
  recuento_colonias TEXT,
  cultivo TEXT,
  cultivo_hongos TEXT
);

CREATE TABLE IF NOT EXISTS quimica_valores_referencia (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_examen TEXT NOT NULL UNIQUE,
  valor_referencia TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS hematologia_valores_referencia (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_examen TEXT NOT NULL UNIQUE,
  valor_referencia TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS coagulacion_valores_referencia (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_examen TEXT NOT NULL UNIQUE,
  valor_referencia TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT OR IGNORE INTO quimica_valores_referencia (nombre_examen, valor_referencia) VALUES
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
INSERT OR IGNORE INTO hematologia_valores_referencia (nombre_examen, valor_referencia) VALUES
('Hematíes', '4.5 - 5.5 mill/mm³'),
('Hemoglobina mujer', '12.0 - 14.0 g/dL'),
('Hemoglobina hombre', '14.0 - 16.0 g/dL'),
('Niños 0-2 semanas', '13.5 - 28.5 g/dL'),
('Niños 2-6 meses', '9.5 - 13.5 g/dL'),
('Niños 6 meses a 6 años', '11.0 - 14.0 g/dL'),
('Niños 6 a 12 años', '12.0 - 15.5 g/dL'),
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
INSERT OR IGNORE INTO coagulacion_valores_referencia (nombre_examen, valor_referencia) VALUES
('T.P. Control', '11.0 - 13.0 seg'),
('T.P. Actividad', '70 - 100 %'),
('I.N.R.', '0.8 - 1.2'),
('T.P.T. Control', '28.0 - 32.0 seg'),
('T.P.T. Paciente', 'Hasta 35.0 seg'),
('Fibrinógeno', '200 - 400 mg/dL');
CREATE INDEX IF NOT EXISTS idx_quimica_nombre ON quimica_valores_referencia(nombre_examen);
CREATE INDEX IF NOT EXISTS idx_hematologia_nombre ON hematologia_valores_referencia(nombre_examen);
CREATE INDEX IF NOT EXISTS idx_coagulacion_nombre ON coagulacion_valores_referencia(nombre_examen);

CREATE TABLE IF NOT EXISTS psa_valores_referencia (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_examen TEXT NOT NULL UNIQUE,
  valor_referencia TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT OR IGNORE INTO psa_valores_referencia (nombre_examen, valor_referencia) VALUES
('PSA Total', 'Hasta 4.0 ng/ml'),
('PSA Libre', 'Hasta 0.93 ng/ml');
CREATE INDEX IF NOT EXISTS idx_psa_nombre ON psa_valores_referencia(nombre_examen);
