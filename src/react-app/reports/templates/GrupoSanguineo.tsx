import React from "react";
import ReportLayout from "../components/ReportLayout";
import { GrupoSanguineoData, Paciente } from "@/types/types";
import GrupoSanguineoContent from "../content/GrupoSanguineoContent";

interface GrupoSanguineoProps {
  data: GrupoSanguineoData;
  patient: Paciente;
  logoUrl?: string;
}

const GrupoSanguineo: React.FC<GrupoSanguineoProps> = ({
  data,
  patient,
  logoUrl,
}) => {
  if (!data?.grupo_sanguineo && !data?.factor_rh) return null;

  return (
    <ReportLayout>
      <GrupoSanguineoContent data={data} patient={patient} logoUrl={logoUrl} />
    </ReportLayout>
  );
};

export default GrupoSanguineo;
