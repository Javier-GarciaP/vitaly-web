import DatabaseService from './db/database';

export interface Paciente {
    id?: number;
    cedula?: string;
    nombre: string;
    edad?: string;
    sexo?: string;
    created_at?: string;
    updated_at?: string;
}

export interface EvolucionData {
    fecha: string;
    valores: any;
}

class PacientesService {
    static async getAll(): Promise<Paciente[]> {
        const db = await DatabaseService.getDB();
        return await db.select<Paciente[]>('SELECT * FROM pacientes ORDER BY created_at DESC');
    }

    static async search(term: string): Promise<Paciente[]> {
        const db = await DatabaseService.getDB();
        const query = 'SELECT * FROM pacientes WHERE nombre LIKE ? OR cedula LIKE ? LIMIT 10';
        return await db.select<Paciente[]>(query, [`%${term}%`, `%${term}%`]);
    }

    static async getById(id: number): Promise<Paciente | null> {
        const db = await DatabaseService.getDB();
        const result = await db.select<Paciente[]>('SELECT * FROM pacientes WHERE id = ?', [id]);
        return result[0] || null;
    }

    static async create(paciente: Omit<Paciente, 'id' | 'created_at' | 'updated_at'>): Promise<Paciente> {
        const db = await DatabaseService.getDB();
        const result = await db.execute(
            'INSERT INTO pacientes (cedula, nombre, edad, sexo) VALUES (?, ?, ?, ?)',
            [paciente.cedula || null, paciente.nombre, paciente.edad || null, paciente.sexo]
        );
        // lastInsertId is available in result.lastInsertId if supported, check plugin return type
        // implementation details: tauri-plugin-sql execute returns QueryResult { rowsAffected: number, lastInsertId: number }

        // We fetch the created patient to return it
        const id = result.lastInsertId as number;
        const newPatient = await this.getById(id);
        if (!newPatient) throw new Error("Failed to retrieve created patient");
        return newPatient;
    }

    static async update(id: number, paciente: Partial<Paciente>): Promise<void> {
        const db = await DatabaseService.getDB();
        await db.execute(
            'UPDATE pacientes SET cedula = ?, nombre = ?, edad = ?, sexo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [paciente.cedula || null, paciente.nombre, paciente.edad || null, paciente.sexo, id]
        );
    }

    static async delete(id: number): Promise<void> {
        const db = await DatabaseService.getDB();
        await db.execute('DELETE FROM pacientes WHERE id = ?', [id]);
    }

    static async getEvolution(id: number, tipo: string): Promise<EvolucionData[]> {
        const db = await DatabaseService.getDB();
        const result = await db.select<{ fecha: string; resultados: string }[]>(
            "SELECT fecha, resultados FROM examenes WHERE paciente_id = ? AND tipo = ? AND estado = 'completado' ORDER BY fecha ASC",
            [id, tipo]
        );

        return result.map(r => ({
            fecha: r.fecha,
            valores: r.resultados ? JSON.parse(r.resultados) : {}
        }));
    }
}

export default PacientesService;
