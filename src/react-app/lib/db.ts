import Dexie, { type Table } from 'dexie';

// Interfaces basadas en tus tablas de D1
export interface Paciente {
  id?: number;
  cedula: string;
  nombre: string;
  edad: number;
  sexo: string;
  created_at: string;
  sync_status: 'synced' | 'pending' | 'deleted';
}

export interface Factura {
  id?: number;
  paciente_id: number;
  examenes: string; // JSON string de los exámenes
  total: number;
  fecha: string;
  sync_status: 'synced' | 'pending';
}

export interface Examen {
  id?: number;
  paciente_id: number;
  tipo: string;
  fecha: string;
  resultados: string;
  estado: string;
  uuid: string;
  sync_status: 'synced' | 'pending';
}

export interface PlantillaBacteriologia {
  id?: number;
  nombre_plantilla: string;
  muestra_default: string;
  observacion_directa: string;
  tincion_gram: string;
  recuento_colonias: string;
  cultivo: string;
  cultivo_hongos: string;
  sync_status: 'synced' | 'pending';
}

export interface PlantillaMiscelaneo {
  id?: number;
  nombre_examen: string;
  metodo: string;
  muestra: string;
  contenido_plantilla: string;
  sync_status: 'synced' | 'pending';
}

// Configuración de la Base de Datos Local
export class VitalyLocalDB extends Dexie {
  pacientes!: Table<Paciente>;
  facturas!: Table<Factura>;
  examenes!: Table<Examen>;
  plantillas_bacteriologia!: Table<PlantillaBacteriologia>;
  plantillas_miscelaneos!: Table<PlantillaMiscelaneo>;

  constructor() {
    super('VitalyLocalDB');
    
    // Definimos los esquemas e índices
    // El primer campo es la llave primaria (++ significa autoincremental)
    this.version(1).stores({
      pacientes: '++id, &cedula, nombre, sync_status',
      facturas: '++id, paciente_id, fecha, sync_status',
      examenes: '++id, paciente_id, fecha, estado, &uuid, sync_status',
      plantillas_bacteriologia: '++id, nombre_plantilla, sync_status',
      plantillas_miscelaneos: '++id, nombre_examen, sync_status'
    });
  }
}

// Instancia única para toda la app
export const dbLocal = new VitalyLocalDB();