/**
 * api.ts - Capa de abstracción de datos
 * 
 * App 100% Desktop (Tauri): USA EXCLUSIVAMENTE SQLITE LOCAL
 */
import { queryLocal, executeLocal } from "./localDb";
import { getTodayDate } from "@/utils/date";

// ======================== PACIENTES ========================

export async function getPacientes() {
  return await queryLocal("SELECT * FROM pacientes ORDER BY nombre ASC");
}

export async function createPaciente(data: { cedula?: string; nombre?: string; edad?: string; sexo?: string }) {
  const cedulaFinal = data.cedula?.trim() ? data.cedula.trim() : `S/I-${Date.now().toString().slice(-6)}`;
  const nombreFinal = data.nombre?.trim() ? data.nombre.trim() : "SIN NOMBRE";

  const result = await executeLocal(
    "INSERT INTO pacientes (cedula, nombre, edad, sexo) VALUES ($1, $2, $3, $4)",
    [cedulaFinal, nombreFinal, data.edad || null, data.sexo || null]
  );
  return { id: result.lastInsertId, cedula: cedulaFinal, nombre: nombreFinal, edad: data.edad, sexo: data.sexo };
}

export async function updatePaciente(id: number, data: { cedula?: string; nombre?: string; edad?: string; sexo?: string }) {
  const cedulaFinal = data.cedula?.trim() ? data.cedula.trim() : `S/I-${Date.now().toString().slice(-6)}`;
  const nombreFinal = data.nombre?.trim() ? data.nombre.trim() : "SIN NOMBRE";

  await executeLocal(
    "UPDATE pacientes SET cedula = $1, nombre = $2, edad = $3, sexo = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5",
    [cedulaFinal, nombreFinal, data.edad || null, data.sexo || null, id]
  );
  return { id, ...data };
}

export async function deletePaciente(id: number) {
  await executeLocal("DELETE FROM pacientes WHERE id = $1", [id]);
  return { ok: true };
}

// ======================== FACTURAS ========================

export async function getFacturas() {
  const rows = await queryLocal(`
    SELECT f.*, p.nombre as paciente_nombre, p.cedula as paciente_cedula
    FROM facturas f 
    LEFT JOIN pacientes p ON f.paciente_id = p.id
    ORDER BY f.fecha DESC
  `);
  return rows.map((r: any) => ({
    ...r,
    examenes: typeof r.examenes === 'string' ? JSON.parse(r.examenes) : r.examenes,
  }));
}

const tipoMap: Record<string, string> = {
  "hematologia": "Hematología",
  "hematología": "Hematología",
  "quimica": "Química Clínica",
  "química clínica": "Química Clínica",
  "quimica clinica": "Química Clínica",
  "orina": "Orina",
  "heces": "Heces",
  "coagulacion": "Coagulación",
  "coagulación": "Coagulación",
  "grupo sanguineo": "Grupo Sanguíneo",
  "grupo sanguíneo": "Grupo Sanguíneo",
  "bacteriologia": "Bacteriología",
  "bacteriología": "Bacteriología",
  "miscelaneos": "Misceláneos",
  "misceláneos": "Misceláneos",
  "psa": "PSA",
};

export async function createFactura(data: { paciente_id: number; examenes: any[]; total: number; fecha: string }) {
  const result = await executeLocal(
    "INSERT INTO facturas (paciente_id, examenes, total, fecha) VALUES ($1, $2, $3, $4)",
    [data.paciente_id, JSON.stringify(data.examenes), data.total, data.fecha]
  );

  // Agrupar parametros por categoria
  const catParams: Record<string, Set<string>> = {};
  for (const item of data.examenes) {
    if (!item.categoria) continue;
    const tipoExamen = tipoMap[item.categoria.toLowerCase()] || item.categoria;
    if (!catParams[tipoExamen]) catParams[tipoExamen] = new Set();
    
    if (Array.isArray(item.parametros)) {
      item.parametros.forEach((p: string) => catParams[tipoExamen].add(p));
    }
  }

  for (const [tipoExamen, paramsSet] of Object.entries(catParams)) {
    const paramsArray = Array.from(paramsSet);
    
    // Verificar si ya existe el examen para hoy
    const existing = await queryLocal(
      "SELECT id, resultados FROM examenes WHERE paciente_id = $1 AND tipo = $2 AND fecha = $3",
      [data.paciente_id, tipoExamen, data.fecha]
    );

    if (existing.length === 0) {
      await executeLocal(
        "INSERT INTO examenes (paciente_id, tipo, fecha, resultados, estado, uuid) VALUES ($1, $2, $3, $4, $5, $6)",
        [data.paciente_id, tipoExamen, data.fecha, JSON.stringify({ _highlightFields: paramsArray }), "pendiente", crypto.randomUUID()]
      );
    } else {
      // Fusionar parametros si el examen ya existe
      const ex = existing[0];
      const currentRes = typeof ex.resultados === 'string' ? JSON.parse(ex.resultados) : (ex.resultados || {});
      const currentHighlights = currentRes._highlightFields || [];
      const mergedHighlights = Array.from(new Set([...currentHighlights, ...paramsArray]));
      currentRes._highlightFields = mergedHighlights;

      await executeLocal(
        "UPDATE examenes SET resultados = $1 WHERE id = $2",
        [JSON.stringify(currentRes), ex.id]
      );
    }
  }

  return { id: result.lastInsertId };
}

export async function deleteFactura(id: number) {
  // 1. Obtener la factura para saber qué exámenes borrar
  const fRows = await queryLocal("SELECT * FROM facturas WHERE id = $1", [id]);
  if (fRows.length === 0) throw new Error("Factura no encontrada");
  const factura = fRows[0];
  const examenesFactura = typeof factura.examenes === 'string' ? JSON.parse(factura.examenes) : factura.examenes;
  
  // Extraer las categorías únicas usando el mapa
  const categoriasSet = new Set<string>();
  for (const item of examenesFactura) {
    if (item.categoria) {
      categoriasSet.add(tipoMap[item.categoria.toLowerCase()] || item.categoria);
    }
  }

  // 2. Verificar estado de todos los exámenes asociados
  const examsToDelete = [];
  for (const tipoExamen of categoriasSet) {
    const eRows = await queryLocal(
      "SELECT id, estado FROM examenes WHERE paciente_id = $1 AND tipo = $2 AND fecha = $3",
      [factura.paciente_id, tipoExamen, factura.fecha]
    );
    if (eRows.length > 0) {
      const ex = eRows[0];
      if (ex.estado !== 'pendiente') {
        // Bloquear eliminación
        throw new Error(`No se puede eliminar la factura porque el examen de ${tipoExamen} ya está en proceso o completado.`);
      }
      examsToDelete.push(ex.id);
    }
  }

  // 3. Si todo está pendiente, eliminar factura y los exámenes
  await executeLocal("DELETE FROM facturas WHERE id = $1", [id]);
  for (const exId of examsToDelete) {
    await executeLocal("DELETE FROM examenes WHERE id = $1", [exId]);
  }

  return { ok: true };
}

export async function updateFactura(id: number, data: { paciente_id: number; examenes: any[]; total: number; fecha: string }) {
  // 1. Obtener factura antigua
  const fRows = await queryLocal("SELECT * FROM facturas WHERE id = $1", [id]);
  if (fRows.length === 0) throw new Error("Factura no encontrada");
  const oldFactura = fRows[0];
  const oldExamenesList = typeof oldFactura.examenes === 'string' ? JSON.parse(oldFactura.examenes) : oldFactura.examenes;

  // 2. Actualizar la factura
  await executeLocal(
    "UPDATE facturas SET paciente_id = $1, examenes = $2, total = $3, fecha = $4 WHERE id = $5",
    [data.paciente_id, JSON.stringify(data.examenes), data.total, data.fecha, id]
  );

  // 3. Procesar las categorías y parámetros de la NUEVA factura
  const newCatParams: Record<string, Set<string>> = {};
  for (const item of data.examenes) {
    if (!item.categoria) continue;
    const tipoExamen = tipoMap[item.categoria.toLowerCase()] || item.categoria;
    if (!newCatParams[tipoExamen]) newCatParams[tipoExamen] = new Set();
    if (Array.isArray(item.parametros)) {
      item.parametros.forEach((p: string) => newCatParams[tipoExamen].add(p));
    }
  }

  // 4. Determinar qué categorías viejas ya no están
  const oldCatSet = new Set<string>();
  for (const item of oldExamenesList) {
    if (item.categoria) oldCatSet.add(tipoMap[item.categoria.toLowerCase()] || item.categoria);
  }

  for (const oldTipo of oldCatSet) {
    if (!newCatParams[oldTipo]) {
      // Categoría eliminada: borrar el examen si está pendiente
      const eRows = await queryLocal(
        "SELECT id, estado FROM examenes WHERE paciente_id = $1 AND tipo = $2 AND fecha = $3",
        [oldFactura.paciente_id, oldTipo, oldFactura.fecha]
      );
      if (eRows.length > 0 && eRows[0].estado === 'pendiente') {
        await executeLocal("DELETE FROM examenes WHERE id = $1", [eRows[0].id]);
      }
    }
  }

  // 5. Crear o actualizar las categorías nuevas/mantenidas
  for (const [tipoExamen, paramsSet] of Object.entries(newCatParams)) {
    const paramsArray = Array.from(paramsSet);
    
    const existing = await queryLocal(
      "SELECT id, resultados, estado FROM examenes WHERE paciente_id = $1 AND tipo = $2 AND fecha = $3",
      [data.paciente_id, tipoExamen, data.fecha]
    );

    if (existing.length === 0) {
      await executeLocal(
        "INSERT INTO examenes (paciente_id, tipo, fecha, resultados, estado, uuid) VALUES ($1, $2, $3, $4, $5, $6)",
        [data.paciente_id, tipoExamen, data.fecha, JSON.stringify({ _highlightFields: paramsArray }), "pendiente", crypto.randomUUID()]
      );
    } else {
      // Solo actualizamos highlight si está pendiente. Si ya está completado, no se le tocan los highlight fields 
      // (ya no se resalta nada porque ya está lleno, y no queremos romper el JSON).
      const ex = existing[0];
      if (ex.estado === 'pendiente') {
        const currentRes = typeof ex.resultados === 'string' ? JSON.parse(ex.resultados) : (ex.resultados || {});
        currentRes._highlightFields = paramsArray; // Sobreescribimos con los del nuevo carrito
        await executeLocal(
          "UPDATE examenes SET resultados = $1 WHERE id = $2",
          [JSON.stringify(currentRes), ex.id]
        );
      }
    }
  }

  return { id };
}

// ======================== EXAMENES ========================

export async function getExamenes() {
  const rows = await queryLocal(`
    SELECT e.*, p.nombre as paciente_nombre, p.cedula as paciente_cedula
    FROM examenes e 
    LEFT JOIN pacientes p ON e.paciente_id = p.id
    ORDER BY e.fecha DESC
  `);
  return rows.map((r: any) => ({
    ...r,
    resultados: typeof r.resultados === 'string' ? JSON.parse(r.resultados) : r.resultados,
  }));
}

export async function createExamen(data: { paciente_id: number; tipo: string; fecha: string; resultados?: any; estado: string; uuid?: string }) {
  const result = await executeLocal(
    "INSERT INTO examenes (paciente_id, tipo, fecha, resultados, estado, uuid) VALUES ($1, $2, $3, $4, $5, $6)",
    [data.paciente_id, data.tipo, data.fecha, data.resultados ? JSON.stringify(data.resultados) : null, data.estado, data.uuid || null]
  );
  return { id: result.lastInsertId };
}

export async function updateExamen(id: number, data: any) {
  const resultados = data.resultados ? JSON.stringify(data.resultados) : null;
  await executeLocal(
    "UPDATE examenes SET tipo = $1, fecha = $2, resultados = $3, estado = $4, uuid = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6",
    [data.tipo, data.fecha, resultados, data.estado, data.uuid || null, id]
  );
  return { id };
}

export async function deleteExamen(id: number) {
  await executeLocal("DELETE FROM examenes WHERE id = $1", [id]);
  return { ok: true };
}

// ======================== EXAMENES PREDEFINIDOS ========================

export async function getExamenesPredefinidos() {
  const rows = await queryLocal("SELECT * FROM examenes_predefinidos ORDER BY categoria, nombre");
  return rows.map((r: any) => ({
    ...r,
    parametros: typeof r.parametros === 'string' ? JSON.parse(r.parametros) : r.parametros,
  }));
}

export async function createExamenPredefinido(data: { nombre: string; precio: number; categoria?: string; parametros?: string[] }) {
  const result = await executeLocal(
    "INSERT INTO examenes_predefinidos (nombre, precio, categoria, parametros) VALUES ($1, $2, $3, $4)",
    [data.nombre, data.precio, data.categoria || null, data.parametros ? JSON.stringify(data.parametros) : null]
  );
  return { id: result.lastInsertId };
}

export async function updateExamenPredefinido(id: number, data: { nombre: string; precio: number; categoria?: string; parametros?: string[] }) {
  await executeLocal(
    "UPDATE examenes_predefinidos SET nombre = $1, precio = $2, categoria = $3, parametros = $4 WHERE id = $5",
    [data.nombre, data.precio, data.categoria || null, data.parametros ? JSON.stringify(data.parametros) : null, id]
  );
  return { id };
}

export async function deleteExamenPredefinido(id: number) {
  await executeLocal("DELETE FROM examenes_predefinidos WHERE id = $1", [id]);
  return { ok: true };
}

// ======================== VALORES DE REFERENCIA ========================

export async function getValoresReferencia(tipo: string) {
  const tableMap: Record<string, string> = {
    quimica: "quimica_valores_referencia",
    hematologia: "hematologia_valores_referencia",
    coagulacion: "coagulacion_valores_referencia",
    psa: "psa_valores_referencia",
  };
  
  const table = tableMap[tipo];
  if (!table) return [];
  return await queryLocal(`SELECT * FROM ${table} ORDER BY nombre_examen`);
}

export async function updateValoresReferencia(tipo: string, valores: any[]) {
  const tableMap: Record<string, string> = {
    quimica: "quimica_valores_referencia",
    hematologia: "hematologia_valores_referencia",
    coagulacion: "coagulacion_valores_referencia",
    psa: "psa_valores_referencia",
  };
  
  const table = tableMap[tipo];
  if (!table) return;
  for (const v of valores) {
    await executeLocal(
      `UPDATE ${table} SET valor_referencia = $1 WHERE id = $2`,
      [v.valor_referencia, v.id]
    );
  }
  return { ok: true };
}

// ======================== ESTADÍSTICAS ========================

export async function getEstadisticas() {
  const [pCount] = await queryLocal("SELECT COUNT(*) as total FROM pacientes");
  const [eCount] = await queryLocal("SELECT COUNT(*) as total FROM examenes");
  
  const today = getTodayDate();
  const [fToday] = await queryLocal("SELECT COUNT(*) as total FROM facturas WHERE fecha = $1", [today]);
  const distrib = await queryLocal(`
    SELECT tipo as name, COUNT(*) as value,
    SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes_tipo
    FROM examenes GROUP BY tipo
  `);
  const totalPendientes = distrib.reduce((acc: number, item: any) => acc + (item.pendientes_tipo || 0), 0);
  return {
    totalPacientes: pCount?.total || 0,
    totalExamenes: eCount?.total || 0,
    facturasHoy: fToday?.total || 0,
    pendientes: totalPendientes,
    distribucion: distrib,
  };
}

// ======================== EVOLUCIÓN PACIENTE ========================

export async function getEvolucionPaciente(pacienteId: number, tipo: string) {
  const rows = await queryLocal(
    "SELECT fecha, resultados FROM examenes WHERE paciente_id = $1 AND tipo = $2 AND estado = 'completado' ORDER BY fecha ASC",
    [pacienteId, tipo]
  );
  return rows.map((r: any) => ({
    ...r,
    resultados: typeof r.resultados === 'string' ? JSON.parse(r.resultados) : r.resultados,
  }));
}

// ======================== PLANTILLAS ========================

export async function getPlantillasBacteriologia() {
  return await queryLocal("SELECT * FROM plantillas_bacteriologia ORDER BY nombre_plantilla");
}

export async function createPlantillaBacteriologia(data: any) {
  const result = await executeLocal(
    `INSERT INTO plantillas_bacteriologia (nombre_plantilla, muestra_default, observacion_directa, tincion_gram, recuento_colonias, cultivo, cultivo_hongos)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [data.nombre_plantilla, data.muestra_default || null, data.observacion_directa || null, data.tincion_gram || null, data.recuento_colonias || null, data.cultivo || null, data.cultivo_hongos || null]
  );
  return { id: result.lastInsertId };
}

export async function updatePlantillaBacteriologia(id: number, data: any) {
  await executeLocal(
    `UPDATE plantillas_bacteriologia SET nombre_plantilla=$1, muestra_default=$2, observacion_directa=$3, tincion_gram=$4, recuento_colonias=$5, cultivo=$6, cultivo_hongos=$7 WHERE id=$8`,
    [data.nombre_plantilla, data.muestra_default || null, data.observacion_directa || null, data.tincion_gram || null, data.recuento_colonias || null, data.cultivo || null, data.cultivo_hongos || null, id]
  );
  return { id };
}

export async function deletePlantillaBacteriologia(id: number) {
  await executeLocal("DELETE FROM plantillas_bacteriologia WHERE id = $1", [id]);
  return { ok: true };
}

export async function getPlantillasMiscelaneos() {
  return await queryLocal("SELECT * FROM plantillas_miscelaneos ORDER BY nombre_examen");
}

export async function createPlantillaMiscelaneos(data: any) {
  const result = await executeLocal(
    `INSERT INTO plantillas_miscelaneos (nombre_examen, metodo, muestra, contenido_plantilla)
     VALUES ($1, $2, $3, $4)`,
    [data.nombre_examen, data.metodo || null, data.muestra || null, data.contenido_plantilla || null]
  );
  return { id: result.lastInsertId };
}

export async function updatePlantillaMiscelaneos(id: number, data: any) {
  await executeLocal(
    `UPDATE plantillas_miscelaneos SET nombre_examen=$1, metodo=$2, muestra=$3, contenido_plantilla=$4 WHERE id=$5`,
    [data.nombre_examen, data.metodo || null, data.muestra || null, data.contenido_plantilla || null, id]
  );
  return { id };
}

export async function deletePlantillaMiscelaneos(id: number) {
  await executeLocal("DELETE FROM plantillas_miscelaneos WHERE id = $1", [id]);
  return { ok: true };
}

export async function getExamenesByPacienteId(pacienteId: number) {
  const rows = await queryLocal(
    "SELECT * FROM examenes WHERE paciente_id = $1 ORDER BY fecha DESC",
    [pacienteId]
  );
  return rows.map((r: any) => ({
    ...r,
    resultados: typeof r.resultados === 'string' ? JSON.parse(r.resultados) : r.resultados,
  }));
}
