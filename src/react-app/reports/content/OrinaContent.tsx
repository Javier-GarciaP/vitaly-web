import { OrinaData, Paciente } from "@/types/types";
import { View, StyleSheet, Text } from "@react-pdf/renderer";
import CommonHeader from '../components/CommonHeader';

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
  // Rows
  gridRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 2,
    alignItems: 'center',
  },
  fieldGroup: {
    flexDirection: "row",
    width: "50%",
    paddingRight: 4,
    alignItems: 'center',
  },
  label: {
    fontSize: 8.5,
    fontWeight: "bold",
    width: "55%",
    color: "#475569",
  },
  value: {
    fontSize: 9,
    width: "45%",
    color: "#0f172a",
    fontWeight: 'medium',
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
  obsText: { fontSize: 8.5, color: "#334155", lineHeight: 1.3 },
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

const OrinaRow: React.FC<OrinaRowProps> = ({
  label1,
  value1,
  label2,
  value2,
}) => {
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

const OrinaContent: React.FC<OrinaReportProps> = ({
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
          edad: patient.edad,
          fechaExamen: patient.fecha || "",
        }}
        title="UROANÁLISIS"
        qrImage={qrImage}
      />

      <SectionCard title="Carácteres Generales">
        <OrinaRow label1="Color" value1={data?.color} label2="Aspecto" value2={data?.aspecto} />
        <OrinaRow label1="Reacción" value1={data?.reaccion} label2="Densidad" value2={data?.densidad} />
        <OrinaRow label1="pH" value1={data?.ph} />
      </SectionCard>

      <SectionCard title="Examen Químico">
        <OrinaRow label1="Proteína" value1={data?.proteina} label2="Glucosa" value2={data?.glucosa} />
        <OrinaRow label1="Hemoglobina" value1={data?.hemoglobina} label2="Nitritos" value2={data?.nitritos} />
        <OrinaRow label1="Pigmento Bil." value1={data?.pigmento_bil} label2="Acetona" value2={data?.acetona} />
        <OrinaRow label1="Urobilín" value1={data?.urobilin} />
      </SectionCard>

      <SectionCard title="Sedimento Urinario (Microscópico)">
        <OrinaRow label1="Filam. Moco" value1={data?.filam_moco} label2="Células Epit." value2={data?.celulas_epit} />
        <OrinaRow label1="Leucocitos" value1={data?.leucocitos} label2="Hematíes" value2={data?.hematies} />
        <OrinaRow label1="Bacterias" value1={data?.bacterias} label2="Levaduras" value2={data?.levaduras} />

        {data?.cristales && data.cristales.trim() !== "" && data.cristales !== "null" && (
          <View style={styles.gridRow}>
            <View style={{ flexDirection: "row", width: "100%", alignItems: 'center' }}>
              <Text style={[styles.label, { width: "27%" }]}>Cristales:</Text>
              <Text style={[styles.value, { width: "73%" }]}>{data.cristales}</Text>
            </View>
          </View>
        )}

        <OrinaRow label1="Cilindros" value1={data?.cilindros} label2="Bacteristales" value2={data?.bacteristales} />
      </SectionCard>

      {data?.observacion && data.observacion.trim() !== "" && (
        <View style={styles.obsCard}>
          <Text style={styles.obsTitle}>OBSERVACIONES</Text>
          <Text style={styles.obsText}>{data.observacion}</Text>
        </View>
      )}
    </View>
  );
};

export default OrinaContent;
