
CREATE TABLE examenes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  paciente_id INTEGER NOT NULL,
  tipo TEXT NOT NULL,
  fecha DATE NOT NULL,
  resultados TEXT,
  estado TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_examenes_paciente ON examenes(paciente_id);
CREATE INDEX idx_examenes_fecha ON examenes(fecha);
CREATE INDEX idx_examenes_estado ON examenes(estado);
