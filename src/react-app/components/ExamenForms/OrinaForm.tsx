import React, { useRef } from "react";

interface OrinaFormProps {
  resultados: any;
  onChange: (resultados: any) => void;
}

export default function OrinaForm({ resultados, onChange }: OrinaFormProps) {
  const formRef = useRef<HTMLDivElement>(null);

  const handleChange = (field: string, value: string) => {
    onChange({ ...resultados, [field]: value });
  };

  // Lógica para saltar al siguiente campo al presionar Enter
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
            <select value={resultados?.aspecto || "Lig. Turbia"} onChange={(e) => handleChange("aspecto", e.target.value)} className={selectStyle}>
              <option value="">Seleccionar...</option>
              <option value="Lig. Turbia">Lig. Turbia</option>
              <option value="Turbia">Turbia</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>Color</label>
            <select value={resultados?.color || "Amarillo"} onChange={(e) => handleChange("color", e.target.value)} className={selectStyle}>
              <option value="">Seleccionar...</option>
              <option value="Amarillo">Amarillo</option>
              <option value="Ambar">Ambar</option>
              <option value="Sanguinolento">Sanguinolento</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>Reacción</label>
            <select value={resultados?.reaccion || "Acida"} onChange={(e) => handleChange("reaccion", e.target.value)} className={selectStyle}>
              <option value="">Seleccionar...</option>
              <option value="Alcalina">Alcalina</option>
              <option value="Acida">Acida</option>
              <option value="Neutra">Neutra</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>PH</label>
            <input type="text" value={resultados?.ph || ""} onChange={(e) => handleChange("ph", e.target.value)} className={inputStyle} placeholder="5.0 - 7.0" />
          </div>
          <div>
            <label className={labelStyle}>Densidad</label>
            <input type="text" value={resultados?.densidad || ""} onChange={(e) => handleChange("densidad", e.target.value)} className={inputStyle} placeholder="1.015 - 1.025" />
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: EXAMEN QUÍMICO */}
      <div className={sectionStyle}>
        <h3 className="text-lg font-bold text-blue-900 mb-4 border-b border-blue-200">Examen Químico</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelStyle}>Pigmento Bil.</label>
            <select value={resultados?.pigmento_bil || "Negativo"} onChange={(e) => handleChange("pigmento_bil", e.target.value)} className={selectStyle}>
              <option value="">Seleccionar...</option>
              <option value="Negativo">Negativo</option>
              <option value="Trazas">Trazas</option>
              <option value="Post(+)">Post(+)</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>Glucosa</label>
            <select value={resultados?.glucosa || "Negativo"} onChange={(e) => handleChange("glucosa", e.target.value)} className={selectStyle}>
              <option value="">Seleccionar...</option>
              <option value="Negativo">Negativo</option>
              <option value="Trazas">Trazas</option>
              <option value="Post(+)">Post(+)</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>Nitritos</label>
            <select value={resultados?.nitritos || "Negativo"} onChange={(e) => handleChange("nitritos", e.target.value)} className={selectStyle}>
              <option value="">Seleccionar...</option>
              <option value="Negativo">Negativo</option>
              <option value="Positivo">Positivo</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>Proteína</label>
            <select value={resultados?.proteina || "Negativo"} onChange={(e) => handleChange("proteina", e.target.value)} className={selectStyle}>
              <option value="">Seleccionar...</option>
              <option value="Negativo">Negativo</option>
              <option value="Trazas">Trazas</option>
              <option value="Post(+)">Post(+)</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>Hemoglobina</label>
            <select value={resultados?.hemoglobina || "Negativo"} onChange={(e) => handleChange("hemoglobina", e.target.value)} className={selectStyle}>
              <option value="">Seleccionar...</option>
              <option value="Negativo">Negativo</option>
              <option value="Trazas">Trazas</option>
              <option value="Post(+)">Post(+)</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>Acetona</label>
            <select value={resultados?.acetona || "Negativo"} onChange={(e) => handleChange("acetona", e.target.value)} className={selectStyle}>
              <option value="">Seleccionar...</option>
              <option value="Negativo">Negativo</option>
              <option value="Trazas">Trazas</option>
              <option value="Post(+)">Post(+)</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>Urobilín</label>
            <select value={resultados?.urobilin || "Normal"} onChange={(e) => handleChange("urobilin", e.target.value)} className={selectStyle}>
              <option value="">Seleccionar...</option>
              <option value="Normal">Normal</option>
              <option value="Lig. Aumentado">Lig. Aumentado</option>
              <option value="Aumentado">Aumentado</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: EXAMEN MICROSCÓPICO */}
      <div className={sectionStyle}>
        <h3 className="text-lg font-bold text-blue-900 mb-4 border-b border-blue-200">Examen Microscópico</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className={labelStyle}>Leucocitos</label>
            <input type="text" value={resultados?.leucocitos || ""} onChange={(e) => handleChange("leucocitos", e.target.value)} className={inputStyle} />
          </div>
          <div><label className={labelStyle}>Hematies</label>
            <input type="text" value={resultados?.hematies || ""} onChange={(e) => handleChange("hematies", e.target.value)} className={inputStyle} />
          </div>
          <div><label className={labelStyle}>Células Epit.</label>
            <input type="text" value={resultados?.celulas_epit || ""} onChange={(e) => handleChange("celulas_epit", e.target.value)} className={inputStyle} />
          </div>
          <div><label className={labelStyle}>Cilindros</label>
            <input type="text" value={resultados?.cilindros || ""} onChange={(e) => handleChange("cilindros", e.target.value)} className={inputStyle} />
          </div>
          <div><label className={labelStyle}>Bacteristales</label>
            <input type="text" value={resultados?.bacteristales || ""} onChange={(e) => handleChange("bacteristales", e.target.value)} className={inputStyle} />
          </div>
          <div><label className={labelStyle}>Cristales</label>
            <input type="text" value={resultados?.cristales || ""} onChange={(e) => handleChange("cristales", e.target.value)} className={inputStyle} />
          </div>
          <div>
            <label className={labelStyle}>Bacterias</label>
            <select value={resultados?.bacterias || ""} onChange={(e) => handleChange("bacterias", e.target.value)} className={selectStyle}>
              <option value="">Seleccionar...</option>
              <option value="Escasas">Escasas</option>
              <option value="Reg. Cantidad">Reg. Cantidad</option>
              <option value="Abundante">Abundante</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>Levaduras</label>
            <select value={resultados?.levaduras || ""} onChange={(e) => handleChange("levaduras", e.target.value)} className={selectStyle}>
              <option value="">Seleccionar...</option>
              <option value="Aisladas">Aisladas</option>
              <option value="Aisladas - Gemación">Aisladas - Gemación</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>Filam de Moco</label>
            <select value={resultados?.filam_moco || ""} onChange={(e) => handleChange("filam_moco", e.target.value)} className={selectStyle}>
              <option value="">Seleccionar...</option>
              <option value="Escasas">Escasas</option>
              <option value="Reg. Cantidad">Reg. Cantidad</option>
              <option value="Abundante">Abundante</option>
            </select>
          </div>
        </div>
      </div>

      {/* OBSERVACIÓN */}
      <div>
        <label className={labelStyle}>Observación</label>
        <textarea
          value={resultados?.observacion || ""}
          onChange={(e) => handleChange("observacion", e.target.value)}
          className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
          placeholder="Notas adicionales..."
        />
      </div>
    </div>
  );
}