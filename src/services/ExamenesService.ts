import DatabaseService from './db/database';

export interface Examen {
    id?: number;
    paciente_id: number;
    tipo: string;
    fecha: string;
    resultados?: any; // JSON object or string
    estado: 'pendiente' | 'en_proceso' | 'completado';
    uuid?: string;
    created_at?: string;
    updated_at?: string;
    // Joins
    paciente_nombre?: string;
    paciente_cedula?: string;
    paciente_edad?: string;
}

export interface ExamenPredefinido {
    id: number;
    nombre: string;
    precio: number;
    categoria?: string;
    parametros?: string[]; // Array of strings
}

class ExamenesService {
    // --- EXAMENES (Ordenes) ---

    static async getAll(search?: string, pacienteId?: number): Promise<Examen[]> {
        const db = await DatabaseService.getDB();
        let query = `
      SELECT e.*, p.nombre as paciente_nombre, p.cedula as paciente_cedula, p.edad as paciente_edad 
      FROM examenes e 
      JOIN pacientes p ON e.paciente_id = p.id
    `;
        const params: any[] = [];

        if (pacienteId) {
            query += ` WHERE e.paciente_id = ? ORDER BY e.fecha DESC`;
            params.push(pacienteId);
        } else if (search) {
            query += ` WHERE p.nombre LIKE ? OR p.cedula LIKE ? ORDER BY e.fecha DESC`;
            params.push(`%${search}%`, `%${search}%`);
        } else {
            query += ` ORDER BY e.fecha DESC`;
        }

        const results = await db.select<any[]>(query, params);

        return results.map(e => ({
            ...e,
            resultados: e.resultados ? JSON.parse(e.resultados) : null
        }));
    }

    static async getById(id: number): Promise<Examen | null> {
        const db = await DatabaseService.getDB();
        const result = await db.select<any[]>(
            `SELECT e.*, p.nombre as paciente_nombre, p.cedula as paciente_cedula 
       FROM examenes e 
       JOIN pacientes p ON e.paciente_id = p.id 
       WHERE e.id = ?`,
            [id]
        );

        if (result.length === 0) return null;

        const e = result[0];
        return {
            ...e,
            resultados: e.resultados ? JSON.parse(e.resultados) : null
        };
    }

    static async create(examen: Omit<Examen, 'id' | 'created_at' | 'updated_at' | 'paciente_nombre' | 'paciente_cedula' | 'paciente_edad'>): Promise<number> {
        const db = await DatabaseService.getDB();

        const uuid = examen.uuid || crypto.randomUUID();
        const resultadosStr = examen.resultados ? JSON.stringify(examen.resultados) : null;

        const result = await db.execute(
            'INSERT INTO examenes (paciente_id, tipo, fecha, resultados, estado, uuid) VALUES (?, ?, ?, ?, ?, ?)',
            [examen.paciente_id, examen.tipo, examen.fecha, resultadosStr, examen.estado, uuid]
        );

        return result.lastInsertId!;
    }

    static async update(id: number, examen: Partial<Examen>): Promise<void> {
        const db = await DatabaseService.getDB();

        const fields: string[] = [];
        const values: any[] = [];

        if (examen.paciente_id !== undefined) { fields.push('paciente_id = ?'); values.push(examen.paciente_id); }
        if (examen.tipo !== undefined) { fields.push('tipo = ?'); values.push(examen.tipo); }
        if (examen.fecha !== undefined) { fields.push('fecha = ?'); values.push(examen.fecha); }
        if (examen.resultados !== undefined) {
            fields.push('resultados = ?');
            values.push(JSON.stringify(examen.resultados));
        }
        if (examen.estado !== undefined) { fields.push('estado = ?'); values.push(examen.estado); }

        if (fields.length === 0) return;

        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        await db.execute(
            `UPDATE examenes SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
    }

    static async delete(id: number): Promise<void> {
        const db = await DatabaseService.getDB();
        await db.execute('DELETE FROM examenes WHERE id = ?', [id]);
    }

    static async getByUuid(uuid: string): Promise<Examen | null> {
        if (!DatabaseService.isTauri()) {
            // En la web (paciente scannning QR), usamos el endpoint público que no requiere Token
            const settings = JSON.parse(localStorage.getItem('vitaly-settings') || '{}');
            const apiUrl = settings.apiUrl || 'https://vitaly-worker-pro.javi-garcia.workers.dev';

            const res = await fetch(`${apiUrl}/api/public/examen/${uuid}`);
            if (!res.ok) return null;
            return await res.json();
        }

        const db = await DatabaseService.getDB();
        const result = await db.select<any[]>(
            `SELECT e.*, p.nombre as paciente_nombre, p.cedula as paciente_cedula
       FROM examenes e JOIN pacientes p ON e.paciente_id = p.id WHERE e.uuid = ?`,
            [uuid]
        );

        if (result.length === 0) return null;

        const e = result[0];
        return {
            ...e,
            resultados: e.resultados ? JSON.parse(e.resultados) : null
        };
    }

    // --- EXAMENES PREDEFINIDOS ---

    static async getPredefinidos(): Promise<ExamenPredefinido[]> {
        const db = await DatabaseService.getDB();
        const results = await db.select<any[]>('SELECT * FROM examenes_predefinidos ORDER BY nombre ASC');
        return results.map(e => ({
            ...e,
            parametros: (typeof e.parametros === 'string') ? JSON.parse(e.parametros) : (e.parametros || [])
        }));
    }

    static async getPredefinidoById(id: number): Promise<ExamenPredefinido | null> {
        const db = await DatabaseService.getDB();
        const result = await db.select<any[]>('SELECT * FROM examenes_predefinidos WHERE id = ?', [id]);
        if (result.length === 0) return null;
        const e = result[0];
        return {
            ...e,
            parametros: e.parametros ? JSON.parse(e.parametros) : []
        };
    }

    static async createPredefinido(examen: Omit<ExamenPredefinido, 'id'>): Promise<number> {
        const db = await DatabaseService.getDB();
        const paramsStr = examen.parametros ? JSON.stringify(examen.parametros) : null;
        const result = await db.execute(
            'INSERT INTO examenes_predefinidos (nombre, precio, categoria, parametros) VALUES (?, ?, ?, ?)',
            [examen.nombre, examen.precio, examen.categoria, paramsStr]
        );
        return result.lastInsertId!;
    }

    static async updatePredefinido(id: number, examen: Partial<ExamenPredefinido>): Promise<void> {
        const db = await DatabaseService.getDB();
        const fields: string[] = [];
        const values: any[] = [];

        if (examen.nombre !== undefined) { fields.push('nombre = ?'); values.push(examen.nombre); }
        if (examen.precio !== undefined) { fields.push('precio = ?'); values.push(examen.precio); }
        if (examen.categoria !== undefined) { fields.push('categoria = ?'); values.push(examen.categoria); }
        if (examen.parametros !== undefined) {
            fields.push('parametros = ?');
            values.push(JSON.stringify(examen.parametros));
        }

        if (fields.length === 0) return;
        values.push(id);

        await db.execute(`UPDATE examenes_predefinidos SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    static async deletePredefinido(id: number): Promise<void> {
        const db = await DatabaseService.getDB();
        await db.execute('DELETE FROM examenes_predefinidos WHERE id = ?', [id]);
    }
}

export default ExamenesService;
