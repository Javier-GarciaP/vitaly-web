import Database from "@tauri-apps/plugin-sql";

let db: Database | null = null;

// Detectar si estamos en Tauri o en el navegador
const isTauri = () => typeof window !== "undefined" && !!(window as any).__TAURI_INTERNALS__;

export async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load("sqlite:vitaly.db");
  }
  return db;
}

export async function initLocalDb(): Promise<void> {
  if (!isTauri()) {
    console.log("[LocalDB] No es Tauri, saltando inicialización SQLite.");
    return;
  }

  const database = await getDb();

  // Crear todas las tablas si no existen
  await database.execute(`
    CREATE TABLE IF NOT EXISTS pacientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cedula TEXT NOT NULL UNIQUE,
      nombre TEXT NOT NULL,
      edad TEXT,
      sexo TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS facturas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paciente_id INTEGER NOT NULL,
      examenes TEXT NOT NULL,
      total REAL NOT NULL,
      fecha DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS examenes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paciente_id INTEGER NOT NULL,
      tipo TEXT NOT NULL,
      fecha DATE NOT NULL,
      resultados TEXT,
      estado TEXT NOT NULL,
      uuid TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS examenes_predefinidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      precio REAL NOT NULL,
      categoria TEXT,
      parametros TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS plantillas_bacteriologia (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre_plantilla TEXT,
      muestra_default TEXT,
      observacion_directa TEXT,
      tincion_gram TEXT,
      recuento_colonias TEXT,
      cultivo TEXT,
      cultivo_hongos TEXT
    );
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS plantillas_miscelaneos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre_examen TEXT NOT NULL,
      metodo TEXT,
      muestra TEXT,
      contenido_plantilla TEXT,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      usuario_id INTEGER
    );
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS quimica_valores_referencia (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre_examen TEXT NOT NULL UNIQUE,
      valor_referencia TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS hematologia_valores_referencia (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre_examen TEXT NOT NULL UNIQUE,
      valor_referencia TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS coagulacion_valores_referencia (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre_examen TEXT NOT NULL UNIQUE,
      valor_referencia TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await database.execute(`
    CREATE TABLE IF NOT EXISTS psa_valores_referencia (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre_examen TEXT NOT NULL UNIQUE,
      valor_referencia TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("[LocalDB] ✅ Todas las tablas creadas/verificadas correctamente.");
}

// ========== FUNCIONES CRUD GENÉRICAS ==========

export async function queryLocal<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  if (!isTauri()) {
    // Fallback: hacer fetch a Cloudflare directamente
    throw new Error("SQLite no disponible fuera de Tauri");
  }
  const database = await getDb();
  return await database.select<T[]>(sql, params);
}

export async function executeLocal(sql: string, params: any[] = []): Promise<{ rowsAffected: number; lastInsertId: number }> {
  if (!isTauri()) {
    throw new Error("SQLite no disponible fuera de Tauri");
  }
  const database = await getDb();
  const result = await database.execute(sql, params);
  return { rowsAffected: result.rowsAffected, lastInsertId: result.lastInsertId || 0 };
}
