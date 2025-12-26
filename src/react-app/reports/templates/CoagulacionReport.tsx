import React from 'react';
import { View, StyleSheet, Text } from '@react-pdf/renderer';
import ReportLayout from '../components/ReportLayout';
import CommonHeader from '../components/CommonHeader';
import CommonFooter from '../components/CommonFooter';
// 1. Importamos los tipos centralizados
import { CoagulacionData, Paciente } from '@/types/types';

interface CoagulacionReportProps {
  data: CoagulacionData;
  patient: Paciente;
  qrImage?: string;
}

interface FieldProps {
  label: string;
  value?: string;
}

const styles = StyleSheet.create({
  groupContainer: {
    border: '0.5pt solid #6e2020',
    marginTop: 10,
    marginBottom: 5,
    borderRadius: 2,
  },
  groupTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#6e2020',
    textAlign: 'center',
    paddingVertical: 3,
  },
  gridContent: {
    padding: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  boxField: {
    width: '31%', 
    marginRight: '2%',
    marginBottom: 5,
    border: '0.5pt solid #ccc',
  },
  boxLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    backgroundColor: '#f5f5f5',
    paddingLeft: 2,
    color: '#444'
  },
  boxValue: {
    fontSize: 9,
    padding: 2,
    textAlign: 'center',
    minHeight: 12,
  },
  verticalList: {
    padding: 6,
  },
  inlineField: {
    flexDirection: 'row',
    marginBottom: 3,
    borderBottomWidth: 0.3,
    borderBottomColor: '#eee',
    paddingBottom: 2,
  },
  inlineLabel: { fontSize: 8, fontWeight: 'bold', width: 90 },
  inlineValue: { fontSize: 9, flex: 1 },
});

const BoxField: React.FC<FieldProps> = ({ label, value }) => {
  if (!value || value.trim() === "" || value === "null") return null;
  return (
    <View style={styles.boxField}>
      <Text style={styles.boxLabel}>{label}</Text>
      <Text style={styles.boxValue}>{value}</Text>
    </View>
  );
};

const InlineField: React.FC<FieldProps> = ({ label, value }) => {
  if (!value || value.trim() === "" || value === "null") return null;
  return (
    <View style={styles.inlineField}>
      <Text style={styles.inlineLabel}>{label}:</Text>
      <Text style={styles.inlineValue}>{value}</Text>
    </View>
  );
};

const CoagulacionReport: React.FC<CoagulacionReportProps> = ({ data, patient, qrImage }) => {
  // Validación basada en las llaves reales de la BD
  const hasTP = !!(data?.tp_control || data?.tp_paciente || data?.tp_act || data?.tp_razon || data?.tp_inr || data?.tp_isi);
  const hasTPT = !!(data?.tpt_control || data?.tpt_paciente || data?.fibrinogeno);

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

      {/* SECCIÓN: TIEMPO DE PROTROMBINA (TP) */}
      {hasTP && (
        <View style={styles.groupContainer}>
          <Text style={styles.groupTitle}>Tiempo de Protrombina (TP)</Text>
          <View style={styles.gridContent}>
            <BoxField label="Control" value={data?.tp_control} />
            <BoxField label="Paciente" value={data?.tp_paciente} />
            <BoxField label="% Actividad" value={data?.tp_act} />
            <BoxField label="Razón" value={data?.tp_razon} />
            <BoxField label="I.N.R." value={data?.tp_inr} />
            <BoxField label="I.S.I." value={data?.tp_isi} />
          </View>
        </View>
      )}

      {/* SECCIÓN: TIEMPO DE TROMBOPLASTINA (TPT) */}
      {hasTPT && (
        <View style={styles.groupContainer}>
          <Text style={styles.groupTitle}>Tiempo de Tromboplastina Parcial Activa (TPT)</Text>
          <View style={styles.verticalList}>
            <InlineField label="T.P.T. Control" value={data?.tpt_control} />
            <InlineField label="T.P.T. Paciente" value={data?.tpt_paciente} />
            <InlineField label="Fibrinógeno" value={data?.fibrinogeno} />
          </View>
        </View>
      )}

      {/* Otros datos adicionales */}
      <View style={{ marginTop: 5, paddingLeft: 5 }}>
        {data?.anticoagulado && (
           <Text style={{ fontSize: 8 }}>Anticoagulado: {data.anticoagulado}</Text>
        )}
        {data?.medicamento && (
           <Text style={{ fontSize: 8 }}>Medicamento: {data.medicamento}</Text>
        )}
      </View>

      {/* Observaciones */}
      {typeof data?.observacion === 'string' && data.observacion.trim() !== "" && (
        <View style={{ marginTop: 10, padding: 5, borderTopWidth: 0.5, borderTopColor: '#eee' }}>
          <Text style={{ fontSize: 8, fontWeight: 'bold' }}>Observaciones:</Text>
          <Text style={{ fontSize: 8 }}>{data.observacion}</Text>
        </View>
      )}

      <CommonFooter />
    </ReportLayout>
  );
};

export default CoagulacionReport;