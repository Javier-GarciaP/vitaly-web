import React, { useState, useEffect } from "react";
import { PDFViewer, StyleSheet, Document } from "@react-pdf/renderer";

// Importación de plantillas
import PortadaGeneral from "./templates/PortadaGeneral";
import QuimicaReport from "./templates/QuimicaReport";
import OrinaReport from "./templates/OrinaReport";
import HecesReport from "./templates/HecesReport";
import { MiscelaneosContent } from "./content/MiscelaneosContent";
import CoagulacionReport from "./templates/CoagulacionReport";
import HematologiaReport from "./templates/HematologiaReport";
import GrupoSanguineo from "./templates/GrupoSanguineo";
import BacteriologiaCompletoReport from "./templates/BacteriologiaCompletoReport";
import BulkReport from "./BulkReport";
import PSAReport from "./templates/PSAReport";

import PageComponent from "./components/Page";
import { useSettings } from "@/react-app/context/SettingsContext";


import { Paciente } from "@/types/types";

interface ReportViewerProps {
  type: string;
  data: any;
  patient: Paciente;
  qrImage?: string;
}

const styles = StyleSheet.create({
  viewer: {
    width: "100%",
    height: "100%",
    border: "none",
  },
  page: {
    paddingVertical: 10, // Margen general de la hoja
    backgroundColor: "#fff",
  },
});

const ReportViewer: React.FC<ReportViewerProps> = ({
  type,
  data,
  patient,
  qrImage,
}) => {
  const { getResolvedDate } = useSettings();
  const LOGO_URL = "./logo.png";
  const [references, setReferences] = useState<any[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(false);

  useEffect(() => {
    const fetchReferences = async () => {
      let tabla = "";
      const t = type.trim();
      if (t === "Hematología") tabla = "hematologia";
      else if (t === "Química Clínica" || t === "Química Sanguínea")
        tabla = "quimica";
      else if (t === "Coagulación") tabla = "coagulacion";
      else if (t === "PSA") tabla = "psa";


      if (!tabla) {
        setReferences([]);
        return;
      }

      try {
        setLoadingRefs(true);
        const res = await fetch(`/api/valores-referencia?tabla=${tabla}`);
        if (res.ok) {
          const result = (await res.json()) as any[];
          setReferences(result);
        }
      } catch (error) {
        console.error("Error al cargar referencias:", error);
      } finally {
        setLoadingRefs(false);
      }
    };
    fetchReferences();
  }, [type]);

  const renderTemplate = () => {
    const resolvedPatient = { ...patient, fecha: getResolvedDate(patient.fecha || new Date()) };
    const commonProps = { data, patient: resolvedPatient, qrImage };
    const t = type.trim();

    // CASO ESPECIAL: MISCELÁNEOS (Maneja múltiples páginas)
    if (t === "Misceláneos" || t === "Exámenes Especiales") {
      const listaExamenes = Array.isArray(data) ? data : [data];
      return (
        <Document title={`Reporte_Especiales_${patient.nombre}`}>
          {listaExamenes.map((examen, index) => (
            <PageComponent key={index}>
              <MiscelaneosContent
                data={examen}
                patient={resolvedPatient}
                qrImage={qrImage}
              />
            </PageComponent>
          ))}
        </Document>
      );
    }


    // OTROS EXÁMENES: Se asume que sus archivos ya contienen <Document> (o vía ReportLayout)
    switch (t) {
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
      case "PSA":
        return <PSAReport {...commonProps} references={references} />;

      case "PORTADA":
        return <PortadaGeneral patient={resolvedPatient} logoUrl={LOGO_URL} />;
      case "IMPRESION_MASIVA":
        return (
          <BulkReport
            bulkData={data}
            patient={resolvedPatient}
            logoUrl={LOGO_URL}
            type={type}
          />
        );
      default:
        return null;
    }
  };

  if (loadingRefs) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const template = renderTemplate();

  if (!template)
    return (
      <div className="p-5 text-red-500">
        Error: No se pudo cargar la plantilla.
      </div>
    );

  return (
    <PDFViewer style={styles.viewer} showToolbar={true}>
      {template}
    </PDFViewer>
  );
};

export default ReportViewer;
