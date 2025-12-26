import React, { useRef } from "react";

interface HecesFormProps {
  resultados: any;
  onChange: (resultados: any) => void;
}

export default function HecesForm({ resultados, onChange }: HecesFormProps) {
  const formRef = useRef<HTMLDivElement>(null);

  const handleChange = (field: string, value: string) => {
    onChange({ ...resultados, [field]: value });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const form = formRef.current;
      if (form) {
        const focusableElements = form.querySelectorAll('input, select, textarea');
        const index = Array.from(focusableElements).indexOf(e.target as HTMLElement);
        
        if (index > -1 && index < focusableElements.length - 1) {
          e.preventDefault();
          (focusableElements[index + 1] as HTMLElement).focus();
        }
      }
    }
  };

  const inputStyle = "w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none";
  const selectStyle = "w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white";
  const labelStyle = "block text-sm font-semibold text-blue-900 mb-1";
  const sectionStyle = "bg-blue-50 rounded-xl p-6 mb-4";

  return (
    <div className="space-y-4" ref={formRef} onKeyDown={handleKeyDown}>
      
      {/* SECCIÓN 1: CARACTERES GENERALES */}
      <div className={sectionStyle}>
        <h3 className="text-lg font-bold text-blue-900 mb-4 border-b border-blue-200">Caracteres Generales</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelStyle}>Aspecto</label>
            <select value={resultados?.aspecto || "Heterogeneo"} onChange={(e) => handleChange("aspecto", e.target.value)} className={selectStyle}>
              <option value="">Seleccionar...</option>
              <option value="Heterogeneo">Heterogeneo</option>
              <option value="Homogeneo">Homogeneo</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>Color</label>
            <select value={resultados?.color || ""} onChange={(e) => handleChange("color", e.target.value)} className={selectStyle}>
              <option value="">Seleccionar...</option>
              <option value="Amarillo">Amarillo</option>
              <option value="Marron">Marron</option>
              <option value="Rojizo">Rojizo</option>
              <option value="Verdoso">Verdoso</option>
              <option value="Negro">Negro</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>Consistencia</label>
            <select value={resultados?.consistencia || ""} onChange={(e) => handleChange("consistencia", e.target.value)} className={selectStyle}>
              <option value="">Seleccionar...</option>
              <option value="Blanda">Blanda</option>
              <option value="Dura">Dura</option>
              <option value="Pastosa">Pastosa</option>
              <option value="Diarreica">Diarreica</option>
              <option value="Liquida">Liquida</option>
              <option value="Mocosa">Mocosa</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>HB (Hemoglobina)</label>
            <select value={resultados?.hb || "Negativo"} onChange={(e) => handleChange("hb", e.target.value)} className={selectStyle}>
              <option value="">Seleccionar...</option>
              <option value="Negativo">Negativo</option>
              <option value="Trazas">Trazas</option>
              <option value="Post(+)">Post(+)</option>
              <option value="Post(++)">Post(++)</option>
              <option value="Post(+++)">Post(+++)</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>Moco</label>
            <select value={resultados?.moco || ""} onChange={(e) => handleChange("moco", e.target.value)} className={selectStyle}>
              <option value="">Seleccionar...</option>
              <option value="Ausente">Ausente</option>
              <option value="Escaso">Escaso</option>
              <option value="Reg. Cantidad">Reg. Cantidad</option>
              <option value="Abundante">Abundante</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>Reacción</label>
            <select value={resultados?.reaccion || ""} onChange={(e) => handleChange("reaccion", e.target.value)} className={selectStyle}>
              <option value="">Seleccionar...</option>
              <option value="Alcalina">Alcalina</option>
              <option value="Acida">Acida</option>
              <option value="Neutra">Neutra</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>PH</label>
            <input type="text" value={resultados?.ph || ""} onChange={(e) => handleChange("ph", e.target.value)} className={inputStyle} placeholder="7.0 - 7.5" />
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: OTROS */}
      <div className={sectionStyle}>
        <h3 className="text-lg font-bold text-blue-900 mb-4 border-b border-blue-200">Otros Exámenes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelStyle}>Sangre Oculta</label>
            <select value={resultados?.sangre_oculta || ""} onChange={(e) => handleChange("sangre_oculta", e.target.value)} className={selectStyle}>
              <option value="">Seleccionar...</option>
              <option value="Negativa">Negativa</option>
              <option value="Post(+)">Post(+)</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>Flora Bacteriana</label>
            <select value={resultados?.flora_bacteriana || "Reg. Cantidad"} onChange={(e) => handleChange("flora_bacteriana", e.target.value)} className={selectStyle}>
              <option value="">Seleccionar...</option>
              <option value="Reg. Cantidad">Reg. Cantidad</option>
              <option value="Escasa">Escasa</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>Parásitos</label>
            <select value={resultados?.parasitos || ""} onChange={(e) => handleChange("parasitos", e.target.value)} className={selectStyle}>
              <option value="">Seleccionar...</option>
              <option value="Blastocystis sp xc">Blastocystis sp xc</option>
              <option value="Quiste de Entamoeba histolytica">Quiste de Entamoeba histolytica</option>
              <option value="Trofozoito y Quiste de Entamoeba histolytica">Trofozoito y Quiste de Entamoeba histolytica</option>
              <option value="Huevos de enterobius vermicularis">Huevos de enterobius vermicularis</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>Polimorfonucleares</label>
            <input type="text" value={resultados?.po_nucleares || ""} onChange={(e) => handleChange("po_nucleares", e.target.value)} className={inputStyle} placeholder="Escribir resultado..." />
          </div>
          <div>
            <label className={labelStyle}>Restos Alimenticios</label>
            <input type="text" value={resultados?.re_alimenticios || ""} onChange={(e) => handleChange("re_alimenticios", e.target.value)} className={inputStyle} placeholder="Escribir resultado..." />
          </div>
          <div>
            <label className={labelStyle}>Azúcares Reductores</label>
            <input type="text" value={resultados?.az_reductores || ""} onChange={(e) => handleChange("az_reductores", e.target.value)} className={inputStyle} placeholder="Escribir resultado..." />
          </div>
        </div>
      </div>

      {/* OBSERVACIÓN */}
      <div>
        <label className={labelStyle}>Observación</label>
        <textarea
          value={resultados?.observacion || ""}
          onChange={(e) => handleChange("observacion", e.target.value)}
          className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]"
          placeholder="Observaciones adicionales del examen..."
        />
      </div>
    </div>
  );
}