import React from 'react';
import { View, StyleSheet, Text } from '@react-pdf/renderer';
import ReportLayout from '../components/ReportLayout';
import CommonHeader from '../components/CommonHeader';
import CommonFooter from '../components/CommonFooter';
import { OrinaData, Paciente } from '@/types/types';

interface OrinaReportProps {
  data: OrinaData;
  patient: Paciente;
  qrImage?: string;
}

interface OrinaRowProps {
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
    paddingRight: 5,
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
    height: 1.2,
    backgroundColor: '#6e2020',
    marginVertical: 6,
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#6e2020',
    marginTop: 6,
    marginBottom: 3,
    textTransform: 'uppercase',
    backgroundColor: '#fdf2f2',
    padding: 2,
  },
  observationsContainer: {
    marginTop: 8,
    padding: 5,
    borderLeftWidth: 2,
    borderLeftColor: '#6e2020',
    backgroundColor: '#f9f9f9',
  },
  obsTitle: { fontSize: 8, fontWeight: 'bold', color: '#6e2020' },
  obsText: { fontSize: 8, marginTop: 2, lineHeight: 1.2 }
});

const OrinaRow: React.FC<OrinaRowProps> = ({ label1, value1, label2, value2 }) => {
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
            <Text style={styles.label}>{label2}:</Text>
            <Text style={styles.value}>{value2}</Text>
          </>
        )}
      </View>
    </View>
  );
};

const OrinaReport: React.FC<OrinaReportProps> = ({ data, patient, qrImage }) => {
  return (
    <ReportLayout>
      <CommonHeader
        patient={{
          nombre: patient.nombre,
          cedula: patient.cedula,
          edad: patient.edad, // Asegúrate de traer este campo desde tu base de datos
          fechaExamen: patient.fecha || "", // La fecha que guardaste cuando se creó el examen
        }}
        title="UROANÁLISIS COMPLETO"
        qrImage={qrImage}
      />

      {/* SECCIÓN 1: CARACTERES GENERALES */}
      <Text style={styles.sectionTitle}>I. Caracteres Generales</Text>
      <OrinaRow label1="Color" value1={data?.color} label2="Aspecto" value2={data?.aspecto} />
      <OrinaRow label1="Reacción" value1={data?.reaccion} label2="Densidad" value2={data?.densidad} />
      <OrinaRow label1="pH" value1={data?.ph} />

      {/* SECCIÓN 2: EXAMEN QUÍMICO */}
      <Text style={styles.sectionTitle}>II. Examen Químico</Text>
      <OrinaRow label1="Proteína" value1={data?.proteina} label2="Glucosa" value2={data?.glucosa} />
      <OrinaRow label1="Hemoglobina" value1={data?.hemoglobina} label2="Nitritos" value2={data?.nitritos} />
      <OrinaRow label1="Pigmento Bil." value1={data?.pigmento_bil} label2="Acetona" value2={data?.acetona} />
      <OrinaRow label1="Urobilín" value1={data?.urobilin} />

      <View style={styles.divider} />

      {/* SECCIÓN 3: EXAMEN DEL SEDIMENTO (Microscópico) */}
      <Text style={styles.sectionTitle}>III. Examen del Sedimento</Text>
      <OrinaRow label1="Células Epiteliales" value1={data?.celulas_epit} label2="Filam. de moco" value2={data?.filam_moco} />
      <OrinaRow label1="Leucocitos" value1={data?.leucocitos} label2="Hematíes" value2={data?.hematies} />
      <OrinaRow label1="Bacterias" value1={data?.bacterias} label2="Levaduras" value2={data?.levaduras} />
      <OrinaRow label1="Cilindros" value1={data?.cilindros} label2="Cristales" value2={data?.cristales} />
      <OrinaRow label1="Bacteristales" value1={data?.bacteristales} />

      {/* OBSERVACIONES */}
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

export default OrinaReport;