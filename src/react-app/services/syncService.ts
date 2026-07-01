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

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }

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
      if (!p) continue;
      try {
        await executeLocal(
          `INSERT OR REPLACE INTO pacientes (id, cedula, nombre, edad, sexo, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [p.id, p.cedula || `S/I-${p.id || Date.now()}`, p.nombre || "SIN NOMBRE", p.edad || null, p.sexo || null, p.created_at || new Date().toISOString()]
        );
        pulled++;
      } catch (e: any) {
        errors.push(`Paciente ${p.nombre || 'Desconocido'}: ${e.message}`);
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
      if (!f) continue;
      try {
        const examenesStr = typeof f.examenes === 'string' ? f.examenes : JSON.stringify(f.examenes || []);
        await executeLocal(
          `INSERT OR REPLACE INTO facturas (id, paciente_id, examenes, total, fecha, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [f.id, f.paciente_id || 0, examenesStr, f.total || 0, f.fecha || new Date().toISOString().split('T')[0], f.created_at || new Date().toISOString()]
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
      if (!ex) continue;
      try {
        const resultadosStr = typeof ex.resultados === 'string' ? ex.resultados : JSON.stringify(ex.resultados || {});
        await executeLocal(
          `INSERT OR REPLACE INTO examenes (id, paciente_id, tipo, fecha, resultados, estado, uuid, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [ex.id, ex.paciente_id || 0, ex.tipo || 'Desconocido', ex.fecha || new Date().toISOString().split('T')[0], resultadosStr, ex.estado || 'pendiente', ex.uuid || null, ex.created_at || new Date().toISOString()]
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
      if (!ep) continue;
      try {
        const paramsStr = typeof ep.parametros === 'string' ? ep.parametros : (ep.parametros ? JSON.stringify(ep.parametros) : null);
        await executeLocal(
          `INSERT OR REPLACE INTO examenes_predefinidos (id, nombre, precio, categoria, parametros)
           VALUES ($1, $2, $3, $4, $5)`,
          [ep.id, ep.nombre || 'Sin Nombre', ep.precio || 0, ep.categoria || null, paramsStr]
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
    { api: "/api/valores-referencia?tabla=quimica", table: "quimica_valores_referencia" },
    { api: "/api/valores-referencia?tabla=hematologia", table: "hematologia_valores_referencia" },
    { api: "/api/valores-referencia?tabla=coagulacion", table: "coagulacion_valores_referencia" },
    { api: "/api/valores-referencia?tabla=psa", table: "psa_valores_referencia" },
  ];

  for (const ref of refTables) {
    try {
      const res = await cloudFetch(ref.api);
      const valores = await res.json() as any[];
      for (const v of valores) {
        if (!v) continue;
        try {
          await executeLocal(
            `INSERT OR REPLACE INTO ${ref.table} (id, nombre_examen, valor_referencia)
             VALUES ($1, $2, $3)`,
            [v.id, v.nombre_examen || 'Desconocido', v.valor_referencia || '']
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

  // --- PRE-FETCH DE NUBE (Optimización N+1) ---
  const cloudPacientesMap = new Map<string, any>();
  const cloudFacturasMap = new Map<number, any>();
  const cloudExamenesMap = new Map<string, any>(); // UUID -> Examen
  const cloudExamenesIdMap = new Map<number, any>(); // ID -> Examen (fallback si no hay uuid)
  
  // Maps para tablas auxiliares
  const cloudPredefinidosMap = new Map<number, any>();
  const cloudPlantillasBactMap = new Map<number, any>();
  const cloudPlantillasMiscMap = new Map<number, any>();
  const cloudValoresRefMap = new Map<string, Map<number, any>>();

  try {
    // Hacemos las peticiones de forma secuencial para evitar bloqueos por DDoS/Rate Limit de Cloudflare
    const resPacientes = await cloudFetch("/api/pacientes");
    const cps = await resPacientes.json() as any[];
    cps.forEach(cp => {
      if (cp.cedula) cloudPacientesMap.set(cp.cedula, cp);
    });

    const resFacturas = await cloudFetch("/api/facturas");
    const cfs = await resFacturas.json() as any[];
    cfs.forEach(cf => cloudFacturasMap.set(cf.id, cf));

    const resExamenes = await cloudFetch("/api/examenes");
    const cxs = await resExamenes.json() as any[];
    cxs.forEach(cx => {
      if (cx.uuid) cloudExamenesMap.set(cx.uuid, cx);
      cloudExamenesIdMap.set(cx.id, cx);
    });
    
    // Tablas auxiliares (pueden fallar si los endpoints no están implementados, lo ignoramos)
    try {
      const resPred = await cloudFetch("/api/examenes-predefinidos");
      const cPred = await resPred.json() as any[];
      cPred.forEach(cp => cloudPredefinidosMap.set(cp.id, cp));
    } catch(e) {}
    
    try {
      const resPB = await cloudFetch("/api/plantillas/bacteriologia");
      const cPB = await resPB.json() as any[];
      cPB.forEach(cp => cloudPlantillasBactMap.set(cp.id, cp));
    } catch(e) {}
    
    try {
      const resPM = await cloudFetch("/api/plantillas/miscelaneos");
      const cPM = await resPM.json() as any[];
      cPM.forEach(cp => cloudPlantillasMiscMap.set(cp.id, cp));
    } catch(e) {}
    
    const refTablesNames = ["quimica", "hematologia", "coagulacion", "psa"];
    for (const rt of refTablesNames) {
      try {
        const resVR = await cloudFetch(`/api/valores-referencia?tabla=${rt}`);
        const cVR = await resVR.json() as any[];
        const map = new Map<number, any>();
        cVR.forEach(cv => map.set(cv.id, cv));
        cloudValoresRefMap.set(rt, map);
      } catch(e) {}
    }

  } catch (e: any) {
    // Si la pre-carga principal falla, abortamos
    errors.push(`Error conectando con la nube: ${e.message}`);
    return { pushed: 0, errors };
  }

  // --- PACIENTES ---
  try {
    const localPacientes = await queryLocal("SELECT * FROM pacientes");
    for (const p of localPacientes) {
      try {
        const exists = cloudPacientesMap.get(p.cedula);

        if (exists) {
          await cloudFetch(`/api/pacientes/${exists.id}`, {
            method: "PUT",
            body: JSON.stringify({ id: p.id, cedula: p.cedula, nombre: p.nombre, edad: p.edad, sexo: p.sexo, created_at: p.created_at }),
          });
        } else {
          await cloudFetch("/api/pacientes", {
            method: "POST",
            body: JSON.stringify({ id: p.id, cedula: p.cedula, nombre: p.nombre, edad: p.edad, sexo: p.sexo, created_at: p.created_at }),
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
        const exists = cloudFacturasMap.get(f.id);

        if (exists) {
          await cloudFetch(`/api/facturas/${exists.id}`, {
            method: "PUT",
            body: JSON.stringify({
              id: f.id,
              paciente_id: f.paciente_id,
              examenes,
              total: f.total,
              fecha: f.fecha,
              created_at: f.created_at,
            }),
          });
        } else {
          await cloudFetch("/api/facturas", {
            method: "POST",
            body: JSON.stringify({
              id: f.id,
              paciente_id: f.paciente_id,
              examenes,
              total: f.total,
              fecha: f.fecha,
              created_at: f.created_at,
            }),
          });
        }
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
        let exists = null;
        if (ex.uuid) {
          exists = cloudExamenesMap.get(ex.uuid);
        }
        if (!exists) {
          exists = cloudExamenesIdMap.get(ex.id);
        }

        if (exists) {
          await cloudFetch(`/api/examenes/${exists.id}`, {
            method: "PUT",
            body: JSON.stringify({
              id: ex.id,
              paciente_id: ex.paciente_id,
              tipo: ex.tipo,
              fecha: ex.fecha,
              resultados,
              estado: ex.estado,
              uuid: ex.uuid,
              created_at: ex.created_at,
            }),
          });
        } else {
          await cloudFetch("/api/examenes", {
            method: "POST",
            body: JSON.stringify({
              id: ex.id,
              paciente_id: ex.paciente_id,
              tipo: ex.tipo,
              fecha: ex.fecha,
              resultados,
              estado: ex.estado,
              uuid: ex.uuid,
              created_at: ex.created_at,
            }),
          });
        }
        pushed++;
      } catch (e: any) {
        errors.push(`Push examen #${ex.id}: ${e.message}`);
      }
    }
  } catch (e: any) {
    errors.push(`Error subiendo examenes: ${e.message}`);
  }

  // --- EXAMENES PREDEFINIDOS ---
  try {
    const localPred = await queryLocal("SELECT * FROM examenes_predefinidos");
    for (const p of localPred) {
      try {
        const params = typeof p.parametros === 'string' ? JSON.parse(p.parametros) : p.parametros;
        const exists = cloudPredefinidosMap.get(p.id);
        if (exists) {
          await cloudFetch(`/api/examenes-predefinidos/${exists.id}`, {
            method: "PUT",
            body: JSON.stringify({ nombre: p.nombre, precio: p.precio, categoria: p.categoria, parametros: params }),
          });
        } else {
          await cloudFetch("/api/examenes-predefinidos", {
            method: "POST",
            body: JSON.stringify({ nombre: p.nombre, precio: p.precio, categoria: p.categoria, parametros: params }),
          });
        }
        pushed++;
      } catch (e: any) {
        errors.push(`Push examen predefinido ${p.nombre}: ${e.message}`);
      }
    }
  } catch (e: any) {
    errors.push(`Error subiendo examenes predefinidos: ${e.message}`);
  }

  // --- PLANTILLAS BACTERIOLOGIA ---
  try {
    const localBact = await queryLocal("SELECT * FROM plantillas_bacteriologia");
    for (const b of localBact) {
      try {
        const exists = cloudPlantillasBactMap.get(b.id);
        if (exists) {
          await cloudFetch(`/api/plantillas/bacteriologia/${exists.id}`, {
            method: "PUT",
            body: JSON.stringify(b),
          });
        } else {
          await cloudFetch("/api/plantillas/bacteriologia", {
            method: "POST",
            body: JSON.stringify(b),
          });
        }
        pushed++;
      } catch (e: any) {
        errors.push(`Push plantilla bacteriologia ${b.nombre_plantilla}: ${e.message}`);
      }
    }
  } catch (e: any) {
    errors.push(`Error subiendo plantillas bacteriologia: ${e.message}`);
  }

  // --- PLANTILLAS MISCELANEOS ---
  try {
    const localMisc = await queryLocal("SELECT * FROM plantillas_miscelaneos");
    for (const m of localMisc) {
      try {
        const exists = cloudPlantillasMiscMap.get(m.id);
        if (exists) {
          await cloudFetch(`/api/plantillas/miscelaneos/${exists.id}`, {
            method: "PUT",
            body: JSON.stringify(m),
          });
        } else {
          await cloudFetch("/api/plantillas/miscelaneos", {
            method: "POST",
            body: JSON.stringify(m),
          });
        }
        pushed++;
      } catch (e: any) {
        errors.push(`Push plantilla miscelaneos ${m.nombre_examen}: ${e.message}`);
      }
    }
  } catch (e: any) {
    errors.push(`Error subiendo plantillas miscelaneos: ${e.message}`);
  }

  // --- VALORES DE REFERENCIA (BULK UPDATE POR TABLA) ---
  const refTablesNames = [
    { name: "quimica", local: "quimica_valores_referencia" },
    { name: "hematologia", local: "hematologia_valores_referencia" },
    { name: "coagulacion", local: "coagulacion_valores_referencia" },
    { name: "psa", local: "psa_valores_referencia" }
  ];
  
  for (const ref of refTablesNames) {
    try {
      const localRefs = await queryLocal(`SELECT * FROM ${ref.local}`);
      if (localRefs.length > 0) {
        await cloudFetch(`/api/valores-referencia?tabla=${ref.name}`, {
          method: "PUT",
          body: JSON.stringify({ valores: localRefs }),
        });
        pushed += localRefs.length;
      }
    } catch (e: any) {
      errors.push(`Error subiendo ${ref.local}: ${e.message}`);
    }
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
