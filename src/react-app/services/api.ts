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

export async function createFactura(data: { paciente_id: number; examenes: any[]; total: number; fecha: string; categorias?: string[] }) {
  const result = await executeLocal(
    "INSERT INTO facturas (paciente_id, examenes, total, fecha) VALUES ($1, $2, $3, $4)",
    [data.paciente_id, JSON.stringify(data.examenes), data.total, data.fecha]
  );

  // Auto-create examen records per unique category so they appear in PanelMaestro
  const categorias = data.categorias && data.categorias.length > 0
    ? data.categorias
    : [...new Set(data.examenes.map((e: any) => e.categoria).filter(Boolean))];

  for (const categoria of categorias) {
    // Map categoria name to the PanelMaestro examen tipo names
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

    const tipoExamen = tipoMap[categoria.toLowerCase()] || categoria;

    // Check if an examen of this type already exists today for this patient
    const existing = await queryLocal(
      "SELECT id FROM examenes WHERE paciente_id = $1 AND tipo = $2 AND fecha = $3",
      [data.paciente_id, tipoExamen, data.fecha]
    );

    if (existing.length === 0) {
      await executeLocal(
        "INSERT INTO examenes (paciente_id, tipo, fecha, resultados, estado, uuid) VALUES ($1, $2, $3, $4, $5, $6)",
        [data.paciente_id, tipoExamen, data.fecha, JSON.stringify({}), "pendiente", crypto.randomUUID()]
      );
    }
  }

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
