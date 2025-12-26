
CREATE TABLE examenes_predefinidos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE,
  precio REAL NOT NULL,
  categoria TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO examenes_predefinidos (nombre, precio, categoria) VALUES
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

CREATE INDEX idx_examenes_predefinidos_categoria ON examenes_predefinidos(categoria);
