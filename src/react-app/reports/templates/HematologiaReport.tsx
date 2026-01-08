import React from "react";
import { View, StyleSheet, Text } from "@react-pdf/renderer";
import ReportLayout from "../components/ReportLayout";
import CommonHeader from "../components/CommonHeader";
import CommonFooter from "../components/CommonFooter";
import ExamRow from "../components/ExamRow";
import { HematologiaData, Paciente } from "@/types/types";

interface ValorReferencia {
  nombre_examen: string;
  valor_referencia: string;
}

interface HematologiaReportProps {
  data: HematologiaData;
  patient: Paciente;
  qrImage?: string;
  references?: ValorReferencia[];
}

interface SectionTitleProps {
  title: string;
}

const styles = StyleSheet.create({
  sectionHeader: {
    backgroundColor: "#f5f5f5",
    padding: 2,
    marginTop: 8,
    marginBottom: 2,
    borderLeftWidth: 3,
    borderLeftColor: "#6e2020",
  },
  sectionHeaderText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#6e2020",
    textTransform: "uppercase",
  },
  vsgContainer: {
    marginTop: 10,
    border: "0.5pt dashed #444",
    padding: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  vsgData: {
    width: "60%",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  vsgRefText: {
    width: "35%",
    fontSize: 7,
    color: "#444",
    textAlign: "right",
    paddingLeft: 5,
    lineHeight: 1.2,
  },
  vsgField: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    marginRight: 5,
  },
  vsgLabel: { fontSize: 8, fontWeight: "bold", marginRight: 2 },
  vsgValue: {
    fontSize: 9,
    borderBottomWidth: 0.5,
    minWidth: 30,
    textAlign: "center",
  },
  observations: {
    marginTop: 10,
    fontSize: 9,
    padding: 5,
    backgroundColor: "#f9f9f9",
    borderLeftWidth: 2,
    borderLeftColor: "#6e2020",
  },
});

const SectionTitle: React.FC<SectionTitleProps> = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionHeaderText}>{title}</Text>
  </View>
);

const HematologiaReport: React.FC<HematologiaReportProps> = ({
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

  // Preparamos el texto multilínea para Hemoglobina
  const refHemoglobina =
    `Mujeres: ${getRef("Hemoglobina mujer", "12-14")} \n Hombres: ${getRef(
      "Hemoglobina hombre",
      "14-16"
    )}\n` +
    `Niños:\n` +
    `0-2 semanas: ${getRef(
      "Niños 0-2 semanas",
      "13.5-28"
    )}\n2-6 meses: ${getRef(
      "Niños 2-6 meses",
      "9.5-13.5"
    )}\n6 meses a 6 años: ${getRef(
      "Niños 6 meses a 6 años",
      "11.0 - 14.0 g/dL"
    )}\n6 a 12 años: ${getRef("Niños 6 a 12 años", "12.0 - 15.5 g/dL")}`;

  // Preparamos el texto para VSG
  const refVSG = `Hombres: ${getRef(
    "V.S.G Hombres",
    "< 15 mm/h"
  )}\nMujeres: ${getRef("V.S.G Mujeres", "< 21 mm/h")}`;

  return (
    <ReportLayout>
      <CommonHeader
        patient={{
          nombre: patient.nombre,
          cedula: patient.cedula,
          edad: patient.edad,
          fechaExamen: patient.fecha || "",
        }}
        title="HEMATOLOGÍA COMPLETA"
        qrImage={qrImage}
      />

      {/* SERIE ROJA */}
      <SectionTitle title="Serie Roja" />
      <ExamRow
        label="Hematíes"
        result={data?.hematies}
        reference={getRef("Hematíes", "4.5 - 5.5 mill/mm³")}
      />

      {/* Hemoglobina con referencias alineadas al lado */}
      <ExamRow
        label="Hemoglobina"
        result={data?.hemoglobina}
        reference={refHemoglobina}
      />

      <ExamRow
        label="Hematocrito"
        result={data?.hematocrito}
        reference={getRef("Hematocrito", "37.0 - 47.0 %")}
      />
      <ExamRow
        label="V.C.M"
        result={data?.vcm}
        reference={getRef("V.C.M", "80 - 100 fL")}
      />
      <ExamRow
        label="H.C.M"
        result={data?.hcm}
        reference={getRef("H.C.M", "27 - 31 pg")}
      />
      <ExamRow
        label="C.H.C.M"
        result={data?.chcm}
        reference={getRef("C.H.C.M", "32 - 36 g/dL")}
      />

      {/* SERIE BLANCA */}
      <SectionTitle title="Serie Blanca" />
      <ExamRow
        label="Leucocitos"
        result={data?.leucocitos}
        reference={getRef("Leucocitos", "5.000 - 10.000 /mm³")}
      />
      <ExamRow
        label="Neutrófilos"
        result={data?.neutrofilos}
        reference={getRef("Neutrófilos", "55 - 70 %")}
      />
      <ExamRow
        label="Linfocitos"
        result={data?.linfocitos}
        reference={getRef("Linfocitos", "20 - 40 %")}
      />
      <ExamRow
        label="Monocitos"
        result={data?.monocitos}
        reference={getRef("Monocitos", "2 - 8 %")}
      />
      <ExamRow
        label="Eosinófilos"
        result={data?.eosinofilos}
        reference={getRef("Eosinófilos", "1 - 4 %")}
      />
      <ExamRow
        label="Basófilos"
        result={data?.basofilos}
        reference={getRef("Basófilos", "0 - 1 %")}
      />

      {/* SERIE PLAQUETARIA */}
      <SectionTitle title="Serie Plaquetaria" />
      <ExamRow
        label="Plaquetas"
        result={data?.plaquetas}
        reference={getRef("Plaquetas", "150.000 - 450.000 /mm³")}
      />

      {/* SECCIÓN V.S.G. */}
      {(data?.vsg_1h || data?.vsg_2h) && (
        <View style={styles.vsgContainer}>
          <View style={styles.vsgData}>
            <Text
              style={{
                fontSize: 9,
                fontWeight: "bold",
                width: "100%",
                color: "#6e2020",
                marginBottom: 5,
              }}
            >
              V.S.G (Eritrosedimentación)
            </Text>
            <View style={styles.vsgField}>
              <Text style={styles.vsgLabel}>1 Hora:</Text>
              <Text style={styles.vsgValue}>{data?.vsg_1h}</Text>
            </View>
            <View style={styles.vsgField}>
              <Text style={styles.vsgLabel}>2 Hora:</Text>
              <Text style={styles.vsgValue}>{data?.vsg_2h}</Text>
            </View>
            <View style={styles.vsgField}>
              <Text style={styles.vsgLabel}>Índice:</Text>
              <Text style={styles.vsgValue}>{data?.vsg_indice}</Text>
            </View>
          </View>
          <View style={styles.vsgRefText}>
            <Text style={{ fontWeight: "bold", marginBottom: 2 }}>
              Referencias:
            </Text>
            <Text>{refVSG}</Text>
          </View>
        </View>
      )}

      {/* OBSERVACIONES */}
      {data?.observacion && data.observacion.trim() !== "" && (
        <View style={styles.observations}>
          <Text style={{ fontWeight: "bold", fontSize: 8, color: "#6e2020" }}>
            OBSERVACIONES:
          </Text>
          <Text style={{ fontSize: 9, marginTop: 2 }}>{data.observacion}</Text>
        </View>
      )}

      <CommonFooter />
    </ReportLayout>
  );
};

export default HematologiaReport;
