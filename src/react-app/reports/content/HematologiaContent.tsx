import React from "react";
import { View, StyleSheet, Text } from "@react-pdf/renderer";
import CommonHeader from "../components/CommonHeader";
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
    overflow: "hidden", // Para que el header respete el border radius
  },
  cardHeader: {
    backgroundColor: "#800020", // Vinotinto
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
    backgroundColor: "#fafafa", // Fondo muy sutil
  },
  // VSG Specifics
  vsgContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  vsgGroup: {
    flexDirection: "row",
    gap: 15,
  },
  vsgItem: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  vsgLabel: { fontSize: 8, color: "#64748b", fontWeight: 'bold' },
  vsgValue: { fontSize: 9, color: "#0f172a", fontWeight: "bold" },
  // Observations
  obsCard: {
    marginTop: 5,
    borderLeftWidth: 3,
    borderLeftColor: "#800020",
    backgroundColor: "#fff5f5", // Fondo rojizo muy claro
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
    fontSize: 9,
    color: "#334155",
    lineHeight: 1.3,
  },
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

const HematologiaContent: React.FC<HematologiaReportProps> = ({
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

  // Construct Hemoglobin References
  const hemoRefs = [
    { label: "Hombre", key: "Hemoglobina hombre", def: "14.0 - 18.0 g/dL" },
    { label: "Mujer", key: "Hemoglobina mujer", def: "12.0 - 16.0 g/dL" },
    { label: "Niños 0-2 sem", key: "Niños 0-2 semanas", def: "13.5 - 19.5 g/dL" },
    { label: "Niños 2-6 m", key: "Niños 2-6 meses", def: "9.5 - 13.5 g/dL" },
    { label: "Niños 6m-6a", key: "Niños 6 meses a 6 años", def: "10.5 - 13.5 g/dL" },
    { label: "Niños 6-12a", key: "Niños 6 a 12 años", def: "11.5 - 15.5 g/dL" },
  ].map(r => `${r.label}: ${getRef(r.key, r.def)}`).join("\n");



  return (
    <View style={styles.container}>
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
      <SectionCard title="Serie Roja">
        <ExamRow label="Hematíes" result={data?.hematies} reference={getRef("Hematíes", "4.5 - 5.5 mill/mm³")} />
        <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#eee', paddingVertical: 2 }}>
          <Text style={{ fontSize: 9, fontWeight: 'bold', width: '40%', color: '#333' }}>Hemoglobina</Text>
          <Text style={{ fontSize: 9, width: '20%', textAlign: 'center', fontWeight: 'bold' }}>{data?.hemoglobina}</Text>
          <Text style={{ fontSize: 6.5, width: '40%', textAlign: 'right', color: '#555', lineHeight: 1.1 }}>
            {hemoRefs}
          </Text>
        </View>
        <ExamRow label="Hematocrito" result={data?.hematocrito} reference={getRef("Hematocrito", "37.0 - 47.0 %")} />

        <View style={{ height: 4 }} /> {/* Spacer */}
        <Text style={{ fontSize: 7, color: '#94a3b8', fontWeight: 'bold', marginBottom: 2, textTransform: 'uppercase' }}>Índices Hematimétricos</Text>
        <ExamRow label="V.C.M" result={data?.vcm} reference={getRef("V.C.M", "80 - 100 fL")} />
        <ExamRow label="H.C.M" result={data?.hcm} reference={getRef("H.C.M", "27 - 31 pg")} />
        <ExamRow label="C.H.C.M" result={data?.chcm} reference={getRef("C.H.C.M", "32 - 36 g/l")} />
      </SectionCard>

      {/* SERIE BLANCA */}
      <SectionCard title="Serie Blanca (Leucocitaria)">
        <ExamRow label="Leucocitos" result={data?.leucocitos} reference={getRef("Leucocitos", "5.000 - 10.000 /mm³")} />
        <View style={{ height: 4 }} />
        <ExamRow label="Neutrófilos" result={data?.neutrofilos} reference={getRef("Neutrófilos", "55 - 70 %")} />
        <ExamRow label="Linfocitos" result={data?.linfocitos} reference={getRef("Linfocitos", "20 - 40 %")} />
        <ExamRow label="Monocitos" result={data?.monocitos} reference={getRef("Monocitos", "2 - 8 %")} />
        <ExamRow label="Eosinófilos" result={data?.eosinofilos} reference={getRef("Eosinófilos", "1 - 4 %")} />
        <ExamRow label="Basófilos" result={data?.basofilos} reference={getRef("Basófilos", "0 - 1 %")} />
      </SectionCard>

      {/* PLAQUETAS Y VSG */}
      <SectionCard title="Plaquetas">
        <ExamRow label="Recuento de Plaquetas" result={data?.plaquetas} reference={getRef("Plaquetas", "150.000 - 450.000 /mm³")} />
      </SectionCard>

      {(data?.vsg_1h || data?.vsg_2h) && (
        <SectionCard title="V.S.G (Eritrosedimentación)">
          <View style={styles.vsgContainer}>
            <View style={styles.vsgGroup}>
              {data?.vsg_1h && (
                <View style={styles.vsgItem}>
                  <Text style={styles.vsgLabel}>1h:</Text>
                  <Text style={styles.vsgValue}>{data.vsg_1h}</Text>
                </View>
              )}
              {data?.vsg_2h && (
                <View style={styles.vsgItem}>
                  <Text style={styles.vsgLabel}>2h:</Text>
                  <Text style={styles.vsgValue}>{data.vsg_2h}</Text>
                </View>
              )}
              {data?.vsg_indice && (
                <View style={styles.vsgItem}>
                  <Text style={styles.vsgLabel}>Índice:</Text>
                  <Text style={styles.vsgValue}>{data.vsg_indice}</Text>
                </View>
              )}
            </View>
            <View style={{ width: '55%' }}>
              <Text style={{ fontSize: 6.5, color: '#666', marginTop: 1, marginBottom: 2 }}>
                <Text style={{ fontWeight: 'bold' }}>1h:</Text> {[
                  { label: "Hombre", key: "VSG 1h Hombre", def: "< 15 mm/h" },
                  { label: "Mujer", key: "VSG 1h Mujer", def: "< 20 mm/h" },
                  { label: "Niños", key: "VSG 1h Niños", def: "< 10 mm/h" },
                ].map(r => `${r.label}: ${getRef(r.key, r.def)}`).join(" | ")}
              </Text>
              <Text style={{ fontSize: 6.5, color: '#666' }}>
                <Text style={{ fontWeight: 'bold' }}>2h:</Text> {[
                  { label: "Hombre", key: "VSG 2h Hombre", def: "< 15 mm/h" },
                  { label: "Mujer", key: "VSG 2h Mujer", def: "< 20 mm/h" },
                  { label: "Niños", key: "VSG 2h Niños", def: "< 10 mm/h" },
                ].map(r => `${r.label}: ${getRef(r.key, r.def)}`).join(" | ")}
              </Text>
            </View>
          </View>
        </SectionCard>
      )}

      {data?.observacion && data.observacion.trim() !== "" && (
        <View style={styles.obsCard}>
          <Text style={styles.obsTitle}>OBSERVACIONES</Text>
          <Text style={styles.obsText}>
            {data.observacion}
          </Text>
        </View>
      )}
    </View>
  );
};

export default HematologiaContent;
