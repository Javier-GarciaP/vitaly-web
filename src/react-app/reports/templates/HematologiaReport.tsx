import React from "react";
import ReportLayout from "../components/ReportLayout";
import { HematologiaData, Paciente } from "@/types/types";
import HematologiaContent from "../content/HematologiaContent";

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

const HematologiaReport: React.FC<HematologiaReportProps> = ({
  data,
  patient,
  qrImage,
  references,
}) => {
  return (
    <ReportLayout>
      <HematologiaContent
        data={data}
        patient={patient}
        qrImage={qrImage}
        references={references}
      />
    </ReportLayout>
  );
};

export default HematologiaReport;
