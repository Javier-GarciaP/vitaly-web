import React from "react";
import { Document } from "@react-pdf/renderer";

// Importación de plantillas
import PortadaGeneral from "./templates/PortadaGeneral";
import QuimicaReport from "./templates/QuimicaReport";
import OrinaReport from "./templates/OrinaReport";
import HecesReport from "./templates/HecesReport";
import MiscelaneosReport from "./templates/MiscelaneosReport";
import CoagulacionReport from "./templates/CoagulacionReport";
import AntibiogramaReport from "./templates/AntibiogramaReport";
import HematologiaReport from "./templates/HematologiaReport";
import GrupoSanguineo from "./templates/GrupoSanguineo";
import BacteriologiaCompletoReport from "./templates/BacteriologiaCompletoReport";

interface BulkReportProps {
  bulkData: { examen: any; qr: string }[];
  patient: any;
  logoUrl: string;
}

const BulkReport: React.FC<BulkReportProps> = ({ bulkData, patient, logoUrl }) => {
  
  // Función auxiliar para renderizar cada página de examen
  const renderExamenPage = (item: any, index: number) => {
    const commonProps = {
      data: item.examen.resultados,
      patient,
      qrImage: item.qr,
    };

    const tipo = item.examen.tipo.trim();

    switch (tipo) {
      case "Hematología":
        return <HematologiaReport key={`ex-${index}`} {...commonProps} />;
      case "Química Clínica":
      case "Química Sanguínea":
        return <QuimicaReport key={`ex-${index}`} {...commonProps} />;
      case "Orina":
        return <OrinaReport key={`ex-${index}`} {...commonProps} />;
      case "Heces":
        return <HecesReport key={`ex-${index}`} {...commonProps} />;
      case "Coagulación":
        return <CoagulacionReport key={`ex-${index}`} {...commonProps} />;
      case "Grupo Sanguíneo":
        return <GrupoSanguineo key={`ex-${index}`} {...commonProps} logoUrl={logoUrl} />;
      case "Bacteriología":
        return <BacteriologiaCompletoReport key={`ex-${index}`} {...commonProps} />;
      case "Antibiograma":
      case "ANTIBIOGRAMA":
        return <AntibiogramaReport key={`ex-${index}`} {...commonProps} />;
      case "Misceláneos":
      case "Exámenes Especiales":
        return <MiscelaneosReport key={`ex-${index}`} {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <Document>
      {/* 1. Portada al inicio (Solo una vez) */}
      <PortadaGeneral patient={patient} logoUrl={logoUrl} />

      {/* 2. Mapeo de todos los exámenes (Cada uno genera sus propias páginas internas) */}
      {bulkData.map((item, index) => renderExamenPage(item, index))}
    </Document>
  );
};

export default BulkReport;