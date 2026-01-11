import React from "react";
import { Paciente } from "@/types/types";
import PortadaContent from "../content/PortadaContent";
import PageComponent from "../components/Page";
import { Document } from '@react-pdf/renderer';

interface PortadaGeneralProps {
  patient: Paciente;
  logoUrl?: string;
}

const PortadaGeneral: React.FC<PortadaGeneralProps> = ({
  patient,
  logoUrl,
}) => {
  return (
    <Document title="Reporte de Laboratorio Clínico">
      <PageComponent>
        <PortadaContent patient={patient} logoUrl={logoUrl} />
      </PageComponent>
    </Document>
  );
};

export default PortadaGeneral;
