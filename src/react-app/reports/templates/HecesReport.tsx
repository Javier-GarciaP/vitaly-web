import React from 'react';
import ReportLayout from '../components/ReportLayout';
// 1. Importamos los tipos centralizados
import { HecesData, Paciente } from '@/types/types';
import HcesContent from '../content/HecesConten';

interface HecesReportProps {
  data: HecesData;
  patient: Paciente;
  qrImage?: string;
}

const HecesReport: React.FC<HecesReportProps> = ({ data, patient, qrImage }) => {
  return (
    <ReportLayout>
      <HcesContent data={data} patient={patient} qrImage={qrImage} />
    </ReportLayout>
  );
};

export default HecesReport;