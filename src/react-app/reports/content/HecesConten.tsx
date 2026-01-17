import React from 'react';
import { View, StyleSheet, Text } from '@react-pdf/renderer';
import CommonHeader from '../components/CommonHeader';
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
  container: {
    paddingTop: 5,
  },
  // Card Styles
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
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#600018",
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

  gridRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 2,
    alignItems: 'center',
  },
  fieldGroup: {
    flexDirection: 'row',
    width: '50%',
    alignItems: 'center',
  },
  label: {
    fontSize: 8.5,
    fontWeight: 'bold',
    width: '55%',
    color: '#475569',
  },
  value: {
    fontSize: 9,
    width: '45%',
    color: '#0f172a',
    fontWeight: 'medium',
  },
  fullRow: {
    flexDirection: 'row',
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  fullLabel: {
    fontSize: 8.5,
    fontWeight: 'bold',
    width: '35%',
    color: '#475569',
  },
  fullValue: {
    fontSize: 9,
    width: '65%',
    color: '#0f172a',
  },

  // Observations and Parasites
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
    fontWeight: 'bold',
    color: '#800020',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  obsText: {
    fontSize: 8.5,
    color: '#334155',
    lineHeight: 1.3
  }
});

const SectionCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    <View style={styles.cardBody}>
      {children}
    </View>
  </View>
);

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

const HcesContent: React.FC<HecesReportProps> = ({ data, patient, qrImage }) => {
  return (
    <View style={styles.container}>
      <CommonHeader
        patient={{
          nombre: patient.nombre,
          cedula: patient.cedula,
          edad: patient.edad,
          fechaExamen: patient.fecha || "",
        }}
        title="COPROANÁLISIS"
        qrImage={qrImage}
      />

      <SectionCard title="Examen Macroscópico">
        <HecesRow label1="Color" value1={data?.color} label2="Consistencia" value2={data?.consistencia} />
        <HecesRow label1="Moco" value1={data?.moco} label2="Aspecto" value2={data?.aspecto} />
        <HecesRow label1="H.B." value1={data?.hb} label2="Reacción" value2={data?.reaccion} />
        <HecesRow label1="pH" value1={data?.ph} />
      </SectionCard>

      <SectionCard title="Microscópico & Químico">
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
      </SectionCard>

      {data?.parasitos && (
        <View style={styles.obsCard}>
          <Text style={styles.obsTitle}>Investigación de Parásitos</Text>
          <Text style={styles.obsText}>{data.parasitos}</Text>
        </View>
      )}

      {data?.observacion && (
        <View style={styles.obsCard}>
          <Text style={styles.obsTitle}>Observaciones</Text>
          <Text style={styles.obsText}>{data.observacion}</Text>
        </View>
      )}

    </View>
  );
};

export default HcesContent;