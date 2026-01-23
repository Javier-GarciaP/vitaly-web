import { View, StyleSheet, Text } from "@react-pdf/renderer";
import CommonHeader from "../components/CommonHeader";

const styles = StyleSheet.create({
  container: {
    paddingTop: 5,
  },
  // Card
  card: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    marginBottom: 8,
    marginTop: 5,
    overflow: "hidden",
  },
  cardHeader: {
    backgroundColor: "#800020",
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  cardTitle: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardBody: {
    padding: 8,
    backgroundColor: "#fafafa",
  },

  infoRow: {
    flexDirection: "row",
    marginBottom: 5,
    alignItems: 'baseline',
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 2,
  },
  label: {
    fontSize: 8.5,
    fontWeight: "bold",
    width: 90,
    color: '#475569',
  },
  value: {
    fontSize: 9.5,
    flex: 1,
    color: '#0f172a',
  },

  resultContainer: {
    marginTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#800020',
    paddingTop: 8,
  },
  resultTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#800020",
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  resultText: {
    fontSize: 10,
    lineHeight: 1.4,
    textAlign: "justify",
    color: '#1e293b',
  },
});

export const MiscelaneosContent = ({ data, patient, qrImage }: { data: any, patient: any, qrImage?: string }) => (
  <View style={styles.container}>
    <CommonHeader
      patient={{
        nombre: patient.nombre,
        cedula: patient.cedula,
        edad: patient.edad,
        fechaExamen: patient.fecha || "",
      }}
      title="PRUEBAS ESPECIALES"
      qrImage={qrImage}
    />

    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Detalle del Examen</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Examen:</Text>
          <Text style={styles.value}>{data?.examen_solicitado}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Método:</Text>
          <Text style={styles.value}>{data?.metodo}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Muestra:</Text>
          <Text style={styles.value}>{data?.muestra}</Text>
        </View>

        {data?.resultado_texto && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>RESULTADO</Text>
            <Text style={styles.resultText}>{data.resultado_texto}</Text>
          </View>
        )}
      </View>
    </View>
  </View>
);

export default MiscelaneosContent;
