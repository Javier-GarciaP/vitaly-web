import React from 'react';
import { View, StyleSheet, Text } from '@react-pdf/renderer';
import ReportLayout from '../components/ReportLayout';
import CommonHeader from '../components/CommonHeader';
import CommonFooter from '../components/CommonFooter';
// 1. Importamos los tipos centralizados
import { HecesData, Paciente } from '@/types/types';

interface HecesReportProps {
  data: HecesData;
  patient: Paciente;
  qrImage?: string;
}

interface HecesRowProps {
  label1: string;
  value1?: string;
  label2?: string;
  value2?: string;
}

const styles = StyleSheet.create({
  gridRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    paddingVertical: 3,
  },
  fieldGroup: {
    flexDirection: 'row',
    width: '50%',
  },
  label: {
    fontSize: 9,
    fontWeight: 'bold',
    width: '60%',
  },
  value: {
    fontSize: 9,
    width: '40%',
  },
  divider: {
    height: 1.5,
    backgroundColor: '#6e2020',
    marginVertical: 8,
  },
  fullRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  fullLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    width: '35%',
  },
  fullValue: {
    fontSize: 9,
    width: '65%',
  },
  obsSection: {
    marginTop: 8,
    padding: 6,
    backgroundColor: '#f9f9f9',
    borderLeftWidth: 2,
    borderLeftColor: '#6e2020',
  },
  obsTitle: { 
    fontSize: 8, 
    fontWeight: 'bold', 
    color: '#6e2020',
    textTransform: 'uppercase'
  },
  obsText: { 
    fontSize: 9, 
    marginTop: 2,
    lineHeight: 1.2
  }
});

const HecesRow: React.FC<HecesRowProps> = ({ label1, value1, label2, value2 }) => {
  const show1 = value1 && value1.trim() !== "" && value1 !== "null";
  const show2 = value2 && value2.trim() !== "" && value2 !== "null";
  if (!show1 && !show2) return null;

  return (
    <View style={styles.gridRow}>
      <View style={styles.fieldGroup}>
        {show1 && (
          <>
            <Text style={styles.label}>{label1}:</Text>
            <Text style={styles.value}>{value1}</Text>
          </>
        )}
      </View>
      <View style={styles.fieldGroup}>
        {show2 && (
          <>
            {label2 && <Text style={styles.label}>{label2}:</Text>}
            <Text style={styles.value}>{value2}</Text>
          </>
        )}
      </View>
    </View>
  );
};

const HecesReport: React.FC<HecesReportProps> = ({ data, patient, qrImage }) => {
  return (
    <ReportLayout>
      <CommonHeader
        patient={{
          nombre: patient.nombre,
          cedula: patient.cedula,
          edad: patient.edad, // Asegúrate de traer este campo desde tu base de datos
          fechaExamen: patient.fecha || "", // La fecha que guardaste cuando se creó el examen
        }}
        title="COPROANÁLISIS"
        qrImage={qrImage}
      />

      {/* EXAMEN FÍSICO - Ajustado para asegurar visualización */}
      <HecesRow label1="Color" value1={data?.color} label2="Consistencia" value2={data?.consistencia} />
      <HecesRow label1="Moco" value1={data?.moco} label2="Aspecto" value2={data?.aspecto} />
      <HecesRow label1="H.B." value1={data?.hb} label2="Reacción" value2={data?.reaccion} />
      <HecesRow label1="pH" value1={data?.ph} />

      <View style={styles.divider} />

      {/* EXAMEN QUÍMICO / MICROSCÓPICO - Sincronizado con nombres de BD */}
      {data?.sangre_oculta && (
        <View style={styles.fullRow}>
          <Text style={styles.fullLabel}>Sangre Oculta:</Text>
          <Text style={styles.fullValue}>{data.sangre_oculta}</Text>
        </View>
      )}
      {data?.az_reductores && (
        <View style={styles.fullRow}>
          <Text style={styles.fullLabel}>Az. Reductores:</Text>
          <Text style={styles.fullValue}>{data.az_reductores}</Text>
        </View>
      )}
      {data?.po_nucleares && (
        <View style={styles.fullRow}>
          <Text style={styles.fullLabel}>Polimorfonucleares:</Text>
          <Text style={styles.fullValue}>{data.po_nucleares}</Text>
        </View>
      )}
      {data?.re_alimenticios && (
        <View style={styles.fullRow}>
          <Text style={styles.fullLabel}>Restos Alimenticios:</Text>
          <Text style={styles.fullValue}>{data.re_alimenticios}</Text>
        </View>
      )}
      {data?.flora_bacteriana && (
        <View style={styles.fullRow}>
          <Text style={styles.fullLabel}>Flora Bacteriana:</Text>
          <Text style={styles.fullValue}>{data.flora_bacteriana}</Text>
        </View>
      )}

      <View style={styles.divider} />

      {/* PARÁSITOS Y OBSERVACIONES */}
      {data?.parasitos && (
        <View style={styles.obsSection}>
          <Text style={styles.obsTitle}>Investigación de Parásitos:</Text>
          <Text style={styles.obsText}>{data.parasitos}</Text>
        </View>
      )}

      {data?.observacion && (
        <View style={styles.obsSection}>
          <Text style={styles.obsTitle}>Observaciones:</Text>
          <Text style={styles.obsText}>{data.observacion}</Text>
        </View>
      )}

      <CommonFooter />
    </ReportLayout>
  );
};

export default HecesReport;