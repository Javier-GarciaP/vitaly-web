-- migrations/000X_crear_tabla_plantillas.sql

-- 1. Tabla de Bacteriología
DROP TABLE IF EXISTS plantillas_bacteriologia;
CREATE TABLE plantillas_bacteriologia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_plantilla TEXT,
    muestra_default TEXT,
    observacion_directa TEXT,
    tincion_gram TEXT,
    recuento_colonias TEXT,
    cultivo TEXT,
    cultivo_hongos TEXT
);

-- 2. Tabla de Misceláneos (Corregida para SQLite)
DROP TABLE IF EXISTS plantillas_miscelaneos;
CREATE TABLE plantillas_miscelaneos (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- SQLite usa INTEGER, no SERIAL
    nombre_examen TEXT NOT NULL,           -- SQLite prefiere TEXT sobre VARCHAR
    metodo TEXT,
    muestra TEXT,
    contenido_plantilla TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP, -- SQLite usa DATETIME
    usuario_id INTEGER                      -- Cambiado a INTEGER para consistencia
);