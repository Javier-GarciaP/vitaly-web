import React from 'react';
import { View, StyleSheet, Text } from '@react-pdf/renderer';
import ReportLayout from '../components/ReportLayout';
import CommonHeader from '../components/CommonHeader';
import CommonFooter from '../components/CommonFooter';
import ExamRow from '../components/ExamRow';
import { QuimicaData, Paciente } from '@/types/types';

// Definimos la estructura de los valores de referencia que vienen de la BD
interface ValorReferencia {
  nombre_examen: string;
  valor_referencia: string;
}

interface QuimicaReportProps {
  data: QuimicaData;
  patient: Paciente;
  qrImage?: string;
  // Pasamos los valores de referencia como un prop
  references?: ValorReferencia[];
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

const QuimicaReport: React.FC<QuimicaReportProps> = ({ data, patient, qrImage, references }) => {
  
  // Función auxiliar para buscar el valor de referencia dinámico o usar uno por defecto
  const getRef = (nombre: string, fallback: string) => {
    if (!references) return fallback;
    const refObj = references.find(r => 
      r.nombre_examen.toLowerCase() === nombre.toLowerCase()
    );
    return refObj ? refObj.valor_referencia : fallback;
  };

  return (
    <ReportLayout>
      <CommonHeader
        patient={{
          nombre: patient.nombre,
          cedula: patient.cedula,
          edad: patient.edad,
          fechaExamen: patient.fecha || "",
        }}
        title="QUÍMICA CLÍNICA"
        qrImage={qrImage}
      />

      <View style={styles.tableHeader}>
        <Text style={[styles.columnTitle, styles.col1]}>Análisis</Text>
        <Text style={[styles.columnTitle, styles.col2]}>Resultado</Text>
        <Text style={[styles.columnTitle, styles.col3]}>V. Referencia</Text>
      </View>

      {/* Uso de getRef para cada fila */}
      <ExamRow label="Glicemia" result={data?.glicemia} reference={getRef("Glicemia", "70 - 110 mg/dL")} />
      <ExamRow label="Urea" result={data?.urea} reference={getRef("Urea", "15 - 45 mg/dL")} />
      <ExamRow label="Creatinina" result={data?.creatinina} reference={getRef("Creatinina", "0.6 - 1.4 mg/dL")} />
      <ExamRow label="Ácido Úrico" result={data?.ac_urico} reference={getRef("Ácido Úrico", "M: 2.4-5.7 / H: 3.4-7.0")} />
      
      <ExamRow label="Colesterol Total" result={data?.colesterol} reference={getRef("Colesterol Total", "Hasta 200 mg/dL")} />
      <ExamRow label="Triglicéridos" result={data?.trigliceridos} reference={getRef("Triglicéridos", "Hasta 150 mg/dL")} />
      <ExamRow label="Colesterol HDL" result={data?.hdl} reference={getRef("Colesterol HDL", "> 45 mg/dL")} />
      <ExamRow label="Colesterol LDL" result={data?.ldh} reference={getRef("Colesterol LDL", "Hasta 130 mg/dL")} />

      <ExamRow label="T.G.O (AST)" result={data?.tgo} reference={getRef("T.G.O (AST)", "Hasta 40 U/L")} />
      <ExamRow label="T.G.P (ALT)" result={data?.tgp} reference={getRef("T.G.P (ALT)", "Hasta 41 U/L")} />
      <ExamRow label="Fosfatasa Alcalina" result={data?.fosf_alc} reference={getRef("Fosfatasa Alcalina", "40 - 129 U/L")} />
      
      <ExamRow label="Bilirrubina Total" result={data?.bilirr_total} reference={getRef("Bilirrubina Total", "Hasta 1.0 mg/dL")} />
      <ExamRow label="Bilirrubina Directa" result={data?.bilirr_directa} reference={getRef("Bilirrubina Directa", "Hasta 0.25 mg/dL")} />
      <ExamRow label="Bilirrubina Indirecta" result={data?.bilirr_indirecta} reference={getRef("Bilirrubina Indirecta", "Hasta 0.75 mg/dL")} />

      <ExamRow label="Proteínas Totales" result={data?.proteinas_tot} reference={getRef("Proteínas Totales", "6.4 - 8.3 g/dL")} />
      <ExamRow label="Albúmina" result={data?.albumina} reference={getRef("Albúmina", "3.5 - 5.2 g/dL")} />
      <ExamRow label="Globulinas" result={data?.globulinas} reference={getRef("Globulinas", "2.3 - 3.4 g/dL")} />
      <ExamRow label="Relación A/G" result={data?.relacion_ag} reference={getRef("Relación A/G", "1.1 - 2.2")} />

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