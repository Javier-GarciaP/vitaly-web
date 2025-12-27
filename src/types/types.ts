/**
 * Interfaces basadas en la estructura JSON de la base de datos
 * para asegurar la consistencia en toda la aplicación.
 */

export interface Paciente {
  nombre: string;
  cedula: string;
  fecha?: string;
  edad?: string | number;
}

export interface HematologiaData {
  hematies?: string;
  hemoglobina?: string;
  hematocrito?: string;
  vcm?: string;
  hcm?: string;
  chcm?: string;
  leucocitos?: string;
  plaquetas?: string;
  neutrofilos?: string;
  linfocitos?: string;
  monocitos?: string;
  eosinofilos?: string;
  basofilos?: string;
  vsg_1h?: string;
  vsg_2h?: string;
  vsg_indice?: string;
  observacion?: string;
}

export interface QuimicaData {
  glicemia?: string;
  urea?: string;
  creatinina?: string;
  colesterol?: string;
  hdl?: string;
  trigliceridos?: string;
  ac_urico?: string;
  proteinas_tot?: string;
  albumina?: string;
  globulinas?: string;
  relacion_ag?: string;
  tgo?: string;
  tgp?: string;
  fosf_alc?: string;
  bilirr_total?: string;
  bilirr_directa?: string;
  bilirr_indirecta?: string;
  ldh?: string;
  amilasa?: string;
  calcio?: string;
  fosforo?: string;
  observacion?: string;
}

export interface OrinaData {
  // SECCIÓN 1: CARACTERES GENERALES
  aspecto?: string;
  color?: string;
  reaccion?: string;
  ph?: string;
  densidad?: string;

  // SECCIÓN 2: EXAMEN QUÍMICO
  pigmento_bil?: string;
  glucosa?: string;
  nitritos?: string;
  proteina?: string;
  hemoglobina?: string;
  acetona?: string;
  urobilin?: string;

  // SECCIÓN 3: EXAMEN MICROSCÓPICO
  leucocitos?: string;
  hematies?: string;
  celulas_epit?: string;
  cilindros?: string;
  bacteristales?: string;
  cristales?: string;
  bacterias?: string;
  levaduras?: string;
  filam_moco?: string;

  // OBSERVACIÓN
  observacion?: string;
}

export interface CoagulacionData {
  tp_control?: string;
  tp_paciente?: string;
  tp_act?: string;
  tp_razon?: string;
  tp_inr?: string;
  tp_isi?: string;
  tpt_control?: string;
  tpt_paciente?: string;
  fibrinogeno?: string;
  anticoagulado?: string;
  medicamento?: string;
  observacion?: string;
}

export interface BacteriologiaData {
  id?: number;
  muestra?: string;
  germen_a?: string;
  germen_b?: string;
  obs_directa?: string;
  gram?: string;
  recuento?: string;
  cultivo?: string;
  cultivo_hongos?: string;
  antibiograma_list?: Array<{
    nombre: string;
    a: string;
    b: string;
  }>;
}

export interface HecesData {
  aspecto?: string,
  color?: string;
  consistencia?: string;
  hb?: string;
  moco?: string;
  reaccion?: string;
  ph?: string;
  sangre_oculta?: string;
  flora_bacteriana?: string;
  parasitos?: string;
  po_nucleares?: string;
  re_alimenticios?: string;
  az_reductores?: string;
  observacion?: string;
}

export interface GrupoSanguineoData {
  grupo_sanguineo?: string;
  factor_rh?: string;
  du?: string;
  observacion?: string;
}

export interface MiscelaneosData {
  examen_solicitado?: string;
  metodo?: string;
  muestra?: string;
  resultado_texto?: string;
}

// Interfaz genérica para el objeto Examen que viene de la API
export interface Examen {
  id: number;
  paciente_id: number;
  paciente_nombre: string;
  paciente_cedula: string;
  tipo: string;
  fecha: string;
  estado: 'pendiente' | 'en_proceso' | 'completado';
  resultados: any; // Aquí puedes usar un Union Type si quieres más rigor: HematologiaData | QuimicaData | etc.
  created_at: string;
}