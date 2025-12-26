
CREATE TABLE plantillas_bacteriologia (
    id SERIAL PRIMARY KEY,
    nombre_plantilla VARCHAR(100), -- Nombre para identificarla (ej: "Urocultivo Negativo")
    muestra_default VARCHAR(100),
    observacion_directa TEXT,
    tincion_gram TEXT,
    recuento_colonias TEXT,
    cultivo TEXT,
    cultivo_hongos TEXT
);