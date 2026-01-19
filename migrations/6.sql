-- migrations/000X_crear_tabla_plantillas.sql
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