import React, { useRef } from "react";

interface QuimicaClinicaFormProps {
  resultados: any;
  onChange: (resultados: any) => void;
}

export default function QuimicaClinicaForm({ resultados, onChange }: QuimicaClinicaFormProps) {
  // Referencia para manejar el foco de los inputs
  const formRef = useRef<HTMLDivElement>(null);

  const handleChange = (field: string, value: string) => {
    onChange({ ...resultados, [field]: value });
  };

  // Función para saltar al siguiente input al presionar Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const form = formRef.current;
      if (form) {
        // Buscamos todos los elementos que pueden tener foco
        const focusableElements = form.querySelectorAll('input, textarea');
        const index = Array.from(focusableElements).indexOf(e.target as HTMLElement);
        
        if (index > -1 && index < focusableElements.length - 1) {
          e.preventDefault(); // Evita que se envíe el formulario
          (focusableElements[index + 1] as HTMLElement).focus();
        }
      }
    }
  };

  // Estilo común para los inputs
  const inputStyle = "w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none";
  const labelStyle = "block text-sm font-semibold text-blue-900 mb-1";
  const sectionStyle = "bg-blue-50 rounded-xl p-6 mb-4";

  return (
    <div className="space-y-4" ref={formRef} onKeyDown={handleKeyDown}>
      
      {/* SECCIÓN 1: BÁSICOS Y RENAL */}
      <div className={sectionStyle}>
        <h3 className="text-lg font-bold text-blue-900 mb-4 border-b border-blue-200">Glicemia y Función Renal</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className={labelStyle}>Glicemia (mg/dL)</label>
            <input type="text" value={resultados?.glicemia || ""} onChange={(e) => handleChange("glicemia", e.target.value)} className={inputStyle} />
          </div>
          <div><label className={labelStyle}>Urea (mg/dL)</label>
            <input type="text" value={resultados?.urea || ""} onChange={(e) => handleChange("urea", e.target.value)} className={inputStyle} />
          </div>
          <div><label className={labelStyle}>Creatinina (mg/dL)</label>
            <input type="text" value={resultados?.creatinina || ""} onChange={(e) => handleChange("creatinina", e.target.value)} className={inputStyle} />
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: PERFIL LIPÍDICO */}
      <div className={sectionStyle}>
        <h3 className="text-lg font-bold text-blue-900 mb-4 border-b border-blue-200">Perfil Lipídico</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className={labelStyle}>Colesterol Total</label>
            <input type="text" value={resultados?.colesterol || ""} onChange={(e) => handleChange("colesterol", e.target.value)} className={inputStyle} />
          </div>
          <div><label className={labelStyle}>Colest. HDL</label>
            <input type="text" value={resultados?.hdl || ""} onChange={(e) => handleChange("hdl", e.target.value)} className={inputStyle} />
          </div>
          <div><label className={labelStyle}>Triglicéridos</label>
            <input type="text" value={resultados?.trigliceridos || ""} onChange={(e) => handleChange("trigliceridos", e.target.value)} className={inputStyle} />
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: PROTEÍNAS Y OTROS */}
      <div className={sectionStyle}>
        <h3 className="text-lg font-bold text-blue-900 mb-4 border-b border-blue-200">Proteínas y Ácido Úrico</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className={labelStyle}>Ácido Úrico</label>
            <input type="text" value={resultados?.ac_urico || ""} onChange={(e) => handleChange("ac_urico", e.target.value)} className={inputStyle} />
          </div>
          <div><label className={labelStyle}>Proteínas Totales</label>
            <input type="text" value={resultados?.proteinas_tot || ""} onChange={(e) => handleChange("proteinas_tot", e.target.value)} className={inputStyle} />
          </div>
          <div><label className={labelStyle}>Albúmina</label>
            <input type="text" value={resultados?.albumina || ""} onChange={(e) => handleChange("albumina", e.target.value)} className={inputStyle} />
          </div>
          <div><label className={labelStyle}>Globulinas</label>
            <input type="text" value={resultados?.globulinas || ""} onChange={(e) => handleChange("globulinas", e.target.value)} className={inputStyle} />
          </div>
          <div><label className={labelStyle}>Relación A/G</label>
            <input type="text" value={resultados?.relacion_ag || ""} onChange={(e) => handleChange("relacion_ag", e.target.value)} className={inputStyle} />
          </div>
        </div>
      </div>

      {/* SECCIÓN 4: ENZIMAS Y HEPÁTICO */}
      <div className={sectionStyle}>
        <h3 className="text-lg font-bold text-blue-900 mb-4 border-b border-blue-200">Perfil Hepático y Enzimas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className={labelStyle}>TGO (AST)</label>
            <input type="text" value={resultados?.tgo || ""} onChange={(e) => handleChange("tgo", e.target.value)} className={inputStyle} />
          </div>
          <div><label className={labelStyle}>TGP (ALT)</label>
            <input type="text" value={resultados?.tgp || ""} onChange={(e) => handleChange("tgp", e.target.value)} className={inputStyle} />
          </div>
          <div><label className={labelStyle}>Fosf. Alc.</label>
            <input type="text" value={resultados?.fosf_alc || ""} onChange={(e) => handleChange("fosf_alc", e.target.value)} className={inputStyle} />
          </div>
          <div><label className={labelStyle}>Bilirr. Total</label>
            <input type="text" value={resultados?.bilirr_total || ""} onChange={(e) => handleChange("bilirr_total", e.target.value)} className={inputStyle} />
          </div>
          <div><label className={labelStyle}>Bilirr. Directa</label>
            <input type="text" value={resultados?.bilirr_directa || ""} onChange={(e) => handleChange("bilirr_directa", e.target.value)} className={inputStyle} />
          </div>
          <div><label className={labelStyle}>Bilirr. Indirecta</label>
            <input type="text" value={resultados?.bilirr_indirecta || ""} onChange={(e) => handleChange("bilirr_indirecta", e.target.value)} className={inputStyle} />
          </div>
          <div><label className={labelStyle}>LDH</label>
            <input type="text" value={resultados?.ldh || ""} onChange={(e) => handleChange("ldh", e.target.value)} className={inputStyle} />
          </div>
          <div><label className={labelStyle}>Amilasa</label>
            <input type="text" value={resultados?.amilasa || ""} onChange={(e) => handleChange("amilasa", e.target.value)} className={inputStyle} />
          </div>
        </div>
      </div>

      {/* SECCIÓN 5: MINERALES */}
      <div className={sectionStyle}>
        <h3 className="text-lg font-bold text-blue-900 mb-4 border-b border-blue-200">Electrolitos y Minerales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className={labelStyle}>Calcio</label>
            <input type="text" value={resultados?.calcio || ""} onChange={(e) => handleChange("calcio", e.target.value)} className={inputStyle} />
          </div>
          <div><label className={labelStyle}>Fósforo</label>
            <input type="text" value={resultados?.fosforo || ""} onChange={(e) => handleChange("fosforo", e.target.value)} className={inputStyle} />
          </div>
        </div>
      </div>

      {/* SECCIÓN FINAL: OBSERVACIONES */}
      <div>
        <label className="block text-sm font-semibold text-blue-900 mb-2">Observación</label>
        <textarea
          value={resultados?.observacion || ""}
          onChange={(e) => handleChange("observacion", e.target.value)}
          className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
          placeholder="Notas clínicas..."
        />
      </div>
    </div>
  );
}