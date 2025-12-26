import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

// --- CONFIGURACIÓN E INTERFACES ---
interface Env {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Env }>();

// --- ESQUEMAS DE VALIDACIÓN (ZOD) ---
const examenSchema = z.object({
  paciente_id: z.number(),
  tipo: z.string(),
  fecha: z.string(),
  resultados: z.record(z.any()).optional(),
  estado: z.enum(["pendiente", "en_proceso", "completado"]),
  uuid: z.string().optional(),
});

const facturaSchema = z.object({
  paciente_id: z.number(),
  examenes: z.array(
    z.object({
      nombre: z.string(),
      precio: z.number(),
      categoria: z.string().optional(), // Ahora es opcional
    })
  ),
  total: z.number(),
  fecha: z.string(),
  categorias: z.array(z.string()).optional(), // Añadido como opcional para evitar el 400/404
});

const pacienteSchema = z.object({
  cedula: z.string().min(1),
  nombre: z.string().min(1),
  edad: z.number().optional(),
  sexo: z.enum(["M", "F", "Otro"]).optional(),
});

const plantillaBacteriologiaSchema = z.object({
  nombre_plantilla: z.string().min(1),
  muestra_default: z.string().optional().nullable(),
  observacion_directa: z.string().optional().nullable(),
  tincion_gram: z.string().optional().nullable(),
  recuento_colonias: z.string().optional().nullable(),
  cultivo: z.string().optional().nullable(),
  cultivo_hongos: z.string().optional().nullable(),
});

const plantillaMiscelaneoSchema = z.object({
  nombre_examen: z.string().min(1),
  metodo: z.string().optional().nullable(),
  muestra: z.string().optional().nullable(),
  contenido_plantilla: z.string().optional().nullable(),
});

// --- DASHBOARD Y ESTADÍSTICAS ---
app.get("/api/estadisticas", async (c) => {
  const db = c.env.DB;

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
      SELECT tipo as name, COUNT(*) as value,
      SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes_tipo
      FROM examenes GROUP BY tipo
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

// --- PACIENTES ---
app.get("/api/pacientes", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM pacientes ORDER BY created_at DESC"
  ).all();
  return c.json(results);
});

app.get("/api/pacientes/:id", async (c) => {
  const res = await c.env.DB.prepare("SELECT * FROM pacientes WHERE id = ?")
    .bind(c.req.param("id"))
    .first();
  return res ? c.json(res) : c.json({ error: "No encontrado" }, 404);
});

app.post("/api/pacientes", zValidator("json", pacienteSchema), async (c) => {
  const data = c.req.valid("json");
  const res = await c.env.DB.prepare(
    "INSERT INTO pacientes (cedula, nombre, edad, sexo) VALUES (?, ?, ?, ?)"
  )
    .bind(data.cedula, data.nombre, data.edad, data.sexo)
    .run();
  const nuevo = await c.env.DB.prepare("SELECT * FROM pacientes WHERE id = ?")
    .bind(res.meta.last_row_id)
    .first();
  return c.json(nuevo, 201);
});

app.put("/api/pacientes/:id", zValidator("json", pacienteSchema), async (c) => {
  const id = c.req.param("id");
  const data = c.req.valid("json");
  await c.env.DB.prepare(
    "UPDATE pacientes SET cedula = ?, nombre = ?, edad = ?, sexo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  )
    .bind(data.cedula, data.nombre, data.edad, data.sexo, id)
    .run();
  const actualizado = await c.env.DB.prepare(
    "SELECT * FROM pacientes WHERE id = ?"
  )
    .bind(id)
    .first();
  return c.json(actualizado);
});

app.delete("/api/pacientes/:id", async (c) => {
  await c.env.DB.prepare("DELETE FROM pacientes WHERE id = ?")
    .bind(c.req.param("id"))
    .run();
  return c.json({ success: true });
});

// --- EXÁMENES ---
app.get("/api/examenes", async (c) => {
  const search = c.req.query("search");
  let sql = `SELECT e.*, p.nombre as paciente_nombre, p.cedula as paciente_cedula, p.edad as paciente_edad FROM examenes e JOIN pacientes p ON e.paciente_id = p.id`;
  const stmt = search
    ? c.env.DB.prepare(
        sql + " WHERE p.nombre LIKE ? OR p.cedula LIKE ? ORDER BY e.fecha DESC"
      ).bind(`%${search}%`, `%${search}%`)
    : c.env.DB.prepare(sql + " ORDER BY e.fecha DESC");

  const { results } = await stmt.all();
  return c.json(
    results.map((e: any) => ({
      ...e,
      resultados: e.resultados ? JSON.parse(e.resultados) : null,
    }))
  );
});

app.get("/api/examenes/:id", async (c) => {
  const res = await c.env.DB.prepare(
    `
    SELECT e.*, p.nombre as paciente_nombre, p.cedula as paciente_cedula 
    FROM examenes e JOIN pacientes p ON e.paciente_id = p.id WHERE e.id = ?
  `
  )
    .bind(c.req.param("id"))
    .first();
  if (!res) return c.json({ error: "No encontrado" }, 404);
  return c.json({
    ...res,
    resultados: (res as any).resultados
      ? JSON.parse((res as any).resultados)
      : null,
  });
});

app.post("/api/examenes", zValidator("json", examenSchema), async (c) => {
  const data = c.req.valid("json");
  const res = await c.env.DB.prepare(
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

  const nuevo = await c.env.DB.prepare(
    "SELECT e.*, p.nombre as paciente_nombre FROM examenes e JOIN pacientes p ON e.paciente_id = p.id WHERE e.id = ?"
  )
    .bind(res.meta.last_row_id)
    .first();
  return c.json(
    {
      ...nuevo,
      resultados: (nuevo as any).resultados
        ? JSON.parse((nuevo as any).resultados)
        : null,
    },
    201
  );
});

app.put("/api/examenes/:id", zValidator("json", examenSchema), async (c) => {
  const id = c.req.param("id");
  const data = c.req.valid("json");
  await c.env.DB.prepare(
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
  return c.json({ success: true });
});

app.delete("/api/examenes/:id", async (c) => {
  await c.env.DB.prepare("DELETE FROM examenes WHERE id = ?")
    .bind(c.req.param("id"))
    .run();
  return c.json({ success: true });
});

// --- VERIFICACIÓN PÚBLICA (QR) ---
app.get("/api/verify/:uuid", async (c) => {
  const result = await c.env.DB.prepare(
    `
    SELECT e.tipo, e.fecha, e.estado, e.resultados, p.nombre as paciente_nombre, p.cedula as paciente_cedula
    FROM examenes e JOIN pacientes p ON e.paciente_id = p.id WHERE e.uuid = ?
  `
  )
    .bind(c.req.param("uuid"))
    .first();

  if (!result) return c.json({ error: "Documento no válido" }, 404);
  return c.json({
    ...result,
    resultados: (result as any).resultados
      ? JSON.parse((result as any).resultados)
      : null,
  });
});

// --- EVOLUCIÓN PACIENTE ---
app.get("/api/pacientes/:id/evolucion/:tipo", async (c) => {
  const { id, tipo } = c.req.param();
  const { results } = await c.env.DB.prepare(
    `
    SELECT fecha, resultados FROM examenes 
    WHERE paciente_id = ? AND tipo = ? AND estado = 'completado' ORDER BY fecha ASC
  `
  )
    .bind(id, tipo)
    .all();
  return c.json(
    results.map((r: any) => ({
      fecha: r.fecha,
      valores: JSON.parse(r.resultados),
    }))
  );
});

// --- FACTURAS ---
app.get("/api/facturas", async (c) => {
  const { results } = await c.env.DB.prepare(
    `
    SELECT f.*, p.nombre as paciente_nombre, p.cedula as paciente_cedula 
    FROM facturas f JOIN pacientes p ON f.paciente_id = p.id ORDER BY f.fecha DESC
  `
  ).all();
  return c.json(
    results.map((f: any) => ({ ...f, examenes: JSON.parse(f.examenes) }))
  );
});

app.get("/api/facturas/:id", async (c) => {
  const f = await c.env.DB.prepare(
    `
    SELECT f.*, p.nombre as paciente_nombre, p.cedula as paciente_cedula 
    FROM facturas f JOIN pacientes p ON f.paciente_id = p.id WHERE f.id = ?
  `
  )
    .bind(c.req.param("id"))
    .first();
  return f
    ? c.json({ ...f, examenes: JSON.parse((f as any).examenes) })
    : c.json({ error: "No encontrado" }, 404);
});

app.post("/api/facturas", zValidator("json", facturaSchema), async (c) => {
  const data = c.req.valid("json");
  const db = c.env.DB;

  try {
    // 1. Insertar la Factura (Igual que antes)
    const resFactura = await db
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

    const facturaId = resFactura.meta.last_row_id;

    // 2. CREAR ÓRDENES AUTOMÁTICAS (Solo si vienen categorías en el JSON)
    if (data.categorias && data.categorias.length > 0) {
      for (const cat of data.categorias) {
        // Usamos crypto.randomUUID() o una alternativa si falla en tu entorno
        const examenUuid = crypto.randomUUID
          ? crypto.randomUUID()
          : `fac-${facturaId}-${Math.random().toString(36).substr(2, 9)}`;

        await db
          .prepare(
            `INSERT INTO examenes 
          (paciente_id, tipo, fecha, estado, uuid, resultados) 
          VALUES (?, ?, ?, ?, ?, ?)`
          )
          .bind(
            data.paciente_id,
            cat,
            data.fecha,
            "pendiente",
            examenUuid,
            JSON.stringify({}) // Resultados vacíos iniciales
          )
          .run();
      }
    }

    return c.json({ success: true, id: facturaId }, 201);
  } catch (error: any) {
    console.error("Error en facturación:", error.message);
    return c.json(
      { error: "No se pudo procesar la factura", details: error.message },
      500
    );
  }
});

app.put("/api/facturas/:id", zValidator("json", facturaSchema), async (c) => {
  const id = c.req.param("id");
  const data = c.req.valid("json");
  const db = c.env.DB;

  try {
    const facturaActual = await db
      .prepare("SELECT examenes FROM facturas WHERE id = ?")
      .bind(id)
      .first<{ examenes: string }>(); // Tipado directamente en la consulta

    if (!facturaActual) return c.json({ error: "Factura no encontrada" }, 404);

    const examenesPrevios = JSON.parse(facturaActual.examenes || "[]");
    const categoriasPrevias = [
      ...new Set(
        examenesPrevios.map((ex: any) => ex.categoria).filter(Boolean)
      ),
    ] as string[];
    const categoriasNuevas = data.categorias || [];

    // Actualizar factura
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

    // Sincronizar Exámenes (Eliminar obsoletos)
    for (const catPrev of categoriasPrevias) {
      if (!categoriasNuevas.includes(catPrev)) {
        await db
          .prepare(
            "DELETE FROM examenes WHERE paciente_id = ? AND tipo = ? AND fecha = ? AND estado = 'pendiente'"
          )
          .bind(data.paciente_id, catPrev, data.fecha)
          .run();
      }
    }

    // Sincronizar Exámenes (Crear nuevos)
    for (const catNueva of categoriasNuevas) {
      if (!categoriasPrevias.includes(catNueva)) {
        const examenUuid = crypto.randomUUID();
        await db
          .prepare(
            "INSERT INTO examenes (paciente_id, tipo, fecha, estado, uuid, resultados) VALUES (?, ?, ?, ?, ?, ?)"
          )
          .bind(
            data.paciente_id,
            catNueva,
            data.fecha,
            "pendiente",
            examenUuid,
            JSON.stringify({})
          )
          .run();
      }
    }

    return c.json({ success: true });
  } catch (error: any) {
    return c.json(
      { error: "Error de sincronización", details: error.message },
      500
    );
  }
});

app.delete("/api/facturas/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.env.DB;

  try {
    // 1. Obtener la información de la factura antes de borrarla
    const factura = await db
      .prepare("SELECT paciente_id, fecha, examenes FROM facturas WHERE id = ?")
      .bind(id)
      .first<{ paciente_id: number; fecha: string; examenes: string }>();

    if (!factura) {
      return c.json({ error: "Factura no encontrada" }, 404);
    }

    // 2. Extraer las categorías únicas de los exámenes de esa factura
    const examenesList = JSON.parse(factura.examenes || "[]");
    const categorias = [...new Set(examenesList.map((ex: any) => ex.categoria).filter(Boolean))] as string[];

    // 3. Eliminar los exámenes vinculados que estén en estado 'pendiente'
    // Usamos el paciente_id, la fecha y el tipo (categoría) para identificarlos
    if (categorias.length > 0) {
      for (const cat of categorias) {
        await db
          .prepare(
            "DELETE FROM examenes WHERE paciente_id = ? AND tipo = ? AND fecha = ? AND estado = 'pendiente'"
          )
          .bind(factura.paciente_id, cat, factura.fecha)
          .run();
      }
    }

    // 4. Finalmente, borrar la factura
    await db.prepare("DELETE FROM facturas WHERE id = ?").bind(id).run();

    return c.json({ 
      success: true, 
      message: "Factura y exámenes pendientes eliminados correctamente" 
    });

  } catch (error: any) {
    console.error("Error al eliminar factura:", error.message);
    return c.json(
      { error: "No se pudo eliminar la factura", details: error.message },
      500
    );
  }
});

// --- PLANTILLAS Y EXÁMENES PREDEFINIDOS ---
app.get("/api/examenes-predefinidos", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM examenes_predefinidos ORDER BY categoria, nombre"
  ).all();
  return c.json(results);
});

app.post("/api/examenes-predefinidos", async (c) => {
  const { nombre, precio, categoria } = await c.req.json();
  const res = await c.env.DB.prepare(
    "INSERT INTO examenes_predefinidos (nombre, precio, categoria) VALUES (?, ?, ?)"
  )
    .bind(nombre, precio, categoria)
    .run();
  return c.json({ success: true, id: res.meta.last_row_id }, 201);
});

// --- PLANTILLAS ESPECÍFICAS ---
app.get("/api/plantillas/bacteriologia", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM plantillas_bacteriologia ORDER BY nombre_plantilla ASC"
  ).all();
  return c.json(results);
});

// --- AGREGAR ESTO AL BACKEND ---

// Actualizar un examen predefinido
app.put("/api/examenes-predefinidos/:id", async (c) => {
  const id = c.req.param("id");
  const { nombre, precio } = await c.req.json();
  
  try {
    await c.env.DB.prepare(
      "UPDATE examenes_predefinidos SET nombre = ?, precio = ?, categoria = ? WHERE id = ?"
    )
    .bind(nombre, precio, precio, id)
    .run();
    
    return c.json({ success: true });
  } catch (e) {
    return c.json({ error: "Error al actualizar" }, 500);
  }
});

// Eliminar un examen predefinido
app.delete("/api/examenes-predefinidos/:id", async (c) => {
  const id = c.req.param("id");
  
  try {
    await c.env.DB.prepare("DELETE FROM examenes_predefinidos WHERE id = ?")
      .bind(id)
      .run();
      
    return c.json({ success: true });
  } catch (e) {
    return c.json({ error: "Error al eliminar" }, 500);
  }
});

app.post(
  "/api/plantillas/bacteriologia",
  zValidator("json", plantillaBacteriologiaSchema),
  async (c) => {
    const data = c.req.valid("json");
    await c.env.DB.prepare(
      `
    INSERT INTO plantillas_bacteriologia (nombre_plantilla, muestra_default, observacion_directa, tincion_gram, recuento_colonias, cultivo, cultivo_hongos) 
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

app.get("/api/plantillas/miscelaneos", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM plantillas_miscelaneos ORDER BY nombre_examen ASC"
  ).all();
  return c.json(results);
});

app.post(
  "/api/plantillas/miscelaneos",
  zValidator("json", plantillaMiscelaneoSchema),
  async (c) => {
    const data = c.req.valid("json");
    await c.env.DB.prepare(
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
  }
);

export default app;
