import React from "react";
import { View, StyleSheet, Text } from "@react-pdf/renderer";
// Eliminamos ReportLayout
import CommonHeader from "../components/CommonHeader";
import CommonFooter from "../components/CommonFooter";
import { BacteriologiaData, Paciente } from "@/types/types";

interface AntibiogramaReportProps {
  data: BacteriologiaData;
  patient: Paciente;
  qrImage?: string;
}

const styles = StyleSheet.create({
  // Mantenemos tus estilos exactamente igual...
  container: { flex: 1 }, // Añadimos un contenedor base
  germenSection: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#6e2020",
    paddingBottom: 5,
  },
  infoRow: { flexDirection: "row", marginBottom: 2 },
  labelBold: { fontSize: 9, fontWeight: "bold", width: 110, color: "#333" },
  valueText: { fontSize: 9, flex: 1 },
  table: { marginTop: 10, borderWidth: 0.5, borderColor: "#bfbfbf" },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#bfbfbf",
  },
  tableHeader: {
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1.5,
    borderBottomColor: "#6e2020",
  },
  tableColHeader: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#6e2020",
    padding: 4,
    textAlign: "center",
  },
  tableCol: { fontSize: 8, padding: 4, textAlign: "center" },
  colAntibiotico: { width: "40%", textAlign: "left" },
  colGermen: { width: "30%", borderLeftWidth: 0.5, borderLeftColor: "#bfbfbf" },
});

const AntibiogramaReport: React.FC<AntibiogramaReportProps> = ({
  data,
  patient,
  qrImage,
}) => {
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

      <View style={styles.germenSection}>
        {data?.muestra && (
          <View style={styles.infoRow}>
            <Text style={styles.labelBold}>Muestra:</Text>
            <Text style={styles.valueText}>{data.muestra}</Text>
          </View>
        )}
        {data?.germen_a && (
          <View style={styles.infoRow}>
            <Text style={styles.labelBold}>Germen A:</Text>
            <Text style={styles.valueText}>{data.germen_a}</Text>
          </View>
        )}
        {data?.germen_b && (
          <View style={styles.infoRow}>
            <Text style={styles.labelBold}>Germen B:</Text>
            <Text style={styles.valueText}>{data.germen_b}</Text>
          </View>
        )}
      </View>

      {data?.antibiograma_list && data.antibiograma_list.length > 0 && (
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableColHeader, styles.colAntibiotico]}>
              Antibiótico
            </Text>
            <Text style={[styles.tableColHeader, styles.colGermen]}>
              Sensib. A
            </Text>
            <Text style={[styles.tableColHeader, styles.colGermen]}>
              Sensib. B
            </Text>
          </View>
          {data.antibiograma_list.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCol, styles.colAntibiotico]}>
                {item.nombre}
              </Text>
              <Text style={[styles.tableCol, styles.colGermen]}>
                {item.a || "-"}
              </Text>
              <Text style={[styles.tableCol, styles.colGermen]}>
                {item.b || "-"}
              </Text>
            </View>
          ))}
        </View>
      )}

      <CommonFooter />
    </View>
  );
};

export default AntibiogramaReport;
