import { View, StyleSheet, Text, Page } from "@react-pdf/renderer";
import CommonHeader from "../components/CommonHeader";

const styles = StyleSheet.create({
  page: {
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  mainContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  leftColumn: {
    width: '50%',
    paddingRight: 20,
    paddingLeft: 10,
    borderRightWidth: 0.5,
    borderRightColor: '#e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    height: '100%',
  },
  rightColumn: {
    width: '50%',
  },

  // Card
  card: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    marginBottom: 8,
    marginTop: 10,
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
    fontWeight: 'medium',
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
    fontSize: 10, // Un poco más grande para el resultado principal
    lineHeight: 1.5,
    textAlign: "justify",
    color: '#1e293b',
  },
});

/**
 * COMPONENTE PARA UNA PÁGINA INDEPENDIENTE
 * Se exporta para que ReportViewer pueda mapearlo.
 */
export const MiscelaneosContent = ({ data, patient, qrImage }: { data: any, patient: any, qrImage?: string }) => (
  <Page size="LETTER" orientation="landscape" style={styles.page}>
    <View style={styles.mainContainer}>
      <View style={styles.leftColumn}>
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
      <View style={styles.rightColumn} />
    </View>
  </Page>
);

export default MiscelaneosContent;