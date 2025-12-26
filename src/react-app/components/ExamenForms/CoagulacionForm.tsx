import React, { useRef } from "react";

interface CoagulacionFormProps {
  resultados: any;
  onChange: (resultados: any) => void;
}

export default function CoagulacionForm({ resultados, onChange }: CoagulacionFormProps) {
  const formRef = useRef<HTMLDivElement>(null);

  // Mapeo de unidades para coagulación
  const unidades: { [key: string]: string } = {
    tp_control: " seg",
    tp_paciente: " seg",
    tp_act: " %",
    tp_razon: " raz",
    tpt_control: " seg",
    tpt_paciente: " seg",
    fibrinogeno: " mg/dL"
  };

  const handleChange = (field: string, value: string) => {
    onChange({ ...resultados, [field]: value });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLInputElement;
      const fieldName = target.name;

      // 1. Aplicar unidad si corresponde
      if (unidades[fieldName] && target.value.trim() !== "" && !target.value.includes(unidades[fieldName].trim())) {
        const newValue = target.value.replace(/[a-zA-Z/%³]/g, "").trim() + unidades[fieldName];
        handleChange(fieldName, newValue);
      }

      // 2. Saltar al siguiente elemento
      const form = formRef.current;
      if (form) {
        const focusableElements = form.querySelectorAll('input, select, textarea');
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
      
      {/* TIEMPO DE PROTROMBINA */}
      <div className={sectionStyle}>
        <h3 className="text-lg font-bold text-blue-900 mb-4 border-b border-blue-200">Tiempo de Protrombina (TP)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className={labelStyle}>Control</label>
            <input name="tp_control" type="text" value={resultados?.tp_control || ""} onChange={(e) => handleChange("tp_control", e.target.value)} className={inputStyle} placeholder="seg" />
          </div>
          <div><label className={labelStyle}>Paciente</label>
            <input name="tp_paciente" type="text" value={resultados?.tp_paciente || ""} onChange={(e) => handleChange("tp_paciente", e.target.value)} className={inputStyle} placeholder="seg" />
          </div>
          <div><label className={labelStyle}>Act. P.</label>
            <input name="tp_act" type="text" value={resultados?.tp_act || ""} onChange={(e) => handleChange("tp_act", e.target.value)} className={inputStyle} placeholder="%" />
          </div>
          <div><label className={labelStyle}>Razón</label>
            <input name="tp_razon" type="text" value={resultados?.tp_razon || ""} onChange={(e) => handleChange("tp_razon", e.target.value)} className={inputStyle} placeholder="raz" />
          </div>
          <div><label className={labelStyle}>INR</label>
            <input name="tp_inr" type="text" value={resultados?.tp_inr || ""} onChange={(e) => handleChange("tp_inr", e.target.value)} className={inputStyle} placeholder="1.0" />
          </div>
          <div><label className={labelStyle}>ISI</label>
            <input name="tp_isi" type="text" value={resultados?.tp_isi || ""} onChange={(e) => handleChange("tp_isi", e.target.value)} className={inputStyle} placeholder="ISI" />
          </div>
        </div>
      </div>

      {/* TTP ACTIVA */}
      <div className={sectionStyle}>
        <h3 className="text-lg font-bold text-blue-900 mb-4 border-b border-blue-200">Tiempo de Tromboplastina Parcial Activa (TTPA)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className={labelStyle}>Control</label>
            <input name="tpt_control" type="text" value={resultados?.tpt_control || ""} onChange={(e) => handleChange("tpt_control", e.target.value)} className={inputStyle} placeholder="seg" />
          </div>
          <div><label className={labelStyle}>Paciente</label>
            <input name="tpt_paciente" type="text" value={resultados?.tpt_paciente || ""} onChange={(e) => handleChange("tpt_paciente", e.target.value)} className={inputStyle} placeholder="seg" />
          </div>
          <div><label className={labelStyle}>Fibrinógeno</label>
            <input name="fibrinogeno" type="text" value={resultados?.fibrinogeno || ""} onChange={(e) => handleChange("fibrinogeno", e.target.value)} className={inputStyle} placeholder="mg/dL" />
          </div>
        </div>
      </div>

      {/* ANTICOAGULACIÓN */}
      <div className={sectionStyle}>
        <h3 className="text-lg font-bold text-blue-900 mb-4 border-b border-blue-200">Estado del Paciente</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelStyle}>¿Paciente anticoagulado?</label>
            <select name="anticoagulado" value={resultados?.anticoagulado || ""} onChange={(e) => handleChange("anticoagulado", e.target.value)} className={inputStyle}>
              <option value="">Seleccionar...</option>
              <option value="No">No</option>
              <option value="Sí">Sí</option>
            </select>
          </div>
          {resultados?.anticoagulado === "Sí" && (
            <div>
              <label className={labelStyle}>Medicamento</label>
              <input name="medicamento" type="text" value={resultados?.medicamento || ""} onChange={(e) => handleChange("medicamento", e.target.value)} className={inputStyle} placeholder="Warfarina, etc." />
            </div>
          )}
        </div>
      </div>

      <div>
        <label className={labelStyle}>Observaciones</label>
        <textarea
          name="observacion"
          value={resultados?.observacion || ""}
          onChange={(e) => handleChange("observacion", e.target.value)}
          className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[80px]"
          placeholder="Interpretación clínica..."
        />
      </div>
    </div>
  );
}