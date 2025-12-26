import React, { useRef, useEffect } from "react";
import { Activity, Beaker, BarChart3, Clock, FileText } from "lucide-react";

interface HematologiaFormProps {
  resultados: any;
  onChange: (resultados: any) => void;
}

export default function HematologiaForm({ resultados, onChange }: HematologiaFormProps) {
  const formRef = useRef<HTMLDivElement>(null);

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
      const formattedIndice = indice.toFixed(2);
      if (resultados?.vsg_indice !== formattedIndice) {
        handleChange("vsg_indice", formattedIndice);
      }
    }
  }, [resultados?.vsg_1h, resultados?.vsg_2h]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLInputElement;
      const fieldName = target.name;

      if (unidades[fieldName] && target.value.trim() !== "" && !target.value.includes(unidades[fieldName].trim())) {
        const numericValue = target.value.replace(/[a-zA-Z/%³\s]/g, "").trim();
        if (numericValue !== "") {
          const newValue = numericValue + unidades[fieldName];
          handleChange(fieldName, newValue);
        }
      }

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

  const sectionCard = "bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-5 transition-all hover:shadow-md";
  const labelBase = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block";
  const inputBase = "w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-red-500 focus:bg-white transition-all placeholder:text-slate-300";

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10" ref={formRef} onKeyDown={handleKeyDown}>
      
      {/* HEADER PRINCIPAL */}
      <div className="flex items-center gap-4 bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl">
        <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/20">
          <Activity size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black tracking-tight">Hematología Completa</h3>
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-[0.2em]">Citometría Hemática y VSG</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SERIE ROJA */}
        <div className={sectionCard}>
          <div className="flex items-center gap-2 mb-2 border-b border-slate-50 pb-3">
            <Beaker size={18} className="text-red-500" />
            <h4 className="font-black text-slate-700 text-xs uppercase tracking-wider">Serie Roja (Eritrocitos)</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className={labelBase}>Hematíes</label>
              <input name="hematies" type="text" value={resultados?.hematies || ""} onChange={(e) => handleChange("hematies", e.target.value)} className={inputBase} placeholder="4.5 - 5.5" />
            </div>
            <div>
              <label className={labelBase}>Hemoglobina</label>
              <input name="hemoglobina" type="text" value={resultados?.hemoglobina || ""} onChange={(e) => handleChange("hemoglobina", e.target.value)} className={inputBase} placeholder="12.0 - 16.0" />
            </div>
            <div>
              <label className={labelBase}>Hematocrito</label>
              <input name="hematocrito" type="text" value={resultados?.hematocrito || ""} onChange={(e) => handleChange("hematocrito", e.target.value)} className={inputBase} placeholder="37 - 47" />
            </div>
            <div>
              <label className={labelBase}>V.C.M.</label>
              <input name="vcm" type="text" value={resultados?.vcm || ""} onChange={(e) => handleChange("vcm", e.target.value)} className={inputBase} placeholder="80 - 100" />
            </div>
            <div>
              <label className={labelBase}>H.C.M.</label>
              <input name="hcm" type="text" value={resultados?.hcm || ""} onChange={(e) => handleChange("hcm", e.target.value)} className={inputBase} placeholder="27 - 32" />
            </div>
            <div>
              <label className={labelBase}>C.H.C.M.</label>
              <input name="chcm" type="text" value={resultados?.chcm || ""} onChange={(e) => handleChange("chcm", e.target.value)} className={inputBase} placeholder="32 - 36" />
            </div>
          </div>
        </div>

        {/* SERIE BLANCA Y PLAQUETAS */}
        <div className={sectionCard}>
          <div className="flex items-center gap-2 mb-2 border-b border-slate-50 pb-3">
            <BarChart3 size={18} className="text-red-500" />
            <h4 className="font-black text-slate-700 text-xs uppercase tracking-wider">Serie Blanca y Plaquetas</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className={labelBase}>Leucocitos</label>
              <input name="leucocitos" type="text" value={resultados?.leucocitos || ""} onChange={(e) => handleChange("leucocitos", e.target.value)} className={`${inputBase} border-blue-100 bg-blue-50/30`} placeholder="5k - 10k" />
            </div>
            <div className="col-span-1">
              <label className={labelBase}>Plaquetas</label>
              <input name="plaquetas" type="text" value={resultados?.plaquetas || ""} onChange={(e) => handleChange("plaquetas", e.target.value)} className={`${inputBase} border-blue-100 bg-blue-50/30`} placeholder="150k - 450k" />
            </div>
            <div className="hidden md:block"></div> {/* Spacer */}
            
            <div>
              <label className={labelBase}>Neutrófilos</label>
              <input name="neutrofilos" type="text" value={resultados?.neutrofilos || ""} onChange={(e) => handleChange("neutrofilos", e.target.value)} className={inputBase} placeholder="55 - 70" />
            </div>
            <div>
              <label className={labelBase}>Linfocitos</label>
              <input name="linfocitos" type="text" value={resultados?.linfocitos || ""} onChange={(e) => handleChange("linfocitos", e.target.value)} className={inputBase} placeholder="20 - 40" />
            </div>
            <div>
              <label className={labelBase}>Monocitos</label>
              <input name="monocitos" type="text" value={resultados?.monocitos || ""} onChange={(e) => handleChange("monocitos", e.target.value)} className={inputBase} placeholder="2 - 8" />
            </div>
            <div>
              <label className={labelBase}>Eosinófilos</label>
              <input name="eosinofilos" type="text" value={resultados?.eosinofilos || ""} onChange={(e) => handleChange("eosinofilos", e.target.value)} className={inputBase} placeholder="1 - 4" />
            </div>
            <div>
              <label className={labelBase}>Basófilos</label>
              <input name="basofilos" type="text" value={resultados?.basofilos || ""} onChange={(e) => handleChange("basofilos", e.target.value)} className={inputBase} placeholder="0 - 1" />
            </div>
          </div>
        </div>

        {/* V.S.G. Y KATZ */}
        <div className={`${sectionCard} lg:col-span-2 !bg-slate-50 border-slate-200`}>
          <div className="flex items-center gap-2 mb-2 border-b border-slate-200 pb-3">
            <Clock size={18} className="text-slate-600" />
            <h4 className="font-black text-slate-700 text-xs uppercase tracking-wider">Velocidad de Sedimentación Globular</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelBase}>Lectura 1 Hora</label>
              <input name="vsg_1h" type="text" value={resultados?.vsg_1h || ""} onChange={(e) => handleChange("vsg_1h", e.target.value)} className={`${inputBase} !bg-white`} placeholder="mm" />
            </div>
            <div>
              <label className={labelBase}>Lectura 2 Horas</label>
              <input name="vsg_2h" type="text" value={resultados?.vsg_2h || ""} onChange={(e) => handleChange("vsg_2h", e.target.value)} className={`${inputBase} !bg-white`} placeholder="mm" />
            </div>
            <div className="relative group">
              <label className={`${labelBase} text-red-600`}>Índice de Katz</label>
              <div className="relative">
                <input 
                  name="vsg_indice" 
                  type="text" 
                  value={resultados?.vsg_indice || ""} 
                  readOnly 
                  className="w-full bg-red-600 border-2 border-red-700 rounded-xl px-4 py-2.5 text-lg font-black text-white outline-none shadow-lg shadow-red-200" 
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-red-200 font-bold uppercase tracking-tighter">Auto</div>
              </div>
            </div>
          </div>
        </div>

        {/* OBSERVACIONES */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-2 ml-4">
            <FileText size={14} className="text-slate-400" />
            <label className={labelBase}>Observaciones de Frotis / Morfología</label>
          </div>
          <textarea
            name="observacion"
            value={resultados?.observacion || ""}
            onChange={(e) => handleChange("observacion", e.target.value)}
            className="w-full bg-white border-2 border-slate-100 rounded-[2rem] px-8 py-6 text-sm font-medium text-slate-600 outline-none focus:border-red-500 transition-all min-h-[120px] shadow-sm resize-none"
            placeholder="Describa anisocitosis, poiquilocitosis, hipocromía o presencia de células inmaduras..."
          />
        </div>
      </div>
    </div>
  );
}