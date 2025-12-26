import React from 'react';
import { View, StyleSheet, Text } from '@react-pdf/renderer';
// Eliminamos ReportLayout
import CommonHeader from '../components/CommonHeader';
import CommonFooter from '../components/CommonFooter';
import { BacteriologiaData, Paciente } from '@/types/types';

interface BacteriologiaReportProps {
  data: BacteriologiaData;
  patient: Paciente;
  qrImage?: string;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  muestraSection: {
    flexDirection: 'row',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#6e2020',
    paddingBottom: 3,
  },
  labelBold: { fontSize: 10, fontWeight: 'bold', width: 60 },
  valueText: { fontSize: 10, flex: 1 },
  sectionBox: {
    border: '0.5pt dashed #444',
    marginBottom: 8,
    padding: 6,
    backgroundColor: '#fcfcfc'
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#6e2020',
    textDecoration: 'underline',
  },
  textAreaContent: { fontSize: 9, lineHeight: 1.3, textAlign: 'justify' },
});

const BacterioSection: React.FC<{ title: string; value?: string }> = ({ title, value }) => {
  if (!value || value.trim() === "" || value === "null") return null;
  return (
    <View style={styles.sectionBox}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.textAreaContent}>{value}</Text>
    </View>
  );
};

const BacteriologiaReport: React.FC<BacteriologiaReportProps> = ({ data, patient, qrImage }) => {
  return (
    <View style={styles.container}>
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

      {data?.muestra && (
        <View style={styles.muestraSection}>
          <Text style={styles.labelBold}>Muestra:</Text>
          <Text style={styles.valueText}>{data.muestra}</Text>
        </View>
      )}

      <BacterioSection title="Observación Directa" value={data?.obs_directa} />
      <BacterioSection title="Tinción Gram" value={data?.gram} />
      <BacterioSection title="Recuento de Colonias" value={data?.recuento} />
      <BacterioSection title="Cultivo" value={data?.cultivo} />
      <BacterioSection title="Cultivo de Hongos" value={data?.cultivo_hongos} />

      <CommonFooter />
    </View>
  );
};

export default BacteriologiaReport;