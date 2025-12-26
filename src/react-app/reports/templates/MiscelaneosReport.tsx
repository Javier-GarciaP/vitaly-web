import React from 'react';
import { View, StyleSheet, Text } from '@react-pdf/renderer';
import ReportLayout from '../components/ReportLayout';
import CommonHeader from '../components/CommonHeader';
import CommonFooter from '../components/CommonFooter';
// 1. Importamos los tipos centralizados
import { MiscelaneosData, Paciente } from '@/types/types';

interface MiscelaneosReportProps {
  data: MiscelaneosData;
  patient: Paciente;
  qrImage?: string;
}

interface MiscelaneosRowProps {
  label: string;
  value?: string;
}

const styles = StyleSheet.create({
  infoSection: {
    marginTop: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#6e2020', // Sincronizado con el color del lab
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  label: {
    fontSize: 9,
    fontWeight: 'bold',
    width: 110,
  },
  value: {
    fontSize: 9,
    flex: 1,
  },
  resultContainer: {
    marginTop: 20,
    flex: 1, 
    padding: 10,
    borderWidth: 0.5,
    borderColor: '#eee',
    borderRadius: 4,
  },
  resultTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6e2020',
    marginBottom: 8,
    textDecoration: 'underline',
  },
  resultText: {
    fontSize: 10,
    lineHeight: 1.6,
    textAlign: 'justify',
    whiteSpace: 'pre-wrap', // Importante para respetar los saltos de línea del JSON
  },
});

const MiscelaneosRow: React.FC<MiscelaneosRowProps> = ({ label, value }) => {
  if (!value || value.trim() === "" || value === "null") return null;
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const MiscelaneosReport: React.FC<MiscelaneosReportProps> = ({ data, patient, qrImage }) => {
  return (
    <ReportLayout>
      <CommonHeader patient={patient} title="Reporte de Examen Especial" qrImage={qrImage}/>

      {/* Sección de Datos del Examen - Sincronizado con BD */}
      <View style={styles.infoSection}>
        <MiscelaneosRow label="Examen Solicitado" value={data?.examen_solicitado} />
        <MiscelaneosRow label="Método" value={data?.metodo} />
        <MiscelaneosRow label="Muestra" value={data?.muestra} />
      </View>

      {/* Área de Texto para Resultados - Sincronizado con resultado_texto */}
      {data?.resultado_texto && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>RESULTADO:</Text>
          <Text style={styles.resultText}>
            {data.resultado_texto}
          </Text>
        </View>
      )}

      <CommonFooter />
    </ReportLayout>
  );
};

export default MiscelaneosReport;