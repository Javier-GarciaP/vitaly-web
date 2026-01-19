import React from 'react';
import { View, StyleSheet, Text } from '@react-pdf/renderer';
import CommonHeader from '../components/CommonHeader';
import CommonFooter from '../components/CommonFooter';
import { BacteriologiaData, Paciente } from '@/types/types';

interface BacteriologiaReportProps {
  data: BacteriologiaData;
  patient: Paciente;
  qrImage?: string;
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 5 },
  // Card Styles
  card: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    marginBottom: 10,
    backgroundColor: '#fff',
    minHeight: 150, // Card principal
  },
  cardHeader: {
    backgroundColor: "#800020",
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  cardTitle: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: 'center',
  },
  cardBody: {
    padding: 10,
  },

  muestraSection: {
    flexDirection: 'row',
    marginBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 4,
    alignItems: 'center',
  },
  labelBold: { fontSize: 9, fontWeight: 'bold', width: 60, color: '#475569', textTransform: 'uppercase' },
  valueText: { fontSize: 9, flex: 1, color: '#0f172a', fontWeight: 'medium' },

  sectionBox: {
    marginTop: 6,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#800020',
    textTransform: 'uppercase',
  },
  textAreaContent: { fontSize: 9, lineHeight: 1.4, textAlign: 'justify', color: '#334155' },
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

const BacteriologiaContent: React.FC<BacteriologiaReportProps> = ({ data, patient, qrImage }) => {
  return (
    <View style={styles.container}>
      <CommonHeader
        patient={{
          nombre: patient.nombre,
          cedula: patient.cedula,
          edad: patient.edad,
          fechaExamen: patient.fecha || "",
        }}
        title="Bacteriología / Antibiograma"
        qrImage={qrImage}
      />

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Informe de Cultivo</Text>
        </View>
        <View style={styles.cardBody}>
          {data?.muestra && (
            <View style={styles.muestraSection}>
              <Text style={styles.labelBold}>Muestra:</Text>
              <Text style={styles.valueText}>{data.muestra}</Text>
            </View>
          )}

          <BacterioSection title="Observación Directa" value={data?.obs_directa} />
          <BacterioSection title="Tinción Gram" value={data?.gram} />

          {(data?.recuento) && (
            <View style={{ borderTopWidth: 0.5, borderTopColor: '#e2e8f0', marginVertical: 4 }} />
          )}
          <BacterioSection title="Recuento de Colonias" value={data?.recuento} />

          {(data?.cultivo) && (
            <View style={{ borderTopWidth: 0.5, borderTopColor: '#e2e8f0', marginVertical: 4 }} />
          )}
          <BacterioSection title="Cultivo" value={data?.cultivo} />

          {(data?.cultivo_hongos) && (
            <View style={{ borderTopWidth: 0.5, borderTopColor: '#e2e8f0', marginVertical: 4 }} />
          )}
          <BacterioSection title="Cultivo de Hongos" value={data?.cultivo_hongos} />
        </View>
      </View>

      <CommonFooter />
    </View>
  );
};

export default BacteriologiaContent;