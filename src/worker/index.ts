import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

// Definimos explícitamente qué recursos tiene nuestro Cloudflare Worker
interface Env {
  DB: D1Database; // Esto vincula tu base de datos mocha-db
}

const app = new Hono<{ Bindings: Env }>();

// ACTUALIZADO: Esquema de examen para incluir el uuid opcional
const examenSchema = z.object({
  paciente_id: z.number(),
  tipo: z.string(),
  fecha: z.string(),
  resultados: z.record(z.any()).optional(),
  estado: z.enum(["pendiente", "en_proceso", "completado"]),
  uuid: z.string().optional(), // Añadimos uuid al esquema
});

const facturaSchema = z.object({
  paciente_id: z.number(),
  examenes: z.array(
    z.object({
      nombre: z.string(),
      precio: z.number(),
    })
  ),
  total: z.number(),
  fecha: z.string(),
});

// --- DASHBOARD: ESTADÍSTICAS ---
app.get("/api/estadisticas", async (c) => {
  const db = c.env.DB;

  // Ejecutamos consultas en paralelo para mejor rendimiento
  const [pCount, eCount, fToday, distrib] = await Promise.all([
    db.prepare("SELECT COUNT(*) as total FROM pacientes").first(),
    db.prepare("SELECT COUNT(*) as total FROM examenes").first(),
    db
      .prepare(
        "SELECT COUNT(*) as total FROM facturas WHERE date(fecha) = date('now')"
      )
      .first(),
    db
      .prepare(
        `
      SELECT 
        tipo as name, 
        COUNT(*) as value,
        SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes_tipo
      FROM examenes 
      GROUP BY tipo
    `
      )
      .all(),
  ]);

  const distribucionRaw = distrib.results || [];
  const totalPendientes = distribucionRaw.reduce(
    (acc: number, item: any) => acc + (item.pendientes_tipo || 0),
    0
  );

  return c.json({
    totalPacientes: (pCount as any)?.total || 0,
    totalExamenes: (eCount as any)?.total || 0,
    examenesPendientes: totalPendientes,
    facturasHoy: (fToday as any)?.total || 0,
    distribucion: distribucionRaw.map((item: any) => ({
      name: item.name,
      value: item.value,
    })),
  });
});

// --- EXÁMENES ---
app.get("/api/examenes", async (c) => {
  const db = c.env.DB;
  const search = c.req.query("search");

  let sql = `SELECT e.*, p.nombre as paciente_nombre, p.cedula as paciente_cedula FROM examenes e JOIN pacientes p ON e.paciente_id = p.id`;
  let stmt;

  if (search) {
    stmt = db
      .prepare(
        sql + " WHERE p.nombre LIKE ? OR p.cedula LIKE ? ORDER BY e.fecha DESC"
      )
      .bind(`%${search}%`, `%${search}%`);
  } else {
    stmt = db.prepare(sql + " ORDER BY e.fecha DESC");
  }

  const { results } = await stmt.all();
  return c.json(
    results.map((e: any) => ({
      ...e,
      resultados: e.resultados ? JSON.parse(e.resultados) : null,
    }))
  );
});

app.post("/api/examenes", zValidator("json", examenSchema), async (c) => {
  const db = c.env.DB;
  const data = c.req.valid("json");

  const res = await db
    .prepare(
      "INSERT INTO examenes (paciente_id, tipo, fecha, resultados, estado, uuid) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(
      data.paciente_id,
      data.tipo,
      data.fecha,
      data.resultados ? JSON.stringify(data.resultados) : null,
      data.estado,
      data.uuid || null
    )
    .run();

  return c.json({ id: res.meta.last_row_id }, 201);
});

// --- VERIFICACIÓN PÚBLICA (QR) ---
app.get("/api/verify/:uuid", async (c) => {
  const db = c.env.DB;
  const uuid = c.req.param("uuid");

  const result = await db
    .prepare(
      `
    SELECT e.tipo, e.fecha, e.estado, e.resultados, p.nombre as paciente_nombre, p.cedula as paciente_cedula
    FROM examenes e
    JOIN pacientes p ON e.paciente_id = p.id
    WHERE e.uuid = ?
  `
    )
    .bind(uuid)
    .first();

  if (!result) return c.json({ error: "No válido" }, 404);

  return c.json({
    ...result,
    resultados: (result as any).resultados
      ? JSON.parse((result as any).resultados)
      : null,
  });
});

// --- FACTURAS ---
app.post("/api/facturas", zValidator("json", facturaSchema), async (c) => {
  const db = c.env.DB;
  const data = c.req.valid("json");
  await db
    .prepare(
      "INSERT INTO facturas (paciente_id, examenes, total, fecha) VALUES (?, ?, ?, ?)"
    )
    .bind(
      data.paciente_id,
      JSON.stringify(data.examenes),
      data.total,
      data.fecha
    )
    .run();
  return c.json({ success: true }, 201);
});


// (Agrega aquí el resto de tus rutas de pacientes y plantillas siguiendo este mismo estilo limpio)

app.get("/api/estadisticas", async (c) => {
  const db = c.env.DB;

  app.put("/api/facturas/:id", zValidator("json", facturaSchema), async (c) => {
    const db = c.env.DB;
    const id = c.req.param("id");
    const data = c.req.valid("json");

    await db
      .prepare(
        "UPDATE facturas SET paciente_id = ?, examenes = ?, total = ?, fecha = ? WHERE id = ?"
      )
      .bind(
        data.paciente_id,
        JSON.stringify(data.examenes),
        data.total,
        data.fecha,
        id
      )
      .run();

    return c.json({ success: true });
  });

  // 1. Consultamos totales generales de pacientes y facturas (asumiendo nombres de tablas)
  const countPacientes = await db
    .prepare("SELECT COUNT(*) as total FROM pacientes")
    .first();
  const countExamenes = await db
    .prepare("SELECT COUNT(*) as total FROM examenes")
    .first();
  const countFacturas = await db
    .prepare(
      "SELECT COUNT(*) as total FROM facturas WHERE date(created_at) = date('now')"
    )
    .first();

  // 2. Consultamos la distribución y pendientes
  const { results: distribucionRaw } = await db
    .prepare(
      `
    SELECT 
      tipo as name,
      COUNT(*) as value,
      SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes_tipo
    FROM examenes
    GROUP BY tipo
  `
    )
    .all();

  // 3. Calculamos el total de pendientes sumando los de cada tipo
  const totalPendientes = distribucionRaw.reduce(
    (acc: number, item: any) => acc + (item.pendientes_tipo || 0),
    0
  );

  // 4. Formateamos la respuesta EXACTAMENTE como la espera el Dashboard
  return c.json({
    totalPacientes: countPacientes?.total || 0,
    totalExamenes: countExamenes?.total || 0,
    examenesPendientes: totalPendientes,
    facturasHoy: countFacturas?.total || 0,
    distribucion: distribucionRaw.map((item: any) => ({
      name: item.name,
      value: item.value,
    })),
  });
});

// server/index.ts
app.get("/api/pacientes/:id/evolucion/:tipo", async (c) => {
  const db = c.env.DB;
  const { id, tipo } = c.req.param();

  const { results } = await db
    .prepare(
      `
      SELECT fecha, resultados 
      FROM examenes 
      WHERE paciente_id = ? AND tipo = ? AND estado = 'completado'
      ORDER BY fecha ASC
    `
    )
    .bind(id, tipo)
    .all();

  // Mapeamos los resultados para que el front reciba un JSON limpio
  const history = results.map((r: any) => ({
    fecha: r.fecha,
    valores: JSON.parse(r.resultados),
  }));

  return c.json(history);
});

// ==========================================
// RUTA DE VERIFICACIÓN PÚBLICA (QR)
// ==========================================
app.get("/api/verify/:uuid", async (c) => {
  const db = c.env.DB;
  const uuid = c.req.param("uuid");

  const result = await db
    .prepare(
      `
      SELECT e.tipo, e.fecha, e.estado, e.resultados, p.nombre as paciente_nombre, p.cedula as paciente_cedula
      FROM examenes e
      JOIN pacientes p ON e.paciente_id = p.id
      WHERE e.uuid = ?
    `
    )
    .bind(uuid)
    .first();

  if (!result) return c.json({ error: "No válido" }, 404);

  return c.json({
    ...result,
    // Parseamos los resultados para que el front los pueda leer
    resultados: result.resultados
      ? JSON.parse(result.resultados as string)
      : null,
  });
});

// ... (tus esquemas de Bacteriología y Misceláneos se mantienen igual)

// ... (rutas de pacientes y facturas se mantienen igual)

// ==========================================
// NUEVA RUTA: VERIFICACIÓN PÚBLICA (QR)
// ==========================================
// Esta ruta es la que el médico verá al escanear el QR.
// Debe ser pública y usar el UUID, no el ID numérico.
app.get("/api/verify/:uuid", async (c) => {
  const db = c.env.DB;
  const uuid = c.req.param("uuid");

  const result = await db
    .prepare(
      `
      SELECT e.tipo, e.fecha, e.estado, p.nombre as paciente_nombre, p.cedula as paciente_cedula
      FROM examenes e
      JOIN pacientes p ON e.paciente_id = p.id
      WHERE e.uuid = ?
    `
    )
    .bind(uuid)
    .first();

  if (!result) {
    return c.json({ error: "Documento no válido" }, 404);
  }

  return c.json(result);
});

// ==========================================
// EXÁMENES: ACTUALIZADO POST PARA GUARDAR UUID
// ==========================================
app.post("/api/examenes", zValidator("json", examenSchema), async (c) => {
  const db = c.env.DB;
  const data = c.req.valid("json");

  // ACTUALIZADO: Incluimos la columna uuid en el INSERT
  const result = await db
    .prepare(
      "INSERT INTO examenes (paciente_id, tipo, fecha, resultados, estado, uuid) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(
      data.paciente_id,
      data.tipo,
      data.fecha,
      data.resultados ? JSON.stringify(data.resultados) : null,
      data.estado,
      data.uuid || null // Guardamos el uuid que viene del frontend
    )
    .run();

  const examen = await db
    .prepare(
      `
      SELECT e.*, p.nombre as paciente_nombre, p.cedula as paciente_cedula
      FROM examenes e
      JOIN pacientes p ON e.paciente_id = p.id
      WHERE e.id = ?
    `
    )
    .bind(result.meta.last_row_id)
    .first();

  if (!examen) return c.json({ error: "Error al crear examen" }, 500);

  return c.json(
    {
      ...examen,
      resultados: (examen as any).resultados
        ? JSON.parse((examen as any).resultados)
        : null,
    },
    201
  );
});

// ACTUALIZADO: GET de exámenes para incluir el uuid en la respuesta
app.get("/api/examenes", async (c) => {
  const db = c.env.DB;
  const search = c.req.query("search");

  let query = `
    SELECT e.*, p.nombre as paciente_nombre, p.cedula as paciente_cedula
    FROM examenes e
    JOIN pacientes p ON e.paciente_id = p.id
  `;

  const finalQuery = search
    ? query + " WHERE p.nombre LIKE ? OR p.cedula LIKE ? ORDER BY e.fecha DESC"
    : query + " ORDER BY e.fecha DESC";

  const stmt = db.prepare(finalQuery);
  const examenes = search
    ? await stmt.bind(`%${search}%`, `%${search}%`).all()
    : await stmt.all();

  return c.json(
    examenes.results.map((e: any) => ({
      ...e,
      resultados: e.resultados ? JSON.parse(e.resultados) : null,
      // El uuid ya viene en e.*
    }))
  );
});

// ... (el resto del código se mantiene igual)

// Schema para Bacteriología
const plantillaBacteriologiaSchema = z.object({
  nombre_plantilla: z.string().min(1),
  muestra_default: z.string().optional().nullable(),
  observacion_directa: z.string().optional().nullable(),
  tincion_gram: z.string().optional().nullable(),
  recuento_colonias: z.string().optional().nullable(),
  cultivo: z.string().optional().nullable(),
  cultivo_hongos: z.string().optional().nullable(),
});

// Rutas API Bacteriología
app.get("/api/plantillas/bacteriologia", async (c) => {
  const db = c.env.DB;
  const { results } = await db
    .prepare(
      "SELECT * FROM plantillas_bacteriologia ORDER BY nombre_plantilla ASC"
    )
    .all();
  return c.json(results);
});

app.post(
  "/api/plantillas/bacteriologia",
  zValidator("json", plantillaBacteriologiaSchema),
  async (c) => {
    const db = c.env.DB;
    const data = c.req.valid("json");

    await db
      .prepare(
        `
    INSERT INTO plantillas_bacteriologia 
    (nombre_plantilla, muestra_default, observacion_directa, tincion_gram, recuento_colonias, cultivo, cultivo_hongos) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `
      )
      .bind(
        data.nombre_plantilla,
        data.muestra_default || "",
        data.observacion_directa || "",
        data.tincion_gram || "",
        data.recuento_colonias || "",
        data.cultivo || "",
        data.cultivo_hongos || ""
      )
      .run();

    return c.json({ success: true }, 201);
  }
);

app.delete("/api/plantillas/bacteriologia/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  await db
    .prepare("DELETE FROM plantillas_bacteriologia WHERE id = ?")
    .bind(id)
    .run();
  return c.json({ success: true });
});

// 1. Schema de validación (Mapeado a los nombres de tu tabla)
const plantillaMiscelaneoSchema = z.object({
  nombre_examen: z.string().min(1),
  metodo: z.string().optional().nullable(),
  muestra: z.string().optional().nullable(),
  contenido_plantilla: z.string().optional().nullable(),
});

// 2. Rutas para Misceláneos
app.get("/api/plantillas/miscelaneos", async (c) => {
  const db = c.env.DB;
  const { results } = await db
    .prepare(
      "SELECT id, nombre_examen, metodo, muestra, contenido_plantilla FROM plantillas_miscelaneos ORDER BY nombre_examen ASC"
    )
    .all();
  return c.json(results);
});

app.post(
  "/api/plantillas/miscelaneos",
  zValidator("json", plantillaMiscelaneoSchema),
  async (c) => {
    const db = c.env.DB;
    const data = c.req.valid("json");

    try {
      await db
        .prepare(
          "INSERT INTO plantillas_miscelaneos (nombre_examen, metodo, muestra, contenido_plantilla) VALUES (?, ?, ?, ?)"
        )
        .bind(
          data.nombre_examen,
          data.metodo || "",
          data.muestra || "",
          data.contenido_plantilla || ""
        )
        .run();

      return c.json({ success: true }, 201);
    } catch (e) {
      return c.json({ error: "Error al guardar la plantilla" }, 500);
    }
  }
);

app.delete("/api/plantillas/miscelaneos/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  await db
    .prepare("DELETE FROM plantillas_miscelaneos WHERE id = ?")
    .bind(id)
    .run();
  return c.json({ success: true });
});

// Schemas de validación
const pacienteSchema = z.object({
  cedula: z.string().min(1),
  nombre: z.string().min(1),
  edad: z.number().optional(),
  sexo: z.enum(["M", "F", "Otro"]).optional(),
});

// PACIENTES
app.get("/api/pacientes", async (c) => {
  const db = c.env.DB;
  const pacientes = await db
    .prepare("SELECT * FROM pacientes ORDER BY created_at DESC")
    .all();
  return c.json(pacientes.results);
});

app.get("/api/pacientes/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const paciente = await db
    .prepare("SELECT * FROM pacientes WHERE id = ?")
    .bind(id)
    .first();
  if (!paciente) return c.json({ error: "Paciente no encontrado" }, 404);
  return c.json(paciente);
});

app.post("/api/pacientes", zValidator("json", pacienteSchema), async (c) => {
  const db = c.env.DB;
  const data = c.req.valid("json");

  const result = await db
    .prepare(
      "INSERT INTO pacientes (cedula, nombre, edad, sexo) VALUES (?, ?, ?, ?)"
    )
    .bind(data.cedula, data.nombre, data.edad, data.sexo)
    .run();

  const paciente = await db
    .prepare("SELECT * FROM pacientes WHERE id = ?")
    .bind(result.meta.last_row_id)
    .first();
  return c.json(paciente, 201);
});

app.put("/api/pacientes/:id", zValidator("json", pacienteSchema), async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const data = c.req.valid("json");

  await db
    .prepare(
      "UPDATE pacientes SET cedula = ?, nombre = ?, edad = ?, sexo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    )
    .bind(data.cedula, data.nombre, data.edad, data.sexo, id)
    .run();

  const paciente = await db
    .prepare("SELECT * FROM pacientes WHERE id = ?")
    .bind(id)
    .first();
  return c.json(paciente);
});

app.delete("/api/pacientes/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  await db.prepare("DELETE FROM pacientes WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// FACTURAS
app.get("/api/facturas", async (c) => {
  const db = c.env.DB;
  const facturas = await db
    .prepare(
      `
    SELECT f.*, p.nombre as paciente_nombre, p.cedula as paciente_cedula
    FROM facturas f
    JOIN pacientes p ON f.paciente_id = p.id
    ORDER BY f.fecha DESC
  `
    )
    .all();

  const facturasConExamenes = facturas.results.map((f: any) => ({
    ...f,
    examenes: JSON.parse(f.examenes),
  }));

  return c.json(facturasConExamenes);
});

app.post("/api/facturas", zValidator("json", facturaSchema), async (c) => {
  const data = c.req.valid("json");
  await c.env.DB.prepare(
    "INSERT INTO facturas (paciente_id, examenes, total, fecha) VALUES (?, ?, ?, ?)"
  )
    .bind(
      data.paciente_id,
      JSON.stringify(data.examenes),
      data.total,
      data.fecha
    )
    .run();
  return c.json({ success: true }, 201);
});

// AQUÍ ESTÁ EL MÉTODO QUE HACÍA FALTA (Corregido y fuera del anidamiento)
app.put("/api/facturas/:id", zValidator("json", facturaSchema), async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const data = c.req.valid("json");
  await db
    .prepare(
      "UPDATE facturas SET paciente_id = ?, examenes = ?, total = ?, fecha = ? WHERE id = ?"
    )
    .bind(
      data.paciente_id,
      JSON.stringify(data.examenes),
      data.total,
      data.fecha,
      id
    )
    .run();
  return c.json({ success: true });
});

app.get("/api/facturas/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const factura = await db
    .prepare(
      `
    SELECT f.*, p.nombre as paciente_nombre, p.cedula as paciente_cedula
    FROM facturas f
    JOIN pacientes p ON f.paciente_id = p.id
    WHERE f.id = ?
  `
    )
    .bind(id)
    .first();

  if (!factura) return c.json({ error: "Factura no encontrada" }, 404);

  return c.json({
    ...factura,
    examenes: JSON.parse((factura as any).examenes),
  });
});

app.post("/api/facturas", zValidator("json", facturaSchema), async (c) => {
  const db = c.env.DB;
  const data = c.req.valid("json");

  const result = await db
    .prepare(
      "INSERT INTO facturas (paciente_id, examenes, total, fecha) VALUES (?, ?, ?, ?)"
    )
    .bind(
      data.paciente_id,
      JSON.stringify(data.examenes),
      data.total,
      data.fecha
    )
    .run();

  const factura = await db
    .prepare(
      `
    SELECT f.*, p.nombre as paciente_nombre, p.cedula as paciente_cedula
    FROM facturas f
    JOIN pacientes p ON f.paciente_id = p.id
    WHERE f.id = ?
  `
    )
    .bind(result.meta.last_row_id)
    .first();

  if (!factura) return c.json({ error: "Error al crear factura" }, 500);

  return c.json(
    {
      ...factura,
      examenes: JSON.parse((factura as any).examenes),
    },
    201
  );
});

app.delete("/api/facturas/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  await db.prepare("DELETE FROM facturas WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// EXÁMENES
app.get("/api/examenes", async (c) => {
  const db = c.env.DB;
  const search = c.req.query("search");

  let query = `
    SELECT e.*, p.nombre as paciente_nombre, p.cedula as paciente_cedula
    FROM examenes e
    JOIN pacientes p ON e.paciente_id = p.id
  `;

  if (search) {
    query += ` WHERE p.nombre LIKE ? OR p.cedula LIKE ?`;
    const examenes = await db
      .prepare(query + " ORDER BY e.fecha DESC")
      .bind(`%${search}%`, `%${search}%`)
      .all();
    return c.json(
      examenes.results.map((e: any) => ({
        ...e,
        resultados: e.resultados ? JSON.parse(e.resultados) : null,
      }))
    );
  }

  const examenes = await db.prepare(query + " ORDER BY e.fecha DESC").all();
  return c.json(
    examenes.results.map((e: any) => ({
      ...e,
      resultados: e.resultados ? JSON.parse(e.resultados) : null,
    }))
  );
});

app.get("/api/examenes/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const examen = await db
    .prepare(
      `
    SELECT e.*, p.nombre as paciente_nombre, p.cedula as paciente_cedula
    FROM examenes e
    JOIN pacientes p ON e.paciente_id = p.id
    WHERE e.id = ?
  `
    )
    .bind(id)
    .first();

  if (!examen) return c.json({ error: "Examen no encontrado" }, 404);

  return c.json({
    ...examen,
    resultados: examen.resultados
      ? JSON.parse(examen.resultados as string)
      : null,
  });
});

app.post("/api/examenes", zValidator("json", examenSchema), async (c) => {
  const db = c.env.DB;
  const data = c.req.valid("json");

  const result = await db
    .prepare(
      "INSERT INTO examenes (paciente_id, tipo, fecha, resultados, estado) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(
      data.paciente_id,
      data.tipo,
      data.fecha,
      data.resultados ? JSON.stringify(data.resultados) : null,
      data.estado
    )
    .run();

  const examen = await db
    .prepare(
      `
    SELECT e.*, p.nombre as paciente_nombre, p.cedula as paciente_cedula
    FROM examenes e
    JOIN pacientes p ON e.paciente_id = p.id
    WHERE e.id = ?
  `
    )
    .bind(result.meta.last_row_id)
    .first();

  if (!examen) return c.json({ error: "Error al crear examen" }, 500);

  return c.json(
    {
      ...examen,
      resultados: (examen as any).resultados
        ? JSON.parse((examen as any).resultados)
        : null,
    },
    201
  );
});

app.put("/api/examenes/:id", zValidator("json", examenSchema), async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const data = c.req.valid("json");

  await db
    .prepare(
      "UPDATE examenes SET paciente_id = ?, tipo = ?, fecha = ?, resultados = ?, estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    )
    .bind(
      data.paciente_id,
      data.tipo,
      data.fecha,
      data.resultados ? JSON.stringify(data.resultados) : null,
      data.estado,
      id
    )
    .run();

  const examen = await db
    .prepare(
      `
    SELECT e.*, p.nombre as paciente_nombre, p.cedula as paciente_cedula
    FROM examenes e
    JOIN pacientes p ON e.paciente_id = p.id
    WHERE e.id = ?
  `
    )
    .bind(id)
    .first();

  if (!examen) return c.json({ error: "Examen no encontrado" }, 404);

  return c.json({
    ...examen,
    resultados: (examen as any).resultados
      ? JSON.parse((examen as any).resultados)
      : null,
  });
});

app.delete("/api/examenes/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  await db.prepare("DELETE FROM examenes WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// EXÁMENES PREDEFINIDOS
app.get("/api/examenes-predefinidos", async (c) => {
  const db = c.env.DB;
  const examenes = await db
    .prepare("SELECT * FROM examenes_predefinidos ORDER BY categoria, nombre")
    .all();
  return c.json(examenes.results);
});

// ESTADÍSTICAS DASHBOARD
app.get("/api/estadisticas", async (c) => {
  const db = c.env.DB;

  const totalPacientes = await db
    .prepare("SELECT COUNT(*) as count FROM pacientes")
    .first();
  const totalExamenes = await db
    .prepare("SELECT COUNT(*) as count FROM examenes")
    .first();
  const examenesPendientes = await db
    .prepare(
      "SELECT COUNT(*) as count FROM examenes WHERE estado = 'pendiente'"
    )
    .first();
  const facturasHoy = await db
    .prepare(
      "SELECT COUNT(*) as count FROM facturas WHERE DATE(fecha) = DATE('now')"
    )
    .first();

  return c.json({
    totalPacientes: (totalPacientes as any)?.count || 0,
    totalExamenes: (totalExamenes as any)?.count || 0,
    examenesPendientes: (examenesPendientes as any)?.count || 0,
    facturasHoy: (facturasHoy as any)?.count || 0,
  });
});

// POST: Crear examen
app.post("/api/examenes-predefinidos", async (c) => {
  const db = c.env.DB;
  const { nombre, precio, categoria } = await c.req.json();
  const result = await db
    .prepare(
      "INSERT INTO examenes_predefinidos (nombre, precio, categoria) VALUES (?, ?, ?)"
    )
    .bind(nombre, precio, categoria)
    .run();
  return c.json({ success: true, id: result.meta.last_row_id }, 201);
});

// PUT: Actualizar examen
app.put("/api/examenes-predefinidos/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const { nombre, precio, categoria } = await c.req.json();
  await db
    .prepare(
      "UPDATE examenes_predefinidos SET nombre = ?, precio = ?, categoria = ? WHERE id = ?"
    )
    .bind(nombre, precio, categoria, id)
    .run();
  return c.json({ success: true });
});

// DELETE: Eliminar examen
app.delete("/api/examenes-predefinidos/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  await db
    .prepare("DELETE FROM examenes_predefinidos WHERE id = ?")
    .bind(id)
    .run();
  return c.json({ success: true });
});

export default app;
