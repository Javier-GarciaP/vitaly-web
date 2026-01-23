import React, { useEffect, useState } from "react";
import { Document } from "@react-pdf/renderer";

// Importación de contenidos (components dentro de /content)
import PortadaContent from "./content/PortadaContent";
import QuimicaContent from "./content/QuimicaContent";
import OrinaContent from "./content/OrinaContent";
import HecesContent from "./content/HecesConten";
import MiscelaneosContent from "./content/MiscelaneosContent";
import CoagulacionContent from "./content/CoagulacionContent";
import HematologiaContent from "./content/HematologiaContent";
import GrupoSanguineoContent from "./content/GrupoSanguineoContent";
import PageComponent from "./components/Page";
import BacteriologiaContent from "./content/BacteriologiaReport";
import AntibiogramaContent from "./content/AntibiogramaContent";


interface BulkReportProps {
  bulkData: { examen: any; qr: string }[];
  patient: any;
  logoUrl: string;
  type: string;
}

const BulkReport: React.FC<BulkReportProps> = ({ bulkData, patient, logoUrl }) => {

  const [references, setReferences] = useState<{ [k: string]: any[] }>({
    hematologia: [],
    quimica: [],
    coagulacion: [],
  });

  useEffect(() => {
    const fetchAll = async () => {
      const tables = [
        { key: "hematologia", tabla: "hematologia" },
        { key: "quimica", tabla: "quimica" },
        { key: "coagulacion", tabla: "coagulacion" },
      ];
      const results: { [k: string]: any[] } = {};
      await Promise.all(
        tables.map(async (t) => {
          try {
            const res = await fetch(`/api/valores-referencia?tabla=${t.tabla}`);
            results[t.key] = res.ok ? ((await res.json()) as any[]) : [];
          } catch (e) {
            results[t.key] = [];
          }
        })
      );
      setReferences((prev) => ({ ...prev, ...results }));
    };
    fetchAll();
  }, []);

  // Función auxiliar para renderizar cada página de examen
  const renderExamenPage = (item: any, index: number) => {
    const commonProps = {
      data: item.examen.resultados,
      patient,
      qrImage: item.qr
    };

    const tipo = item.examen.tipo.trim();

    switch (tipo) {
      case "Hematología":
        return (
          <PageComponent key={`ex-${index}`}>
            <HematologiaContent {...commonProps} references={references.hematologia} />
          </PageComponent>
        );
      case "Química Clínica":
      case "Química Sanguínea":
        return (
          <PageComponent key={`ex-${index}`}>
            <QuimicaContent {...commonProps} references={references.quimica} />
          </PageComponent>
        );
      case "Orina":
        return (
          <PageComponent key={`ex-${index}`}>
            <OrinaContent {...commonProps} />
          </PageComponent>
        );
      case "Heces":
        return (
          <PageComponent key={`ex-${index}`}>
            <HecesContent {...commonProps} />
          </PageComponent>
        );
      case "Coagulación":
        return (
          <PageComponent key={`ex-${index}`}>
            <CoagulacionContent {...commonProps} references={references.coagulacion} />
          </PageComponent>
        );
      case "Grupo Sanguíneo":
        return (
          <PageComponent key={`ex-${index}`}>
            <GrupoSanguineoContent {...commonProps} logoUrl={logoUrl} />
          </PageComponent>
        );
      case "Bacteriología":
        return (
          <>
            <PageComponent key={`ex-${index}`}>
              <BacteriologiaContent {...commonProps} />
            </PageComponent>
            {commonProps.data?.antibiograma_list && commonProps.data.antibiograma_list.length > 0 && (
              <PageComponent key={`ex-${index}-antibiograma`}>
                <AntibiogramaContent {...commonProps} />
              </PageComponent>
            )}
          </>
        );
      case "Antibiograma":
      case "ANTIBIOGRAMA":
        if (commonProps.data?.antibiograma_list && commonProps.data.antibiograma_list.length > 0) {
          return (
            <PageComponent key={`ex-${index}`}>
              <AntibiogramaContent {...commonProps} />
            </PageComponent>
          );
        }
        return null;
      case "Misceláneos":
      case "Exámenes Especiales":
        if (Array.isArray(commonProps.data)) {
          return commonProps.data.map((sub: any, subIndex: number) => (
            <PageComponent key={`ex-${index}-m-${subIndex}`}>
              <MiscelaneosContent data={sub} patient={patient} qrImage={commonProps.qrImage} />
            </PageComponent>
          ));
        }
        return (
          <PageComponent key={`ex-${index}`}>
            <MiscelaneosContent {...commonProps} />
          </PageComponent>
        );

      default:
        return null;
    }
  };

  return (
    <Document>
      {/* 1. Portada al inicio (Solo una vez) */}
      <PageComponent showFooter={false}>
        <PortadaContent patient={patient} logoUrl={logoUrl} />
      </PageComponent>


      {/* 2. Mapeo de todos los exámenes completados (Ignora los no completados) */}
      {bulkData
        .filter((it) => it && it.examen && it.examen.estado === "completado")
        .map((item, index) => renderExamenPage(item, index))}
    </Document>
  );
};

export default BulkReport;