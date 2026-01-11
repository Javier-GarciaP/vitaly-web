import React from "react";
import ReportLayout from "../components/ReportLayout";
import MiscelaneosContent from "../content/MiscelaneosContent";

/**
 * COMPONENTE POR DEFECTO
 * Se usa cuando se imprime solo un examen misceláneo desde otros módulos.
 */
const MiscelaneosReport: React.FC<{ data: any, patient: any, qrImage?: string }> = (props) => {
  return (
    <ReportLayout>
      <MiscelaneosContent {...props} />
    </ReportLayout>
  );
};

export default MiscelaneosReport;