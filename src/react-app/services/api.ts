/**
 * api.ts - Capa de abstracción de datos
 * 
 * App 100% Desktop (Tauri): USA EXCLUSIVAMENTE SQLITE LOCAL
 */
import { queryLocal, executeLocal } from "./localDb";

// ======================== PACIENTES ========================

export async function getPacientes() {
  return await queryLocal("SELECT * FROM pacientes ORDER BY nombre ASC");
}

export async function createPaciente(data: { cedula: string; nombre: string; edad?: string; sexo?: string }) {
  const result = await executeLocal(
    "INSERT INTO pacientes (cedula, nombre, edad, sexo) VALUES ($1, $2, $3, $4)",
    [data.cedula, data.nombre, data.edad || null, data.sexo || null]
  );
  return { id: result.lastInsertId, ...data };
}

export async function updatePaciente(id: number, data: { cedula: string; nombre: string; edad?: string; sexo?: string }) {
  await executeLocal(
    "UPDATE pacientes SET cedula = $1, nombre = $2, edad = $3, sexo = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5",
    [data.cedula, data.nombre, data.edad || null, data.sexo || null, id]
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

export async function createFactura(data: { paciente_id: number; examenes: any[]; total: number; fecha: string; categorias?: string[] }) {
  const result = await executeLocal(
    "INSERT INTO facturas (paciente_id, examenes, total, fecha) VALUES ($1, $2, $3, $4)",
    [data.paciente_id, JSON.stringify(data.examenes), data.total, data.fecha]
  );
  return { id: result.lastInsertId };
}

export async function deleteFactura(id: number) {
  await executeLocal("DELETE FROM facturas WHERE id = $1", [id]);
  return { ok: true };
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
  const [fToday] = await queryLocal("SELECT COUNT(*) as total FROM facturas WHERE date(fecha) = date('now')");
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

export async function getPlantillasMiscelaneos() {
  return await queryLocal("SELECT * FROM plantillas_miscelaneos ORDER BY nombre_examen");
}
