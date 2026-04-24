import DatabaseService from './db/database';
import { Paciente } from './PacientesService';
import { Examen } from './ExamenesService';
import { Factura } from './FacturasService';
import { ValorReferencia } from './ValoresReferenciaService';

interface BackupPayload {
    timestamp: string;
    version: number;
    data: {
        pacientes: Paciente[];
        examenes: Examen[];
        facturas: Factura[];
        quimica_valores_referencia: ValorReferencia[];
        hematologia_valores_referencia: ValorReferencia[];
        coagulacion_valores_referencia: ValorReferencia[];
        psa_valores_referencia: ValorReferencia[];
        examenes_predefinidos: any[];
    };
}

class BackupService {
    static async createBackup(): Promise<BackupPayload> {
        const db = await DatabaseService.getDB();

        // Fetch all data
        // optimizing with Promise.all
        const [
            pacientes,
            examenes,
            facturas,
            quimica,
            hematologia,
            coagulacion,
            psa,
            predefinidos
        ] = await Promise.all([
            db.select<Paciente[]>('SELECT * FROM pacientes'),
            db.select<Examen[]>('SELECT * FROM examenes'),
            db.select<Factura[]>('SELECT * FROM facturas'),
            db.select<ValorReferencia[]>('SELECT * FROM quimica_valores_referencia'),
            db.select<ValorReferencia[]>('SELECT * FROM hematologia_valores_referencia'),
            db.select<ValorReferencia[]>('SELECT * FROM coagulacion_valores_referencia'),
            db.select<ValorReferencia[]>('SELECT * FROM psa_valores_referencia'),
            db.select<any[]>('SELECT * FROM examenes_predefinidos')
        ]);

        return {
            timestamp: new Date().toISOString(),
            version: 1, // Schema version
            data: {
                pacientes,
                examenes,
                facturas,
                quimica_valores_referencia: quimica,
                hematologia_valores_referencia: hematologia,
                coagulacion_valores_referencia: coagulacion,
                psa_valores_referencia: psa,
                examenes_predefinidos: predefinidos
            }
        };
    }

    static async testConnection(apiUrl: string, token?: string): Promise<boolean> {
        try {
            const base = apiUrl.replace(/\/+$/, "");
            const res = await fetch(`${base}/api/health`, {
                method: 'GET',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            return res.ok;
        } catch (e) {
            console.error('Connection test failed:', e);
            return false;
        }
    }

    static async uploadBackup(apiUrl: string, token?: string): Promise<boolean> {
        try {
            const backup = await this.createBackup();

            const base = apiUrl.replace(/\/+$/, "");

            const res = await fetch(`${base}/api/backup/full-restore`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(backup)
            });

            if (!res.ok) {
                console.error('Backup failed:', await res.text());
                return false;
            }

            return true;
        } catch (e) {
            console.error('Backup error:', e);
            return false;
        }
    }

    static async downloadBackup(apiUrl: string, token?: string): Promise<BackupPayload | null> {
        try {
            const base = apiUrl.replace(/\/+$/, "");
            const res = await fetch(`${base}/api/backup/download`, {
                method: 'GET',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            if (!res.ok) throw new Error(await res.text());
            return await res.json();
        } catch (e) {
            console.error('Download error:', e);
            return null;
        }
    }

    static async restoreFromBackup(payload: BackupPayload): Promise<void> {
        const db = await DatabaseService.getDB();
        const { data } = payload;

        try {
            // WIPE ALL TABLES (Children first)
            await db.execute('DELETE FROM examenes');
            await db.execute('DELETE FROM facturas');
            await db.execute('DELETE FROM pacientes');
            await db.execute('DELETE FROM quimica_valores_referencia');
            await db.execute('DELETE FROM hematologia_valores_referencia');
            await db.execute('DELETE FROM coagulacion_valores_referencia');
            await db.execute('DELETE FROM psa_valores_referencia');
            await db.execute('DELETE FROM examenes_predefinidos');

            // INSERTS
            if (data.pacientes) {
                for (const p of data.pacientes) {
                    await db.execute('INSERT INTO pacientes (id, cedula, nombre, edad, sexo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [p.id, p.cedula, p.nombre, p.edad, p.sexo, p.created_at, p.updated_at]);
                }
            }

            if (data.examenes) {
                for (const e of data.examenes) {
                    await db.execute('INSERT INTO examenes (id, paciente_id, tipo, fecha, resultados, estado, uuid, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [e.id, e.paciente_id, e.tipo, e.fecha, typeof e.resultados === 'string' ? e.resultados : JSON.stringify(e.resultados), e.estado, e.uuid, e.created_at, e.updated_at]);
                }
            }

            if (data.facturas) {
                for (const f of data.facturas) {
                    await db.execute('INSERT INTO facturas (id, paciente_id, examenes, total, fecha, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [f.id, f.paciente_id, typeof f.examenes === 'string' ? f.examenes : JSON.stringify(f.examenes), f.total, f.fecha, f.created_at, f.updated_at]);
                }
            }

            // Catalogs
            const catalogs = [
                { items: data.quimica_valores_referencia, table: 'quimica_valores_referencia' },
                { items: data.hematologia_valores_referencia, table: 'hematologia_valores_referencia' },
                { items: data.coagulacion_valores_referencia, table: 'coagulacion_valores_referencia' },
                { items: data.psa_valores_referencia, table: 'psa_valores_referencia' }
            ];

            for (const cat of catalogs) {
                if (cat.items) {
                    for (const item of cat.items) {
                        await db.execute(`INSERT INTO ${cat.table} (id, nombre_examen, valor_referencia) VALUES (?, ?, ?)`,
                            [item.id, item.nombre_examen, item.valor_referencia]);
                    }
                }
            }

            if (data.examenes_predefinidos) {
                for (const ex of data.examenes_predefinidos) {
                    await db.execute('INSERT INTO examenes_predefinidos (id, nombre, precio, categoria, parametros) VALUES (?, ?, ?, ?, ?)',
                        [ex.id, ex.nombre, ex.precio, ex.categoria, typeof ex.parametros === 'string' ? ex.parametros : JSON.stringify(ex.parametros)]);
                }
            }

        } catch (error) {
            console.error('Local Restore Failed:', error);
            throw error;
        }
    }
}

export default BackupService;
