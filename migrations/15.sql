-- Migración para hacer opcionales la cédula y la edad
CREATE TABLE IF NOT EXISTS new_pacientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cedula TEXT UNIQUE,
    nombre TEXT NOT NULL,
    edad TEXT,
    sexo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO new_pacientes (id, cedula, nombre, edad, sexo, created_at, updated_at)
SELECT id, cedula, nombre, edad, sexo, created_at, updated_at FROM pacientes;

DROP TABLE pacientes;

ALTER TABLE new_pacientes RENAME TO pacientes;

CREATE INDEX IF NOT EXISTS idx_pacientes_cedula ON pacientes(cedula);
CREATE INDEX IF NOT EXISTS idx_pacientes_nombre ON pacientes(nombre);
