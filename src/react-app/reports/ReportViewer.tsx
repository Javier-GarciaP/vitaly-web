import React, { useState, useEffect } from 'react';
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
import BulkReport from "./BulkReport";

import { Paciente } from '@/types/types';

interface ReportViewerProps {
  type: string;
  data: any; 
  patient: Paciente;
  qrImage?: string; 
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
  
  // Estado para las referencias dinámicas
  const [references, setReferences] = useState<any[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(false);

  useEffect(() => {
    const fetchReferences = async () => {
      // Determinamos qué tabla consultar según el tipo de examen
      let tabla = "";
      const t = type.trim();

      if (t === "Hematología") {
        tabla = "hematologia";
      } else if (t === "Química Clínica" || t === "Química Sanguínea") {
        tabla = "quimica";
      } else if (t === "Coagulación") {
        tabla = "coagulacion";
      }

      // Si no es ninguno de esos, no necesitamos hacer fetch
      if (!tabla) {
        setReferences([]);
        return;
      }

      try {
        setLoadingRefs(true);
        const res = await fetch(`/api/valores-referencia?tabla=${tabla}`);
        if (res.ok) {
          const result = await res.json() as any[];
          setReferences(result);
        }
      } catch (error) {
        console.error("Error al cargar referencias para el reporte:", error);
      } finally {
        setLoadingRefs(false);
      }
    };

    fetchReferences();
  }, [type]); // Se vuelve a ejecutar si el tipo cambia

  const renderTemplate = () => {
    // Props comunes
    const commonProps = { data, patient, qrImage };

    switch (type.trim()) {
      case "Hematología":
        return <HematologiaReport {...commonProps} references={references} />;
      
      case "Química Clínica":
      case "Química Sanguínea": 
        return <QuimicaReport {...commonProps} references={references} />;
      
      case "Coagulación":
        return <CoagulacionReport {...commonProps} references={references} />;

      case "Orina":
        return <OrinaReport {...commonProps} />;
      case "Heces":
        return <HecesReport {...commonProps} />;
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
        return <BulkReport bulkData={data} patient={patient} logoUrl={LOGO_URL} />;
      default:
        return null;
    }
  };

  // Mientras carga las referencias, podemos mostrar un mensaje sutil
  // o simplemente esperar, ya que el PDFViewer tarda un poco en inicializar
  if (loadingRefs) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-800"></div>
          <p className="mt-4 text-gray-600 text-sm font-medium">Cargando valores de referencia...</p>
        </div>
      </div>
    );
  }

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