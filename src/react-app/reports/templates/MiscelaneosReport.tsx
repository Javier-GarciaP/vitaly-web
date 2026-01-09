import React from "react";
import { View, StyleSheet, Text, Page } from "@react-pdf/renderer";
import ReportLayout from "../components/ReportLayout";
import CommonHeader from "../components/CommonHeader";
import CommonFooter from "../components/CommonFooter";

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
    paddingRight: 35,
    paddingLeft: 5,
    borderRightWidth: 0.5, 
    borderRightColor: '#ccc',
    borderRightStyle: 'dashed',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    height: '100%',
  },
  rightColumn: {
    width: '50%',
  },
  infoSection: {
    marginTop: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#6e2020",
    paddingBottom: 5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 3,
  },
  label: {
    fontSize: 9,
    fontWeight: "bold",
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
    borderColor: "#eee",
    borderRadius: 4,
  },
  resultTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#6e2020",
    marginBottom: 8,
    textDecoration: "underline",
  },
  resultText: {
    fontSize: 10,
    lineHeight: 1.6,
    textAlign: "justify",
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

        <View style={styles.infoSection}>
          <View style={styles.row}>
            <Text style={styles.label}>Examen Solicitado:</Text>
            <Text style={styles.value}>{data?.examen_solicitado}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Método:</Text>
            <Text style={styles.value}>{data?.metodo}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Muestra:</Text>
            <Text style={styles.value}>{data?.muestra}</Text>
          </View>
        </View>

        {data?.resultado_texto && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>RESULTADO:</Text>
            <Text style={styles.resultText}>{data.resultado_texto}</Text>
          </View>
        )}

        <CommonFooter />
      </View>
      <View style={styles.rightColumn} />
    </View>
  </Page>
);

/**
 * COMPONENTE POR DEFECTO
 * Se usa cuando se imprime solo un examen misceláneo desde otros módulos.
 */
const MiscelaneosReport: React.FC<{ data: any, patient: any, qrImage?: string }> = (props) => {
  return (
    <ReportLayout>
      <MiscelaneosContent {...props} />
    </ReportLayout>
  );
};

export default MiscelaneosReport;