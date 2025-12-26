import { Document, Page, View, StyleSheet } from '@react-pdf/renderer';
import AntibiogramaReport from './AntibiogramaReport';
import BacteriologiaReport from './BacteriologiaReport'; 
import { BacteriologiaData, Paciente } from '@/types/types';

interface BacteriologiaCompletoReportProps {
  data: BacteriologiaData;
  patient: Paciente;
  qrImage?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
    backgroundColor: '#fff',
  },
  mainContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  leftColumn: {
    width: '50%',
    paddingRight: 25,
    paddingLeft: 10,
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
  }
});

const BacteriologiaCompletoReport: React.FC<BacteriologiaCompletoReportProps> = ({ data, patient, qrImage }) => (
  <Document title={`Reporte Bacteriología - ${patient.nombre}`}>
    
    {/* HOJA 1: CULTIVO */}
    <Page size="LETTER" orientation="landscape" style={styles.page}>
      <View style={styles.mainContainer}>
        <View style={styles.leftColumn}>
          <BacteriologiaReport data={data} patient={patient} qrImage={qrImage}/>
        </View>
        <View style={styles.rightColumn} />
      </View>
    </Page>

    {/* HOJA 2: ANTIBIOGRAMA (Si existe) */}
    {data.antibiograma_list && data.antibiograma_list.length > 0 && (
      <Page size="LETTER" orientation="landscape" style={styles.page}>
        <View style={styles.mainContainer}>
          <View style={styles.leftColumn}>
            <AntibiogramaReport data={data} patient={patient} qrImage={qrImage} />
          </View>
          <View style={styles.rightColumn} />
        </View>
      </Page>
    )}
  </Document>
);

export default BacteriologiaCompletoReport;