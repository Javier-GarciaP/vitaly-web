CREATE TABLE plantillas_miscelaneos (
    id SERIAL PRIMARY KEY,
    nombre_examen VARCHAR(255) NOT NULL, -- Ej: "Perfil Tiroideo"
    metodo VARCHAR(100),                -- Ej: "ELISA"
    muestra VARCHAR(100),               -- Ej: "Suero"
    contenido_plantilla TEXT,           -- El texto base que va en el TextArea
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id INT                      -- Opcional: para saber quién la creó
);