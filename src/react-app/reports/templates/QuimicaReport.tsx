import React from 'react';
import ReportLayout from '../components/ReportLayout';
import { QuimicaData, Paciente } from '@/types/types';
import QuimicaContent from '../content/QuimicaContent';

// Definimos la estructura de los valores de referencia que vienen de la BD
interface ValorReferencia {
  nombre_examen: string;
  valor_referencia: string;
}

interface QuimicaReportProps {
  data: QuimicaData;
  patient: Paciente;
  qrImage?: string;
  // Pasamos los valores de referencia como un prop
  references?: ValorReferencia[];
}

const QuimicaReport: React.FC<QuimicaReportProps> = ({ data, patient, qrImage, references }) => {

  return (
    <ReportLayout>
      <QuimicaContent data={data} patient={patient} qrImage={qrImage} references={references} />
    </ReportLayout>
  );
};

export default QuimicaReport;