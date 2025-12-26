import React from 'react';
import { View, StyleSheet, Text } from '@react-pdf/renderer';
import ReportLayout from '../components/ReportLayout';
import CommonHeader from '../components/CommonHeader';
import CommonFooter from '../components/CommonFooter';
import ExamRow from '../components/ExamRow';
// 1. Importamos los tipos centralizados
import { HematologiaData, Paciente } from '@/types/types';

interface HematologiaReportProps {
  data: HematologiaData;
  patient: Paciente;
  qrImage?: string;
}

interface SectionTitleProps {
  title: string;
}

const styles = StyleSheet.create({
  sectionHeader: {
    backgroundColor: '#f5f5f5',
    padding: 2,
    marginTop: 8,
    marginBottom: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#6e2020',
  },
  sectionHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#6e2020',
    textTransform: 'uppercase',
  },
  vsgContainer: {
    marginTop: 10,
    border: '0.5pt dashed #444',
    padding: 5,
    flexDirection: 'row',
  },
  vsgData: {
    width: '70%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  vsgRef: {
    width: '30%',
    fontSize: 7,
    color: '#555',
    borderLeftWidth: 0.5,
    borderLeftColor: '#ccc',
    paddingLeft: 5,
  },
  vsgField: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginRight: 15,
  },
  vsgLabel: { fontSize: 8, fontWeight: 'bold', marginRight: 4 },
  vsgValue: { fontSize: 9, borderBottomWidth: 0.5, minWidth: 30, textAlign: 'center' },
  observations: {
    marginTop: 10,
    fontSize: 9,
    padding: 5,
    backgroundColor: '#f9f9f9',
    borderLeftWidth: 2,
    borderLeftColor: '#6e2020',
  }
});

const SectionTitle: React.FC<SectionTitleProps> = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionHeaderText}>{title}</Text>
  </View>
);

const HematologiaReport: React.FC<HematologiaReportProps> = ({ data, patient, qrImage }) => {
  return (
    <ReportLayout>
      <CommonHeader patient={patient} title="Análisis Hematológico" qrImage={qrImage}/>

      {/* SERIE ROJA - Sincronizado con llaves de BD */}
      <SectionTitle title="Serie Roja" />
      <ExamRow label="Hematíes" result={data?.hematies} reference="4.5 - 5.5 mill/mm³" />
      <ExamRow label="Hemoglobina" result={data?.hemoglobina} reference="12.0 - 16.0 g/dL" />
      <ExamRow label="Hematocrito" result={data?.hematocrito} reference="37.0 - 47.0 %" />
      <ExamRow label="V.C.M" result={data?.vcm} reference="80 - 100 fL" />
      <ExamRow label="H.C.M" result={data?.hcm} reference="27 - 31 pg" />
      <ExamRow label="C.H.C.M" result={data?.chcm} reference="32 - 36 g/dL" />

      {/* SERIE BLANCA - Sincronizado con llaves de BD */}
      <SectionTitle title="Serie Blanca" />
      <ExamRow label="Leucocitos" result={data?.leucocitos} reference="5.000 - 10.000 /mm³" />
      <ExamRow label="Neutrófilos" result={data?.neutrofilos} reference="55 - 70 %" />
      <ExamRow label="Linfocitos" result={data?.linfocitos} reference="20 - 40 %" />
      <ExamRow label="Monocitos" result={data?.monocitos} reference="2 - 8 %" />
      <ExamRow label="Eosinófilos" result={data?.eosinofilos} reference="1 - 4 %" />
      <ExamRow label="Basófilos" result={data?.basofilos} reference="0 - 1 %" />

      {/* SERIE PLAQUETARIA */}
      <SectionTitle title="Serie Plaquetaria" />
      <ExamRow label="Plaquetas" result={data?.plaquetas} reference="150.000 - 450.000 /mm³" />

      {/* SECCIÓN V.S.G. - Sincronizado con vsg_1h, vsg_2h, vsg_indice */}
      {(data?.vsg_1h || data?.vsg_2h) && (
        <View style={styles.vsgContainer}>
          <View style={styles.vsgData}>
            <Text style={{ fontSize: 9, fontWeight: 'bold', width: '100%', color: '#6e2020', marginBottom: 5 }}>V.S.G (Eritrosedimentación)</Text>
            <View style={styles.vsgField}>
              <Text style={styles.vsgLabel}>1 Hora:</Text>
              <Text style={styles.vsgValue}>{data?.vsg_1h}</Text>
            </View>
            <View style={styles.vsgField}>
              <Text style={styles.vsgLabel}>2 Hora:</Text>
              <Text style={styles.vsgValue}>{data?.vsg_2h}</Text>
            </View>
            <View style={styles.vsgField}>
              <Text style={styles.vsgLabel}>Índice:</Text>
              <Text style={styles.vsgValue}>{data?.vsg_indice}</Text>
            </View>
          </View>
          <View style={styles.vsgRef}>
            <Text>Hombres: {'<'} 15 mm/h</Text>
            <Text>Mujeres: {'<'} 20 mm/h</Text>
          </View>
        </View>
      )}

      {/* OBSERVACIONES - Sincronizado con observacion */}
      {data?.observacion && data.observacion.trim() !== "" && (
        <View style={styles.observations}>
          <Text style={{ fontWeight: 'bold', fontSize: 8, color: '#6e2020' }}>OBSERVACIONES:</Text>
          <Text style={{ fontSize: 9, marginTop: 2 }}>{data.observacion}</Text>
        </View>
      )}

      <CommonFooter />
    </ReportLayout>
  );
};

export default HematologiaReport;