import { Document } from '@react-pdf/renderer';
import AntibiogramaContent from '../content/AntibiogramaContent';
import BacteriologiaContent from '../content/BacteriologiaReport';
import { BacteriologiaData, Paciente } from '@/types/types';
import PageComponent from '../components/Page';

interface BacteriologiaCompletoReportProps {
  data: BacteriologiaData;
  patient: Paciente;
  qrImage?: string;
}

const BacteriologiaCompletoReport: React.FC<BacteriologiaCompletoReportProps> = ({ data, patient, qrImage }) => (
  <Document title={`Reporte Bacteriología - ${patient.nombre}`}>

    {/* HOJA 1: CULTIVO */}
    <PageComponent>
      <BacteriologiaContent data={data} patient={patient} qrImage={qrImage} />
    </PageComponent>

    {/* HOJA 2: ANTIBIOGRAMA (Si existe) */}
    {data.antibiograma_list && data.antibiograma_list.length > 0 && (
      <PageComponent>
        <AntibiogramaContent data={data} patient={patient} qrImage={qrImage} />
      </PageComponent>
    )}
  </Document>
);

export default BacteriologiaCompletoReport;
