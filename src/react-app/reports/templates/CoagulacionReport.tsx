import React from "react";
import ReportLayout from "../components/ReportLayout";
import { CoagulacionData, Paciente } from "@/types/types";
import CoagulacionContent from "../content/CoagulacionContent";

// Interfaz para las referencias dinámicas
interface ValorReferencia {
  nombre_examen: string;
  valor_referencia: string;
}

interface CoagulacionReportProps {
  data: CoagulacionData;
  patient: Paciente;
  qrImage?: string;
  references?: ValorReferencia[]; // Nueva prop
}

const CoagulacionReport: React.FC<CoagulacionReportProps> = ({
  data,
  patient, 
  qrImage,
  references,
}) => {
  return (
    <ReportLayout>
      <CoagulacionContent
        data={data}
        patient={patient}
        qrImage={qrImage}
        references={references}
      />
    </ReportLayout>
  );
};

export default CoagulacionReport;
