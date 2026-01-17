import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

// --- CONFIGURACIÓN E INTERFACES ---
interface Env {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Env }>();

const valorReferenciaItemSchema = z.object({
  id: z.number(),
  nombre_examen: z.string(),
  valor_referencia: z.string(),
});

const valoresReferenciaBulkSchema = z.object({
  valores: z.array(valorReferenciaItemSchema),
});

// --- ESQUEMAS DE VALIDACIÓN (ZOD) ---
const examenSchema = z.object({
  paciente_id: z.number(),
  tipo: z.string(),
  fecha: z.string(),
  resultados: z.union([z.record(z.any()), z.array(z.any())]).optional(),
  estado: z.enum(["pendiente", "en_proceso", "completado"]),
  uuid: z.string().optional(),
});

const facturaSchema = z.object({
  paciente_id: z.number(),
  examenes: z.array(
    z.object({
      nombre: z.string(),
      precio: z.number(),
      categoria: z.string().optional(),
      parametros: z.array(z.string()).optional(),
    })
  ),
  total: z.number(),
  fecha: z.string(),
  categorias: z.array(z.string()).optional(),
});

const pacienteSchema = z.object({
  cedula: z.string().min(1),
  nombre: z.string().min(1),
  edad: z.string().optional(),
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
  const pacienteId = c.req.query("paciente_id");
  let sql = `SELECT e.*, p.nombre as paciente_nombre, p.cedula as paciente_cedula, p.edad as paciente_edad FROM examenes e JOIN pacientes p ON e.paciente_id = p.id`;

  let stmt;

  if (pacienteId) {
    stmt = c.env.DB.prepare(sql + " WHERE e.paciente_id = ? ORDER BY e.fecha DESC").bind(pacienteId);
  } else if (search) {
    stmt = c.env.DB.prepare(
      sql + " WHERE p.nombre LIKE ? OR p.cedula LIKE ? ORDER BY e.fecha DESC"
    ).bind(`%${search}%`, `%${search}%`);
  } else {
    stmt = c.env.DB.prepare(sql + " ORDER BY e.fecha DESC");
  }

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

  const resultadosString = data.resultados ? JSON.stringify(data.resultados) : null;

  await c.env.DB.prepare(
    "UPDATE examenes SET paciente_id = ?, tipo = ?, fecha = ?, resultados = ?, estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  )
    .bind(
      data.paciente_id,
      data.tipo,
      data.fecha,
      resultadosString,
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
// GET: Obtener todas las facturas
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

// GET: Obtener una factura por ID
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

// POST: Crear factura y generar órdenes (omitiendo Materiales)
app.post("/api/facturas", zValidator("json", facturaSchema), async (c) => {
  const data = c.req.valid("json");
  const db = c.env.DB;

  try {
    // 1. Insertar la Factura (Guarda TODO, incluyendo materiales en el JSON)
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

    // 2. CREAR ÓRDENES AUTOMÁTICAS (Filtrando Materiales)
    const categoriasValidas = (data.categorias || []).filter(
      (cat) => cat !== "Materiales"
    );

    if (categoriasValidas.length > 0) {
      for (const cat of categoriasValidas) {
        const examenUuid = crypto.randomUUID
          ? crypto.randomUUID()
          : `fac-${facturaId}-${Math.random().toString(36).substr(2, 9)}`;

        // Recolectar parámetros para resaltar
        const paramsParaResaltar = data.examenes
          .filter(e => e.categoria === cat && e.parametros)
          .flatMap(e => e.parametros || []);

        // Crear objeto resultados inicial
        const resultadosIniciales = paramsParaResaltar.length > 0
          ? { _highlightFields: [...new Set(paramsParaResaltar)] }
          : {};

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
            JSON.stringify(resultadosIniciales)
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

// PUT: Actualizar factura y sincronizar órdenes (omitiendo Materiales)
app.put("/api/facturas/:id", zValidator("json", facturaSchema), async (c) => {
  const id = c.req.param("id");
  const data = c.req.valid("json");
  const db = c.env.DB;

  try {
    const facturaActual = await db
      .prepare("SELECT examenes FROM facturas WHERE id = ?")
      .bind(id)
      .first<{ examenes: string }>();

    if (!facturaActual) return c.json({ error: "Factura no encontrada" }, 404);

    const examenesPrevios = JSON.parse(facturaActual.examenes || "[]");

    // Categorías que existían antes (para saber qué borrar si ya no existen)
    const categoriasPrevias = [
      ...new Set(
        examenesPrevios
          .map((ex: any) => ex.categoria)
          .filter((cat: any) => cat && cat !== "Materiales")
      ),
    ] as string[];

    // Categorías activas en la nueva edición (para upsert)
    const categoriasActivas = [
      ...new Set(
        data.examenes
          .map((ex: any) => ex.categoria)
          .filter((cat: any) => cat && cat !== "Materiales")
      ),
    ] as string[];

    // 1. Actualizar Factura
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

    // 2. Sincronizar Inserciones/Actualizaciones (Upsert Logic)
    for (const cat of categoriasActivas) {
      // Calcular parámetros para resaltar basados en los ítems actuales de esta categoría
      const paramsParaResaltar = data.examenes
        .filter(e => e.categoria === cat && e.parametros)
        .flatMap(e => e.parametros || []);

      const newHighlightFields = [...new Set(paramsParaResaltar)];

      // Buscar si ya existe el examen PENDIENTE
      const examenExistente = await db
        .prepare("SELECT * FROM examenes WHERE paciente_id = ? AND tipo = ? AND fecha = ? AND estado = 'pendiente'")
        .bind(data.paciente_id, cat, data.fecha)
        .first<{ id: number; uuid: string; resultados: string }>();

      if (examenExistente) {
        // ACTUALIZAR (UPDATE): Fusionar highlighting con resultados existentes
        const resultadosActuales = JSON.parse(examenExistente.resultados || "{}");

        // Si hay parámetros, actualizamos _highlightFields. Si no, lo eliminamos o dejamos vacío.
        if (newHighlightFields.length > 0) {
          resultadosActuales._highlightFields = newHighlightFields;
        } else {
          delete resultadosActuales._highlightFields;
        }

        await db
          .prepare("UPDATE examenes SET resultados = ? WHERE id = ?")
          .bind(JSON.stringify(resultadosActuales), examenExistente.id)
          .run();

      } else {
        // CREAR (INSERT): Nuevo examen
        const examenUuid = crypto.randomUUID();
        const resultadosIniciales = newHighlightFields.length > 0
          ? { _highlightFields: newHighlightFields }
          : {};

        await db
          .prepare(
            "INSERT INTO examenes (paciente_id, tipo, fecha, estado, uuid, resultados) VALUES (?, ?, ?, ?, ?, ?)"
          )
          .bind(
            data.paciente_id,
            cat,
            data.fecha,
            "pendiente",
            examenUuid,
            JSON.stringify(resultadosIniciales)
          )
          .run();
      }
    }

    // 3. Sincronizar Eliminaciones (Delete Logic)
    // Si una categoría estaba antes pero ya no está en las activas, borrar el examen pendiente
    for (const catPrev of categoriasPrevias) {
      if (!categoriasActivas.includes(catPrev)) {
        await db
          .prepare(
            "DELETE FROM examenes WHERE paciente_id = ? AND tipo = ? AND fecha = ? AND estado = 'pendiente'"
          )
          .bind(data.paciente_id, catPrev, data.fecha)
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

// DELETE: Eliminar factura y exámenes pendientes asociados
app.delete("/api/facturas/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.env.DB;

  try {
    // 1. Obtener la factura para saber qué exámenes borrar
    const factura = await db
      .prepare("SELECT paciente_id, examenes, fecha FROM facturas WHERE id = ?")
      .bind(id)
      .first<{ paciente_id: number; examenes: string; fecha: string }>();

    if (!factura) {
      return c.json({ error: "Factura no encontrada" }, 404);
    }

    // 2. Obtener categorías de la factura para eliminar exámenes asociados
    // (Solo eliminamos los que sigan en estado 'pendiente')
    const examenes = JSON.parse(factura.examenes || "[]");
    const categorias = [
      ...new Set(
        examenes
          .map((ex: any) => ex.categoria)
          .filter((cat: any) => cat && cat !== "Materiales")
      ),
    ] as string[];

    // 3. Eliminar exámenes pendientes asociados
    for (const cat of categorias) {
      await db
        .prepare(
          "DELETE FROM examenes WHERE paciente_id = ? AND tipo = ? AND fecha = ? AND estado = 'pendiente'"
        )
        .bind(factura.paciente_id, cat, factura.fecha)
        .run();
    }

    // 4. Eliminar la factura
    await db.prepare("DELETE FROM facturas WHERE id = ?").bind(id).run();

    return c.json({ success: true });
  } catch (error: any) {
    return c.json(
      { error: "Error al eliminar factura", details: error.message },
      500
    );
  }
});

app.get("/api/examenes-predefinidos", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM examenes_predefinidos ORDER BY nombre ASC"
  ).all();
  return c.json(
    results.map((e: any) => ({
      ...e,
      parametros: e.parametros ? JSON.parse(e.parametros) : [],
    }))
  );
});

app.get("/api/examenes-predefinidos/:id", async (c) => {
  const id = c.req.param("id");
  const result = await c.env.DB.prepare(
    "SELECT * FROM examenes_predefinidos WHERE id = ?"
  )
    .bind(id)
    .first();

  if (!result) return c.json({ error: "No encontrado" }, 404);

  return c.json({
    ...result,
    parametros: (result as any).parametros ? JSON.parse((result as any).parametros) : []
  });
});

app.delete("/api/examenes-predefinidos/:id", async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM examenes_predefinidos WHERE id = ?")
    .bind(id)
    .run();
  return c.json({ success: true });
});

app.post("/api/examenes-predefinidos", async (c) => {
  const { nombre, precio, categoria, parametros } = await c.req.json();
  const res = await c.env.DB.prepare(
    "INSERT INTO examenes_predefinidos (nombre, precio, categoria, parametros) VALUES (?, ?, ?, ?)"
  )
    .bind(nombre, precio, categoria, parametros ? JSON.stringify(parametros) : null)
    .run();
  return c.json({ success: true, id: res.meta.last_row_id }, 201);
});

// --- PLANTILLAS ESPECÍFICAS ---

// 1. OBTENER TODAS (GET)
app.get("/api/plantillas/bacteriologia", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM plantillas_bacteriologia ORDER BY nombre_plantilla ASC"
    ).all();
    return c.json(results);
  } catch (e) { }
});

// 2. CREAR NUEVA (POST)
app.post("/api/plantillas/bacteriologia", async (c) => {
  const body = await c.req.json();
  try {
    const res = await c.env.DB.prepare(
      `INSERT INTO plantillas_bacteriologia 
      (nombre_plantilla, muestra_default, observacion_directa, tincion_gram, recuento_colonias, cultivo, cultivo_hongos)
      VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        body.nombre_plantilla,
        body.muestra_default,
        body.observacion_directa,
        body.tincion_gram,
        body.recuento_colonias,
        body.cultivo,
        body.cultivo_hongos
      )
      .run();

    // res.meta.last_row_id es el ID que generó SQLite
    return c.json({ success: true, id: res.meta.last_row_id }, 201);
  } catch (e) { }
});

// 3. ACTUALIZAR (PUT)
app.put("/api/plantillas/bacteriologia/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  try {
    await c.env.DB.prepare(
      `
      UPDATE plantillas_bacteriologia 
      SET 
        nombre_plantilla = ?, 
        muestra_default = ?, 
        observacion_directa = ?, 
        tincion_gram = ?, 
        recuento_colonias = ?, 
        cultivo = ?, 
        cultivo_hongos = ?
      WHERE id = ?
    `
    )
      .bind(
        body.nombre_plantilla,
        body.muestra_default,
        body.observacion_directa,
        body.tincion_gram,
        body.recuento_colonias,
        body.cultivo,
        body.cultivo_hongos,
        id
      )
      .run();
    return c.json({ success: true });
  } catch (e) { }
});

// 4. ELIMINAR (DELETE)
// 4. ELIMINAR (DELETE) - CORREGIDO
app.delete("/api/plantillas/bacteriologia/:id", async (c) => {
  const id = c.req.param("id");
  console.log("Intentando eliminar ID:", id); // Para debug

  try {
    const result = await c.env.DB.prepare(
      "DELETE FROM plantillas_bacteriologia WHERE id = ?"
    )
      .bind(id)
      .run();

    if (result.meta.changes === 0) {
      return c.json(
        { success: false, error: "No se encontró la plantilla" },
        404
      );
    }

    return c.json({ success: true });
  } catch (e) {
    console.error("Error en DELETE:", e);
    return c.json({ success: false, error: "Error interno del servidor" }, 500);
  }
});

// --- AGREGAR ESTO AL BACKEND ---

// Actualizar un examen predefinido
app.put("/api/examenes-predefinidos/:id", async (c) => {
  const id = c.req.param("id");
  const { nombre, precio, categoria, parametros } = await c.req.json();

  try {
    await c.env.DB.prepare(
      "UPDATE examenes_predefinidos SET nombre = ?, precio = ?, categoria = ?, parametros = ? WHERE id = ?"
    )
      .bind(nombre, precio, categoria, parametros ? JSON.stringify(parametros) : null, id)
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
    const result = await c.env.DB.prepare(
      "INSERT INTO plantillas_miscelaneos (nombre_examen, metodo, muestra, contenido_plantilla) VALUES (?, ?, ?, ?)"
    )
      .bind(
        data.nombre_examen,
        data.metodo || "",
        data.muestra || "",
        data.contenido_plantilla || ""
      )
      .run();

    // Importante: Devolver el ID generado para que el frontend lo tenga
    return c.json(
      {
        success: true,
        id: result.meta.last_row_id, // D1 devuelve aquí el ID creado
      },
      201
    );
  }
);

// DELETE: Eliminar una plantilla de misceláneos
app.delete("/api/plantillas/miscelaneos/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const result = await c.env.DB.prepare(
      "DELETE FROM plantillas_miscelaneos WHERE id = ?"
    )
      .bind(id)
      .run();

    if (result.success) {
      return c.json({ success: true, message: "Plantilla eliminada" });
    } else {
      return c.json({ error: "No se pudo eliminar la plantilla" }, 500);
    }
  } catch (e) {
    return c.json({ error: "Error de base de datos", details: e }, 500);
  }
});

// --- GESTIÓN DE VALORES DE REFERENCIA ---

// GET: Obtener valores según la tabla (quimica, hematologia, coagulacion)
app.get("/api/valores-referencia", async (c) => {
  const tablaInput = c.req.query("tabla");
  const db = c.env.DB;

  // Validamos que la tabla solicitada sea una de las permitidas para evitar SQL Injection
  let tableName = "";
  switch (tablaInput) {
    case "quimica":
      tableName = "quimica_valores_referencia";
      break;
    case "hematologia":
      tableName = "hematologia_valores_referencia";
      break;
    case "coagulacion":
      tableName = "coagulacion_valores_referencia";
      break;
    default:
      return c.json({ error: "Tabla de referencia no válida" }, 400);
  }

  try {
    const { results } = await db
      .prepare(`SELECT * FROM ${tableName} ORDER BY id ASC`)
      .all();
    return c.json(results);
  } catch (error: any) {
    return c.json(
      { error: "Error al obtener valores", details: error.message },
      500
    );
  }
});

// PUT: Actualización masiva (Bulk Update)
app.put(
  "/api/valores-referencia",
  zValidator("json", valoresReferenciaBulkSchema),
  async (c) => {
    const tablaInput = c.req.query("tabla");
    const { valores } = c.req.valid("json");
    const db = c.env.DB;

    let tableName = "";
    switch (tablaInput) {
      case "quimica":
        tableName = "quimica_valores_referencia";
        break;
      case "hematologia":
        tableName = "hematologia_valores_referencia";
        break;
      case "coagulacion":
        tableName = "coagulacion_valores_referencia";
        break;
      default:
        return c.json({ error: "Tabla no válida" }, 400);
    }

    try {
      // En Cloudflare D1, la mejor forma de hacer bulk update es con batch()
      // Preparamos todas las sentencias de actualización
      const statements = valores.map((item) =>
        db
          .prepare(`UPDATE ${tableName} SET valor_referencia = ? WHERE id = ?`)
          .bind(item.valor_referencia, item.id)
      );

      // Ejecutamos todas en una sola transacción atómica
      await db.batch(statements);

      return c.json({
        success: true,
        message: "Valores actualizados correctamente",
      });
    } catch (error: any) {
      console.error("Error en bulk update:", error.message);
      return c.json(
        {
          error: "No se pudieron actualizar los valores",
          details: error.message,
        },
        500
      );
    }
  }
);

export default app;
