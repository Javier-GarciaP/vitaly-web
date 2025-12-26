import React from 'react';
import { View, StyleSheet, Text } from '@react-pdf/renderer';
import ReportLayout from '../components/ReportLayout';
import CommonHeader from '../components/CommonHeader';
import CommonFooter from '../components/CommonFooter';
import ExamRow from '../components/ExamRow';
// 1. Usamos tus tipos centralizados
import { QuimicaData, Paciente } from '@/types/types';

interface QuimicaReportProps {
  data: QuimicaData;
  patient: Paciente;
  qrImage?: string;
}

const styles = StyleSheet.create({
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#6e2020', 
    marginTop: 10,
    paddingBottom: 3,
    backgroundColor: '#fdfdfd',
  },
  columnTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#6e2020',
    textTransform: 'uppercase',
  },
  col1: { width: '40%', paddingLeft: 5 },
  col2: { width: '30%', textAlign: 'center' },
  col3: { width: '30%', textAlign: 'right', paddingRight: 5 },
  observationsContainer: {
    marginTop: 15,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderLeftWidth: 2,
    borderLeftColor: '#6e2020',
  },
  obsTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#6e2020',
    marginBottom: 2,
  },
  obsText: {
    fontSize: 9,
    lineHeight: 1.2,
  }
});

const QuimicaReport: React.FC<QuimicaReportProps> = ({ data, patient, qrImage }) => {
  return (
    <ReportLayout>
      <CommonHeader
        patient={{
          nombre: patient.nombre,
          cedula: patient.cedula,
          edad: patient.edad, // Asegúrate de traer este campo desde tu base de datos
          fechaExamen: patient.fecha || "", // La fecha que guardaste cuando se creó el examen
        }}
        title="Bacteriología / Antibiograma"
        qrImage={qrImage}
      />

      {/* Encabezado de la Tabla */}
      <View style={styles.tableHeader}>
        <Text style={[styles.columnTitle, styles.col1]}>Análisis</Text>
        <Text style={[styles.columnTitle, styles.col2]}>Resultado</Text>
        <Text style={[styles.columnTitle, styles.col3]}>V. Referencia</Text>
      </View>

      {/* Lista de Exámenes Sincronizada con las llaves de tu BD */}
      <ExamRow label="Glicemia" result={data?.glicemia} reference="70 - 110 mg/dL" />
      <ExamRow label="Urea" result={data?.urea} reference="15 - 45 mg/dL" />
      <ExamRow label="Creatinina" result={data?.creatinina} reference="0.6 - 1.4 mg/dL" />
      <ExamRow label="Ácido Úrico" result={data?.ac_urico} reference="M: 2.4-5.7 / H: 3.4-7.0" />
      
      <ExamRow label="Colesterol Total" result={data?.colesterol} reference="Hasta 200 mg/dL" />
      <ExamRow label="Triglicéridos" result={data?.trigliceridos} reference="Hasta 150 mg/dL" />
      <ExamRow label="Colesterol HDL" result={data?.hdl} reference="> 45 mg/dL" />
      <ExamRow label="Colesterol LDL" result={data?.ldh} reference="Hasta 130 mg/dL" />
      <ExamRow label="Colesterol VLDL" result={data?.colesterol} reference="Hasta 30 mg/dL" />

      <ExamRow label="T.G.O (AST)" result={data?.tgo} reference="Hasta 40 U/L" />
      <ExamRow label="T.G.P (ALT)" result={data?.tgp} reference="Hasta 41 U/L" />
      <ExamRow label="Fosfatasa Alcalina" result={data?.fosf_alc} reference="40 - 129 U/L" />
      console.log("Datos:" + data?.bilirr_total)
      <ExamRow label="Bilirrubina Total" result={data?.bilirr_total} reference="Hasta 1.0 mg/dL" />
      <ExamRow label="Bilirrubina Directa" result={data?.bilirr_directa} reference="Hasta 0.25 mg/dL" />
      <ExamRow label="Bilirrubina Indirecta" result={data?.bilirr_indirecta} reference="Hasta 0.75 mg/dL" />

      <ExamRow label="Proteínas Totales" result={data?.proteinas_tot} reference="6.4 - 8.3 g/dL" />
      <ExamRow label="Albúmina" result={data?.albumina} reference="3.5 - 5.2 g/dL" />
      <ExamRow label="Globulinas" result={data?.globulinas} reference="2.3 - 3.4 g/dL" />
      <ExamRow label="Relación A/G" result={data?.relacion_ag} reference="1.1 - 2.2" />

      <ExamRow label="Calcio" result={data?.calcio} reference="8.6 - 10.2 mg/dL" />
      <ExamRow label="Fósforo" result={data?.fosforo} reference="2.5 - 4.5 mg/dL" />
      <ExamRow label="LDH" result={data?.ldh} reference="140 - 280 U/L" />
      <ExamRow label="Amilasa" result={data?.amilasa} reference="Hasta 100 U/L" />

      {/* Observaciones */}
      {data?.observacion && data.observacion.trim() !== "" && (
        <View style={styles.observationsContainer}>
          <Text style={styles.obsTitle}>OBSERVACIONES:</Text>
          <Text style={styles.obsText}>{data.observacion}</Text>
        </View>
      )}

      <CommonFooter />
    </ReportLayout>
  );
};

export default QuimicaReport;