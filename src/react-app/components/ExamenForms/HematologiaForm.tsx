import React, { useRef, useEffect } from "react";

interface HematologiaFormProps {
  resultados: any;
  onChange: (resultados: any) => void;
}

export default function HematologiaForm({ resultados, onChange }: HematologiaFormProps) {
  const formRef = useRef<HTMLDivElement>(null);

  // Mapeo de unidades para auto-completado
  const unidades: { [key: string]: string } = {
    hematies: " mill/mm³",
    hemoglobina: " g/dL",
    hematocrito: " %",
    vcm: " fL",
    hcm: " pg",
    chcm: " g/dL",
    leucocitos: " /mm³",
    plaquetas: " /mm³",
    neutrofilos: " %",
    linfocitos: " %",
    monocitos: " %",
    eosinofilos: " %",
    basofilos: " %",
    vsg_1h: " mm",
    vsg_2h: " mm",
  };

  const handleChange = (field: string, value: string) => {
    onChange({ ...resultados, [field]: value });
  };

  // Cálculo del Índice de Katz automático
  useEffect(() => {
    const h1 = parseFloat(resultados?.vsg_1h);
    const h2 = parseFloat(resultados?.vsg_2h);

    if (!isNaN(h1) && !isNaN(h2)) {
      const indice = ((h2 / 2) + h1) / 2;
      // Solo actualizamos si el índice es diferente para evitar bucles infinitos
      if (resultados?.vsg_indice !== indice.toFixed(2)) {
        handleChange("vsg_indice", indice.toFixed(2));
      }
    }
  }, [resultados?.vsg_1h, resultados?.vsg_2h]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLInputElement;
      const fieldName = target.name;

      // 1. Aplicar unidad si el campo tiene una definida y hay un valor
      if (unidades[fieldName] && target.value.trim() !== "" && !target.value.includes(unidades[fieldName].trim())) {
        const newValue = target.value.replace(/[a-zA-Z/%³]/g, "").trim() + unidades[fieldName];
        handleChange(fieldName, newValue);
      }

      // 2. Saltar al siguiente input
      const form = formRef.current;
      if (form) {
        const focusableElements = form.querySelectorAll('input, textarea');
        const index = Array.from(focusableElements).indexOf(target);
        if (index > -1 && index < focusableElements.length - 1) {
          e.preventDefault();
          (focusableElements[index + 1] as HTMLElement).focus();
        }
      }
    }
  };

  const inputStyle = "w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none";
  const labelStyle = "block text-sm font-semibold text-blue-900 mb-1";
  const sectionStyle = "bg-blue-50 rounded-xl p-6 mb-4";

  return (
    <div className="space-y-4" ref={formRef} onKeyDown={handleKeyDown}>
      
      {/* SERIE ROJA */}
      <div className={sectionStyle}>
        <h3 className="text-lg font-bold text-blue-900 mb-4 border-b border-blue-200">Serie Roja</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className={labelStyle}>Hematíes</label>
            <input name="hematies" type="text" value={resultados?.hematies || ""} onChange={(e) => handleChange("hematies", e.target.value)} className={inputStyle} placeholder="mill/mm³" />
          </div>
          <div><label className={labelStyle}>Hemoglobina</label>
            <input name="hemoglobina" type="text" value={resultados?.hemoglobina || ""} onChange={(e) => handleChange("hemoglobina", e.target.value)} className={inputStyle} placeholder="g/dL" />
          </div>
          <div><label className={labelStyle}>Hematocrito</label>
            <input name="hematocrito" type="text" value={resultados?.hematocrito || ""} onChange={(e) => handleChange("hematocrito", e.target.value)} className={inputStyle} placeholder="%" />
          </div>
          <div><label className={labelStyle}>V.C.M.</label>
            <input name="vcm" type="text" value={resultados?.vcm || ""} onChange={(e) => handleChange("vcm", e.target.value)} className={inputStyle} placeholder="fL" />
          </div>
          <div><label className={labelStyle}>H.C.M.</label>
            <input name="hcm" type="text" value={resultados?.hcm || ""} onChange={(e) => handleChange("hcm", e.target.value)} className={inputStyle} placeholder="pg" />
          </div>
          <div><label className={labelStyle}>C.H.C.M.</label>
            <input name="chcm" type="text" value={resultados?.chcm || ""} onChange={(e) => handleChange("chcm", e.target.value)} className={inputStyle} placeholder="g/dL" />
          </div>
        </div>
      </div>

      {/* SERIE BLANCA Y PLAQUETAS */}
      <div className={sectionStyle}>
        <h3 className="text-lg font-bold text-blue-900 mb-4 border-b border-blue-200">Serie Blanca y Plaquetas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className={labelStyle}>Leucocitos</label>
            <input name="leucocitos" type="text" value={resultados?.leucocitos || ""} onChange={(e) => handleChange("leucocitos", e.target.value)} className={inputStyle} placeholder="/mm³" />
          </div>
          <div><label className={labelStyle}>Plaquetas</label>
            <input name="plaquetas" type="text" value={resultados?.plaquetas || ""} onChange={(e) => handleChange("plaquetas", e.target.value)} className={inputStyle} placeholder="/mm³" />
          </div>
          <div><label className={labelStyle}>Neutrófilos</label>
            <input name="neutrofilos" type="text" value={resultados?.neutrofilos || ""} onChange={(e) => handleChange("neutrofilos", e.target.value)} className={inputStyle} placeholder="%" />
          </div>
          <div><label className={labelStyle}>Linfocitos</label>
            <input name="linfocitos" type="text" value={resultados?.linfocitos || ""} onChange={(e) => handleChange("linfocitos", e.target.value)} className={inputStyle} placeholder="%" />
          </div>
          <div><label className={labelStyle}>Monocitos</label>
            <input name="monocitos" type="text" value={resultados?.monocitos || ""} onChange={(e) => handleChange("monocitos", e.target.value)} className={inputStyle} placeholder="%" />
          </div>
          <div><label className={labelStyle}>Eosinófilos</label>
            <input name="eosinofilos" type="text" value={resultados?.eosinofilos || ""} onChange={(e) => handleChange("eosinofilos", e.target.value)} className={inputStyle} placeholder="%" />
          </div>
          <div><label className={labelStyle}>Basófilos</label>
            <input name="basofilos" type="text" value={resultados?.basofilos || ""} onChange={(e) => handleChange("basofilos", e.target.value)} className={inputStyle} placeholder="%" />
          </div>
        </div>
      </div>

      {/* V.S.G. */}
      <div className={sectionStyle}>
        <h3 className="text-lg font-bold text-blue-900 mb-4 border-b border-blue-200">V.S.G.</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className={labelStyle}>1 Hora</label>
            <input name="vsg_1h" type="text" value={resultados?.vsg_1h || ""} onChange={(e) => handleChange("vsg_1h", e.target.value)} className={inputStyle} placeholder="mm" />
          </div>
          <div><label className={labelStyle}>2 Hora</label>
            <input name="vsg_2h" type="text" value={resultados?.vsg_2h || ""} onChange={(e) => handleChange("vsg_2h", e.target.value)} className={inputStyle} placeholder="mm" />
          </div>
          <div><label className={labelStyle}>Índice (Katz)</label>
            <input name="vsg_indice" type="text" value={resultados?.vsg_indice || ""} readOnly className={`${inputStyle} bg-gray-100 font-bold text-blue-600`} placeholder="Auto-calculado" />
          </div>
        </div>
      </div>

      {/* OBSERVACIÓN */}
      <div>
        <label className={labelStyle}>Observación</label>
        <textarea
          name="observacion"
          value={resultados?.observacion || ""}
          onChange={(e) => handleChange("observacion", e.target.value)}
          className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[80px]"
          placeholder="Morfología, inclusiones, etc..."
        />
      </div>
    </div>
  );
}