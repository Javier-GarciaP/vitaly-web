import React from "react";
import { View, StyleSheet, Text } from "@react-pdf/renderer";
import CommonHeader from "../components/CommonHeader";
import { CoagulacionData, Paciente } from "@/types/types";

// Interfaz para las referencias dinámicas
interface ValorReferencia {
  nombre_examen: string;
  valor_referencia: string;
}

interface CoagulacionReportProps {
  data: CoagulacionData;
  patient: Paciente;
  qrImage?: string;
  references?: ValorReferencia[]; // Nueva prop
}

interface FieldProps {
  label: string;
  value?: string;
  reference?: string; // Añadido para mostrar el valor de referencia
}

const styles = StyleSheet.create({
  groupContainer: {
    border: "0.5pt solid #6e2020",
    marginTop: 10,
    marginBottom: 5,
    borderRadius: 2,
  },
  groupTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#6e2020",
    textAlign: "center",
    paddingVertical: 3,
  },
  gridContent: {
    padding: 6,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  boxField: {
    width: "31%",
    marginRight: "2%",
    marginBottom: 5,
    border: "0.5pt solid #ccc",
  },
  boxLabel: {
    fontSize: 7,
    fontWeight: "bold",
    backgroundColor: "#f5f5f5",
    paddingLeft: 2,
    color: "#444",
  },
  boxValue: {
    fontSize: 9,
    padding: 2,
    textAlign: "center",
    minHeight: 12,
  },
  verticalList: {
    padding: 6,
  },
  inlineField: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
    borderBottomWidth: 0.3,
    borderBottomColor: "#eee",
    paddingBottom: 2,
  },
  inlineLabel: { fontSize: 8, fontWeight: "bold", width: 90 },
  inlineValue: { fontSize: 9, width: 80 },
  inlineRef: {
    fontSize: 8,
    color: "#666",
    flex: 1,
    textAlign: "right",
    fontStyle: "italic",
  },
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
  // Función para buscar referencias en la BD
  const getRef = (nombre: string, fallback: string) => {
    if (!references) return fallback;
    const refObj = references.find(
      (r) => r.nombre_examen.toLowerCase() === nombre.toLowerCase()
    );
    return refObj ? refObj.valor_referencia : fallback;
  };

  const hasTP = !!(
    data?.tp_control ||
    data?.tp_paciente ||
    data?.tp_act ||
    data?.tp_razon ||
    data?.tp_inr
  );
  const hasTPT = !!(data?.tpt_control || data?.tpt_paciente);

  return (
    <View>
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

      {/* SECCIÓN: TP */}
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

      {/* SECCIÓN: TPT */}
      {hasTPT && (
        <View style={styles.groupContainer}>
          <Text style={styles.groupTitle}>
            Tiempo de Tromboplastina Parcial Activa (TPT)
          </Text>
          <View style={styles.verticalList}>
            <InlineField label="T.P.T. Control" value={data?.tpt_control} />
            <InlineField label="T.P.T. Paciente" value={data?.tpt_paciente} />
          </View>
        </View>
      )}

      {/* SECCIÓN: FIBRINÓGENO (Dinamizado) */}
      {data.fibrinogeno && (
        <View style={styles.groupContainer}>
          <Text style={styles.groupTitle}>Fibrinógeno</Text>
          <View style={styles.verticalList}>
            <InlineField
              label="Resultado"
              value={`${data.fibrinogeno}`}
              reference={getRef("Fibrinógeno", "70 - 120 %")}
            />
          </View>
        </View>
      )}

      {/* Información Adicional */}
      <View style={{ marginTop: 5, paddingLeft: 8, flexDirection: "row" }}>
        {data?.anticoagulado && (
          <Text style={{ fontSize: 8, marginRight: 15 }}>
            Anticoagulado:{" "}
            <Text style={{ fontWeight: "bold" }}>{data.anticoagulado}</Text>
          </Text>
        )}
        {data?.medicamento && (
          <Text style={{ fontSize: 8 }}>
            Medicamento:{" "}
            <Text style={{ fontWeight: "bold" }}>{data.medicamento}</Text>
          </Text>
        )}
      </View>

      {/* Observaciones */}
      {typeof data?.observacion === "string" &&
        data.observacion.trim() !== "" && (
          <View
            style={{
              marginTop: 10,
              padding: 8,
              backgroundColor: "#f9f9f9",
              borderLeftWidth: 2,
              borderLeftColor: "#6e2020",
            }}
          >
            <Text style={{ fontSize: 8, fontWeight: "bold", color: "#6e2020" }}>
              Observaciones:
            </Text>
            <Text style={{ fontSize: 8, marginTop: 2 }}>
              {data.observacion}
            </Text>
          </View>
        )}
    </View>
  );
};

export default CoagulacionContent;
