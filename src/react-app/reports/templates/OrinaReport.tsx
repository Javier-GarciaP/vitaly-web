import React from "react";
import { OrinaData, Paciente } from "@/types/types";
import ReportLayout from "../components/ReportLayout";
import OrinaContent from "../content/OrinaContent";

interface OrinaReportProps {
  data: OrinaData;
  patient: Paciente;
  qrImage?: string;
}

const OrinaReport: React.FC<OrinaReportProps> = ({
  data,
  patient,
  qrImage,
}) => {
  return (
    <ReportLayout>
      <OrinaContent data={data} patient={patient} qrImage={qrImage} />
    </ReportLayout>
  );
};

export default OrinaReport;
