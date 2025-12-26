import React, { useRef, useEffect } from "react";
import { FlaskConical, Activity, Droplets, HeartPulse, ClipboardList } from "lucide-react";

interface QuimicaClinicaFormProps {
  resultados: any;
  onChange: (resultados: any) => void;
}

export default function QuimicaClinicaForm({ resultados, onChange }: QuimicaClinicaFormProps) {
  const formRef = useRef<HTMLDivElement>(null);

  const handleChange = (field: string, value: string) => {
    onChange({ ...resultados, [field]: value });
  };

  // Cálculos Automáticos
  useEffect(() => {
    // 1. Cálculo de Bilirrubina Indirecta
    const bt = parseFloat(resultados?.bilirr_total);
    const bd = parseFloat(resultados?.bilirr_directa);
    if (!isNaN(bt) && !isNaN(bd)) {
      const bi = (bt - bd).toFixed(2);
      if (resultados?.bilirr_indirecta !== bi) handleChange("bilirr_indirecta", bi);
    }

    // 2. Cálculo de Relación A/G
    const alb = parseFloat(resultados?.albumina);
    const glob = parseFloat(resultados?.globulinas);
    if (!isNaN(alb) && !isNaN(glob) && glob !== 0) {
      const rag = (alb / glob).toFixed(2);
      if (resultados?.relacion_ag !== rag) handleChange("relacion_ag", rag);
    }
  }, [resultados?.bilirr_total, resultados?.bilirr_directa, resultados?.albumina, resultados?.globulinas]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const form = formRef.current;
      if (form) {
        const focusableElements = form.querySelectorAll('input, textarea');
        const index = Array.from(focusableElements).indexOf(e.target as HTMLElement);
        if (index > -1 && index < focusableElements.length - 1) {
          e.preventDefault();
          (focusableElements[index + 1] as HTMLElement).focus();
        }
      }
    }
  };

  const sectionCard = "bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-5 transition-all hover:shadow-md";
  const labelBase = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block";
  const inputBase = "w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-blue-600 focus:bg-white transition-all placeholder:text-slate-300";
  const autoInput = "w-full bg-blue-50 border-2 border-blue-100 rounded-xl px-4 py-2.5 text-sm font-black text-blue-700 outline-none cursor-default shadow-inner";

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12" ref={formRef} onKeyDown={handleKeyDown}>
      
      {/* HEADER DE SECCIÓN */}
      <div className="flex items-center gap-4 bg-blue-700 p-6 rounded-[2.5rem] text-white shadow-xl shadow-blue-200">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
          <FlaskConical size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black tracking-tight">Química Clínica</h3>
          <p className="text-[10px] font-bold text-blue-100 uppercase tracking-[0.2em]">Analitos Sanguíneos y Enzimáticos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GLICEMIA Y RENAL */}
        <div className={sectionCard}>
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <Activity size={18} className="text-blue-600" />
            <h4 className="font-black text-slate-700 text-xs uppercase tracking-wider">Metabolismo y Función Renal</h4>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className={labelBase}>Glicemia</label>
              <input type="text" value={resultados?.glicemia || ""} onChange={(e) => handleChange("glicemia", e.target.value)} className={inputBase} placeholder="mg/dL" />
            </div>
            <div>
              <label className={labelBase}>Urea</label>
              <input type="text" value={resultados?.urea || ""} onChange={(e) => handleChange("urea", e.target.value)} className={inputBase} placeholder="mg/dL" />
            </div>
            <div>
              <label className={labelBase}>Creatinina</label>
              <input type="text" value={resultados?.creatinina || ""} onChange={(e) => handleChange("creatinina", e.target.value)} className={inputBase} placeholder="mg/dL" />
            </div>
          </div>
        </div>

        {/* PERFIL LIPÍDICO */}
        <div className={sectionCard}>
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <HeartPulse size={18} className="text-rose-500" />
            <h4 className="font-black text-slate-700 text-xs uppercase tracking-wider">Perfil Lipídico</h4>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelBase}>Colesterol</label>
              <input type="text" value={resultados?.colesterol || ""} onChange={(e) => handleChange("colesterol", e.target.value)} className={inputBase} placeholder="Total" />
            </div>
            <div>
              <label className={labelBase}>HDL</label>
              <input type="text" value={resultados?.hdl || ""} onChange={(e) => handleChange("hdl", e.target.value)} className={inputBase} placeholder="Bueno" />
            </div>
            <div>
              <label className={labelBase}>Triglicéridos</label>
              <input type="text" value={resultados?.trigliceridos || ""} onChange={(e) => handleChange("trigliceridos", e.target.value)} className={inputBase} />
            </div>
          </div>
        </div>

        {/* PERFIL HEPÁTICO COMPLETO */}
        <div className={`${sectionCard} lg:col-span-2`}>
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <Droplets size={18} className="text-amber-500" />
            <h4 className="font-black text-slate-700 text-xs uppercase tracking-wider">Perfil Hepático y Enzimas</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            <div>
              <label className={labelBase}>TGO (AST)</label>
              <input type="text" value={resultados?.tgo || ""} onChange={(e) => handleChange("tgo", e.target.value)} className={inputBase} />
            </div>
            <div>
              <label className={labelBase}>TGP (ALT)</label>
              <input type="text" value={resultados?.tgp || ""} onChange={(e) => handleChange("tgp", e.target.value)} className={inputBase} />
            </div>
            <div>
              <label className={labelBase}>Fosf. Alc.</label>
              <input type="text" value={resultados?.fosf_alc || ""} onChange={(e) => handleChange("fosf_alc", e.target.value)} className={inputBase} />
            </div>
            <div>
              <label className={labelBase}>LDH</label>
              <input type="text" value={resultados?.ldh || ""} onChange={(e) => handleChange("ldh", e.target.value)} className={inputBase} />
            </div>
            <div>
              <label className={labelBase}>Amilasa</label>
              <input type="text" value={resultados?.amilasa || ""} onChange={(e) => handleChange("amilasa", e.target.value)} className={inputBase} />
            </div>
            
            {/* BILIRRUBINAS CON CÁLCULO */}
            <div className="md:col-span-3 lg:col-span-5 grid grid-cols-3 gap-4 pt-4 border-t border-slate-50">
              <div>
                <label className={labelBase}>Bilirr. Total</label>
                <input type="text" value={resultados?.bilirr_total || ""} onChange={(e) => handleChange("bilirr_total", e.target.value)} className={`${inputBase} !border-amber-100`} />
              </div>
              <div>
                <label className={labelBase}>Bilirr. Directa</label>
                <input type="text" value={resultados?.bilirr_directa || ""} onChange={(e) => handleChange("bilirr_directa", e.target.value)} className={`${inputBase} !border-amber-100`} />
              </div>
              <div>
                <label className={`${labelBase} text-blue-600`}>Indirecta (Auto)</label>
                <input type="text" value={resultados?.bilirr_indirecta || ""} readOnly className={autoInput} />
              </div>
            </div>
          </div>
        </div>

        {/* PROTEÍNAS Y MINERALES */}
        <div className={sectionCard}>
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <ClipboardList size={18} className="text-indigo-500" />
            <h4 className="font-black text-slate-700 text-xs uppercase tracking-wider">Proteínas y Ácido Úrico</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelBase}>Ácido Úrico</label>
              <input type="text" value={resultados?.ac_urico || ""} onChange={(e) => handleChange("ac_urico", e.target.value)} className={inputBase} />
            </div>
            <div>
              <label className={labelBase}>Proteínas Tot.</label>
              <input type="text" value={resultados?.proteinas_tot || ""} onChange={(e) => handleChange("proteinas_tot", e.target.value)} className={inputBase} />
            </div>
            <div>
              <label className={labelBase}>Albúmina</label>
              <input type="text" value={resultados?.albumina || ""} onChange={(e) => handleChange("albumina", e.target.value)} className={inputBase} />
            </div>
            <div>
              <label className={labelBase}>Globulinas</label>
              <input type="text" value={resultados?.globulinas || ""} onChange={(e) => handleChange("globulinas", e.target.value)} className={inputBase} />
            </div>
            <div className="col-span-2">
              <label className={`${labelBase} text-blue-600`}>Relación Alb/Glob (Auto)</label>
              <input type="text" value={resultados?.relacion_ag || ""} readOnly className={autoInput} />
            </div>
          </div>
        </div>

        {/* MINERALES Y OBSERVACIÓN */}
        <div className="space-y-6">
          <div className={sectionCard}>
            <h4 className="font-black text-slate-700 text-xs uppercase tracking-wider border-b border-slate-50 pb-3">Electrolitos</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelBase}>Calcio</label>
                <input type="text" value={resultados?.calcio || ""} onChange={(e) => handleChange("calcio", e.target.value)} className={inputBase} />
              </div>
              <div>
                <label className={labelBase}>Fósforo</label>
                <input type="text" value={resultados?.fosforo || ""} onChange={(e) => handleChange("fosforo", e.target.value)} className={inputBase} />
              </div>
            </div>
          </div>

          <div className="px-2">
            <label className={labelBase}>Notas Clínicas</label>
            <textarea
              value={resultados?.observacion || ""}
              onChange={(e) => handleChange("observacion", e.target.value)}
              className="w-full bg-white border-2 border-slate-100 rounded-[2rem] px-6 py-4 text-sm font-medium text-slate-600 outline-none focus:border-blue-600 transition-all min-h-[105px] shadow-sm resize-none"
              placeholder="Ej: Suero lipémico, muestra hemolizada..."
            />
          </div>
        </div>

      </div>
    </div>
  );
}