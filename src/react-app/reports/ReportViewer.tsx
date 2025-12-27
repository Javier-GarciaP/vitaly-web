import React from 'react';
import { PDFViewer, StyleSheet } from '@react-pdf/renderer';

// Importación de plantillas
import PortadaGeneral from './templates/PortadaGeneral';
import QuimicaReport from './templates/QuimicaReport';
import OrinaReport from './templates/OrinaReport';
import HecesReport from './templates/HecesReport';
import MiscelaneosReport from './templates/MiscelaneosReport';
import CoagulacionReport from './templates/CoagulacionReport';
import AntibiogramaReport from './templates/AntibiogramaReport';
import HematologiaReport from './templates/HematologiaReport';
import GrupoSanguineo from './templates/GrupoSanguineo';
import BacteriologiaCompletoReport from './templates/BacteriologiaCompletoReport';

import BulkReport from "./BulkReport"

import { Paciente } from '@/types/types';

interface ReportViewerProps {
  type: string;
  data: any; 
  patient: Paciente;
  qrImage?: string; // NUEVA PROP: Recibe el base64 generado en la página de resultados
}

const styles = StyleSheet.create({
  viewer: {
    width: '100%',
    height: '100%', 
    border: 'none',
  }
});

const ReportViewer: React.FC<ReportViewerProps> = ({ type, data, patient, qrImage }) => {
  const LOGO_URL = "./logo.png"; 

  const renderTemplate = () => {
    // Definimos un objeto con las props comunes para no repetir código
    const commonProps = { data, patient, qrImage };

    switch (type.trim()) {
      case "Hematología":
        return <HematologiaReport {...commonProps} />;
      case "Química Clínica":
      case "Química Sanguínea": 
        return <QuimicaReport {...commonProps} />;
      case "Orina":
        return <OrinaReport {...commonProps} />;
      case "Heces":
        return <HecesReport {...commonProps} />;
      case "Coagulación":
        return <CoagulacionReport {...commonProps} />;
      case "Grupo Sanguíneo":
        return <GrupoSanguineo {...commonProps} logoUrl={LOGO_URL} />;
      case "Bacteriología":
        return <BacteriologiaCompletoReport {...commonProps} />;
      case "Antibiograma":
      case "ANTIBIOGRAMA":
        return <AntibiogramaReport {...commonProps} />;
      case "Misceláneos":
      case "Exámenes Especiales":
        return <MiscelaneosReport {...commonProps} />;
      case "PORTADA":
        return <PortadaGeneral patient={patient} logoUrl={LOGO_URL} />;
      case "IMPRESION_MASIVA":
        // Aquí 'data' será el array 'bulkData' que enviaremos desde el Panel
        return <BulkReport bulkData={data} patient={patient} logoUrl={LOGO_URL} />;
      default:
        return null;
    }
  };

  const template = renderTemplate();

  if (!template) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50 p-10">
        <div className="text-center">
          <h2 className="text-red-700 font-bold text-lg">Error de Plantilla</h2>
          <p className="text-red-600 text-sm">No se encontró un formato para: "{type}"</p>
        </div>
      </div>
    );
  }

  return (
    <PDFViewer style={styles.viewer} showToolbar={true}>
      {template}
    </PDFViewer>
  );
};

export default ReportViewer;