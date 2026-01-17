import React from "react";
import { View, StyleSheet, Text } from "@react-pdf/renderer";
import CommonHeader from "../components/CommonHeader";
import { CoagulacionData, Paciente } from "@/types/types";

interface ValorReferencia {
  nombre_examen: string;
  valor_referencia: string;
}

interface CoagulacionReportProps {
  data: CoagulacionData;
  patient: Paciente;
  qrImage?: string;
  references?: ValorReferencia[];
}

interface FieldProps {
  label: string;
  value?: string;
  reference?: string;
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

  // Grid/List Styles
  gridContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  boxField: {
    width: "33%",
    paddingRight: 5,
    marginBottom: 6,
  },
  boxLabel: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#475569",
    marginBottom: 1,
    textTransform: 'uppercase',
  },
  boxValue: {
    fontSize: 9,
    fontWeight: 'medium',
    color: "#0f172a",
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 1,
  },
  verticalList: {
  },
  inlineField: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 2,
  },
  inlineLabel: { fontSize: 8.5, fontWeight: "bold", width: 100, color: '#334155' },
  inlineValue: { fontSize: 9, width: 80, fontWeight: 'bold', color: '#0f172a' },
  inlineRef: {
    fontSize: 8,
    color: "#666",
    flex: 1,
    textAlign: "right",
  },

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
    fontSize: 8.5,
    color: "#334155",
    lineHeight: 1.3
  },
  infoText: {
    fontSize: 8,
    color: "#475569",
    marginRight: 15,
  },
  infoBold: {
    fontWeight: "bold",
    color: "#0f172a",
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

const BoxField: React.FC<FieldProps> = ({ label, value }) => {
  if (!value || value.trim() === "" || value === "null") return null;
  return (
    <View style={styles.boxField}>
      <Text style={styles.boxLabel}>{label}</Text>
      <Text style={styles.boxValue}>{value}</Text>
    </View>
  );
};

const InlineField: React.FC<FieldProps> = ({ label, value, reference }) => {
  if (!value || value.trim() === "" || value === "null") return null;
  return (
    <View style={styles.inlineField}>
      <Text style={styles.inlineLabel}>{label}:</Text>
      <Text style={styles.inlineValue}>{value}</Text>
      {reference && <Text style={styles.inlineRef}>Ref: {reference}</Text>}
    </View>
  );
};

const CoagulacionContent: React.FC<CoagulacionReportProps> = ({
  data,
  patient,
  qrImage,
  references,
}) => {
  const getRef = (nombre: string, fallback: string) => {
    if (!references) return fallback;
    const refObj = references.find(
      (r) => r.nombre_examen.toLowerCase() === nombre.toLowerCase()
    );
    return refObj ? refObj.valor_referencia : fallback;
  };

  const hasTP = !!(data?.tp_control || data?.tp_paciente || data?.tp_act || data?.tp_razon || data?.tp_inr);
  const hasTPT = !!(data?.tpt_control || data?.tpt_paciente);
  const hasAdditionalInfo = !!(data?.anticoagulado || data?.medicamento);
  const hasObservations = typeof data?.observacion === "string" && data.observacion.trim() !== "";

  return (
    <View style={styles.container}>
      <CommonHeader
        patient={{
          nombre: patient.nombre,
          cedula: patient.cedula,
          edad: patient.edad,
          fechaExamen: patient.fecha || "",
        }}
        title="COAGULACIÓN"
        qrImage={qrImage}
      />

      {hasTP && (
        <SectionCard title="Tiempo de Protrombina (TP)">
          <View style={styles.gridContent}>
            <BoxField label="Control" value={data?.tp_control} />
            <BoxField label="Paciente" value={data?.tp_paciente} />
            <BoxField label="% Actividad" value={data?.tp_act} />
            <BoxField label="Razón" value={data?.tp_razon} />
            <BoxField label="I.N.R." value={data?.tp_inr} />
            <BoxField label="I.S.I." value={data?.tp_isi} />
          </View>
        </SectionCard>
      )}

      {hasTPT && (
        <SectionCard title="Tiempo de Tromboplastina Parcial Activa (TPT)">
          <View style={styles.verticalList}>
            <InlineField label="T.P.T. Control" value={data?.tpt_control} />
            <InlineField label="T.P.T. Paciente" value={data?.tpt_paciente} />
          </View>
        </SectionCard>
      )}

      {data.fibrinogeno && (
        <SectionCard title="Fibrinógeno">
          <View style={styles.verticalList}>
            <InlineField
              label="Resultado"
              value={`${data.fibrinogeno}`}
              reference={getRef("Fibrinógeno", "200 - 400 mg/dL")}
            />
          </View>
        </SectionCard>
      )}

      {hasAdditionalInfo && (
        <SectionCard title="Información Adicional">
          <View style={{ flexDirection: "row" }}>
            {data?.anticoagulado && (
              <Text style={styles.infoText}>
                Anticoagulado: <Text style={styles.infoBold}>{data.anticoagulado}</Text>
              </Text>
            )}
            {data?.medicamento && (
              <Text style={styles.infoText}>
                Medicamento: <Text style={styles.infoBold}>{data.medicamento}</Text>
              </Text>
            )}
          </View>
        </SectionCard>
      )}

      {hasObservations && (
        <SectionCard title="Observaciones">
          <Text style={styles.obsText}>
            {data.observacion}
          </Text>
        </SectionCard>
      )}
    </View>
  );
};

export default CoagulacionContent;
