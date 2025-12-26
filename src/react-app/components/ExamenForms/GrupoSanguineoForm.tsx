import React, { useRef } from "react";

interface GrupoSanguineoFormProps {
  resultados: any;
  onChange: (resultados: any) => void;
}

export default function GrupoSanguineoForm({ resultados, onChange }: GrupoSanguineoFormProps) {
  const formRef = useRef<HTMLDivElement>(null);

  const handleChange = (field: string, value: string) => {
    onChange({ ...resultados, [field]: value });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const form = formRef.current;
      if (form) {
        const focusableElements = form.querySelectorAll('select, textarea');
        const index = Array.from(focusableElements).indexOf(e.target as HTMLElement);
        
        if (index > -1 && index < focusableElements.length - 1) {
          e.preventDefault();
          (focusableElements[index + 1] as HTMLElement).focus();
        }
      }
    }
  };

  const selectStyle = "w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white";
  const labelStyle = "block text-sm font-semibold text-blue-900 mb-1";
  const sectionStyle = "bg-blue-50 rounded-xl p-6 mb-4";

  return (
    <div className="space-y-4" ref={formRef} onKeyDown={handleKeyDown}>
      
      <div className={sectionStyle}>
        <h3 className="text-lg font-bold text-blue-900 mb-4 border-b border-blue-200">Tipificación Sanguínea</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* GRUPO SANGUINEO */}
          <div>
            <label className={labelStyle}>Grupo Sanguíneo</label>
            <select 
              value={resultados?.grupo_sanguineo || ""} 
              onChange={(e) => handleChange("grupo_sanguineo", e.target.value)} 
              className={selectStyle}
            >
              <option value=""></option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="AB">AB</option>
              <option value="O">O</option>
            </select>
          </div>

          {/* FACTOR RH */}
          <div>
            <label className={labelStyle}>Factor RH</label>
            <select 
              value={resultados?.factor_rh || ""} 
              onChange={(e) => handleChange("factor_rh", e.target.value)} 
              className={selectStyle}
            >
              <option value=""></option>
              <option value="Post.(+)">Post.(+)</option>
              <option value="Neg.(-)">Neg.(-)</option>
            </select>
          </div>

          {/* DU */}
          <div>
            <label className={labelStyle}>DU</label>
            <select 
              value={resultados?.du || ""} 
              onChange={(e) => handleChange("du", e.target.value)} 
              className={selectStyle}
            >
              <option value=""></option>
              <option value="Post.(+)">Post.(+)</option>
              <option value="Neg.(-)">Neg.(-)</option>
            </select>
          </div>

        </div>
      </div>

      {/* RESULTADO VISUAL DESTACADO */}
      {(resultados?.grupo_sanguineo || resultados?.factor_rh) && (
        <div className="flex justify-center">
          <div className="bg-white border-2 border-blue-200 rounded-2xl p-4 w-full max-w-xs text-center shadow-sm">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Resultado Final</span>
            <div className="text-4xl font-black text-blue-900 mt-1">
              {resultados?.grupo_sanguineo || "?"} 
              <span className="ml-1 text-blue-600">
                {resultados?.factor_rh === "Post.(+)" ? "+" : resultados?.factor_rh === "Neg.(-)" ? "-" : ""}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* OBSERVACIONES */}
      <div>
        <label className={labelStyle}>Observación</label>
        <textarea
          value={resultados?.observacion || ""}
          onChange={(e) => handleChange("observacion", e.target.value)}
          className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[80px]"
          placeholder="Notas adicionales..."
        />
      </div>
    </div>
  );
}