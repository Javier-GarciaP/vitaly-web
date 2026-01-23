import React from 'react';
import ReportLayout from '../components/ReportLayout';
import { PSAData, Paciente } from '@/types/types';
import PSAContent from '../content/PSAContent';

interface ValorReferencia {
    nombre_examen: string;
    valor_referencia: string;
}

interface PSAReportProps {
    data: PSAData;
    patient: Paciente;
    qrImage?: string;
    references?: ValorReferencia[];
}

const PSAReport: React.FC<PSAReportProps> = ({ data, patient, qrImage, references }) => {

    return (
        <ReportLayout>
            <PSAContent data={data} patient={patient} qrImage={qrImage} references={references} />
        </ReportLayout>
    );
};

export default PSAReport;
