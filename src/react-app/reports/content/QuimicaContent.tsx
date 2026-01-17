import React from 'react';
import { View, StyleSheet, Text } from '@react-pdf/renderer';
import CommonHeader from '../components/CommonHeader';
import ExamRow from '../components/ExamRow';
import { QuimicaData, Paciente } from '@/types/types';

interface ValorReferencia {
  nombre_examen: string;
  valor_referencia: string;
}

interface QuimicaReportProps {
  data: QuimicaData;
  patient: Paciente;
  qrImage?: string;
  references?: ValorReferencia[];
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 5,
  },
  // Card Styles (Duplicate from Hematologia for consistency, could be shared ideally)
  card: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    marginBottom: 8,
    overflow: "hidden",
  },
  cardHeader: {
    backgroundColor: "#800020",
    paddingVertical: 3,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardBody: {
    padding: 6,
    backgroundColor: "#fafafa",
  },
  // Table Header within Cards
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
    marginBottom: 4,
    paddingBottom: 2,
  },
  columnHead: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  col1: { width: '40%' },
  col2: { width: '30%', textAlign: 'center' },
  col3: { width: '30%', textAlign: 'right' },

  // Observations
  obsCard: {
    marginTop: 5,
    borderLeftWidth: 3,
    borderLeftColor: "#800020",
    backgroundColor: "#fff5f5",
    padding: 8,
    borderRadius: 4,
  },
  obsTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#800020",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  obsText: {
    fontSize: 9,
    color: "#334155",
    lineHeight: 1.3,
  }
});

const SectionCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    <View style={styles.cardBody}>
      {/* Headers de columnas opcionales dentro de cada tarjeta para mayor claridad */}
      <View style={styles.tableHeader}>
        <Text style={[styles.columnHead, styles.col1]}>Análisis</Text>
        <Text style={[styles.columnHead, styles.col2]}>Resultado</Text>
        <Text style={[styles.columnHead, styles.col3]}>Referencia</Text>
      </View>
      {children}
    </View>
  </View>
);

const QuimicaContent: React.FC<QuimicaReportProps> = ({ data, patient, qrImage, references }) => {
  const getRef = (nombre: string, fallback: string) => {
    if (!references) return fallback;
    const refObj = references.find(r =>
      r.nombre_examen.toLowerCase() === nombre.toLowerCase()
    );
    return refObj ? refObj.valor_referencia : fallback;
  };

  // Helper to check if a section should be rendered based on data presence
  const hasMetabolismo = data?.glicemia || data?.urea || data?.creatinina || data?.ac_urico;
  const hasLipidico = data?.colesterol || data?.trigliceridos || data?.hdl || data?.ldh;
  const hasEnzimas = data?.tgo || data?.tgp || data?.fosf_alc || data?.bilirr_total || data?.bilirr_directa || data?.bilirr_indirecta;
  const hasProteinas = data?.proteinas_tot || data?.albumina || data?.globulinas || data?.relacion_ag;

  return (
    <View style={styles.container}>
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

      {hasMetabolismo && (
        <SectionCard title="Metabolismo & Renal">
          <ExamRow label="Glicemia Basal" result={data?.glicemia} reference={getRef("Glicemia", "70 - 110 mg/dL")} />
          <ExamRow label="Urea" result={data?.urea} reference={getRef("Urea", "15 - 45 mg/dL")} />
          <ExamRow label="Creatinina" result={data?.creatinina} reference={getRef("Creatinina", "0.6 - 1.4 mg/dL")} />
          <ExamRow label="Ácido Úrico" result={data?.ac_urico} reference={getRef("Ácido Úrico", "2.4 - 7.0 mg/dL")} />
        </SectionCard>
      )}

      {hasLipidico && (
        <SectionCard title="Perfil Lipídico">
          <ExamRow label="Colesterol Total" result={data?.colesterol} reference={getRef("Colesterol Total", "< 200 mg/dL")} />
          <ExamRow label="Triglicéridos" result={data?.trigliceridos} reference={getRef("Triglicéridos", "< 150 mg/dL")} />
          <ExamRow label="Colesterol HDL" result={data?.hdl} reference={getRef("Colesterol HDL", "> 45 mg/dL")} />
          <ExamRow label="Colesterol LDL" result={data?.ldh} reference={getRef("Colesterol LDL", "< 130 mg/dL")} />
        </SectionCard>
      )}

      {hasEnzimas && (
        <SectionCard title="Enzimas & Función Hepática">
          <ExamRow label="T.G.O (AST)" result={data?.tgo} reference={getRef("T.G.O (AST)", "< 40 U/L")} />
          <ExamRow label="T.G.P (ALT)" result={data?.tgp} reference={getRef("T.G.P (ALT)", "< 41 U/L")} />
          <ExamRow label="Fosfatasa Alcalina" result={data?.fosf_alc} reference={getRef("Fosfatasa Alcalina", "40 - 129 U/L")} />
          <ExamRow label="Bilirrubina Total" result={data?.bilirr_total} reference={getRef("Bilirrubina Total", "< 1.0 mg/dL")} />
          <ExamRow label="Bilirrubina Directa" result={data?.bilirr_directa} reference={getRef("Bilirrubina Directa", "< 0.25 mg/dL")} />
          <ExamRow label="Bilirrubina Indirecta" result={data?.bilirr_indirecta} reference={getRef("Bilirrubina Indirecta", "< 0.75 mg/dL")} />
        </SectionCard>
      )}

      {hasProteinas && (
        <SectionCard title="Proteínas">
          <ExamRow label="Proteínas Totales" result={data?.proteinas_tot} reference={getRef("Proteínas Totales", "6.4 - 8.3 g/dL")} />
          <ExamRow label="Albúmina" result={data?.albumina} reference={getRef("Albúmina", "3.5 - 5.2 g/dL")} />
          <ExamRow label="Globulinas" result={data?.globulinas} reference={getRef("Globulinas", "2.3 - 3.4 g/dL")} />
          <ExamRow label="Relación A/G" result={data?.relacion_ag} reference={getRef("Relación A/G", "1.1 - 2.2")} />
        </SectionCard>
      )}

      {data?.observacion && data.observacion.trim() !== "" && (
        <View style={styles.obsCard}>
          <Text style={styles.obsTitle}>OBSERVACIONES</Text>
          <Text style={styles.obsText}>{data.observacion}</Text>
        </View>
      )}

    </View>
  );
};

export default QuimicaContent;