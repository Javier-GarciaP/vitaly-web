import DatabaseService from './db/database';
import ExamenesService from './ExamenesService';

export interface FacturaItem {
    nombre: string;
    precio: number;
    categoria: string;
    parametros?: string[];
}

export interface Factura {
    id?: number;
    paciente_id: number;
    examenes: FacturaItem[]; // Stored as JSON string in DB
    total: number;
    fecha: string;
    created_at?: string;
    updated_at?: string;
    // Joins
    paciente_nombre?: string;
    paciente_cedula?: string;
}

class FacturasService {
    static async getAll(): Promise<Factura[]> {
        const db = await DatabaseService.getDB();
        const result = await db.select<any[]>(
            `SELECT f.*, p.nombre as paciente_nombre, p.cedula as paciente_cedula 
       FROM facturas f 
       JOIN pacientes p ON f.paciente_id = p.id 
       ORDER BY f.fecha DESC, f.created_at DESC`
        );

        return result.map(f => ({
            ...f,
            examenes: f.examenes ? JSON.parse(f.examenes) : []
        }));
    }

    static async getById(id: number): Promise<Factura | null> {
        const db = await DatabaseService.getDB();
        const result = await db.select<any[]>(
            `SELECT f.*, p.nombre as paciente_nombre, p.cedula as paciente_cedula 
       FROM facturas f 
       JOIN pacientes p ON f.paciente_id = p.id 
       WHERE f.id = ?`,
            [id]
        );

        if (result.length === 0) return null;
        const f = result[0];
        return {
            ...f,
            examenes: f.examenes ? JSON.parse(f.examenes) : []
        };
    }

    static async create(factura: Omit<Factura, 'id' | 'created_at' | 'updated_at' | 'paciente_nombre' | 'paciente_cedula'>): Promise<number> {
        const db = await DatabaseService.getDB();

        // 1. Create Factura
        const examenesJson = JSON.stringify(factura.examenes);
        const result = await db.execute(
            'INSERT INTO facturas (paciente_id, examenes, total, fecha) VALUES (?, ?, ?, ?)',
            [factura.paciente_id, examenesJson, factura.total, factura.fecha]
        );

        const facturaId = result.lastInsertId as number;

        // 2. Sync Examenes
        await this.syncExamenes(factura.paciente_id, factura.fecha, factura.examenes);

        return facturaId;
    }

    static async update(id: number, factura: Partial<Factura>): Promise<void> {
        const db = await DatabaseService.getDB();

        // Fetch current factura to get paciente_id and fecha if not provided
        const current = await this.getById(id);
        if (!current) throw new Error("Factura no encontrada");

        const fields: string[] = [];
        const values: any[] = [];

        if (factura.examenes !== undefined) {
            fields.push('examenes = ?');
            values.push(JSON.stringify(factura.examenes));
        }
        if (factura.total !== undefined) { fields.push('total = ?'); values.push(factura.total); }
        if (factura.fecha !== undefined) { fields.push('fecha = ?'); values.push(factura.fecha); }

        if (fields.length > 0) {
            fields.push('updated_at = CURRENT_TIMESTAMP');
            values.push(id);
            await db.execute(`UPDATE facturas SET ${fields.join(', ')} WHERE id = ?`, values);
        }

        // Sync exams after update
        const updatedExamenes = factura.examenes || current.examenes;
        const updatedFecha = factura.fecha || current.fecha;
        await this.syncExamenes(current.paciente_id, updatedFecha, updatedExamenes);
    }

    static async delete(id: number): Promise<void> {
        const db = await DatabaseService.getDB();
        const factura = await this.getById(id);
        if (!factura) return;

        // Check for completed exams for this patient on this date
        const allExams = await db.select<any[]>(
            'SELECT * FROM examenes WHERE paciente_id = ? AND fecha = ?',
            [factura.paciente_id, factura.fecha]
        );

        // Identify which categories are in this factura
        const categoriesInFactura = Array.from(new Set(factura.examenes.map(item => this.mapCategory(item.categoria))));

        const completedExams = allExams.filter(e => e.estado === 'completado' && categoriesInFactura.includes(e.tipo));

        if (completedExams.length > 0) {
            throw new Error("No se puede eliminar la factura porque ya existen exámenes completados asociados a ella.");
        }

        // Delete pending exams associated with this factura's categories
        for (const cat of categoriesInFactura) {
            await db.execute(
                "DELETE FROM examenes WHERE paciente_id = ? AND fecha = ? AND tipo = ? AND estado != 'completado'",
                [factura.paciente_id, factura.fecha, cat]
            );
        }

        await db.execute('DELETE FROM facturas WHERE id = ?', [id]);
    }

    private static mapCategory(cat: string): string {
        if (cat === "Uroanálisis") return "Orina";
        if (cat === "Coproanálisis") return "Heces";
        return cat;
    }

    private static async syncExamenes(pacienteId: number, fecha: string, items: FacturaItem[]) {
        const db = await DatabaseService.getDB();

        const validFormTypes = [
            "Hematología", "Química Clínica", "Orina", "Heces",
            "Coagulación", "Grupo Sanguíneo", "Bacteriología", "Misceláneos", "PSA"
        ];

        // Group parameters by mapped category
        const categoryGroups = items.reduce((acc, item) => {
            const cat = this.mapCategory(item.categoria);
            if (validFormTypes.includes(cat)) {
                if (!acc[cat]) acc[cat] = new Set<string>();
                if (item.parametros) {
                    item.parametros.forEach(p => acc[cat].add(p));
                }
            }
            return acc;
        }, {} as Record<string, Set<string>>);

        // Get existing exams for this patient/date
        const existingExams = await db.select<any[]>(
            'SELECT * FROM examenes WHERE paciente_id = ? AND fecha = ?',
            [pacienteId, fecha]
        );

        // 1. Delete exams whose category is NO LONGER in the factura (only if PENDING)
        for (const ex of existingExams) {
            if (!categoryGroups[ex.tipo]) {
                if (ex.estado !== 'completado') {
                    await db.execute('DELETE FROM examenes WHERE id = ?', [ex.id]);
                }
            }
        }

        // 2. For each category in the factura, ensure an exam exists
        for (const [cat, params] of Object.entries(categoryGroups)) {
            const existing = existingExams.find(e => e.tipo === cat);
            const highlightFields = Array.from(params);

            if (!existing) {
                // Create new exam
                await ExamenesService.create({
                    paciente_id: pacienteId,
                    tipo: cat,
                    fecha: fecha,
                    estado: 'pendiente',
                    resultados: { _highlightFields: highlightFields },
                    uuid: crypto.randomUUID()
                });
            } else {
                // Update highlight fields of existing exam if it's not completed
                // Actually, the user says "si se edita la factura... debe crear ese examen" 
                // but usually we update. However, if they want a NEW one if the old is completed:
                if (existing.estado === 'completado') {
                    // Check if there's *another* pending one? 
                    // To follow the user's "must create" literally when related to a completed one:
                    const hasAnotherPending = existingExams.some(e => e.tipo === cat && e.estado !== 'completado');
                    if (!hasAnotherPending) {
                        await ExamenesService.create({
                            paciente_id: pacienteId,
                            tipo: cat,
                            fecha: fecha,
                            estado: 'pendiente',
                            resultados: { _highlightFields: highlightFields },
                            uuid: crypto.randomUUID()
                        });
                    }
                } else {
                    // Update existing pending exam's highlight fields
                    const resultados = existing.resultados ? JSON.parse(existing.resultados) : {};
                    resultados._highlightFields = highlightFields;
                    await ExamenesService.update(existing.id, { resultados });
                }
            }
        }
    }
}

export default FacturasService;
