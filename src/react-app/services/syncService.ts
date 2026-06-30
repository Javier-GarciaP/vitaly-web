import { queryLocal, executeLocal } from "./localDb";

// Obtener la URL del worker de Cloudflare
function getWorkerUrl(): string {
  return localStorage.getItem("WORKER_URL") || "";
}

function getApiKey(): string {
  return "vitaly-super-secret-key";
}

async function cloudFetch(path: string, options?: RequestInit) {
  const workerUrl = getWorkerUrl();
  if (!workerUrl) throw new Error("No hay URL de Worker configurada");
  
  const res = await fetch(workerUrl + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": getApiKey(),
      ...(options?.headers || {}),
    },
  });
  return res;
}

// ========== PULL: Descargar datos de la nube a SQLite local ==========

export async function pullFromCloud(): Promise<{ pulled: number; errors: string[] }> {
  let pulled = 0;
  const errors: string[] = [];

  // --- PACIENTES ---
  try {
    const res = await cloudFetch("/api/pacientes");
    const pacientes = await res.json() as any[];
    for (const p of pacientes) {
      try {
        await executeLocal(
          `INSERT OR REPLACE INTO pacientes (id, cedula, nombre, edad, sexo, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [p.id, p.cedula, p.nombre, p.edad || null, p.sexo || null, p.created_at || new Date().toISOString()]
        );
        pulled++;
      } catch (e: any) {
        errors.push(`Paciente ${p.nombre}: ${e.message}`);
      }
    }
  } catch (e: any) {
    errors.push(`Error descargando pacientes: ${e.message}`);
  }

  // --- FACTURAS ---
  try {
    const res = await cloudFetch("/api/facturas");
    const facturas = await res.json() as any[];
    for (const f of facturas) {
      try {
        const examenesStr = typeof f.examenes === 'string' ? f.examenes : JSON.stringify(f.examenes);
        await executeLocal(
          `INSERT OR REPLACE INTO facturas (id, paciente_id, examenes, total, fecha, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [f.id, f.paciente_id, examenesStr, f.total, f.fecha, f.created_at || new Date().toISOString()]
        );
        pulled++;
      } catch (e: any) {
        errors.push(`Factura #${f.id}: ${e.message}`);
      }
    }
  } catch (e: any) {
    errors.push(`Error descargando facturas: ${e.message}`);
  }

  // --- EXAMENES ---
  try {
    const res = await cloudFetch("/api/examenes");
    const examenes = await res.json() as any[];
    for (const ex of examenes) {
      try {
        const resultadosStr = typeof ex.resultados === 'string' ? ex.resultados : JSON.stringify(ex.resultados);
        await executeLocal(
          `INSERT OR REPLACE INTO examenes (id, paciente_id, tipo, fecha, resultados, estado, uuid, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [ex.id, ex.paciente_id, ex.tipo, ex.fecha, resultadosStr, ex.estado, ex.uuid || null, ex.created_at || new Date().toISOString()]
        );
        pulled++;
      } catch (e: any) {
        errors.push(`Examen #${ex.id}: ${e.message}`);
      }
    }
  } catch (e: any) {
    errors.push(`Error descargando examenes: ${e.message}`);
  }

  // --- EXAMENES PREDEFINIDOS ---
  try {
    const res = await cloudFetch("/api/examenes-predefinidos");
    const predefinidos = await res.json() as any[];
    for (const ep of predefinidos) {
      try {
        const paramsStr = typeof ep.parametros === 'string' ? ep.parametros : (ep.parametros ? JSON.stringify(ep.parametros) : null);
        await executeLocal(
          `INSERT OR REPLACE INTO examenes_predefinidos (id, nombre, precio, categoria, parametros)
           VALUES ($1, $2, $3, $4, $5)`,
          [ep.id, ep.nombre, ep.precio, ep.categoria || null, paramsStr]
        );
        pulled++;
      } catch (e: any) {
        errors.push(`Examen predefinido ${ep.nombre}: ${e.message}`);
      }
    }
  } catch (e: any) {
    errors.push(`Error descargando examenes predefinidos: ${e.message}`);
  }

  // --- VALORES DE REFERENCIA ---
  const refTables = [
    { api: "/api/valores-referencia/quimica", table: "quimica_valores_referencia" },
    { api: "/api/valores-referencia/hematologia", table: "hematologia_valores_referencia" },
    { api: "/api/valores-referencia/coagulacion", table: "coagulacion_valores_referencia" },
    { api: "/api/valores-referencia/psa", table: "psa_valores_referencia" },
  ];

  for (const ref of refTables) {
    try {
      const res = await cloudFetch(ref.api);
      const valores = await res.json() as any[];
      for (const v of valores) {
        try {
          await executeLocal(
            `INSERT OR REPLACE INTO ${ref.table} (id, nombre_examen, valor_referencia)
             VALUES ($1, $2, $3)`,
            [v.id, v.nombre_examen, v.valor_referencia]
          );
          pulled++;
        } catch (e: any) {
          errors.push(`${ref.table} ${v.nombre_examen}: ${e.message}`);
        }
      }
    } catch (e: any) {
      errors.push(`Error descargando ${ref.table}: ${e.message}`);
    }
  }

  return { pulled, errors };
}

// ========== PUSH: Subir datos locales a la nube ==========

export async function pushToCloud(): Promise<{ pushed: number; errors: string[] }> {
  let pushed = 0;
  const errors: string[] = [];

  // --- PACIENTES ---
  try {
    const localPacientes = await queryLocal("SELECT * FROM pacientes");
    for (const p of localPacientes) {
      try {
        // Try to update first, then create if 404
        const resCheck = await cloudFetch(`/api/pacientes`);
        const cloudPacientes = await resCheck.json() as any[];
        const exists = cloudPacientes.find((cp: any) => cp.cedula === p.cedula);
        
        if (exists) {
          await cloudFetch(`/api/pacientes/${exists.id}`, {
            method: "PUT",
            body: JSON.stringify({ cedula: p.cedula, nombre: p.nombre, edad: p.edad, sexo: p.sexo }),
          });
        } else {
          await cloudFetch("/api/pacientes", {
            method: "POST",
            body: JSON.stringify({ cedula: p.cedula, nombre: p.nombre, edad: p.edad, sexo: p.sexo }),
          });
        }
        pushed++;
      } catch (e: any) {
        errors.push(`Push paciente ${p.nombre}: ${e.message}`);
      }
    }
  } catch (e: any) {
    errors.push(`Error subiendo pacientes: ${e.message}`);
  }

  // --- FACTURAS ---
  try {
    const localFacturas = await queryLocal("SELECT * FROM facturas");
    for (const f of localFacturas) {
      try {
        const examenes = typeof f.examenes === 'string' ? JSON.parse(f.examenes) : f.examenes;
        await cloudFetch("/api/facturas", {
          method: "POST",
          body: JSON.stringify({
            paciente_id: f.paciente_id,
            examenes,
            total: f.total,
            fecha: f.fecha,
          }),
        });
        pushed++;
      } catch (e: any) {
        errors.push(`Push factura #${f.id}: ${e.message}`);
      }
    }
  } catch (e: any) {
    errors.push(`Error subiendo facturas: ${e.message}`);
  }

  // --- EXAMENES ---
  try {
    const localExamenes = await queryLocal("SELECT * FROM examenes");
    for (const ex of localExamenes) {
      try {
        const resultados = typeof ex.resultados === 'string' ? JSON.parse(ex.resultados) : ex.resultados;
        await cloudFetch("/api/examenes", {
          method: "POST",
          body: JSON.stringify({
            paciente_id: ex.paciente_id,
            tipo: ex.tipo,
            fecha: ex.fecha,
            resultados,
            estado: ex.estado,
            uuid: ex.uuid,
          }),
        });
        pushed++;
      } catch (e: any) {
        errors.push(`Push examen #${ex.id}: ${e.message}`);
      }
    }
  } catch (e: any) {
    errors.push(`Error subiendo examenes: ${e.message}`);
  }

  return { pushed, errors };
}

// ========== SYNC COMPLETO ==========

export async function fullSync(): Promise<{ pulled: number; pushed: number; errors: string[] }> {
  // Primero push (subir cambios locales)
  const pushResult = await pushToCloud();
  // Luego pull (descargar todo de la nube)
  const pullResult = await pullFromCloud();
  
  return {
    pulled: pullResult.pulled,
    pushed: pushResult.pushed,
    errors: [...pushResult.errors, ...pullResult.errors],
  };
}
