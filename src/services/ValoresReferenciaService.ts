import DatabaseService from './db/database';

export interface ValorReferencia {
    id: number;
    nombre_examen: string;
    valor_referencia: string;
}

export type TipoReferencia = 'quimica' | 'hematologia' | 'coagulacion' | 'psa';

class ValoresReferenciaService {
    private static getTableName(tipo: TipoReferencia): string {
        switch (tipo) {
            case 'quimica': return 'quimica_valores_referencia';
            case 'hematologia': return 'hematologia_valores_referencia';
            case 'coagulacion': return 'coagulacion_valores_referencia';
            case 'psa': return 'psa_valores_referencia';
            default: throw new Error(`Unknown table type: ${tipo}`);
        }
    }

    static async getAll(tipo: TipoReferencia): Promise<ValorReferencia[]> {
        const db = await DatabaseService.getDB();
        const table = this.getTableName(tipo);
        return await db.select<ValorReferencia[]>(`SELECT * FROM ${table} ORDER BY id ASC`);
    }

    static async update(tipo: TipoReferencia, id: number, valor: string): Promise<void> {
        const db = await DatabaseService.getDB();
        const table = this.getTableName(tipo);
        await db.execute(
            `UPDATE ${table} SET valor_referencia = ? WHERE id = ?`,
            [valor, id]
        );
    }

    static async updateAll(tipo: TipoReferencia, valores: ValorReferencia[]): Promise<void> {
        const db = await DatabaseService.getDB();
        const table = this.getTableName(tipo);

        // Process in parallel or transaction? 
        // SQLite doesn't support massive bulk updates easily without a transaction or loop.
        // Loop is fine for small datasets like this (~20 rows).
        for (const v of valores) {
            await db.execute(
                `UPDATE ${table} SET valor_referencia = ? WHERE id = ?`,
                [v.valor_referencia, v.id]
            );
        }
    }

    // Method to create if doesn't exist (useful for dynamic checks in UI)
    static async create(tipo: TipoReferencia, nombre: string, valor: string): Promise<void> {
        const db = await DatabaseService.getDB();
        const table = this.getTableName(tipo);
        await db.execute(
            `INSERT INTO ${table} (nombre_examen, valor_referencia) VALUES (?, ?)`,
            [nombre, valor]
        );
    }
}

export default ValoresReferenciaService;
